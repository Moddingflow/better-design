# Optional effects library

An opt-in pool of signature effects for expressive surfaces. Nothing here is a default:
a page built without any of these effects is complete. Reach for the pool when the art
direction asks for a signature detail (art-direction.md section 6) and the usual answers
(a card that lifts, a button that grows) would make the surface read as a template.

These effects are hard to get right from a one-line prompt. Each card below gives the
idea, when it fits, a tested recipe in [assets/effects/](../assets/effects/), parameters,
and the checks that keep it from turning into noise. The bench page
[gallery.html](../assets/effects/gallery.html) shows every effect working; serve the folder
over `http://` (for example `python -m http.server`) and open it before adapting one.

Origin: patterns observed in October 2026 on kumorouter.com (Next.js, Tailwind, Motion,
Embla Carousel, Paper Shaders), cloudflare.com (Astro, React Flow background, Three.js
globe), linear.app (5×5 dot-matrix status icons) and apple.com product pages (timed dot
navigation, scroll-linked scenes). The recipes are rewritten from the observed behaviour,
not copied from those sites. Paper Shaders (`@paper-design/shaders-react`, Apache-2.0) is
the library behind the original live dither field; `cobe` (MIT) is a common ready-made dot
globe for React projects. See the cards for when a library is worth it.

## 1. Rules of use

1. **Opt-in, by direction.** Pick an effect only when it follows from the concept (print,
   instrument, signal, metal, blueprint, routing). "It looks cool" is not a reason. Write the
   chosen IDs into DESIGN.md under Direction → Signature details (`effects: fx:dither-bake,
   fx:edge`) and into `direction.motion` of the contract. A pattern recorded there is an
   intentional brand choice, so the matching slop entry no longer applies to it.
2. **Budget per page.** At most one live WebGL field. At most one `fx:ring-orbit` and one
   `fx:metal-sheen` per viewport, both on the primary call to action or heading. At most one
   ambient loop visible at a time. A baked motif (`fx:dither-bake`, `fx:grain`,
   `fx:blueprint-rails`, `fx:dot-field`, `fx:bolts`) may repeat across a set because
   repetition is what makes it a system. One `fx:dot-globe` per page. `fx:comet-beam` only on
   the one card that is active right now. Two to four pool effects per page is the useful
   range (a recurring motif counts once); more becomes a showroom.
3. **Surface type.** Landing, brand, launch, portfolio, pricing, CTA bands, game menus:
   any card may fit. Dense working tools (dashboards, editors, settings): only `fx:hover-set`,
   `fx:header-morph`, `fx:scroll-fade-edges`, `fx:led-glyph` for real states, and
   `fx:ruler-scrubber` / `fx:dot-bars` over real data. No fields, rings, sheen, or globes.
4. **Named function.** Every effect still serves a function from motion.md section 1:
   feedback (hover-set, ring press), orientation (header-morph, coverflow, rails), value
   change (ruler-scrubber), causality (signal-route), or signs of life (field, sheen). An
   effect that serves none of them is decoration and gets removed.
5. **Text stays readable.** Body text never sits on a live field. Headings and buttons over
   a field get the scrim; verify contrast against the brightest frame, not the average one.
6. **Adopt, don't import.** Copy the block for the chosen effect from `effects.css` and the
   function from the JS file, rename `--fx-*` tokens to DESIGN.md roles, and keep the
   reduced-motion and fallback parts. Never link the whole `effects.css` "just in case".
   In React, Vue, or Svelte port the logic into the stack's idiom (refs, effects, actions).
7. **Honest data.** A ruler, counter, or route diagram shows real values or clearly marked
   fixtures. Never smooth, inflate, or clamp a figure to make the visual look better.
8. **Dots are material, not wallpaper.** The dot language works when the whole page speaks
   it quietly: one pitch on the spacing scale (8, 12, or 16 px), one warm- or cool-tinted dot
   color at 8–15% alpha, masks that fade dots where content sits, and dots that *carry*
   something somewhere on the page (a map, a traffic series, a status, a logo). A uniform
   white dot grid behind everything with nothing made of dots is `slop:decorative-grid-bg`.
   Bright dots belong only to the one element that means something.

