# Endi Jaubashi — Creative Web Designer

A statically generated portfolio with expressive typography, an expanding art surface, bowed intro cards, keyboard-aware project previews, and a local liquid footer effect. Graphite, warm paper and amber form the shared colour system.

## Develop

Node.js 22.12+; validated with Node 24.

```sh
npm ci --cache /tmp/npm-cache
npm run dev -- --port 3000
```

## Production and validation

```sh
BASE_PATH=/t014/ npm run build
node scripts/serve.mjs --port 3000 --base /t014/
npm test
```

`npm test` builds and serves the production site on port 3021, using `/usr/bin/chromium`. It checks actual static routes and 404 statuses rather than a dev-server SPA fallback. Change `executablePath` in `playwright.config.js` on another machine.

The GitHub Actions workflow builds physical `work/<slug>/index.html` files and deploys `dist` to GitHub Pages. Keep the published base path and `profile.site` in sync if changing hosting or adding a custom domain.

## Content and branding

Edit `src/content.js` for the name, role, contact details, project narratives, source links and EJ vector mark. `src/render.js` is shared between build-time rendering and client-side navigation. Each route has meaningful HTML before JavaScript. Pages include distinct metadata, a PNG sharing card, a favicon, sitemap and robots file.

Sweet Tape and Nocturne are the featured projects under Selected work. Portfolio entries can use a local cover, an image or video gallery, caption tracks and artwork credits. Field Notes, Common Ground and Matter in Motion are **self-initiated concept studies**. The earlier reference biography, contact details and low-resolution recording crops have been removed from the active site.

## Artwork

Original contemporary generative artworks were obtained from Anders Hoff's own source repositories. The unchanged 2000px, 1024px and 800px originals, repository MIT notices, source URLs and visible credits are retained. The 800px work is explicitly not advertised as high-resolution. See `docs/artwork-sources.md` and the `/credits/` page.

```sh
npm run assets
```

This generates AVIF/WebP derivatives without enlargement, the original EJ monogram, favicon, and PNG share card using Sharp. It does not download new art or modify the original files.

## Motion and fallbacks

- First-visit intro: 1.8s, with an immediate Skip button. Replay uses the full 5.05s sequence. `?replay=1` also replays it.
- Reduced-motion OS preference and the visitor's persistent motion toggle are both respected, including changes while the page is open.
- Lenis is limited to fine-pointer devices. Native links, modified clicks, downloads and touch scrolling remain available.
- Preview canvases redraw only when their source, geometry or movement changes; their buffers resize only when needed.
- The WebGL footer initializes near the viewport, stops after its trail settles, and retains the static SVG when WebGL is unavailable or its context is lost.
- No external analytics, tracking, or message-sending service is configured. Opt-in `?metrics=1` diagnostics log Web Vitals locally without sending telemetry. The email CTA uses `mailto:jaubashi@gmail.com`.

See `docs/upgrade-implementation.md` for implemented items, validation evidence and remaining human/physical-device validation.
