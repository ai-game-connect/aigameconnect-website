import { resolve } from "node:path";
import { defineConfig } from "vite";

const pages = [
  "index.html",
  "dawrak/index.html",
  "leaderboard/index.html",
  "rewards/index.html",
  "blog/index.html",
  "about/index.html",
  "register/index.html",
  "signin/index.html",
  "privacy/index.html",
  "terms/index.html",
  "senet/index.html",
  "venues/index.html",
  "rules/index.html",
  "contact/index.html"
];

const base = "/aigameconnect-website/";

export default defineConfig({
  base,
  define: {
    __AIGC_BASE__: JSON.stringify(base)
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [
          page === "index.html" ? "home" : page.replace("/index.html", ""),
          resolve(__dirname, page)
        ])
      )
    }
  }
});