## 2. Picking table

| ID | What the viewer sees | Fits concepts | Function | Cost |
| --- | --- | --- | --- | --- |
| `fx:dither-field` | Slow liquid metal printed through a Bayer halftone, live | Print, signal, telemetry, night, metal | Signs of life | WebGL, one canvas |
| `fx:dither-bake` | Static halftone glow at the bottom of each card, one hue, three tones | Same family, catalogs and card sets | Identity per item | Zero runtime |
| `fx:grain` | Film grain over flat dark surfaces | Analog, photo, print | Material | One tile, no loop |
| `fx:ring-orbit` | A light travelling around a hairline border | Instrument, energy, primary action | Emphasis of one action | One CSS loop |
| `fx:metal-sheen` | Brushed-silver text on 1–3 words, a sheen hairline above | Metal, premium hardware | Emphasis | One CSS loop |
| `fx:blueprint-rails` | Hairline seams between sections with rivets on the content edges | Blueprint, engineering, infrastructure | Orientation | Static |
| `fx:hover-set` | Edge brightens, arrow nudges, underline draws, halo ring | Any | Feedback | Transitions |
| `fx:header-morph` | Full-width bar becomes a floating capsule after scroll | Any landing | Orientation | Transitions |
| `fx:coverflow` | Centered card full size, neighbours scale to 0.78 and fade | Catalogs, models, products | Orientation | rAF on scroll |
| `fx:ruler-scrubber` | Barcode of thin day ticks with a draggable thumb and labels that follow it | Uptime, history, audio, logs | Value change | DOM ticks |
| `fx:story-stack` | Deck of cards; drag the front one down, segmented progress | Personas, testimonials, steps | Orientation | Transitions |
| `fx:signal-route` | A packet travels a wire; its branch lights up in turn | Routing, pipelines, integrations | Causality | CSS offset-path |
| `fx:dot-field` | A faint dot grid on the page, fading under content; optional pointer spotlight | Network, infrastructure, maps, blueprint | Material, orientation | CSS, tiny JS |
| `fx:dot-matrix` | A logo, word, map or image rebuilt from dots, revealed from one side | LED signs, print, data, maps | Identity, causality | Canvas 2D, once |
| `fx:dot-globe` | Rotating dotted globe, fog toward the limb, arcs and HTML markers | Global network, travel, logistics | Orientation, causality | Canvas 2D loop |
| `fx:dot-wave` | A band of dots with a pulse travelling along it | Signal, throughput, sync | Signs of life | CSS only |
| `fx:dot-bars` | A series drawn as columns of dots, optionally scrolling | Traffic, audio, load, activity | Value change | SVG, CSS loop |
| `fx:led-glyph` | 16 px 5×5 LED icon playing frames (working, indexing, done) | Agents, jobs, devices | Feedback, status | CSS steps() |
| `fx:bolts` | Bordered blocks with 14 px squares bolted on the corners; dashed seams; corner brackets | Engineering, hardware, data | Structure | Static |
| `fx:comet-beam` | A bright arc with a fading tail runs the border of the active card | Streaming, live, selected | Status | One CSS loop |
| `fx:scroll-fade-edges` | A horizontal list fades only on the side that has more | Any overflow row | Orientation | CSS scroll timeline |
| `fx:rotating-phrase` | An inline accent chip inside a sentence cycles its phrasings | Product lines, audiences | Orientation | Small JS |
| `fx:dotnav-progress` | Glass pill of dots; the current dot stretches and fills; pause button | Media galleries, highlights | Orientation | Small JS |
| `fx:scroll-zoom` | Hero media settles from full bleed into a rounded frame as it scrolls in | Product launch, hardware | Orientation | CSS view timeline |
| `fx:theme-scrub` | A section's background turns from dark to light as it enters | Chapter breaks in a long story | Orientation | CSS view timeline |

## 3. Effect cards

### fx:dither-field — live ordered-dither field

A procedural pattern quantized onto a coarse pixel grid through a 4×4 Bayer matrix: one
ink color over transparency, so it reads as a halftone print of moving liquid metal.

