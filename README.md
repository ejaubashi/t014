# Surya Aditya portfolio recreation

A responsive portfolio recreated from the two supplied screen recordings. Built with Vite, JavaScript, CSS, and a locally bundled Anton font.

## Develop

Use Node.js 22.12+ (validated with Node 24).

```sh
npm ci
npm run dev -- --port 3000
```

## Validate

```sh
npm run build
npm test
```

Browser tests use the environment's `/usr/bin/chromium`. Change `executablePath` in `playwright.config.js` for another machine.

Includes an animated intro, scroll-expanding portrait, project previews, 14 project detail routes, responsive layouts, and reduced-motion support. The live reference returned HTTP 403, so the recordings are the visual source. Images are cropped stills from those recordings; some project names, descriptions and detail compositions are reconstructed. Replace generic social destinations and the contact email before publishing as your own portfolio.

For deployment, serve `dist` after building and configure a fallback to `index.html` for `/work/*` routes. Nothing has been deployed.
