import { build } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { renderPage, metadata, escapeHTML as e } from "../src/render.js";
import { profile, projects } from "../src/content.js";
const base = process.env.BASE_PATH || "/";
await build({ base });
const shell = await readFile("dist/index.html", "utf8");
const routes = ["", ...projects.map((p) => `work/${p.slug}`), "credits"];
function documentFor(route) {
  const meta = metadata(route);
  const extras = `${route === "404" ? '<meta name="robots" content="noindex">' : ""}<link rel="canonical" href="${meta.url}"><meta property="og:type" content="website"><meta property="og:title" content="${e(meta.title)}"><meta property="og:description" content="${e(meta.description)}"><meta property="og:url" content="${meta.url}"><meta property="og:image" content="${meta.image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(meta.title)}"><meta name="twitter:description" content="${e(meta.description)}"><meta name="twitter:image" content="${meta.image}"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: profile.name, jobTitle: profile.role, url: profile.site, email: "mailto:" + profile.email, sameAs: [profile.github] }).replace(/</g, "\\u003c")}</script>`;
  return shell
    .replace(/<title>.*?<\/title>/, `<title>${e(meta.title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${e(meta.description)}">`,
    )
    .replace("</head>", extras + "</head>")
    .replace(
      '<div id="app"></div>',
      `<div id="app">${renderPage(route, base)}</div>`,
    );
}
for (const route of routes) {
  const dir = route ? `dist/${route}` : "dist";
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, documentFor(route));
}
await writeFile("dist/404.html", documentFor("404"));
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((r) => `<url><loc>${profile.site}${r ? r + "/" : ""}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${profile.site}sitemap.xml\n`,
);
console.log(
  `Prerendered ${routes.length} pages, a real 404, sitemap and route-specific sharing metadata.`,
);
