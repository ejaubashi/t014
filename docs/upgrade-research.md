# Portfolio upgrade research and implementation plan

Researched 16 November 2026. Audited baseline: `7c93b1d`. [Measured audit summary](audits/2026-11-16-summary.json).

## Recommendation

Keep the graphite/paper/amber palette and the distinctive motion. The highest-value next upgrade is a credible, readable portfolio around that motion: personal identity, accurate project stories, useful mobile previews, predictable navigation, and efficient rendering. More animation is a lower priority until those foundations work.

This conclusion combines direct inspection of this repository, a local production-build browser audit, and primary technical guidance. Design priorities are recommendations, not claims of proven conversion gains. No audience study or A/B test has been performed.

## What was actually checked

- Production build with `BASE_PATH=/t014/`, served locally with Vite preview using the same base.
- Chromium at 1440×900 and 390×844; home and the Carles Faus detail route; initial reduced-motion mode.
- axe-core 4.14.0 with WCAG A/AA rule tags through 2.2, plus keyboard, no-JavaScript, and runtime preference-change probes.
- Lighthouse 13.6.0: one fresh simulated mobile navigation, 412×823 emulation, 150ms RTT, approximately 1.6Mbps throughput and 4× simulated CPU slowdown.
- Source inspection of branding, assets, routing, animation lifecycle, and the GitHub Pages workflow.

| Baseline measurement | Result | Interpretation |
| --- | --- | --- |
| Lighthouse performance / accessibility / best practices / SEO | 98 / 100 / 96 / 100 | Automated lab scores, not full usability or accessibility assessments, rankings, or field performance |
| FCP / LCP | 1.13s / 1.13s | Does not reflect completion of the cinematic intro |
| TBT / CLS | 143.5ms / 0.0001473 | No measured INP; low layout shift in this one run |
| First-visit intro | 5.68s wall time in one separate unthrottled probe | A long intentional wait despite the high performance score; script completes at 5.05s |
| axe violations in five audited states | 0 automatically detected | Contrast review remained incomplete on 17 desktop-home nodes, 12 mobile-home nodes, and 2 nodes in each other state |
| Horizontal overflow | None at the audited 1440px and 390px widths | Does not establish every breakpoint or 200–400% zoom is correct |
| Mobile HOME link | 17.16×9.59px; 8px text | Small physical target and hard-to-read navigation; spacing exceptions must be assessed before declaring a WCAG target-size failure |
| Detail page H1 / focus after navigation | No H1 / focus on BODY | Weak document structure and no deliberate SPA focus handoff |
| JavaScript disabled | Empty body text | Core content is entirely client-rendered |
| Browser console | Missing favicon produced one 404 | Straightforward branding/metadata fix |

These are local observations, not results from the public GitHub Pages origin, Safari, a physical phone, or real-user monitoring. The public origin/API were unavailable from this environment earlier; live HTTP status and Search Console results remain unverified.

## Prioritized changes

### P0 — Identity and honest content

**Observed:** the owner name, SA mark, Bali biography, award totals, copyright, email, metadata and titles are embedded in templates. Social links point to service homepages. Project descriptions reuse one generic paragraph, images repeat, and the final detail image is selected by modulo arithmetic rather than a project-specific sequence. Some project names/credits were reconstructed from the reference footage.

**Upgrade:** put name, short role, location, real contact links, and logo into one brand/profile module. Replace the reference person's portrait, biography, award claims, and contact destination with the owner's supplied content; do not infer them from a new name. Curate 3–5 actual projects first, with an optional archive for the remainder. Each case study should explain the problem, the owner's role, constraints, approach, and evidenced outcome. Use qualitative outcomes when no verified numeric result exists.

**Acceptance:** no accidental reference-person branding in rendered pages or metadata; every contact destination is real or intentionally omitted; each featured project has its own media sequence and an accurate role statement. Never invent client work, awards, metrics, or testimonials.

**Dependency:** the replacement name is pending. Real biography, contact links, project ownership and source imagery require owner input. Research can finish independently; those facts cannot be supplied by technical tooling.

### P0 — Readability, touch and keyboard navigation

**Observed:** mobile navigation is 8px; project metadata reaches 7px; small labels are 6px. Thirteen home-page links are under 24px high. Keyboard focus does not trigger the visual project preview. Activating a project leaves focus on BODY, and its title is a styled DIV, not an H1. The current return path has no explicit selected-row scroll-restoration policy.

