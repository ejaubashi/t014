import { profile, logo, projects, artworks } from "./content.js";
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const e = escapeHTML;
export function picture(art, base, { className = "", eager = false } = {}) {
  const widths = [400, 800, 1280, 2000].filter((w) => w <= art.width);
  const srcset = (format) =>
    widths
      .map((w) => `${base}art/optimized/${art.id}-${w}.${format} ${w}w`)
      .join(", ");
  const max = widths.at(-1);
  return `<picture class="${className}"><source type="image/avif" srcset="${srcset("avif")}" sizes="(max-width: 700px) 90vw, 70vw"><img src="${base}art/optimized/${art.id}-${max}.webp" srcset="${srcset("webp")}" sizes="(max-width: 700px) 90vw, 70vw" width="${art.width}" height="${art.height}" alt="${e(art.title)} — generative artwork by ${e(art.artist)}" loading="${eager ? "eager" : "lazy"}" decoding="async" ${eager ? 'fetchpriority="high"' : ""}></picture>`;
}
const nav = (base) =>
  `<nav aria-label="Main navigation"><a href="${base}#projects">Work <span>(${String(projects.length).padStart(2, "0")})</span></a><a href="${base}#about">About</a><a href="${base}#contact">Contact</a></nav>`;
const homeLink = (base) =>
  `<a class="brand-link" href="${base}" aria-label="${profile.name} — home">${logo}</a>`;
const credit = (art, base) =>
  `<figcaption><span>${e(art.title)} · ${e(art.artist)}</span><a href="${art.source}" target="_blank" rel="noreferrer">Original source ↗</a><a href="${base}art/originals/${art.original}" download>Download original (${art.width}×${art.height}) ↓</a></figcaption>`;
const footer = (base) =>
  `<footer id="contact"><div class="footer-nav">${nav(base)}<a class="contact-mail" href="mailto:${profile.email}">${profile.email} ↗</a></div><div class="footer-contact"><p class="eyebrow">Have a project in mind?</p><h2>LET’S MAKE<br>SOMETHING MATTER.</h2><a class="contact-cta" href="mailto:${profile.email}">Start a conversation <span>↗</span></a></div><div class="footer-mark" aria-hidden="true">${logo}</div><div class="footer-bottom"><span>© ${profile.name} 2026</span><div><button type="button" class="replay-intro" hidden>Replay intro</button><button type="button" class="motion-toggle" hidden aria-pressed="false">Reduce motion</button><a href="${base}credits/">Artwork credits</a><a href="${profile.github}" target="_blank" rel="noreferrer">GitHub ↗</a></div></div></footer>`;