- **Use for:** one CTA band, a hero side panel, or a single feature tile. One per page.
- **Not for:** behind paragraphs, in dense tools, on every card (use `fx:dither-bake`).
- **Recipe:** [dither-field.js](../assets/effects/dither-field.js) +
  `.fx-field`, `.fx-field__fallback`, `.fx-field-scrim` from effects.css.
  `BetterFx.mountDitherField(host, { shape: 'warp', bayer: 4, pxSize: 2, scale: 0.6,
  speed: 0.18, colorFront: '#fff' })`. Shapes: `warp` (creased satin), `simplex` (clouds),
  `wave` (ribbons), `ripple`, `swirl`.
- **Look:** field opacity 0.4–0.55 with `mix-blend-mode: screen` (light theme: `multiply`
  and a dark ink), a radial scrim (0.9 black in the center to 0.1 at the edge) so the
  heading and buttons sit in calm space while the field lives at the edges.
- **Built in, keep it:** mounts after idle; renders only on screen and in a visible tab;
  ~30 fps cap; DPR capped at 2; context-loss handling; reduced motion draws one still
  frame; without WebGL the CSS fallback stays and nothing breaks.
- **React alternative:** `<Dithering shape="warp" type="4x4" size={2} scale={0.6}
  speed={0.18} colorBack="#00000000" colorFront="#ffffff" />` from
  `@paper-design/shaders-react` (pin an exact version). Use it when the project already
  ships Paper Shaders or wants their other shapes. Wrap it the same way: lazy import,
  mount after idle, pause offscreen, `speed={0}` under reduced motion, CSS fallback that
  crossfades out when the canvas has size.
- **Tune:** `debug: true` renders the raw pattern in grayscale. Shapes should be large and
  calm; uniform speckle means the scale is too small or the pattern too noisy.

### fx:dither-bake — baked halftone glow

The same print language without a GPU: a light shape (ribbon, rise, camo) rasterized once
into an SVG grid of square cells. Cell size follows intensity; the faint edge is thinned
through an 8×8 Bayer matrix so it dissolves into scattered dots. Three tone layers of one
hue give depth.

- **Use for:** card sets (models, posts, plans) where each item needs its own art but the
  set must read as one system. Seed per item so the art is stable between renders.
- **Recipe:** [dither-bake.js](../assets/effects/dither-bake.js):
  `BetterFx.bakeDither({ pattern: 'ribbon', seed, tones: [hi, body, low], avoid: [{ x: 1.75,
  y: 0.92, r: 0.22 }] })` returns an SVG string. Place with `.fx-dither-bake` (bottom 68%
  of the card). `avoid` dims the art under a badge or title; x runs 0–2, y 0–1.
- **Tones:** derive from the item's brand or category color: hi is a pale tint, body the
  color, low a deep shade. Never a rainbow across one card.
- **SSR:** it is a pure function; run it at build or on the server and inline the SVG.
- **Pairs with:** `fx:grain` (opacity 0.45, overlay) and `fx:edge` on the card.

### fx:grain — film grain

A 180 px `feTurbulence` tile with `mix-blend-mode: overlay` at 0.3–0.45 over flat dark
surfaces, so large near-black areas read as material instead of an empty fill.
Recipe: `.fx-grain` (needs `position: relative` on the element). Static, never animated.
Skip it on light themes unless the concept is paper.

### fx:ring-orbit — light around a hairline

A 1.25 px ring drawn with a conic gradient whose angle is a registered `@property`, masked
to the border (`mask-composite: exclude`). The light travels around the primary button
every 6 s; `fx-ring--sweep` slides a linear gradient instead.

- **Use for:** the one primary action of a viewport. Hover adds a 4 px halo ring in the
  accent at 16% instead of lifting; press moves the button 0.5 px down.
- **Not for:** secondary buttons, cards, inputs, or several elements at once
  (`slop:lazy-cool`).
- **Accessibility:** the ring is decoration; the button keeps its own visible focus style
  and 3:1 boundary contrast without the animation. Reduced motion stops the loop and keeps
  a static ring.

### fx:metal-sheen — brushed-silver words

