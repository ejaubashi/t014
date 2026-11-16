# Endi Jaubashi portfolio — upgrade implementation

Implemented 16 November 2026 from [the research plan](upgrade-research.md). The baseline audit remains historical; its 98/100 Lighthouse figure is not presented as the score of the redesigned site.

## Delivered

| Research item             | Implementation                                                                                                                                                                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity                  | Central `src/content.js` profile: Endi Jaubashi, Creative Web Designer, an original EJ vector mark and `jaubashi@gmail.com`. Reference-person biography, awards, location and contact details removed.                                                                                                     |
| Honest portfolio content  | Three distinct concept studies with challenge, approach, decisions, outcome limitations and next validation step. No invented client delivery, business metrics, awards or artist collaboration.                                                                                                           |
| Original contemporary art | Anders Hoff original repository image files retained with MIT notices, credits and source/download links. Main art source is 2000×2000; the other files are 1024px and 800px. Lower-resolution art is not enlarged during export or advertised as HD. See [provenance](artwork-sources.md).                |
| Mobile/readability        | Inter for prose and interface copy; Anton for display type. Readable metadata and ≥44px main navigation targets; permanent thumbnails on touch layouts. No hover prerequisite for navigation.                                                                                                              |
| Keyboard and routing      | Skip link; real H1 per route; keyboard previews; deliberate route focus; browser-back focus/scroll restoration; return links to the selected row; native modified clicks and downloads.                                                                                                                    |
| Motion control            | Default intro shortened to 1.8s with an immediate Skip button; optional full 5.05s replay. OS preference changes and a persistent visitor motion preference start/stop resources cleanly. Static content is the default before JavaScript.                                                                 |
| Efficient effects         | On-demand frame scheduling; unchanged preview buffers are not resized/repainted; visible footer stops after settling; typed arrays reused; near-viewport WebGL initialization; hardware-conscious resolution cap; hidden-document scheduling paused.                                                       |
| GPU failures              | Static EJ SVG retained without WebGL and restored after context loss. Content and contact never depend on the canvas.                                                                                                                                                                                      |
| Static rendering/SEO      | Five real HTML pages, physical project directories, genuine 404 file, canonical and Open Graph/Twitter metadata, Person schema, PNG share card, favicon, sitemap and robots file. GitHub workflow no longer substitutes the home shell for 404 content.                                                    |
| Diagnostics               | Optional `?metrics=1` loads the maintained `web-vitals` package and logs LCP/INP/CLS locally, also emitting `portfolio:metric` browser events. No collector, tracking identifiers, visitor analytics storage or telemetry requests are configured. Intro completion is marked in the Performance timeline. |
| Validation readiness      | A 20-test production-browser suite plus a [visitor-test protocol](usability-test.md). The static test server serves only real files and returns 404 for unknown paths, avoiding misleading Vite fallback responses.                                                                                        |

## Validation scope

The browser suite runs against a freshly built `/t014/` production tree, in system Chromium. It includes desktop and 320/390/768px layouts, no-JavaScript routes, per-page metadata, HTTP statuses, motion preference transitions, contact destinations, focus restoration, Ctrl-click, idle preview and shader rendering, WebGL unavailable/context loss, artwork notices and axe A/AA checks.

All automated results are local checks. They do not establish the public GitHub Pages deployment status, real-device GPU performance, screen-reader usability, complete WCAG conformance, field INP, or visitor task success. Contrast over artwork and motion still needs manual review.

## Local verification result

- All 20 production-browser tests passed in the final post-optimization regression run (35.3 seconds), including an artwork-download failure check and shader sampler integrity.
- Fresh optimized mobile Lighthouse 13.6.0 run: **99 performance, 100 automated accessibility, 100 best practices, 100 SEO**. FCP/LCP 1.40s, TBT 62ms, CLS 0.0593. Simulated 4× CPU slowdown, approximately 1.6Mbps throughput, 150ms RTT. See [structured results](audits/2026-11-16-upgrade-summary.json).
- The first high-resolution implementation measured 78 performance and approximately 960ms TBT. Removing duplicate full-resolution loads and preparing image bitmaps before drawing reduced the observed blocking time; no score is being substituted from the historical reference build.
- The high-resolution image is decoded as the art surface expands; initial thumbnails use 400px derivatives. The main artwork source is 2000px and remains available unchanged via Credits.
- Lighthouse exposed a visible-label/accessibility-name mismatch not covered by the earlier rule-tag selection. Project links now derive their accessible names from native content; the regression scan includes WCAG 2.1 A tags as well as AA.

## Remaining external validation

- Real commissioned case studies can replace the concept data when Endi supplies approved project content; nothing in this implementation invents them.
- Human visitor testing and physical iOS/Android checks need participants/devices. The protocol is ready; those activities have not been claimed as completed.
- Field Core Web Vitals need real visits and a separately chosen measurement/consent policy. The optional local diagnostic is not a field-data collection service.
- The public-origin status should be checked after GitHub finishes deploying. Local static-page tests return 200 for all five pages and 404 for unknown routes; that is separate from public-origin observation.
