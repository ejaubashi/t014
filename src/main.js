import "@fontsource/anton/latin-400.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "./style.css";
import { logo, artworks } from "./content.js";
import { renderPage, routeFromPath, metadata } from "./render.js";
import { mountMotion, disposeMotion } from "./motion.js";
const base = import.meta.env.BASE_URL,
  app = document.querySelector("#app");
let preferences;
try {
  preferences = localStorage.getItem("reduce-motion") === "true";
} catch {}
const systemMotion = matchMedia("(prefers-reduced-motion: reduce)");
export const motionReduced = () => systemMotion.matches || preferences === true;
let currentRoute = routeFromPath(location.pathname, base),
  introPlayed = false,
  pageController;
const storage = {
  get() {
    try {
      return sessionStorage.getItem("visited") === "1";
    } catch {
      return introPlayed;
    }
  },
  set() {
    introPlayed = true;
    try {
      sessionStorage.setItem("visited", "1");
    } catch {}
  },
};
function updateMeta() {
  const meta = metadata(currentRoute);
  document.title = meta.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", meta.description);
  for (const [selector, value] of [
    ['link[rel="canonical"]', meta.url],
    ['meta[property="og:title"]', meta.title],
    ['meta[property="og:description"]', meta.description],
    ['meta[property="og:url"]', meta.url],
    ['meta[property="og:image"]', meta.image],
    ['meta[name="twitter:title"]', meta.title],
    ['meta[name="twitter:description"]', meta.description],
    ['meta[name="twitter:image"]', meta.image],
  ]) {
    const node = document.querySelector(selector);
    node?.setAttribute(node.tagName === "LINK" ? "href" : "content", value);
  }
}
function bindPage() {
  pageController?.abort();
  pageController = new AbortController();
  const { signal } = pageController;
  updateMeta();
  const preview = document.querySelector(".hover-preview");
  document.querySelectorAll(".project[data-art]").forEach((row) => {
    const show = (keyboard) => {
      if (!preview) return;
      preview.src = row.dataset.art;
      preview.classList.add("visible");
      if (keyboard)
        document.dispatchEvent(
          new CustomEvent("preview-position", {
            detail: { x: innerWidth * 0.74, y: innerHeight * 0.5 },
          }),
        );
      document.dispatchEvent(
        new CustomEvent("preview-image", { detail: preview.src }),
      );
    };
    row.addEventListener("pointerenter", () => show(false), { signal });
    row.addEventListener("focus", () => show(true), { signal });
    row.addEventListener(
      "pointerleave",
      () => {
        if (!row.matches(":focus-visible"))
          preview?.classList.remove("visible");
      },
      { signal },
    );
    row.addEventListener("blur", () => preview?.classList.remove("visible"), {
      signal,
    });
  });
  const replay = document.querySelector(".replay-intro");
  if (replay) {
    replay.hidden = Boolean(currentRoute) || motionReduced();
    if (!replay.hidden)
      replay.addEventListener(
        "click",
        () => {
          document
            .querySelector(".hero")
            ?.scrollIntoView({ behavior: "instant" });
          startIntro(true);
        },
        { signal },
      );
  }
  const toggle = document.querySelector(".motion-toggle");
  if (toggle) {
    toggle.hidden = false;
    toggle.setAttribute("aria-pressed", String(preferences === true));
    toggle.textContent = systemMotion.matches
      ? "System: reduced motion"
      : preferences
        ? "Enable motion"
        : "Reduce motion";
    toggle.disabled = systemMotion.matches;
    toggle.addEventListener(
      "click",
      () => {
        preferences = !preferences;
        try {
          localStorage.setItem("reduce-motion", String(preferences));
        } catch {}
        refreshMotion();
      },
      { signal },
    );
  }
  mountMotion(logo, { reduced: motionReduced() });
}
function finishIntro() {
  if (document.querySelector(".intro"))
    performance.mark("portfolio:intro-complete");
  storage.set();
  document.querySelector(".intro")?.remove();
  document.body.classList.remove("intro-playing");
  document.body.classList.add("motion-ready");
}
function startIntro(full = false) {
  if (currentRoute || motionReduced()) return;
  finishIntro();
  const intro = document.createElement("div");
  intro.className = "intro";
  intro.innerHTML = `<div class="intro-logo" aria-hidden="true">${logo}</div><div class="intro-strip" aria-hidden="true">${Array.from({ length: 11 }, (_, i) => `<img src="${i === 5 ? base + "art/optimized/sand-spline-02-400.webp" : base + "art/optimized/" + artworks[i % 3].id + "-400.webp"}" alt="">`).join("")}</div><button type="button" class="skip-intro">Skip intro</button>`;
  document.body.append(intro);
  document.body.classList.add("intro-playing");
  intro.querySelector("button").addEventListener("click", () => {
    finishIntro();
    document.querySelector("#main")?.focus({ preventScroll: true });
  });
  mountMotion(logo, {
    reduced: false,
    intro,
    duration: full ? 5.05 : 1.8,
    onIntroComplete: finishIntro,
  });
}
function refreshMotion() {
  finishIntro();
  bindPage();
}
systemMotion.addEventListener("change", refreshMotion);
function activate({ focus = false, restore = null } = {}) {
  disposeMotion();
  currentRoute = routeFromPath(location.pathname, base);
  app.innerHTML = renderPage(currentRoute, base);
  bindPage();
  requestAnimationFrame(() => {
    if (restore) {
      window.scrollTo({ top: restore.scroll || 0, behavior: "instant" });
      document.getElementById(restore.focusId)?.focus({ preventScroll: true });
      return;
    }
    const target = location.hash
      ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
      : null;
    if (target) target.scrollIntoView({ behavior: "instant", block: "center" });
    else window.scrollTo({ top: 0, behavior: "instant" });
    if (focus)
      (target?.matches("a") ? target : document.querySelector("#main"))?.focus({
        preventScroll: true,
      });
  });
}
history.scrollRestoration = "manual";
document.addEventListener("click", (event) => {
  const a = event.target.closest("a");
  if (
    !a ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    a.target ||
    a.hasAttribute("download") ||
    a.origin !== location.origin ||
    !a.pathname.startsWith(base)
  )
    return;
  if (a.pathname === location.pathname && a.hash) return;
  event.preventDefault();
  finishIntro();
  history.replaceState(
    { ...history.state, scroll: scrollY, focusId: a.closest(".project")?.id },
    "",
  );
  const go = () => {
    history.pushState({}, "", a.href);
    activate({ focus: true });
  };
  if (document.startViewTransition && !motionReduced()) {
    const image = document.querySelector(".preview-surface.visible");
    if (image) image.style.viewTransitionName = "project-art";
    document.startViewTransition(go);
  } else go();
});
document.addEventListener("focusin", (event) => {
  if (document.querySelector(".intro") && !event.target.closest(".intro"))
    finishIntro();
});
window.addEventListener("popstate", () =>
  activate({ restore: history.state || { scroll: 0 } }),
);
if (!app.querySelector("main")) app.innerHTML = renderPage(currentRoute, base);
bindPage();
if (
  !currentRoute &&
  !location.hash &&
  (!storage.get() || new URLSearchParams(location.search).has("replay"))
)
  startIntro(new URLSearchParams(location.search).has("replay"));
if (location.hash)
  requestAnimationFrame(() =>
    document
      .getElementById(decodeURIComponent(location.hash.slice(1)))
      ?.scrollIntoView({ behavior: "instant", block: "center" }),
  );
if (new URLSearchParams(location.search).has("metrics")) import("./metrics.js");