Silver gradient clipped to text (`background-clip: text`), 200% wide, sliding over 7 s; a
1 px sheen hairline above the heading moves the same way.

- **Allowed scope:** one to three words of at most one heading per page, when the concept
  is metal, hardware, or instrument and DESIGN.md records it. Outside that scope it is
  `slop:gradient-text`.
- **Contrast:** check the darkest stop (`--fx-silver-low`) against the background; it must
  meet the text's contrast requirement on its own. A solid-color fallback is in the recipe
  for browsers without text clipping and for forced colors.

### fx:blueprint-rails — section seams

Each section gets a hairline across the page at its top and bottom edge, with small square
rivets exactly on the content column edges (`--fx-rail-x` = half the content width).
The page reads as an engineered drawing without a background grid.

- **Rules:** rails sit on real section boundaries and real keylines of the layout. A rail
  that does not align with the content column is `slop:decorative-grid-bg`. Use
  `fx-rails--open-end` on a section that flows into the next.

### fx:hover-set — feedback that is not lift-and-scale

Pick one response per component type and use it everywhere for that type:

| Response | Component | Recipe |
| --- | --- | --- |
| Edge brightens over 700 ms | Cards, tiles, list rows | `.fx-edge`: inset hairline 0.08 → 0.2 white |
| Arrow nudges 4 px toward the destination | Links and buttons that navigate | `.fx-nudge` + `.fx-nudge__icon` |
| Underline draws from the reading start | Inline and footer links | `.fx-draw` |
| Halo ring, no movement | Primary button | `.fx-ring:hover` or `box-shadow: 0 0 0 4px` accent 16% |
| Art intensifies | Cards with `fx:dither-bake` | `.fx-intensify`: SVG opacity 0.85 → 1 over 700 ms |
| Siblings dim | Dense lists, nav | `.fx-dim-siblings`: the others go to 0.6 while one is hovered |

All hover styles sit inside `@media (hover: hover) and (pointer: fine)` and have a
`:focus-visible` twin. Press feedback is separate (motion.md section 5). Menus that open on
hover get a 100–150 ms close delay so a diagonal pointer path does not close them.

### fx:header-morph — bar to capsule

At the top of the page the header is a transparent full-width bar (64 px). After the first
few pixels of scroll it becomes a floating capsule: narrower (about 900 px), 58 px tall,
12 px radius, hairline border, blurred translucent fill, and a long soft shadow. All
properties ease over 500 ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
Recipe: `.fx-header` / `.fx-header__bar` + `BetterFx.headerMorph(header)`. On phones keep the
capsule opaque (0.94) for legibility; reduced motion switches instantly.

### fx:coverflow — distance-driven carousel

Slides scale and fade by their distance from the center of a native scroll-snap scroller:
`scale = 0.78 + 0.22·s`, `opacity = 0.45 + 0.55·s`, where `s` falls from 1 at the center.
Scrolling, swipe, wheel, and keyboard stay native.
Recipe: `.fx-coverflow` + `.fx-coverflow__tween` + `BetterFx.coverflow(scroller)`. Add visible
previous/next buttons (`api.prev()` / `api.next()`). Autoplay (`autoplayMs`) is optional,
stops forever on the first interaction, and never runs under reduced motion.

### fx:ruler-scrubber — barcode timeline

A row of 2 px ticks, one per day (or sample); week starts are taller, incidents take their
status color with a soft glow. A thumb marks the selected day; a status line above and a
caption with the date below follow the thumb and stay inside the component. Drag with
pointer capture, click a tick, or use the keyboard.
Recipe: `BetterFx.rulerScrubber(el, { items: [{ title, caption, date, tone, major }], label })`.
It is a `role="slider"` with `aria-valuetext`; arrows move one step, PageUp/PageDown one
week, Home/End the ends. Tone colors are paired with the status word, never color alone.

### fx:story-stack — swipe deck

Cards stacked bottom-aligned, each deeper card 26 px higher and 5% smaller. The front card
follows a downward drag (upward drag resists at 0.2) and is sent to the back when released
beyond 80 px or faster than 0.3 px/ms; it fades while it passes behind the deck. Cards
behind are clickable; segmented progress advances every 7 s and pauses on hover, focus,
and drag.
Recipe: `.fx-stack` markup + `BetterFx.storyStack(el)`. A Next button is required (drag is
never the only way), and so is the Pause control whenever autoplay runs (WCAG 2.2.2).
Back cards are `inert`. Reduced motion disables autoplay and the travel.

