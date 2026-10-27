# House style: premium ultra-minimal (on request)

A ready direction: dark, monochrome, quiet, and precise, in the spirit of Apple's product
pages and system apps. Until v1.7 it was the default for every unstyled request; that made
unrelated products converge on one black page. Since v1.8 it is used when someone asks for
it, and otherwise only when the deal ([direction-deal.md](direction-deal.md)) hands it out
as one material among many.

## 1. When it applies

Decide in this order and stop at the first match:

1. **The user asks for this style** ("minimal", "premium", "like Apple", "dark and clean",
   "house style", "our usual style"): use it and record it in DESIGN.md from the preset
   [DESIGN.house-style.md](../assets/DESIGN.house-style.md).
2. **The user asked for something else visual** (colors, mood, theme, brand, reference site,
   audience style such as "playful", "for kids", "retro", "bright", "light theme"): follow the
   request with [art-direction.md](art-direction.md). The house style is not applied.
3. **A system exists** (DESIGN.md, brand guidelines, code tokens, a live UI): inherit it.
   The house style never restyles an existing product unless the user asks for a redesign
   in this style.
4. **Otherwise** (new surface, no cues): deal a direction
   ([direction-deal.md](direction-deal.md)). If the deal hands out the `house` material and
   the roll builds it, use this file as its full specification.