**Upgrade:** keep Anton for large titles, introduce a readable text family for prose and metadata, and use a restrained type scale. Starting design targets: 16px body, 12–14px metadata, and visible 14px+ navigation; these sizes are design choices, not WCAG minimum font-size rules. Give key controls approximately 44px activation areas, while checking the AA 24px-or-spacing requirement accurately. Add a skip link, one descriptive H1 per route, focus-visible styles, preview-on-focus, and route focus/scroll restoration. Preserve Ctrl/Cmd-click and native anchor behaviour in the router.

**Mobile:** show an inline project thumbnail and client/role label; hover-only imagery is hidden at ≤700px today. Do not require a first tap to reveal a hover state before a second tap can navigate.

**Acceptance:** keyboard-only users can reach and identify every project, enter a case study, and return to the previous row. Test touch at 320/390/768px, 200% text zoom, and reflow at 320 CSS px. Focus must remain visible and unoccluded. Manually review contrast over imagery and moving layers.

**Evidence:** W3C target-size guidance allows spacing and other exceptions; a small bounding box alone does not prove a failure [S1]. Focus guidance addresses keeping focused controls visible [S2].

### P0 — Motion that cannot hide the content

**Confirmed bug:** loading with reduced motion enabled, then changing to normal motion, leaves `motion-ready` false. After 1.5s the heading letters remain translated about 242px outside their clipped container. `tick()` returns without scheduling another frame in reduced mode, and there is no preference-change listener.

**Upgrade:** make static content visible by default, enable decorative motion progressively, and subscribe to `matchMedia(...).change`. Cleanly start/stop the motion system on preference changes. Give the intro an immediately available Skip button, and allow replay separately. Consider a shorter 1–2s default entrance while retaining the full cinematic version as an intentional replay; validate that choice with visitors.

**Acceptance:** toggling reduced motion both directions never removes text, traps scrolling, or duplicates WebGL contexts. Failed images, unavailable WebGL, disabled animation, and interrupted intros leave a usable page. Skip works with keyboard and touch.

**Standards distinction:** WCAG animation-from-interactions is AAA, not an AA requirement [S3]. Pause/stop/hide has conditions, including moving content running over five seconds alongside other content [S4]; this report does not declare the intro a categorical WCAG failure from its duration alone. Skip is also a usability recommendation.

### P1 — Optimize continuous rendering before adding effects

**Observed in source:** the main RAF loop runs continuously; every visible hover preview resets its canvas dimensions and draws 48 image columns on every frame, even when the pointer is stationary. A visible idle footer also keeps issuing shader draws. DOM measurements and style writes are mixed. Lighthouse flagged about 38.8ms of forced-reflow work and about 2.0s total main-thread work in the one mobile navigation.

**Instrumentation:** over separate 1.2s windows, hero idle produced 0 GPU/0 image draws; visible footer with no pointer movement produced 8 GPU draws; a stationary project preview produced 3,504 `drawImage` calls. These are call counts from headless Chromium, not hardware FPS or energy measurements.

**Upgrade:** resize a canvas only when its dimensions change; reuse typed arrays; batch geometry reads before style writes; stop rendering settled surfaces and restart on pointer/scroll/resize. Keep only the Lenis work needed while scrolling. Lazily initialize the footer near the viewport. Use a tested adaptive resolution/device strategy and handle WebGL context loss. Avoid adding another animation library or migrating frameworks solely for effects.

**Acceptance:** stationary previews stop redrawing after settling; the static footer issues no repeated draws once its trail decays. Scroll and movement restart correctly. Check with CPU/GPU profiling on a physical mid-range phone and desktop, not just this container. Keep static fallbacks. Measure before/after under the same conditions.

**Evidence:** MDN recommends smaller WebGL back buffers where appropriate and reducing unnecessary rendering/resource work [S5]. Browsers already throttle RAF in many hidden tabs; visibility handling can complement that rather than claiming background animation always runs today [S6].

### P1 — Replace low-resolution reference crops

**Observed:** the portrait is 815×600; most work files are 336×420, with the last two around 350px wide. The intro work files were themselves upscaled from smaller recording crops. Some detail images render around half a desktop viewport, and the portrait expands to the entire viewport. Adding more file pixels by interpolation will not restore missing source detail.

**Upgrade:** obtain original project images/videos and the owner's actual portrait. Export responsive WebP/AVIF sizes based on measured rendered sizes and device-pixel ratio. Use `picture`/`srcset`, explicit aspect ratios/dimensions, and meaningful alt text. Load the above-fold portrait intentionally; lazy-load below-fold case-study media. Preserve project-specific colour rather than forcing every image through the same effect.