### fx:signal-route — packet on a wire

An SVG of orthogonal wires from a source to several destinations. Each wire is drawn
twice: a dim base and a bright branch. A 7 px square packet travels the wire with CSS
`offset-path`, and its branch stays lit while it travels, then dims to 0.42. Branches take
turns: cycle 12 s, delay 0 / 4 / 8 s.
Recipe: `.fx-route__branch` and `.fx-route__packet` in effects.css; see the gallery SVG.
The diagram needs `role="img"` and a label that states the relationship in words.
Reduced motion shows all branches lit and no packet.

### fx:dot-field — the page as a dot grid

A faint grid of round dots behind the page (Cloudflare: 12 px pitch, 0.75 px radius,
`#f0e3de` at 12% over warm near-black `#191817`). Sections and cards are opaque and sit on
top, so the dots show in gutters, around the hero, and through transparent bands.

- **Recipe:** `.fx-dots` on the element; tokens `--fx-dot-pitch`, `--fx-dot-r`,
  `--fx-dot-color`. Masks: `.fx-dots--fade-center` (dots fade toward the edges),
  `.fx-dots--fade-edges`, `.fx-dots--hole` (calm center for text). Spotlight:
  `.fx-dots--spotlight` + `BetterFx.dotSpotlight(el)` brightens dots in a 180 px circle
  under the pointer (pointer-fine devices only).
- **Rules:** the pitch is a spacing token, and the grid's center column aligns with the
  page center. Dot alpha 8–15%; never pure white. The spotlight is for one hero or CTA band,
  not every section. Cards on top use an opaque surface, not glass, so text never sits on dots.
- **Light theme:** dark dots at 10–14% on an off-white tinted toward the brand.

### fx:dot-matrix — anything rebuilt from dots

A sampler that draws any source as a dot grid: an image or SVG (logo, map, product
silhouette), text, or a function `(u, v) → 0..1`. `mode: 'size'` gives a halftone (radius
follows the value); `mode: 'threshold'` gives an LED sign (all dots equal, on or off) with
`dim` showing the unlit grid. Optional one-time reveal from `origin`.
Recipe: [dots.js](../assets/effects/dots.js) `BetterFx.dotMatrix(el, { source, pitch, radius,
mode, color, dim, origin })`. The source is drawn at full size and averaged per cell, so
fonts and images keep their proportions. The real text or image must exist in the DOM for
assistive technology; the canvas is `aria-hidden`.

### fx:dot-globe — dotted Earth with routes

Dots on a Fibonacci sphere, kept only on land; front dots fade toward the limb, back dots
are hidden or at 8%. Great-circle arcs lift off the surface between points; markers are your
own HTML elements (icons, labels) positioned each frame and hidden on the far side. Slow
auto-rotation (about 5°/s), drag to spin, pauses offscreen, still under reduced motion.

- **Recipe:** `BetterFx.dotGlobe(el, { mask: 'land-equirect.png', color, arcs, markers })`.
  The mask is a white-on-transparent equirectangular land image (lon −180→180, lat 90→−90).
  Make it from public-domain Natural Earth land polygons at 360×180 or larger; `land:
  (lat, lon) => bool` works too. The gallery uses a procedural placeholder: never ship that
  as a map of the world.
- **Library option:** in React, `cobe` (MIT) gives a WebGL dot globe with markers; check its
  current API in the docs before use. Cloudflare uses Three.js points with fog; that is worth
  it only when the scene needs real 3D (lighting, many arcs, zoom).
- **Rules:** one per page, as the illustration of a real network or reach. Callouts next to
  it use `.fx-bracket` (from `fx:bolts`) and real measured numbers. Pair with `fx:dot-field` in the same color
  family so the globe looks made of the page's material.

### fx:dot-wave — a pulse along a band

