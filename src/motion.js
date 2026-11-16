import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  createIntro,
  createLiquidFooter,
  createPreviewSurface,
} from "./effects.js";
import { artworks } from "./content.js";
let dispose = () => {};
export const disposeMotion = () => dispose();
export function mountMotion(
  logo,
  {
    reduced = false,
    intro = null,
    duration = 1.8,
    onIntroComplete = () => {},
  } = {},
) {
  dispose();
  const controller = new AbortController(),
    { signal } = controller;
  let alive = true,
    frame = 0,
    liquid = null,
    previewSurface = null,
    introCleanup = () => {};
  const hero = document.querySelector(".hero"),
    original = document.querySelector(".hero-portrait"),
    section = document.querySelector(".portrait-section");
  const footer = document.querySelector("footer"),
    preview = document.querySelector(".hover-preview");
  const title = document.querySelector(".hero-title");
  if (title && !title.dataset.split) {
    title.setAttribute("aria-label", title.textContent);
    title.innerHTML = [...title.textContent]
      .map(
        (c, i) =>
          `<span aria-hidden="true" style="--letter:${i}">${c === " " ? "&nbsp;" : c}</span>`,
      )
      .join("");
    title.dataset.split = "true";
  }
  document.body.classList.toggle("motion-ready", !intro);
  document.body.classList.toggle("motion-enhanced", !reduced);
  document.body.classList.toggle("user-reduced-motion", reduced);
  if (reduced) {
    intro?.remove();
    document.body.classList.remove("intro-playing");
    document.body.classList.add("motion-ready");
    dispose = () => controller.abort();
    return;
  }
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const smooth = fine
    ? new Lenis({
        lerp: 0.12,
        smoothWheel: true,
        anchors: false,
        autoRaf: false,
      })
    : null;
  const mirror = original?.cloneNode();
  if (mirror) {
    mirror.className = "portrait-flight";
    mirror.alt = "";
    mirror.setAttribute("aria-hidden", "true");
    document.body.append(mirror);
  }
  let upgraded = false;
  function upgradeArt() {
    if (upgraded || !original || !mirror) return;
    upgraded = true;
    const size = Math.min(innerWidth * Math.min(devicePixelRatio, 1.5), 2000);
    const width = size > 1280 ? 2000 : size > 800 ? 1280 : 800;
    const image = new Image();
    image.src =
      import.meta.env.BASE_URL +
      "art/optimized/" +
      original.dataset.artId +
      "-" +
      width +
      ".avif";
    image
      .decode()
      .then(() => {
        if (alive) {
          mirror.src = image.src;
          wake();
        }
      })
      .catch(() => {
        if (alive)
          mirror.src =
            import.meta.env.BASE_URL +
            "art/optimized/" +
            original.dataset.artId +
            "-" +
            width +
            ".webp";
      });
  }
  let origin,
    tx = innerWidth * 0.74,
    ty = innerHeight * 0.5,
    x = tx,
    y = ty,
    lastX = tx,
    velocity = 0,
    lastScroll = scrollY,
    speed = 0;
  function measure() {
    if (original) {
      const r = original.getBoundingClientRect();
      origin = {
        left: r.left,
        top: r.top + scrollY,
        width: r.width,
        height: r.height,
      };
    }
    liquid?.invalidate();
    wake();
  }
  function wake() {
    if (alive && !frame && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  if (fine) previewSurface = createPreviewSurface(preview, wake);
  function tick(now) {
    frame = 0;
    if (!alive || document.hidden) return;
    smooth?.raf(now);
    // Read geometry before writing transforms; no per-frame canvas resizing.
    const sectionRect = section?.getBoundingClientRect(),
      footerRect = footer?.getBoundingClientRect();
    const markRect = liquid?.needsLayout
      ? footer?.querySelector(".footer-mark").getBoundingClientRect()
      : null;
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    velocity += (tx - lastX - velocity) * 0.2;
    lastX = tx;
    speed += (scrollY - lastScroll - speed) * 0.18;
    lastScroll = scrollY;
    if (preview) {
      preview.style.left = x + "px";
      preview.style.top = y + "px";
    }
    if (mirror && origin && sectionRect) {
      const p = Math.max(0, Math.min(1, scrollY / (innerHeight * 0.95))),
        ease = p * p * (3 - 2 * p),
        visible =
          !document.querySelector(".intro") &&
          scrollY > 1 &&
          sectionRect.bottom > 0;
      if (visible && scrollY > 70) upgradeArt();
      const mix = (a, b) => a + (b - a) * ease;
      mirror.style.display = visible ? "block" : "none";
      original.style.opacity = visible ? "0" : "1";
      section.classList.toggle("flight-active", visible);
      Object.assign(mirror.style, {
        left: mix(origin.left, 0) + "px",
        top: mix(origin.top - scrollY, 0) + "px",
        width: mix(origin.width, innerWidth) + "px",
        height: mix(origin.height, innerHeight) + "px",
        transform: `perspective(1600px) rotateX(${Math.max(-3, Math.min(3, speed * 0.1)) * (1 - ease)}deg)`,
      });
      section.style.setProperty(
        "--progress",
        Math.max(
          0,
          Math.min(1, (innerHeight - sectionRect.top) / (innerHeight * 1.25)),
        ),
      );
    }
    previewSurface?.draw(x, y, velocity);
    liquid?.draw(now, footerRect, markRect);
    if (
      Math.abs(tx - x) + Math.abs(ty - y) > 0.15 ||
      Math.abs(velocity) > 0.05 ||
      Math.abs(speed) > 0.05 ||
      smooth?.isScrolling === "smooth" ||
      liquid?.active
    )
      wake();
  }
  const observer =
    footer && fine
      ? new IntersectionObserver(
          (entries) => {
            const near = entries[0].isIntersecting;
            if (near && !liquid) {
              liquid = createLiquidFooter(
                footer,
                logo,
                import.meta.env.BASE_URL +
                  "art/optimized/" +
                  artworks[0].id +
                  "-800.webp",
                wake,
              );
              wake();
            }
          },
          { rootMargin: "200px" },
        )
      : null;
  observer?.observe(footer);
  if (intro) {
    introCleanup = createIntro(
      intro,
      original,
      () => {
        onIntroComplete();
        document.body.classList.add("motion-ready");
        wake();
      },
      { duration },
    );
  }
  document.addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      wake();
    },
    { signal, passive: true },
  );
  document.addEventListener(
    "preview-position",
    (e) => {
      tx = e.detail.x;
      ty = e.detail.y;
      wake();
    },
    { signal },
  );
  document.addEventListener(
    "preview-image",
    (e) => {
      liquid?.setImage(e.detail);
      previewSurface?.invalidate();
      wake();
    },
    { signal },
  );
  window.addEventListener("scroll", wake, { signal, passive: true });
  window.addEventListener("wheel", wake, { signal, passive: true });
  window.addEventListener("resize", measure, { signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else wake();
    },
    { signal },
  );
  document.fonts?.ready.then(() => {
    if (alive) measure();
  });
  measure();
  dispose = () => {
    alive = false;
    cancelAnimationFrame(frame);
    controller.abort();
    observer?.disconnect();
    smooth?.destroy();
    introCleanup();
    liquid?.destroy();
    previewSurface?.destroy();
    mirror?.remove();
    if (original) original.style.opacity = "";
    section?.classList.remove("flight-active");
    document.body.classList.remove("intro-playing", "motion-enhanced");
    document.body.classList.add("motion-ready");
  };
}