**Acceptance:** inspect at 1× and 2× DPR with no visible recording UI, baked pointer, or avoidable softness; no layout shift when media loads; do not send full-resolution case-study media into every intro thumbnail.

### P1 — Search, sharing and real direct routes

**Observed:** `index.html` contains an empty app root and one generic description. There is no Open Graph image, canonical, favicon, sitemap or route-specific HTML. The workflow copies the SPA shell to `404.html`; it does not generate physical project pages. Vite preview returns 200 on a detail path, which does not prove GitHub Pages does the same.

**Upgrade:** pre-render home and each selected case study into actual `index.html` files under their route directories. This can be done with the existing Vite project and a build-time generator; Astro becomes an option if a larger content workflow is needed, not a prerequisite. Generate unique titles/descriptions, canonical links, social cards, a favicon, sitemap, and a genuine not-found page.

**Acceptance:** direct project requests return HTTP 200 on the published origin; unknown routes return 404; key content and links exist before JavaScript; social previews contain the new identity and correct project image. Do not promise improved rankings just because Lighthouse SEO is 100.

**Evidence:** GitHub documents `404.html` as a custom error page, not as a route-generation mechanism [S7].

### P2 — Validate the portfolio against actual visitor tasks

**Recommendation, not measured user evidence:** test with prospective collaborators/recruiters using three tasks: identify the owner's specialty, understand one project's contribution, and make contact. Observe where they hesitate before choosing further visual changes. A reasonable first study is 5 representative participants, explicitly a qualitative formative study rather than a statistically representative sample.

After publication, measure LCP, INP and CLS on real visits if traffic and privacy requirements justify it. Google currently defines good thresholds at LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; use the 75th percentile when reporting a field distribution. Instrument contact clicks only with an agreed analytics choice. No tracking has been added by this research.

**Evidence:** the maintained `web-vitals` package documents the current metrics and thresholds [S8]. An older archived web.dev source found during research still references FID; it was not used as the current standard.

## Suggested delivery order

| Phase | Deliverable | Effort estimate* | Dependencies |
| --- | --- | --- | --- |
| 1 | New brand/profile, real contact route, three substantive case studies | Medium–large | Exact name and owner-approved content/media |
| 2 | Readable mobile layout, touch targets, keyboard/focus fixes, motion-preference bug and intro skip | Medium | Mostly independent of new assets |
| 3 | Render lifecycle optimization, original responsive media | Medium | Source media; physical-device profiling |
| 4 | Pre-rendered case-study routes, metadata/share cards, targeted regression suite | Medium | Final identity and featured projects |
| 5 | Visitor study and optional field measurement | Small implementation, ongoing observation | Published site, participants and traffic |

*Relative engineering estimates, not deadlines: small means hours, medium about a day or two, large several days. Content creation, design revision and external waiting can dominate.

Retain the six existing browser tests, then add meaningful coverage for dynamic motion preference, keyboard focus/return, WebGL unavailable/context loss, touch navigation, browser modifiers, 200% zoom, intro skip, static route output and production HTTP statuses. A clean axe scan or Lighthouse score remains one layer of validation.

## Sources

All primary sources below were retrieved during this research; public sites that were blocked were read through their official repository source.

- **S1** [W3C: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — [source read](https://github.com/w3c/wcag/blob/main/understanding/22/target-size-minimum.html).
- **S2** [W3C: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) — [source read](https://github.com/w3c/wcag/blob/main/understanding/22/focus-not-obscured-minimum.html).
- **S3** [W3C: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) — [source read](https://github.com/w3c/wcag/blob/main/understanding/21/animation-from-interactions.html).
- **S4** [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) — [source read](https://github.com/w3c/wcag/blob/main/understanding/20/pause-stop-hide.html).
- **S5** [MDN: WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) — [source read](https://github.com/mdn/content/blob/main/files/en-us/web/api/webgl_api/webgl_best_practices/index.md).
- **S6** [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) — [source read](https://github.com/mdn/content/blob/main/files/en-us/web/api/page_visibility_api/index.md).
- **S7** [GitHub: Custom 404 pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site) — [source read](https://github.com/github/docs/blob/main/content/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site.md).
- **S8** [GoogleChrome/web-vitals maintained README](https://github.com/GoogleChrome/web-vitals#rating-thresholds), including `onLCP`, `onINP`, `onCLS` and the 2500ms / 200ms / 0.1 thresholds. The package confirms INP is not reported without an interaction. This audit measured Lighthouse TBT, not field INP.
