# Portfolio color recommendation

Reviewed 16 November 2026. Recommendation: graphite, warm paper, amber.

This is a design judgment for this portfolio, not a claim that any palette is universally best. The large condensed type, monochrome portrait, varied project artwork, and animated footer benefit from neutral main surfaces and one vivid accent. Reserving strong color for the footer and highlights gives the imagery and motion more room than the previous full cobalt surface.

## Sources consulted

- [Radix Colors: understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale). Steps 1–2 are backgrounds, 6–8 borders, 9–10 solid color surfaces, 11–12 text. It explicitly recommends dark foregrounds on amber 9–10. Read the [official documentation source](https://github.com/radix-ui/website/blob/main/data/colors/docs/palette-composition/understanding-the-scale.mdx).
- Official Radix [light palette](https://github.com/radix-ui/colors/blob/main/src/light.ts) and [dark palette](https://github.com/radix-ui/colors/blob/main/src/dark.ts): Sand and Amber scales provide the selected colors.
- [WCAG: Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), read through its [official W3C source](https://github.com/w3c/wcag/blob/main/understanding/20/contrast-minimum.html). Normal text requires 4.5:1 at AA; large text requires 3:1. Calculated values must not be rounded up to meet the threshold.

The public W3C website was blocked from this environment; the official GitHub source was accessible. These sources support color roles and contrast, not aesthetic superiority.

## Options evaluated

Ratios use the WCAG sRGB relative-luminance formula, calculated locally.

| Pair | Contrast | Assessment |
| --- | ---: | --- |
| Existing cobalt `#1734C8` / ivory `#F4ECD9` | 7.56:1 | Strong contrast, but visually competes with the artwork |
| Existing cobalt `#1734C8` / coral `#FF856B` | 3.73:1 | Insufficient for normal-sized footer text at AA |
| Graphite `#111110` / warm text `#EEEEEC` | 16.26:1 | Selected for hero and detail pages |
| Graphite `#111110` / amber `#FFC53D` | 11.97:1 | Selected for footer, logo and navigation |
| Muted sand `#63635E` / paper `#F9F9F8` | 5.73:1 | Selected for inactive project text |
| Plum `#231629` / sage `#C5D9BD` | 11.52:1 | Viable softer alternative; less aligned with the current graphic treatment |

## Applied roles

- Hero, intro, detail backgrounds: `#111110` (Sand dark 1).
- Text on dark: `#EEEEEC` (Sand dark 12).
- Project surfaces: `#F9F9F8` (Sand light 2).
- Primary text on light and amber: `#111110`.
- Muted project text: `#63635E` (Sand light 11).
- Footer and highlights: `#FFC53D` (Amber 9).
- Decorative separators: `#BCBBB5` / `#CFCECA`.

The footer's WebGL texture reads its background and foreground from the same CSS palette; its image tint is derived from that background. Reduced-motion and WebGL fallback use the same colors. Contrast figures refer to solid static foreground/background pairs. Image overlays, opacity animations, tiny typography, and the full page have not undergone a comprehensive accessibility audit.