export function home(base) {
  return `<a class="skip-link" href="#main">Skip to content</a><main id="main" tabindex="-1" data-route="home"><section class="hero" id="home"><header class="masthead">${homeLink(base)}<p>${profile.role}<br>Typography / interaction / digital experiences</p>${nav(base)}</header><h1 class="hero-title">ENDI JAUBASHI</h1><div class="hero-intro"><p>I design expressive websites<br>with clarity, character,<br>and a sense of movement.</p><a class="text-link" href="#projects">Explore the design studies ↓</a></div><div class="hero-center"><span class="small-logo" aria-hidden="true">${logo}</span><picture><source type="image/avif" srcset="${base}art/optimized/sand-spline-02-400.avif"><img class="hero-portrait" data-art-id="sand-spline-02" src="${base}art/optimized/sand-spline-02-400.webp" width="2000" height="2000" alt="Sand Spline — example 2, generative artwork by Anders Hoff" fetchpriority="high"></picture><p>CREATIVE WEB DESIGNER<br>IDEAS MADE TANGIBLE.</p><a class="hero-art-credit" href="${base}credits/">Artwork: Anders Hoff ↗</a></div><div class="hero-bottom"><span>Independent design explorations</span><span>Scroll to discover ↓</span></div></section>
 <section id="about" class="portrait-section" aria-labelledby="about-title"><div class="portrait-sticky"><picture class="about-art" aria-hidden="true"><source type="image/avif" srcset="${base}art/optimized/sand-spline-02-400.avif 400w, ${base}art/optimized/sand-spline-02-800.avif 800w, ${base}art/optimized/sand-spline-02-1280.avif 1280w, ${base}art/optimized/sand-spline-02-2000.avif 2000w" sizes="100vw"><img src="${base}art/optimized/sand-spline-02-800.webp" width="2000" height="2000" alt="" loading="lazy" decoding="async"></picture><div class="portrait-copy"><span class="eyebrow">A little about me</span><div><h2 id="about-title">Design with purpose.<br>Room for the unexpected.</h2><p>I’m Endi, a creative web designer. My focus is on visual direction, clear interfaces, and interactions that give a website its own character.</p><p>Below are three concept studies exploring those ideas. The featured generative artworks are by Anders Hoff, credited throughout.</p></div><a class="text-link" href="mailto:${profile.email}">Let’s talk ↗</a></div></div></section>
 <section id="projects" class="projects" aria-labelledby="projects-title"><div class="section-heading"><h2 id="projects-title">Selected explorations</h2><p>Three directions. One thoughtful approach.<br>Self-initiated concepts · not commissioned client work.</p></div>${projects.map((p) => `<a id="project-${p.slug}" class="project" href="${base}work/${p.slug}/" data-project="${p.slug}" data-art="${base}art/optimized/${artworks[p.art].id}-${Math.min(800, artworks[p.art].width)}.webp" ><div class="project-title" aria-hidden="true"><span>P.${p.number}</span><span>${p.initials}</span><span class="project-arrow">↗</span></div>${picture(artworks[p.art], base, { className: "project-thumbnail" })}<div class="project-meta"><h3>${e(p.title)}</h3><span>${e(p.category)}</span><span>Concept study / ${p.year}</span><span class="read-study">View study ↗</span></div></a>`).join("")}</section>${footer(base)}</main><img class="hover-preview" alt="" aria-hidden="true">`;
}
export function detail(p, base) {
  const art = artworks[p.art],
    next = projects[(projects.indexOf(p) + 1) % projects.length];
  return `<a class="skip-link" href="#main">Skip to content</a><main id="main" tabindex="-1" class="detail" data-route="${p.slug}"><header class="detail-nav">${homeLink(base)}<a href="${base}#project-${p.slug}" class="back-link">← Back to studies</a><a href="mailto:${profile.email}">Let’s talk ↗</a></header><div class="detail-header"><p class="eyebrow">P.${p.number} / Self-initiated concept / ${p.year}</p><h1 class="detail-title">${e(p.title)}</h1><p class="detail-summary">${e(p.summary)}</p><dl class="project-facts"><div><dt>Discipline</dt><dd>${e(p.category)}</dd></div><div><dt>Format</dt><dd>Web design concept</dd></div><div><dt>Artwork</dt><dd>${e(art.artist)} · MIT repository licence</dd></div></dl></div><figure class="case-art" style="--native-width:${art.width}px">${picture(art, base, { eager: true })}${credit(art, base)}</figure>
 <div class="case-narrative"><section><span class="eyebrow">01 / The question</span><h2>${e(p.challenge)}</h2></section><section><span class="eyebrow">02 / Design direction</span><p>${e(p.approach)}</p></section><section class="decisions"><span class="eyebrow">03 / The details</span><ol>${p.decisions.map((d) => `<li>${e(d)}</li>`).join("")}</ol></section><section><span class="eyebrow">04 / Outcome & next step</span><p>${e(p.outcome)}</p><p>${e(p.next)}</p></section></div><div class="case-note"><p>About this study</p><p>This page is a concept presentation for Endi Jaubashi’s portfolio. The artwork is ${e(art.artist)}’s original, not Endi’s, and is not evidence of a commissioned collaboration. Artwork source and licence are linked above.</p></div><a class="next-project" href="${base}work/${next.slug}/"><span>Next exploration →</span><strong>${e(next.title)}</strong></a>${footer(base)}</main>`;
}
export function credits(base) {
  return `<a class="skip-link" href="#main">Skip to content</a><main id="main" tabindex="-1" class="credits" data-route="credits"><header class="detail-nav">${homeLink(base)}<a href="${base}#projects">← Back to studies</a></header><h1>Artwork & credits</h1><p class="lede">Contemporary generative art, sourced from the artist’s own repositories. Original files are preserved and available below. Web design concepts are presented separately from the authorship of these artworks.</p>${artworks.map((a) => `<article><h2>${e(a.title)}</h2><p>Artist: <a href="${a.repo}" target="_blank" rel="noreferrer">${e(a.artist)} / Inconvergent ↗</a></p><p>Source repository copyright notice: ${a.year}. This is not an independently verified artwork creation date.</p><p>Original dimensions: ${a.width}×${a.height}px. Responsive derivatives are resized without enlargement; the source files are unchanged. The 800px piece is not described as high-resolution.</p><div class="credit-links"><a href="${a.source}" target="_blank" rel="noreferrer">Source file ↗</a><a href="${base}art/originals/${a.original}" download>Download original ↓</a><a href="${base}art/licenses/${a.license}">Repository MIT licence</a></div></article>`).join("")}<p>The repository MIT notices are distributed with the images and their derivatives. There is no claimed endorsement or collaboration with the artist. The original EJ monogram and site layout were made for this portfolio.</p><a class="text-link" href="mailto:${profile.email}">Contact ${profile.name} ↗</a></main>`;
}
export function notFound(base) {
  return `<main id="main" class="not-found" tabindex="-1" data-route="404"><p class="eyebrow">404 / Page not found</p><h1>A wrong turn.<br>A fresh start.</h1><a class="contact-cta" href="${base}">Back to the portfolio ↗</a></main>`;
}
export function routeFromPath(path, base) {
  const relative = path.startsWith(base)
    ? path.slice(base.length)
    : path.replace(/^\//, "");
  return relative.replace(/^\/+|\/+$/g, "");
}
const arrows = {
  "↗": "M4 20 20 4M4 4h16v16",
  "←": "M20 12H4M10 6l-6 6 6 6",
  "→": "M4 12h16M14 6l6 6-6 6",
  "↓": "M12 4v16M6 14l6 6 6-6",
};
const withIcons = (markup) =>
  markup.replace(
    /[↗←→↓]/g,
    (s) =>
      `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${arrows[s]}"/></svg>`,
  );
export function renderPage(route, base) {
  let markup;
  if (!route) markup = home(base);
  else if (route === "credits") markup = credits(base);
  else {
    const p = projects.find((p) => route === `work/${p.slug}`);
    markup = p ? detail(p, base) : notFound(base);
  }
  return withIcons(markup);
}
export function metadata(route) {
  const p = projects.find((p) => route === `work/${p.slug}`);
  return {
    title: p
      ? `${p.title} — ${profile.name}`
      : route === "credits"
        ? `Artwork credits — ${profile.name}`
        : route
          ? `Page not found — ${profile.name}`
          : `${profile.name} — ${profile.role}`,
    description: p ? p.summary : profile.description,
    url: profile.site + (route ? route + "/" : ""),
    image: profile.site + "art/share.png",
  };
}
