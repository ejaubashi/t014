export const profile = {
  name: "Endi Jaubashi",
  role: "Creative Web Designer",
  initials: "EJ",
  email: "jaubashi@gmail.com",
  github: "https://github.com/ejaubashi",
  site: "https://ejaubashi.github.io/t014/",
  description:
    "Endi Jaubashi is a creative web designer exploring expressive typography, thoughtful interactions, and distinctive digital experiences.",
};
export const logo = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 220 70" aria-label="EJ — Endi Jaubashi" role="img"><path fill="currentColor" d="M0 0h102v17H27v10h63v16H27v10h75v17H0zM113 0h107v54l-27 16h-53l-27-16V36h27v17h53V17h-80z"/></svg>`;
export const artworks = [
  {
    id: "sand-spline-02",
    title: "Sand Spline — example 2",
    artist: "Anders Hoff",
    year: "2016",
    width: 2000,
    height: 2000,
    original: "sand-spline-02.png",
    source:
      "https://github.com/inconvergent/sand-spline/blob/master/img/img2.png",
    repo: "https://github.com/inconvergent/sand-spline",
    license: "sand-spline-MIT.txt",
  },
  {
    id: "sand-spline-01",
    title: "Sand Spline — example 1",
    artist: "Anders Hoff",
    year: "2016",
    width: 1024,
    height: 1024,
    original: "sand-spline-01.png",
    source:
      "https://github.com/inconvergent/sand-spline/blob/master/img/img.png",
    repo: "https://github.com/inconvergent/sand-spline",
    license: "sand-spline-MIT.txt",
  },
  {
    id: "differential-mesh",
    title: "Differential Mesh — example 3",
    artist: "Anders Hoff",
    year: "2015",
    width: 800,
    height: 800,
    original: "differential-mesh.jpg",
    source:
      "https://github.com/inconvergent/differential-mesh/blob/master/img/img3.jpg",
    repo: "https://github.com/inconvergent/differential-mesh",
    license: "differential-mesh-MIT.txt",
  },
];
export const projects = [
  {
    slug: "field-notes",
    number: "01",
    initials: "FN",
    title: "Field Notes",
    category: "Art & editorial",
    art: 0,
    color: "#194b5a",
    year: "2026",
    summary:
      "An editorial direction for art that sits between natural systems and digital experimentation.",
    challenge:
      "How can a digital publication give a complex artwork room to breathe, while making its story easy to explore?",
    approach:
      "A quiet grid frames a large artwork. Condensed headlines create a clear point of entry; smaller, readable captions carry the context. Movement is reserved for transitions between the artwork and its description.",
    decisions: [
      "A generous, full-bleed opening gives the work the first word.",
      "A consistent caption system keeps artist, title and provenance together.",
      "A stacked mobile layout preserves the reading order without a hover interaction.",
    ],
    outcome:
      "The study establishes an art-first editorial hierarchy and a responsive detail page. It is a concept direction, with no commissioned client or measured commercial results.",
    next: "Validate the reading order and artwork discovery with five visitors before expanding into an editorial archive.",
  },
  {
    slug: "common-ground",
    number: "02",
    initials: "CG",
    title: "Common Ground",
    category: "Identity & web direction",
    art: 1,
    color: "#d7e8df",
    year: "2026",
    summary:
      "A digital identity study built around clarity, negative space, and a single expressive visual.",
    challenge:
      "How can a minimal visual identity feel memorable without relying on a dense interface or constant animation?",
    approach:
      "A restrained type system and open spacing let the organic artwork act as a focal point. The same layout rules carry from the overview into a compact, readable project narrative.",
    decisions: [
      "Use one graphic gesture rather than multiple competing decorations.",
      "Make headings, body text and metadata distinct through scale and spacing.",
      "Keep important links large enough for touch and clear when focused by keyboard.",
    ],
    outcome:
      "A coherent identity direction with desktop and mobile compositions. This is a self-initiated concept, not a claim of client delivery or authorship of the featured artwork.",
    next: "Test whether visitors can identify the subject, navigate to the detail, and find the contact link without guidance.",
  },
  {
    slug: "matter-in-motion",
    number: "03",
    initials: "MM",
    title: "Matter in Motion",
    category: "Interaction & digital culture",
    art: 2,
    color: "#e0dce9",
    year: "2026",
    summary:
      "An interaction study balancing a sculptural visual language with a calm, usable interface.",
    challenge:
      "How can a page convey energy while remaining comfortable for visitors who prefer less motion?",
    approach:
      "The image establishes texture, while a rigid typographic grid creates stability. Motion responds to intent and settles when interaction stops. A static version communicates the same content.",
    decisions: [
      "Keep navigation and content independent of the decorative canvas.",
      "Provide a reduced-motion experience that works without visual effects.",
      "Show a permanent thumbnail on touch screens instead of hiding the art behind hover.",
    ],
    outcome:
      "A motion direction with a static fallback, readable case-study structure and touch-friendly project navigation. There are no published engagement metrics for this concept.",
    next: "Review on physical mid-range phones and with motion-sensitive visitors before adding more shader complexity.",
  },
];