Partial requests: when the user asks for the house style and fixes some aspects ("make the
accent green", "use Montserrat"), apply exactly those on top of it and keep the rest; record
the change in DESIGN.md.

Scope: websites, web apps, desktop and mobile apps, dashboards and tools. Games use their
own world's art direction; their launchers, stores, and account pages may use the house
style when no cue exists.

### What is not a cue, and what is not a system

- **Not a request for this style:** the product's domain, industry, audience, price level,
  or name. "A coffee roastery", "a SaaS for accountants", "for developers", "a premium
  brand" describe what to build, not how it should look; with nothing else they mean "no
  visual cue", which deals a direction (section 1, step 4), not this style. Only words about
  appearance select it.
- **Not a system:** defaults nobody chose. A fresh shadcn/ui install with its default theme
  (neutral, zinc, or slate base color and its stock `--radius`), Tailwind's default palette
  and type scale, the create-next-app, Vite, Astro, or Expo starter styles, and untouched
  Bootstrap, MUI, Chakra, Mantine, or Material defaults are scaffolding. Keep the component
  library and map the chosen direction onto its tokens: the dealt one, or this style through
  the table below. A theme becomes a system once someone customized it for this product: a
  brand color, a chosen font, a DESIGN.md, or shipped screens that use it.

Mapping onto common scaffolds (dark values; light ones from section 3):

| Scaffold token | House-style role |
| --- | --- |
| shadcn `--background` / `--foreground` | canvas `#000` / text `#f5f5f7` |
| shadcn `--card`, `--popover`, `--muted`, `--secondary` | surface `#161617` (popover and inputs: surface-raised `#1d1d1f`) |
| shadcn `--muted-foreground` | text-secondary `#a1a1a6` |
| shadcn `--primary` / `--primary-foreground` | action `#f5f5f7` / `#000` |
| shadcn `--accent` | surface-raised `#1d1d1f` (hover fill, not a hue) |
| shadcn `--border` / `--input` / `--ring` | hairline `rgb(255 255 255 / 0.1)` / field-border `#86868b` / focus `#2997ff` |
| shadcn `--radius` | `1.125rem` (cards 18 px); buttons get `rounded-full`, tiles 28 px |
| Tailwind `fontFamily.sans` | Geologica stack (section 4); remove Inter/Geist imports |
| Tailwind `font-bold` / `font-semibold` on headings | `font-medium` (500); body text weight 340 |

### Start from the reference

Do not compose the look from memory. When the style applies:

1. Open [house-style.html](../assets/house-style.html) and read it whole. It is the visual
   source of truth: tokens on `:root`, the type classes (`.hero`, `.headline`, `.title`,
   `.intro`, `.lead`), the glass nav with the late primary pill, pill buttons, tiles, the
   feature split, the light chapter, and the app settings screen.
2. Start the new page or app shell from it: copy its tokens and type classes verbatim (or
   port them 1:1 into the stack's theme and components), plus the
   [interaction kit](../assets/motion/). Change values only through DESIGN.md.
3. Replace the placeholder product ("Lumen") with the real one: content, imagery, section
   order, and the signature detail chosen from the concept.
4. Before finishing, put a screenshot of your page next to one of house-style.html at the
   same width (section 11). They must read as one family.

## 2. The character in one paragraph

Black canvas, near-white type, two grays, no decoration. One idea per section, set large,
with a lot of air around it. Real content (product shots, screenshots, data) is the only
source of color. Controls are calm pills; surfaces separate by tone, not by borders or
shadows. Motion is slow on large things and immediate on small ones, and never bounces.
Premium comes from restraint and finish: exact spacing, tight display tracking, crisp
hairlines, and nothing on the screen that does not need to be there.

## 3. Palette

Dark is the default theme. Light tokens are defined for chapter sections, for products that
need a light mode, and for native apps that follow the system appearance (iOS, Android,
macOS, Windows: follow the system setting and ship both).

| Role | Dark | Light | Notes |
| --- | --- | --- | --- |
| canvas | `#000000` | `#ffffff` | Page / window background |
| surface | `#161617` | `#f5f5f7` | Tiles, grouped sections |
| surface-raised | `#1d1d1f` | `#ffffff` on `#f5f5f7` | Cards inside a section, inputs, menus |
| text | `#f5f5f7` | `#1d1d1f` | 19.3 / 16.8 : 1 |
| text-secondary | `#a1a1a6` | `#6e6e73` | ≥ 6.5 / ≥ 4.66 : 1 on every surface |
| hairline | `rgb(255 255 255 / 0.1)` | `rgb(0 0 0 / 0.1)` | Lists, tables, dividers only |
| field-border | `#86868b` | `#86868b` | Input boundaries (≥ 3 : 1) |
| action | `#f5f5f7` fill, `#000` label | `#1d1d1f` fill, `#fff` label | The primary pill |
| link / focus | `#2997ff` | `#0066cc` link, `#0071e3` focus | The only chromatic UI color |
| danger | `#ff453a` | `#d70015` | Always with text or an icon |
| success | `#30d158` | `#1a7f37` | Always with text or an icon |

Rules:

- **Monochrome UI.** Gray steps carry hierarchy; blue is reserved for links, focus, and
  selection. No second accent unless the product brings one (then one, used for actions).
- **Color comes from content.** Product renders, screenshots, photos, and charts supply the
  chroma. Without real imagery, follow the imagery path in section 5; never fill the gap
  with gradients, glow, or tinted UI.
- **No gradient backgrounds, no glass panels.** Glass (blur 20 px, saturate 180%,
  `rgb(22 22 23 / 0.8)`) is allowed only for floating chrome: the sticky nav and floating
  media controls.
- Native apps use the platform's semantic colors where they exist (iOS dark: grouped
  `#000` / `#1c1c1e` / `#2c2c2e`, secondary label `rgb(235 235 245 / 0.6)`, tint `#0a84ff`).

## 4. Typography

- **Family: Geologica** (variable, OFL-1.1, full Cyrillic), one family for everything. Its
  wide, technical grotesk proportions give the style its own voice instead of the habitual
  Inter / Geist / system look. Self-host it (`@fontsource-variable/geologica`, or the
  woff2 files with `font-display: swap`); Google Fonts is acceptable for prototypes. Fallback
  stack: `-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif`.
- **Axes:** keep the extra axes neutral (`font-variation-settings: "CRSV" 0, "SHRP" 0,
  "slnt" 0`); only weight varies. Sharpness is a possible signature detail for a technical
  product, never a default.
- **Weights:** Geologica is heavy for its number, so the style runs light: 500 for every
  headline (hero to title), 340 for reading text (intro, lead, body), 400 for small text,
  labels, buttons, and numbers, where thin strokes break up. Never 600+ for headlines, never
  below 300.
- **Tracking:** the face is wide, so display sizes close up: −0.035em at hero, −0.03em at
  headline, −0.025em at title; 0 for body; +0.005 to +0.01em at 12–14 px. Tabular numerals
  for prices and specs.
- **Native apps:** bundle Geologica for app content; keep the platform's own font only in
  system-provided UI (alerts, pickers, share sheets).
- **User overrides** a font by naming one; record it in DESIGN.md and retune weights and
  tracking for that family with a rendered specimen, not by copying these numbers.

Web scale (desktop / phone):

| Role | Size | Line height | Weight | Tracking |
| --- | --- | --- | --- | --- |
| hero | 80 / 48 | 1.05 | 500 | −0.035em |
| headline | 56 / 40 | 1.07 | 500 | −0.03em |
| title | 40 / 32 | 1.1 | 500 | −0.025em |
| intro | 28 / 21 | 1.18 / 1.24 | 340 | −0.01em |
| lead | 21 / 19 | 1.4 | 340 | 0 |
| body | 17 | 1.5 | 340 | 0 |
| small | 14 | 1.43 | 400 | 0.005em |
| caption | 12 | 1.33 | 400 | 0.01em |

App scale (also good for desktop tools): large title 34/41 500, title 28/34 500, title-2
22/28 500, headline 17/22 500, body 17/22 340, callout 16/21 340, subhead 15/20 400,
footnote 13/18 400, caption 12/16 400. Dense tools step down to body 14–15 at weight 400.

## 5. Space, layout, shape

- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 120, 160. Section padding
  120–160 px desktop, 80 px phone. Side margin ≥ 24 px phone. Headline → subhead 12–16 px,
  subhead → actions 24–32 px.
- **Widths:** text blocks ≤ 980 px (reading measure ≤ 70 characters), media up to 1440 px,
  full-bleed only for the hero product shot.
- **Composition:** the hero may be centered (headline, one line of intro, two actions,
  then the product). Feature sections alternate: left-aligned text with large media, a
  two-tile row, a full-width media band. Never everything centered, never a grid of
  identical icon cards.
- **Page anatomy (sites and landing pages).** Build from these blocks of the reference, in
  an order the content needs: (1) hero: headline, one intro line, a primary pill and a text
  link, then one large product media block up to 1440 px wide; (2) feature split: text left,
  large media right (or mirrored); (3) a two-tile row: each tile a short headline, one line,
  a link, and media bleeding off its edge; (4) a full-width media band or `fx:scroll-zoom`;
  (5) one light chapter (`data-theme="light"`) as a break, at most one per page; (6) a quiet
  footer in caption type. Adjacent sections use different blocks. Apps and tools use the app
  scale and the grouped-list pattern of the reference's settings screen instead.
- **The hero leads with the product, not a panel.** Its leading element is the product
  shown as an object: a photo, a render, or the real app screen in a device or window frame.
  Dashboards, charts, stat rows, configurators, and forms are content for feature sections,
  where they sit as the media of a split or tile, not as a boxed widget under the headline.
- **Imagery path when no photos exist.** Take the first that applies: (1) real assets from
  the project or the user; (2) the product's own interface rendered as real HTML inside a
  device or window frame; (3) a large monochrome object drawn in SVG or CSS (the bag, the
  lamp, the device) with soft tone steps on a surface tile; (4) a media slot of the final
  size and crop on surface, labeled for the real image, as in the reference ("Product render
  (real image goes here)"). A correctly sized empty slot keeps the composition; replacing
  the image with a chart, a gradient, or decoration breaks it. Never AI-generated scenes or
  stock clichés.
- **Radii:** tiles 28 px, cards 18 px, inputs 12 px, buttons and chips pill (9999 px),
  sheets 16–20 px top. Nested radius = outer − inset.
- **Depth:** flat on dark (tone steps instead of shadows); on light, one soft shadow for
  overlays only (`0 12px 40px rgb(0 0 0 / 0.12)`).

## 6. Components

- **Primary button:** pill, height 44 (md) / 56 (lg) / 32 (sm), padding 22 px, 17 px
  regular label, action fill. One per viewport.
- **Secondary action:** a text link in link color with a chevron ("Learn more ›"), or a
  ghost pill with a field-border outline. Never two filled buttons side by side.
- **Catalogs and shops:** "one primary per viewport" means one filled pill for the
  page-level action (checkout, subscribe, buy the hero product). Repeated per-item actions
  ("Add to bag", "Choose") are ghost pills or text links. Item cards are media-led: the
  product image (or its slot from the imagery path) fills at least half the card, then the
  name, one line, and the price in tabular numerals. At most one item grid per page, three
  or four per row on desktop; a single hero product or a featured split comes before it.
- **Nav:** 48–52 px, transparent over the hero, then glass (`fx:header-morph` fits);
  12–14 px links in text-secondary, active in text. Its primary pill fades in only once the
  hero's primary action has left the viewport.
- **Tiles:** surface fill, 28 px radius, generous padding (40–64 px), a short headline, one
  line of copy, a link, and a real image that may bleed off the tile edge.
- **Lists and settings (apps):** grouped rows on surface, 44 px minimum height, hairline
  separators inset to the text keyline, values in text-secondary, chevrons 13 px.
- **Inputs:** 44 px, surface-raised fill, 12 px radius, field-border 1 px, label above,
  focus ring 2 px link/focus color with 2 px offset.
- **Icons:** one thin set (SF Symbols on Apple platforms, Lucide or Phosphor Light on the
  web) at 1.5 px stroke; never inside colored tiles.

## 7. Motion

- **Character:** calm and weighty, precise. Surfaces, text, and sheets never overshoot;
  controls are tactile: they answer every press with the interaction kit's three-layer press
  (compress ~4 px of perimeter, a fill step, a bloom from the touch point) and settle back
  with a small spring (≈1% overshoot). Ease `cubic-bezier(0.28, 0.11, 0.32, 1)` for surfaces
  and transitions, `cubic-bezier(0.25, 0.1, 0.25, 1)` for color.
- **Durations:** press 80 ms down (minimum 90 ms held) / ~450 ms spring release; hover and
  color 200–250 ms; focus ring 160 ms; switch thumb 420 ms snap spring; menus and sheets
  300–400 ms; scenes 600–1000 ms.
- **Every control ships with its motion** from the [interaction kit](../assets/motion/), and
  the page passes `scripts/motion_probe.mjs` with zero errors.
- **Signature motion lives in scroll and media**, not in buttons: one hero scene and
  chapter transitions (see the pool below). Other content is simply there; no fade-up on
  every section (`slop:scroll-reveal-all`).

## 8. Copy

Short declarative headlines (2–6 words) that name a real benefit of this product; one
concrete intro sentence; action labels that are verbs ("Buy", "Get started", "Learn more").
No exclamation marks, no generic claims, no "Not X. Y." slogans.

**Each fact once per viewport.** The product name sits in the nav or above the hero
headline, never both on one screen. The same action is visible once: a nav "Buy" next to
the hero's "Buy" is a duplicate, so the nav action appears only after the hero action has
scrolled out of view (and stays reachable by keyboard from then on). The same applies to a
headline repeated in the intro, a tile title repeated in its link, and a section label that
restates the headline (`slop:redundant-copy`).

## 9. Effects from the pool that fit

The [effects library](effects-library.md) stays optional; inside the house style these fit
without changing its character:

| Fits by default | Fits with care | Only when the product's concept calls for it |
| --- | --- | --- |
| `fx:header-morph`, `fx:hover-set` (nudge, draw, edge), `fx:scroll-fade-edges`, `fx:dotnav-progress`, `fx:scroll-zoom`, `fx:theme-scrub`, `fx:coverflow` for product galleries, `fx:led-glyph` for real states | `fx:dither-field` in white ink for one CTA band, `fx:metal-sheen` on one product name, `fx:dot-field` faint and masked, `fx:ring-orbit` in its silver variant, `fx:story-stack`, `fx:ruler-scrubber` over real data | `fx:dither-bake`, `fx:dot-globe`, `fx:dot-bars`, `fx:dot-wave`, `fx:bolts`, `fx:blueprint-rails`, `fx:signal-route`, `fx:comet-beam`, `fx:grain` |

Colored variants of any effect bring a second accent: allowed only when the product supplies
that color.

## 10. Keeping it from becoming a template

The palette and type are shared by design, so character has to come from the product:

- **Concept still applies.** Write the one-sentence concept (art-direction.md section 1);
  inside the house style it chooses the imagery, the leading element of each section, the
  motion character within section 7, and one signature detail (custom or from the pool).
- **Swap test, adjusted:** a shared palette and type do not fail it; interchangeable
  content does. If the headlines, imagery, and signature detail would fit a competitor,
  rework them.
- **No filler.** Ultra-minimal means fewer, better elements; it never means hiding needed
  labels, states, errors, or actions (SKILL.md section 6).

## 11. Verify

- Contrast pairs from section 3 measured on the real surfaces, both themes when shipped. The
  preset palette passes all 44 pairs in
  [house-style.tokens.json](../assets/house-style.tokens.json)
  (`python -B -X utf8 scripts/validate_design.py tokens assets/house-style.tokens.json
  --require-contrast`); re-run it after any color override.
- Compare with the reference render [house-style.html](../assets/house-style.html) (hero,
  feature split, tiles, light chapter, app settings screen) at phone and desktop widths:
  screenshot both at 1440 and 390 and look at them side by side. Same family means the
  same headline weight and tracking, the same nav, pill buttons, tile radius and padding,
  and the same section rhythm. List every deviation with its reason in DESIGN.md.
- Style conformance in the code (any hit is an error unless DESIGN.md records it):
  a headline above weight 500 or body text above 400; a font family other than Geologica
  and its fallback stack; a hex color outside section 3 in UI (content imagery excepted);
  an elevation shadow (a blurred `box-shadow`) on a dark surface, while the interaction
  kit's focus rings and press fills are fine; any `linear-gradient` or `radial-gradient`
  used as a background; a border drawn around a tile or card; a filled button that is not a
  pill; more than one filled action pill visible in one viewport (selection indicators,
  counters, and chips do not count).
- Squint test: one leading element per section survives blur and grayscale.
- Count per viewport: one primary action, at most two text levels per block, no decoration
  without a function.
- Phone layout: hero type steps down, side margins ≥ 24 px, tiles stack, media keeps its crop.
- Record in DESIGN.md: "Direction: house style (premium ultra-minimal)", the concept, the
  signature detail, any user overrides, and chosen pool effect IDs.
