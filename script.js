(function () {
  const normalizeBase = (value) => {
    if (!value || value === "./") return "/";
    return value.endsWith("/") ? value : `${value}/`;
  };
  const configuredBase = typeof __AIGC_BASE__ !== "undefined" ? __AIGC_BASE__ : "/";
  const basePath = normalizeBase(configuredBase);
  const withBase = (path) => {
    if (!path || path.startsWith("#") || path.startsWith("mailto:") || path.startsWith("tel:")) {
      return path;
    }
    if (/^[a-z][a-z\d+.-]*:/i.test(path)) {
      return path;
    }
    if (basePath !== "/" && path.startsWith(basePath)) {
      return path;
    }
    if (path.startsWith("/")) {
      return `${basePath}${path.slice(1)}`;
    }
    return `${basePath}${path}`;
  };

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

  const svg = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  const iconLibrary = {
    activity: svg('<path d="M6 8.5h12"/><path d="M8 5.5h8"/><path d="M8 18.5h8"/><path d="M6 15.5h12"/><circle cx="12" cy="12" r="8.5"/>'),
    ball: svg('<circle cx="12" cy="12" r="8.5"/><path d="m12 7 3.5 2.6-1.4 4.2H9.9L8.5 9.6 12 7Z"/><path d="m8.5 9.6-3-.9"/><path d="m15.5 9.6 3-.9"/><path d="m9.9 13.8-2.1 3"/><path d="m14.1 13.8 2.1 3"/>'),
    racket: svg('<path d="M15.6 4.4c2.1 2.1 2 5.7-.2 7.9s-5.8 2.3-7.9.2-2-5.7.2-7.9 5.8-2.3 7.9-.2Z"/><path d="m8.7 13.3-4.4 4.4"/><path d="m3.2 16.6 4.2 4.2"/><path d="M10 6.8h5"/><path d="M8.3 9.3h7.2"/>'),
    board: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16"/><path d="M4 15h16"/><path d="M10 4v16"/><path d="M15 4v16"/>'),
    controller: svg('<path d="M7 10h10c2.2 0 3.6 1.5 4 4.1.4 2.7-.6 4.4-2.3 4.4-.9 0-1.6-.5-2.3-1.5H7.6c-.7 1-1.4 1.5-2.3 1.5-1.7 0-2.7-1.7-2.3-4.4C3.4 11.5 4.8 10 7 10Z"/><path d="M8 13v3"/><path d="M6.5 14.5h3"/><circle cx="16.5" cy="14" r=".7"/><circle cx="18.5" cy="16" r=".7"/>'),
    chess: svg('<path d="M9 20h6"/><path d="M8 17h8"/><path d="M10 14h4l1-6h-6l1 6Z"/><path d="M10 8 8 5.5 10.5 4 12 6l1.5-2L16 5.5 14 8"/>'),
    domino: svg('<rect x="5" y="3.5" width="14" height="17" rx="3" transform="rotate(-8 12 12)"/><path d="M6.2 12.1 18 10.5"/><circle cx="9" cy="8" r=".8"/><circle cx="15.2" cy="16" r=".8"/><circle cx="11.8" cy="16.5" r=".8"/>'),
    reward: svg('<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5.5a2 2 0 0 0 0 4H8"/><path d="M16 6h2.5a2 2 0 0 1 0 4H16"/><path d="M12 13v4"/><path d="M8.5 20h7"/><path d="M10 17h4"/>'),
    check: svg('<path d="M20 7 10 17l-5-5"/><circle cx="12" cy="12" r="9"/>'),
    message: svg('<path d="M5 5h14v10H8l-4 4V6a1 1 0 0 1 1-1Z"/><path d="M8 9h8"/><path d="M8 12h5"/>'),
    users: svg('<path d="M8.5 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M15.5 11a3 3 0 1 0 0-6"/><path d="M3.5 20a5 5 0 0 1 10 0"/><path d="M14 17.5a4.5 4.5 0 0 1 6.5 2.5"/>'),
    map: svg('<path d="M12 21s6-5.1 6-10a6 6 0 0 0-12 0c0 4.9 6 10 6 10Z"/><circle cx="12" cy="11" r="2.2"/>'),
    calendar: svg('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M4 10h16"/><path d="M8 14h3"/><path d="M13 14h3"/>'),
    trend: svg('<path d="M4 17h16"/><path d="m6 14 4-4 3 3 5-7"/><path d="M15 6h3v3"/>'),
    venue: svg('<path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M9 20v-6h6v6"/><path d="M9.5 10.5h5"/>'),
    shield: svg('<path d="M12 21s7-3.5 7-10V5l-7-2-7 2v6c0 6.5 7 10 7 10Z"/><path d="m9 12 2 2 4-5"/>'),
    tag: svg('<path d="M4 12.5V5h7.5L20 13.5 13.5 20 4 12.5Z"/><circle cx="8" cy="8" r="1.2"/>'),
    badge: svg('<circle cx="12" cy="9" r="5"/><path d="m8.5 13.5-1 6 4.5-2.3 4.5 2.3-1-6"/><path d="m10 9 1.3 1.3L14 7.6"/>'),
    flag: svg('<path d="M6 21V4"/><path d="M6 5h11l-2 4 2 4H6"/>'),
    repeat: svg('<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9a3 3 0 0 1 3-3h14"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v2a3 3 0 0 1-3 3h-14"/>'),
    document: svg('<path d="M7 3.5h7l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V7h3"/><path d="M9 11h6"/><path d="M9 15h6"/>'),
    spark: svg('<path d="m12 3 1.6 5.1L19 10l-5.4 1.9L12 17l-1.6-5.1L5 10l5.4-1.9L12 3Z"/><path d="M5 16.5 3.5 21"/><path d="M19 16.5l1.5 4.5"/>')
  };
  const iconMap = {
    FB: "ball", PD: "racket", BG: "board", PS: "controller", CH: "chess", DM: "domino",
    RW: "reward", OK: "check", RQ: "message", IN: "users", LOC: "map", TM: "calendar",
    UP: "trend", LT: "reward", VH: "venue", AC: "flag", SC: "calendar", SP: "spark",
    VD: "tag", CP: "reward", PR: "badge", BD: "badge", PO: "tag", LR: "trend",
    MD: "users", BV: "trend", TV: "shield", PL: "users", VN: "venue", AR: "map",
    FP: "shield", VA: "check", CR: "check", NF: "shield", TR: "reward", PT: "users",
    RS: "trend", CS: "repeat", DS: "tag", EV: "calendar", VS: "venue", TOP: "reward",
    ST: "repeat", GG: "document", SF: "shield", MAP: "map", RL: "shield", GR: "message",
    RR: "reward", OF: "tag", AV: "venue", CN: "users", RK: "trend", LB: "trend",
    SR: "spark", TP: "reward", CM: "users"
  };
  const iconTheme = (item) => {
    const source = `${item.icon || ""} ${item.title || ""}`.toLowerCase();
    if (/reward|badge|leader|rank|gold|#1|top|rw|lr|bd|cp|vd/.test(source)) return "gold";
    if (/safe|approved|venue|field|court|trust|safety|ok|fp|tv|shield/.test(source)) return "green";
    if (/dawrak|request|notification|assistant|orange|rq|in/.test(source)) return "orange";
    return "blue";
  };
  const renderIcon = (item) => {
    const icon = make("span", `card-icon icon-${iconTheme(item)}`);
    icon.setAttribute("aria-hidden", "true");
    const raw = String(item.icon || "");
    if (/^#?\d+$/.test(raw)) {
      icon.innerHTML = `<span class="icon-number">${raw}</span>`;
      return icon;
    }
    const key = iconMap[raw] || "spark";
    icon.innerHTML = iconLibrary[key] || iconLibrary.spark;
    return icon;
  };
  const classToken = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const canonicalBaseUrl = "https://ai-game-connect.github.io/aigameconnect-website/";
  const routePaths = {
    home: "",
    dawrak: "dawrak/",
    leaderboard: "leaderboard/",
    rewards: "rewards/",
    blog: "blog/",
    about: "about/",
    register: "register/",
    signin: "signin/",
    privacy: "privacy/",
    terms: "terms/"
  };
  const routePath = routePaths[pageKey] || "";
  const canonicalUrl = `${canonicalBaseUrl}${routePath}`;
  const ogImageUrl = `${canonicalBaseUrl}assets/og/ai-game-connect-og.svg`;
  const ogImageAlt = "AI Game Connect social preview with connect, compete, rank, reward, and approved places messaging.";
  const safeMetaDescription = "AI Game Connect helps players find real-life games and sports, compete in approved places, track rankings, and unlock rewards through safe communities.";
  const assetUrl = (path) => {
    if (!path) return "";
    if (/^[a-z][a-z\d+.-]*:/i.test(path)) return path;
    return new URL(path.replace(/^\//, ""), canonicalBaseUrl).toString();
  };

  const ensureMeta = (attribute, key, value) => {
    if (!value) return;
    let meta = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, key);
      document.head.append(meta);
    }
    meta.content = value;
  };

  const ensureLink = (rel, href, extra = {}) => {
    const selector = extra.hreflang ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]` : `link[rel="${rel}"]`;
    let link = document.querySelector(selector);
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      if (extra.hreflang) link.hreflang = extra.hreflang;
      document.head.append(link);
    }
    link.href = href;
  };

  const setStructuredData = (data, page) => {
    ["structured-data", "static-structured-data"].forEach((id) => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    const graph = [];
    if (pageKey === "home") {
      graph.push({
        "@type": "Organization",
        "@id": `${canonicalBaseUrl}#organization`,
        name: data.site.name,
        url: canonicalBaseUrl,
        logo: assetUrl(data.site.logoHeader),
        description: page.meta.description || safeMetaDescription
      });
      graph.push({
        "@type": "WebSite",
        "@id": `${canonicalBaseUrl}#website`,
        name: data.site.name,
        url: canonicalBaseUrl,
        description: page.meta.description || safeMetaDescription,
        publisher: { "@id": `${canonicalBaseUrl}#organization` },
        inLanguage: language
      });
    }

    const faqItems = page.sections
      .filter((section) => section.type === "faq")
      .flatMap((section) => data.faq[section.group || pageKey] || []);
    if (faqItems.length) {
      graph.push({
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        url: canonicalUrl,
        inLanguage: language,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      });
    }

    if (!graph.length) return;
    const script = document.createElement("script");
    script.id = "structured-data";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.append(script);
  };

  const updatePageMetadata = (data, page) => {
    const title = page.meta.title || "AI Game Connect";
    const description = page.meta.description || safeMetaDescription;
    document.title = title;
    ensureMeta("name", "description", description);
    ensureMeta("name", "robots", "index, follow");
    ensureMeta("name", "theme-color", "#07111F");
    ensureMeta("http-equiv", "content-language", language);

    ensureLink("canonical", canonicalUrl);
    ensureLink("alternate", canonicalUrl, { hreflang: "en" });
    ensureLink("alternate", `${canonicalUrl}?lang=ar`, { hreflang: "ar" });
    ensureLink("alternate", canonicalUrl, { hreflang: "x-default" });

    ensureMeta("property", "og:site_name", data.site.name);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", canonicalUrl);
    ensureMeta("property", "og:locale", language === "ar" ? "ar_EG" : "en_US");
    ensureMeta("property", "og:locale:alternate", language === "ar" ? "en_US" : "ar_EG");
    ensureMeta("property", "og:image", ogImageUrl);
    ensureMeta("property", "og:image:type", "image/svg+xml");
    ensureMeta("property", "og:image:alt", ogImageAlt);

    ensureMeta("name", "twitter:card", "summary_large_image");
    ensureMeta("name", "twitter:title", title);
    ensureMeta("name", "twitter:description", description);
    ensureMeta("name", "twitter:image", ogImageUrl);
    ensureMeta("name", "twitter:image:alt", ogImageAlt);

    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const icon = document.createElement("link");
      icon.rel = "apple-touch-icon";
      icon.href = withBase("/assets/aigc/ai_game_connect_website_icon_light.png");
      document.head.append(icon);
    }
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifest = document.createElement("link");
      manifest.rel = "manifest";
      manifest.href = withBase("/site.webmanifest");
      document.head.append(manifest);
    }

    setStructuredData(data, page);
  };

  const localizedHref = (href) => {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return href;
    }
    const url = new URL(withBase(href), window.location.origin);
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
    const response = await fetch(withBase(`/content/${language}/${name}.json`), { cache: "no-cache" });
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
    logo.src = withBase(site.logoHeader);
    logo.alt = site.logoAlt;
    brand.append(logo);

    const brandText = make("span", "brand-text", site.name);
    brand.append(brandText);

    const menuButton = make("button", "menu-toggle");
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", nav.menuLabel);
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "primary-navigation");
    for (let index = 0; index < 3; index += 1) {
      const bar = make("span");
      bar.setAttribute("aria-hidden", "true");
      menuButton.append(bar);
    }

    const links = make("nav", "nav-links");
    links.id = "primary-navigation";
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

    const closeLabel = nav.closeLabel || "Close navigation";
    const closeMenu = () => {
      inner.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", nav.menuLabel);
    };

    menuButton.addEventListener("click", () => {
      const isOpen = inner.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? closeLabel : nav.menuLabel);
    });
    links.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    actions.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
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
    logo.src = withBase(site.logoFooter);
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
    if (foot.safetyNote) bottom.append(make("span", "", foot.safetyNote));

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
    card.classList.add(`theme-${iconTheme(item)}`);
    if (item.icon) card.classList.add(`icon-key-${classToken(item.icon)}`);
    if (item.icon) card.append(renderIcon(item));
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

    const visual = make("div", "hero-visual hero-product-visual");
    visual.setAttribute("role", "group");
    visual.setAttribute("aria-label", hero.visualLabel || hero.title || "AI Game Connect product preview");
    visual.append(make("span", "hero-connector hero-connector-one"));
    visual.append(make("span", "hero-connector hero-connector-two"));
    const logoWrap = make("div", "hero-logo-card");
    const logo = make("img", "");
    logo.src = withBase(hero.visualLogo || "/assets/aigc/ai_game_connect_website_logo_horizontal_light.png");
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
    const section = make("section", `hero-section page-${pageKey}-hero reveal`);
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
    grid.setAttribute("role", "list");
    grid.setAttribute("aria-label", section.title || "Safety badges");
    (section.items || []).forEach((item) => {
      const badge = make("span", "", item);
      badge.setAttribute("role", "listitem");
      grid.append(badge);
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
    const stack = make("div", "leaderboard-preview-stack");
    stack.setAttribute("role", "region");
    stack.setAttribute("aria-label", section.ariaLabel || section.title || "Leaderboard preview");
    const previewLabel = section.previewLabel || (pageKey === "leaderboard" ? "Preview only - ranking profiles are coming soon." : "");
    if (previewLabel) {
      stack.append(make("p", "preview-label", previewLabel));
    }

    const topGrid = make("div", "top-rank-grid");
    section.rows.slice(0, 3).forEach((row, index) => {
      const card = make("article", `top-rank-card rank-${index + 1}`);
      card.style.setProperty("--stagger", index);
      card.append(make("span", "top-rank-number", row[0]));
      card.append(make("h3", "", row[1]));
      card.append(make("p", "top-rank-detail", `${row[2]} - ${row[3]}`));
      card.append(make("strong", "top-rank-score", row[4]));
      const meta = make("div", "rank-card-meta");
      meta.append(make("span", "verified-pill", section.verifiedLabel || "Verified preview"));
      meta.append(make("span", "movement-pill", index === 0 ? "+3" : index === 1 ? "+2" : "+1"));
      card.append(meta);
      topGrid.append(card);
    });
    if (section.rows.length >= 3) stack.append(topGrid);

    const wrapper = make("div", "table-card");
    const table = make("table", "");
    const caption = make("caption", "sr-only", section.tableCaption || section.title || "Leaderboard preview table");
    table.append(caption);
    const thead = make("thead");
    const headRow = make("tr");
    section.headers.forEach((heading) => headRow.append(make("th", "", heading)));
    thead.append(headRow);

    const tbody = make("tbody");
    section.rows.forEach((row, index) => {
      const tr = make("tr");
      tr.classList.add("leaderboard-row");
      tr.style.setProperty("--stagger", index);
      if (index < 3) tr.classList.add("is-top-rank", `rank-${index + 1}`);
      row.forEach((cell, cellIndex) => {
        const td = make("td", "", cell);
        td.dataset.label = section.headers[cellIndex] || "";
        if (cellIndex === 1 && pageKey === "leaderboard") {
          td.append(make("span", "sample-tag", section.sampleLabel || "Sample"));
        }
        if (cellIndex === row.length - 1) {
          td.append(make("span", "movement-pill table-move", index % 2 === 0 ? "+3" : "+1"));
        }
        tr.append(td);
      });
      tbody.append(tr);
    });

    table.append(thead, tbody);
    wrapper.append(table);
    stack.append(wrapper);
    return stack;
  };

  const renderFilters = (section) => {
    const filters = make("div", "filter-row");
    section.items.forEach((item, index) => {
      const button = make("button", "filter-chip", item);
      button.type = "button";
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      filters.append(button);
    });
    return filters;
  };

  const renderBlogGrid = (section) => {
    const grid = make("div", `blog-grid ${section.featured || section.items.length === 1 ? "is-featured-grid" : ""}`);
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

  const renderNotificationStack = (section) => {
    const stack = make("div", "notification-stack");
    (section.items || []).forEach((item, index) => {
      const card = renderCard(item, "notification-card");
      card.style.setProperty("--stagger", index);
      stack.append(card);
    });
    return stack;
  };

  const renderRankingPreview = (section) => {
    const grid = make("div", "ranking-preview-grid");
    (section.items || []).forEach((item, index) => {
      const card = renderCard(item, "ranking-preview-card");
      card.style.setProperty("--stagger", index);
      grid.append(card);
    });
    return grid;
  };

  const renderRewardBadges = (section) => {
    const grid = make("div", "reward-badge-grid");
    grid.setAttribute("role", "list");
    grid.setAttribute("aria-label", section.title || "Reward badge preview");
    (section.items || []).forEach((item, index) => {
      const card = renderCard(item, "reward-badge-card");
      card.setAttribute("role", "listitem");
      card.style.setProperty("--stagger", index);
      grid.append(card);
    });
    return grid;
  };

  const renderChatMockup = (chat, compact) => {
    const mockup = make("div", compact ? "chat-mockup hero-chat" : "chat-mockup");
    mockup.setAttribute("role", "group");
    mockup.setAttribute("aria-label", chat.ariaLabel || chat.title || "Dawrak chat preview");
    const headerRow = make("div", "chat-header");
    headerRow.append(make("span", "chat-status", chat.status));
    headerRow.append(make("strong", "", chat.title));
    mockup.append(headerRow);

    chat.messages.forEach((message, index) => {
      const bubble = make("p", `chat-bubble ${message.from === "user" ? "is-user" : "is-bot"}`, message.text);
      bubble.style.setProperty("--stagger", index);
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
    const status = make("div", "legal-status-card");
    status.append(make("span", "preview-label", section.eyebrow || ""));
    if (section.body) status.append(make("p", "", section.body));
    wrapper.append(status);
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
    const wrap = make("div", `form-field field-${field.type || "text"}`);
    const id = fieldId(formKey, field);

    if (field.type === "checkboxGroup") {
      const fieldset = make("fieldset", "checkbox-group");
      fieldset.classList.add("field-checkbox-group");
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
      label.classList.add("field-checkbox");
      const input = make("input");
      input.type = "checkbox";
      input.name = field.name;
      input.id = id;
      if (field.required) input.required = true;
      if (field.required) input.setAttribute("aria-required", "true");
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
      if (field.required) select.setAttribute("aria-required", "true");
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
    if (field.required) input.setAttribute("aria-required", "true");
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
    if (formData.sections) {
      const fieldsByName = new Map(formData.fields.map((field) => [field.name, field]));
      formData.sections.forEach((group) => {
        const groupNode = make("div", "questionnaire-section");
        const heading = make("div", "questionnaire-section-heading");
        heading.append(make("span", "section-dot"));
        heading.append(make("h4", "", group.title));
        groupNode.append(heading);
        if (group.body) groupNode.append(make("p", "questionnaire-section-copy", group.body));
        (group.fields || []).forEach((fieldName) => {
          const field = fieldsByName.get(fieldName);
          if (field) groupNode.append(renderInputField(formKey, field));
        });
        form.append(groupNode);
      });
    } else {
      formData.fields.forEach((field) => form.append(renderInputField(formKey, field)));
    }
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
    if (section.label) card.append(make("p", "preview-label", section.label));
    card.append(make("h2", "", section.title));
    card.append(make("p", "", section.body));
    if (section.notes) {
      const notes = make("div", "signin-note-grid");
      section.notes.forEach((note) => notes.append(make("span", "", note)));
      card.append(notes);
    }
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
      case "timeline":
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
      case "notifications":
        return renderNotificationStack(section);
      case "rankingPreview":
        return renderRankingPreview(section);
      case "rewardBadges":
        return renderRewardBadges(section);
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
    const node = make("section", `section reveal section-${section.type || "cards"} ${section.tone || ""}`);
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
    updatePageMetadata(data, page);

    main.innerHTML = "";
    main.append(renderHero(page));
    page.sections.forEach((section) => {
      main.append(renderSection(section, data));
    });
  };

  const setupReveal = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".card-grid, .hero-card-grid, .badge-grid, .steps-list, .blog-grid, .forms-grid, .faq-list, .top-rank-grid, .notification-stack, .ranking-preview-grid, .reward-badge-grid, tbody").forEach((group) => {
      Array.from(group.children).forEach((child, index) => {
        child.style.setProperty("--stagger", index);
      });
    });
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