A row (or a few rows) of dots, each brightening from 0.28 to 0.9 opacity and nudging under
a pixel as a pulse passes; the delay follows the dot's position, so the wave travels.
Recipe: `BetterFx.dotWave(el, { cols, rows, pitch })` + `.fx-dot-wave__dot` keyframes. Pure
CSS after creation. Use it as a connector between two things that sync (repo → deploy,
device → cloud), not as a divider between sections.

### fx:dot-bars — data as dot columns

Each value becomes a column of square dots (mirrored around a center line for a waveform,
or rising from a baseline for a histogram). With `scroll` the strip is duplicated and loops
seamlessly with edge masks (Cloudflare: a 20 s traffic waveform inside an orange panel).
Recipe: `BetterFx.dotBars(el, { values, rows, pitch, size, mirror, scroll })`. Values are real
data or a series labelled as illustrative; the scrolling variant is ambient and needs the
same pause rules as any loop longer than 5 s when it sits next to content.

### fx:led-glyph — 5×5 dot-matrix status

A 16 px icon made of 25 dots (r = 1, pitch 3.5) that plays frames with `steps(1)` timing:
`pong` (agent working), `scan` (indexing), `pulse` (syncing), `spinner` (loading), `check`
(done, draws then holds). Custom frames are rows of `#` and `.` separated by `'|'`.
Recipe: `BetterFx.ledGlyph(el, { preset, ms, size, label })`. It always sits next to a
visible status word; pass `label` only when it stands alone. Reduced motion shows the last
frame. Use it for real asynchronous states, never as a decorative loader on static content.

### fx:bolts — bolted plates, dashed seams, brackets

Three structural marks from the Cloudflare grid:
- **Bolts:** 14 px squares (3 px radius, hairline border, page-colored fill) centered on
  the four corners of a bordered block, so the border appears to stop at each bolt. Markup:
  `.fx-bolted` + four `<i class="fx-bolt fx-bolt--tl|tr|bl|br">`. Use on grids of plates
  (feature tables, comparison blocks), not on every card.
- **Dashed seams:** `.fx-seam-dashed` draws a 6/6 px dashed hairline that runs past the
  container to the viewport edges (clip the page with `overflow-x: clip`).
- **Brackets:** `.fx-bracket` draws four L-shaped corner marks in `currentColor` around a
  stat or callout; `--dashed` adds an inset dashed frame. Use `background-color` (not the
  `background` shorthand) on the same element, or the marks disappear.

### fx:comet-beam — the active card

A conic-gradient comet with a fading tail travels the card border every 4.5 s, fading in
over 600 ms when the card becomes active and out over 500 ms when it stops (Cloudflare:
the customer browser being "served"). Recipe: `.fx-comet` + `[data-active]`. It replaces
`fx:ring-orbit` when the light means *this one is live now*, so it must switch off when the
state ends. Reduced motion shows a static arc.

### fx:scroll-fade-edges — overflow you can feel

A horizontally scrolling row fades only at the edge where more content waits: no fade at
the start, both edges in the middle, only the left at the end. Scroll-driven
(`animation-timeline: scroll(self inline)` animating two registered properties used in the
mask), no JS; without support the edges stay sharp. Recipe: `.fx-scroll-fade` on the
scroller. Keep visible arrow buttons or a scrollbar when the row holds key actions.

### fx:rotating-phrase — one sentence, several audiences

