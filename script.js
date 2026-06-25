const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#nav-links");
const year = document.querySelector("#year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = new Date().getFullYear();
}

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navLinks.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll('a[href="./dawrak/"][target="_blank"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (window.location.protocol !== "file:") {
      return;
    }

    event.preventDefault();
    window.open(new URL("./dawrak/index.html", window.location.href).href, "_blank", "noopener,noreferrer");
  });
});

document.querySelectorAll('a[href="../"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (window.location.protocol !== "file:" || !link.textContent.includes("AI Game Connect")) {
      return;
    }

    event.preventDefault();
    window.location.href = new URL("../index.html", window.location.href).href;
  });
});

const revealItems = document.querySelectorAll(
  ".section, .feature-card, .step-card, .list-card, .story-panel, .ecosystem-panel"
);

if (revealItems.length && !prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );

  revealItems.forEach((item) => {
    item.classList.add("reveal-ready");
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
