import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { artworks, profile, logo } from "../src/content.js";
await mkdir("public/art/optimized", { recursive: true });
for (const a of artworks) {
  const widths = [400, 800, 1280, 2000].filter((w) => w <= a.width);
  for (const width of widths) {
    const input = `public/art/originals/${a.original}`;
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(`public/art/optimized/${a.id}-${width}.webp`);
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 64, effort: 4 })
      .toFile(`public/art/optimized/${a.id}-${width}.avif`);
  }
}
const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200"><rect width="1600" height="1200" fill="#eeeeec"/><path d="M80 80H1520V1120H80Z M800 80V1120 M80 600H1520" fill="none" stroke="#cfceca" stroke-width="2"/><g transform="translate(180 395) scale(5.6)">${logo.match(/<path.*\/>/)[0].replace("currentColor", "#111110")}</g><g font-family="Arial,sans-serif" font-size="20" fill="#63635e"><text x="100" y="125">${profile.name.toUpperCase()}</text><text x="100" y="1080">DESIGN / TYPE / INTERACTION</text><text x="1300" y="1080">EJ—2026</text></g></svg>`;
await writeFile("public/art/endi-monogram.svg", hero);
const favicon = logo.replace("currentColor", "#ffc53d");
await writeFile("public/favicon.svg", favicon);
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#111110"/><g fill="#eeeeec" font-family="Arial,sans-serif"><text x="60" y="210" font-weight="700" font-size="102">ENDI</text><text x="60" y="325" font-weight="700" font-size="102">JAUBASHI</text><text x="64" y="420" font-size="30">Creative Web Designer</text></g><rect x="60" y="530" width="1080" height="4" fill="#ffc53d"/><text x="64" y="582" fill="#ffc53d" font-family="Arial,sans-serif" font-size="22">Typography. Interaction. Digital experiences.</text></svg>`;
await sharp(Buffer.from(card)).png().toFile("public/art/share.png");
console.log(
  "Original artwork preserved; responsive derivatives, monogram, favicon and share card generated.",
);
