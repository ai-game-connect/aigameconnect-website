(function () {
  const pageKey = document.body.dataset.page || "home";
  const supportedLanguages = ["en", "ar"];
  const params = new URLSearchParams(window.location.search);
  const requestedLanguage = params.get("lang");
  const language = supportedLanguages.includes(requestedLanguage) ? requestedLanguage : "en";
  const direction = language === "ar" ? "rtl" : "ltr";

  document.documentElement.lang = language;
  document.documentElement.dir = direction;
  document.body.dataset.locale = language;

  const sharedFiles = ["site", "navigation", "footer", "faq", "forms"];
  const contentFiles = [...sharedFiles, pageKey];

  const main = document.getElementById("main");
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const setMetaDescription = (description) => {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.append(meta);
    }
    meta.content = description;
  };

  const localizedHref = (href) => {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return href;
    }
    const url = new URL(href, window.location.origin);
    if (language === "ar") {
      url.searchParams.set("lang", "ar");
    } else {
      url.searchParams.delete("lang");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const hrefForLanguage = (nextLanguage) => {
    const url = new URL(window.location.href);
    if (nextLanguage === "ar") {
      url.searchParams.set("lang", "ar");
    } else {
      url.searchParams.delete("lang");
    }
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const createAction = (action, fallbackVariant) => {
    const link = make("a", `btn ${action.variant || fallbackVariant || "btn-primary"}`);
    link.href = localizedHref(action.href);
    link.textContent = action.label;
    return link;
  };

  const loadJson = async (name) => {
    const response = await fetch(`/content/${language}/${name}.json`, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Missing content file: ${language}/${name}.json`);
    }
    return response.json();
  };

  const renderHeader = (data) => {
    const nav = data.navigation;
    const site = data.site;
    header.innerHTML = "";

    const inner = make("div", "nav-inner");
    const brand = make("a", "brand-link");
    brand.href = localizedHref("/");

    const logo = make("img", "brand-logo");
    logo.src = site.logoHeader;
    logo.alt = site.logoAlt;
    brand.append(logo);

    const brandText = make("span", "brand-text", site.name);
    brand.append(brandText);

    const menuButton = make("button", "menu-toggle");
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", nav.menuLabel);
    menuButton.setAttribute("aria-expanded", "false");
    for (let index = 0; index < 3; index += 1) {
      menuButton.append(make("span"));
    }

    const links = make("nav", "nav-links");
    links.setAttribute("aria-label", nav.primaryLabel);
    nav.links.forEach((item) => {
      const link = make("a", "nav-link", item.label);
      link.href = localizedHref(item.href);
      if (item.page === pageKey) {
        link.setAttribute("aria-current", "page");
      }
      links.append(link);
    });

    const actions = make("div", "nav-actions");
    const nextLanguage = language === "en" ? "ar" : "en";
    const languageToggle = make("a", "language-toggle", nav.languageToggle[nextLanguage]);
    languageToggle.href = hrefForLanguage(nextLanguage);
    languageToggle.setAttribute("aria-label", nav.languageToggle.label);
    actions.append(languageToggle);
    actions.append(createAction(nav.actions.register, "btn-primary"));
    actions.append(createAction(nav.actions.signin, "btn-outline"));

    menuButton.addEventListener("click", () => {
      const isOpen = inner.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    inner.append(brand, menuButton, links, actions);
    header.append(inner);
  };

  const renderFooter = (data) => {
    const foot = data.footer;
    const site = data.site;
    footer.innerHTML = "";

    const inner = make("div", "footer-inner");
    const brandBlock = make("div", "footer-brand");
    const logo = make("img", "footer-logo");
    logo.src = site.logoFooter;
    logo.alt = site.logoAlt;
    const tagline = make("p", "", foot.tagline);
    brandBlock.append(logo, tagline);

    const linkGroups = make("div", "footer-groups");
    foot.groups.forEach((group) => {
      const groupNode = make("div", "footer-group");
      groupNode.append(make("h2", "footer-heading", group.title));
      group.links.forEach((item) => {
        const link = make("a", "", item.label);
        link.href = localizedHref(item.href);
        groupNode.append(link);
      });
      linkGroups.append(groupNode);
    });

    const bottom = make("div", "footer-bottom");
    bottom.append(make("span", "", foot.copyright));
    bottom.append(make("span", "", foot.previewNote));

    inner.append(brandBlock, linkGroups);
    footer.append(inner, bottom);
  };

  const sectionHeader = (section) => {
    const block = make("div", "section-header");
    if (section.eyebrow) block.append(make("p", "eyebrow", section.eyebrow));
    if (section.title) block.append(make("h2", "", section.title));
    if (section.body) block.append(make("p", "section-lede", section.body));
    if (section.note) block.append(make("p", "small-note", section.note));
    return block;
  };

  const renderCard = (item, className) => {
    const card = make("article", className || "feature-card");
    if (item.icon) card.append(make("span", "card-icon", item.icon));
    if (item.kicker) card.append(make("p", "card-kicker", item.kicker));
    if (item.title) card.append(make("h3", "", item.title));
    if (item.body) card.append(make("p", "", item.body));
    if (item.meta) card.append(make("span", "card-meta", item.meta));
    return card;
  };

  const addCta = (container, section) => {
    if (!section.cta && !section.secondaryCta) return;
    const ctaRow = make("div", "section-actions");
    if (section.cta) ctaRow.append(createAction(section.cta, "btn-primary"));
    if (section.secondaryCta) ctaRow.append(createAction(section.secondaryCta, "btn-outline"));
    container.append(ctaRow);
  };

  const renderHeroVisual = (hero) => {
    if (hero.chat) {
      return renderChatMockup(hero.chat, true);
    }

    const visual = make("div", "hero-visual");
    const logoWrap = make("div", "hero-logo-card");
    const logo = make("img", "");
    logo.src = hero.visualLogo || "/assets/aigc/ai_game_connect_website_logo_horizontal_light.png";
    logo.alt = hero.visualLogoAlt || "AI Game Connect";
    logoWrap.append(logo);
    visual.append(logoWrap);

    const grid = make("div", "hero-card-grid");
    (hero.visualCards || []).forEach((item) => {
      grid.append(renderCard(item, "mini-card"));
    });
    visual.append(grid);
    return visual;
  };

  const renderHero = (page) => {
    const hero = page.hero;
    const section = make("section", "hero-section reveal");
    const container = make("div", "section-container hero-grid");
    const copy = make("div", "hero-copy");

    if (hero.eyebrow) copy.append(make("p", "eyebrow", hero.eyebrow));
    copy.append(make("h1", "", hero.title));
    if (hero.body) copy.append(make("p", "hero-lede", hero.body));
    if (hero.differentiator) copy.append(make("p", "differentiator", hero.differentiator));
    if (hero.badge) copy.append(make("p", "founding-badge", hero.badge));
    if (hero.actions) {
      const actionRow = make("div", "hero-actions");
      hero.actions.forEach((action, index) => {
        actionRow.append(createAction(action, index === 0 ? "btn-primary" : "btn-outline"));
      });
      copy.append(actionRow);
    }
    if (hero.trust) copy.append(make("p", "trust-line", hero.trust));

    container.append(copy, renderHeroVisual(hero));
    section.append(container);
    return section;
  };

  const renderCards = (section) => {
    const grid = make("div", `card-grid columns-${section.columns || 3}`);
    (section.items || []).forEach((item) => {
      grid.append(renderCard(item, section.cardClass || "feature-card"));
    });
    return grid;
  };

  const renderBadges = (section) => {
    const grid = make("div", "badge-grid");
    (section.items || []).forEach((item) => {
      grid.append(make("span", "", item));
    });
    return grid;
  };

  const renderSteps = (section) => {
    const list = make("ol", "steps-list");
    (section.items || []).forEach((item) => {
      const li = make("li", "");
      li.append(make("span", "step-number", item.step));
      li.append(make("h3", "", item.title));
      li.append(make("p", "", item.body));
      list.append(li);
    });
    return list;
  };

  const renderLeaderboard = (section) => {
    const wrapper = make("div", "table-card");
    const table = make("table", "");
    const thead = make("thead");
    const headRow = make("tr");
    section.headers.forEach((heading) => headRow.append(make("th", "", heading)));
    thead.append(headRow);

    const tbody = make("tbody");
    section.rows.forEach((row) => {
      const tr = make("tr");
      row.forEach((cell) => tr.append(make("td", "", cell)));
      tbody.append(tr);
    });

    table.append(thead, tbody);
    wrapper.append(table);
    return wrapper;
  };

  const renderFilters = (section) => {
    const filters = make("div", "filter-row");
    section.items.forEach((item) => {
      const button = make("button", "filter-chip", item);
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      filters.append(button);
    });
    return filters;
  };

  const renderBlogGrid = (section) => {
    const grid = make("div", "blog-grid");
    section.items.forEach((item) => {
      const card = make("article", "blog-card");
      card.append(make("p", "card-kicker", item.category));
      card.append(make("h3", "", item.title));
      card.append(make("p", "", item.body));
      card.append(make("span", "card-meta", item.meta));
      grid.append(card);
    });
    return grid;
  };

  const renderChatMockup = (chat, compact) => {
    const mockup = make("div", compact ? "chat-mockup hero-chat" : "chat-mockup");
    const headerRow = make("div", "chat-header");
    headerRow.append(make("span", "chat-status", chat.status));
    headerRow.append(make("strong", "", chat.title));
    mockup.append(headerRow);

    chat.messages.forEach((message) => {
      const bubble = make("p", `chat-bubble ${message.from === "user" ? "is-user" : "is-bot"}`, message.text);
      mockup.append(bubble);
    });
    return mockup;
  };

  const renderFAQ = (section, data) => {
    const items = section.items || data.faq[section.group || pageKey] || [];
    const list = make("div", "faq-list");
    items.forEach((item) => {
      const detail = make("details", "faq-item");
      detail.append(make("summary", "", item.question));
      detail.append(make("p", "", item.answer));
      list.append(detail);
    });
    return list;
  };

  const renderLegal = (section) => {
    const wrapper = make("div", "legal-blocks");
    section.blocks.forEach((block) => {
      const article = make("article", "legal-block");
      article.append(make("h3", "", block.title));
      block.paragraphs.forEach((paragraph) => article.append(make("p", "", paragraph)));
      if (block.items) {
        const list = make("ul", "");
        block.items.forEach((item) => list.append(make("li", "", item)));
        article.append(list);
      }
      wrapper.append(article);
    });
    return wrapper;
  };

  const fieldId = (formKey, field) => `${formKey}-${field.name}`;

  const renderInputField = (formKey, field) => {
    const wrap = make("div", "form-field");
    const id = fieldId(formKey, field);

    if (field.type === "checkboxGroup") {
      const fieldset = make("fieldset", "checkbox-group");
      fieldset.append(make("legend", "", field.label));
      field.options.forEach((option, index) => {
        const optionId = `${id}-${index}`;
        const label = make("label", "check-option");
        const input = make("input");
        input.type = "checkbox";
        input.name = field.name;
        input.value = option;
        input.id = optionId;
        label.append(input, make("span", "", option));
        fieldset.append(label);
      });
      return fieldset;
    }

    if (field.type === "checkbox") {
      const label = make("label", "check-option single-check");
      const input = make("input");
      input.type = "checkbox";
      input.name = field.name;
      input.id = id;
      if (field.required) input.required = true;
      label.append(input, make("span", "", field.label));
      return label;
    }

    const label = make("label", "", field.label);
    label.setAttribute("for", id);
    wrap.append(label);

    if (field.type === "select") {
      const select = make("select");
      select.id = id;
      select.name = field.name;
      if (field.required) select.required = true;
      field.options.forEach((option) => {
        const opt = make("option", "", option);
        opt.value = option;
        select.append(opt);
      });
      wrap.append(select);
      return wrap;
    }

    if (field.type === "textarea") {
      const textarea = make("textarea");
      textarea.id = id;
      textarea.name = field.name;
      textarea.rows = field.rows || 4;
      textarea.placeholder = field.placeholder || "";
      wrap.append(textarea);
      return wrap;
    }

    const input = make("input");
    input.type = field.type || "text";
    input.id = id;
    input.name = field.name;
    input.placeholder = field.placeholder || "";
    if (field.required) input.required = true;
    wrap.append(input);
    return wrap;
  };

  const renderQuestionnaire = (formKey, formData) => {
    const panel = make("article", "form-panel");
    panel.id = formKey;
    panel.append(make("p", "card-kicker", formData.kicker));
    panel.append(make("h3", "", formData.title));
    panel.append(make("p", "", formData.body));
    panel.append(make("p", "founding-line", formData.foundingLine));
    panel.append(make("p", "pricing-line", formData.pricingLine));

    const form = make("form", "questionnaire-form");
    form.noValidate = false;
    formData.fields.forEach((field) => form.append(renderInputField(formKey, field)));
    const submit = make("button", "btn btn-primary");
    submit.type = "submit";
    submit.textContent = formData.submitLabel;
    form.append(submit);

    const confirmation = make("p", "form-confirmation");
    confirmation.hidden = true;
    confirmation.textContent = formData.confirmation;
    form.append(confirmation);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      confirmation.hidden = false;
      form.reset();
    });

    panel.append(form);
    return panel;
  };

  const renderForms = (section, data) => {
    const forms = make("div", "forms-grid");
    section.formKeys.forEach((key) => {
      forms.append(renderQuestionnaire(key, data.forms[key]));
    });
    return forms;
  };

  const renderSignin = (section) => {
    const card = make("div", "coming-card");
    card.append(make("h2", "", section.title));
    card.append(make("p", "", section.body));
    const actions = make("div", "section-actions");
    section.actions.forEach((action, index) => {
      actions.append(createAction(action, index === 0 ? "btn-primary" : "btn-outline"));
    });
    card.append(actions);
    return card;
  };

  const renderNotice = (section) => {
    const notice = make("div", "notice-card");
    if (section.title) notice.append(make("h3", "", section.title));
    if (section.body) notice.append(make("p", "", section.body));
    return notice;
  };

  const renderSectionBody = (section, data) => {
    switch (section.type) {
      case "cards":
      case "activities":
      case "paths":
        return renderCards(section);
      case "badges":
        return renderBadges(section);
      case "steps":
        return renderSteps(section);
      case "leaderboard":
        return renderLeaderboard(section);
      case "filters":
        return renderFilters(section);
      case "blogGrid":
        return renderBlogGrid(section);
      case "chat":
        return renderChatMockup(section.chat, false);
      case "faq":
        return renderFAQ(section, data);
      case "legal":
        return renderLegal(section);
      case "forms":
        return renderForms(section, data);
      case "signin":
        return renderSignin(section);
      case "notice":
        return renderNotice(section);
      default:
        return renderCards(section);
    }
  };

  const renderSection = (section, data) => {
    const node = make("section", `section reveal ${section.tone || ""}`);
    if (section.id) node.id = section.id;
    const container = make("div", `section-container ${section.layout || ""}`);
    if (section.type !== "signin") {
      container.append(sectionHeader(section));
    }
    container.append(renderSectionBody(section, data));
    addCta(container, section);
    node.append(container);
    return node;
  };

  const renderPage = (data) => {
    const page = data[pageKey];
    document.title = page.meta.title;
    setMetaDescription(page.meta.description);

    main.innerHTML = "";
    main.append(renderHero(page));
    page.sections.forEach((section) => {
      main.append(renderSection(section, data));
    });
  };

  const setupReveal = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
  };

  const boot = async () => {
    try {
      const entries = await Promise.all(contentFiles.map(async (name) => [name, await loadJson(name)]));
      const data = Object.fromEntries(entries);
      renderHeader(data);
      renderPage(data);
      renderFooter(data);
      setupReveal();
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ block: "start" });
      }
    } catch (error) {
      main.innerHTML = `<section class="section"><div class="section-container"><div class="notice-card"><h1>Content could not load</h1><p>${error.message}</p></div></div></section>`;
      console.error(error);
    }
  };

  boot();
}());