A sentence with an inline accent chip that cycles phrasings ("Everything needed to *build
secure applications* → *connect and protect your employees*"). The chip width eases to
each phrase (450 ms), the old text leaves upward and the new one enters from below (260 ms,
`cubic-bezier(0.32, 0.72, 0, 1)`). Recipe: `BetterFx.rotatingPhrase(el, { variants,
interval })`. Screen readers get all phrasings once; rotation pauses on hover/focus and
offscreen and is off under reduced motion. One per page, in a subheading, never in a CTA.

### fx:dotnav-progress — Apple's timed dots

A glass pill (56 px tall, `rgb(66 66 69 / 0.7)`, blur 20 px) of 8 px dots; the current
dot stretches to 48 px and fills linearly over the slide duration, then the next slide
starts. A separate 56 px glass circle toggles play/pause, and pause freezes the fill in
place. Recipe: `BetterFx.dotnav(el, { count, ms, labels, onSelect })`. It is a tablist:
arrows move, click selects, each dot has a label. Autoplay is off under reduced motion and
does not advance offscreen. The pill floats over the bottom of the media.

### fx:scroll-zoom and fx:theme-scrub — scroll-linked scenes

- **Scroll zoom:** as the block scrolls in, its media scales from 1.18 to 1 inside a frame
  whose radius grows from 0 to 28 px, so a full-bleed product shot settles into a card.
  `.fx-scroll-zoom` with one child; native view timeline, final state without support.
- **Theme scrub:** a section's background turns from black to `#f5f5f7` while it enters;
  the text color flips in one step at the midpoint so no frame is gray on gray. Give the
  section at least 25vh of top padding so its text reaches reading position after the
  colors settle. `.fx-theme-scrub` with `--fx-theme-from/to`, `--fx-theme-ink-from/to`.
- **Rules:** one zoom per page (the hero product) and theme flips only at real chapter
  breaks. Both never hijack scrolling: the page scrolls natively and reduced motion shows
  the final state.

## 4. Compositions that work

### The Kumo stack

Near-black canvas with tinted panels (`#0a0a0a`, `#0b0b0e`), white ink, silver grays, two
accents (blue and copper) used only on the primary action ring. One live `fx:dither-field`
in the closing CTA band; `fx:dither-bake` with `fx:grain` and `fx:edge` on every catalog
and blog card, colored by vendor; `fx:blueprint-rails` on section seams;
`fx:metal-sheen` on the last two words of two headings; `fx:header-morph`; `fx:coverflow`
for the model catalog; `fx:ruler-scrubber` for uptime; `fx:story-stack` for audiences.
What holds it together: one monochrome print language (dither, grain, hairlines), one
easing family (expo-out, 500–900 ms for surfaces, 150 ms for ticks), and color held back
for meaning.

### The Cloudflare stack

Warm near-black (`#191817`) with warm off-white ink, one hot accent (orange `#f38020`) and
its glow color. A page-wide `fx:dot-field` at 12 px; a hero panel in the solid accent; the
`fx:dot-globe` in accent dots with HTML markers and `.fx-bracket` callouts; grids of
`fx:bolts` plates with dashed seams; `fx:dot-bars` and `fx:dot-wave` where data or sync
is the story; `fx:comet-beam` on the one live card; `fx:rotating-phrase` in a subheading;
`fx:scroll-fade-edges` on product rows. The orange is rationed: big in the hero, then only
on things that carry meaning (dots of land, routes, the live card).

### The Linear stack

Quiet dark UI where motion is information: `fx:led-glyph` beside agent and job states,
dot clusters as the illustration of grouped work, hairline panels. No ambient fields.

### The Apple stack

Product photography does the expressing; the effects only stage it: `fx:scroll-zoom` on the
hero product, `fx:theme-scrub` at chapter breaks, media galleries with
`fx:dotnav-progress`, generous type, and a single gradient on the product name when the
product color itself is the subject (recorded in DESIGN.md, otherwise `slop:gradient-text`).

## 5. Verify an adopted effect

- Watch it in motion at normal and 25% speed; idle for 10 s and list everything that moves.
- Reduced motion: loops stop, travel disappears, states and feedback stay.
- Throttle the CPU 4–6×; the page scrolls without long frames. A live field pauses offscreen
  (check that rAF stops) and in a hidden tab.
- Disable WebGL (or force the fallback): the layout and text are intact.
- Contrast over the brightest frame of any effect behind text.
- Keyboard: every interactive effect works without a pointer; focus is visible.
- Phone width: no horizontal overflow, labels stay inside, touch drag does not block
  vertical page scroll (`touch-action: pan-y`).
- Scroll-linked effects: step through the scroll range and check every intermediate frame
  for contrast and overflow, not just the start and the end.
- Dot effects: check at 1× and 2× DPR (dots must stay round and on the pitch) and at 200%
  zoom; the meaning they carry also exists as text.
- Record the effect IDs and results in the `motion` and `distinctiveness` checks.
