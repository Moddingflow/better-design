# Interaction kit

Required baseline motion for every UI built or redesigned with better-design. Models leave
controls dead unless the motion is in the code from the start, so adopt this first, then
build components on it. Bench: [kit.html](kit.html). Proof: `node scripts/motion_probe.mjs`.

## Adopt

1. Copy `interaction-kit.css` into the project's styles and map `--ui-*` tokens to DESIGN.md
   motion and color roles (focus ring, highlight, switch/check colors).
2. Load `interaction-kit.js` and call `BetterUI.init(document)` once (event delegation), or
   port its handlers into the shared Button / Link / Switch components (see below).
3. Give every interactive element its class from the map. Do not add a second `transition`
   declaration to an element that has a kit class: the later one silently replaces the
   kit's list and kills the press and spring release. Extend the list instead.
4. Run the probe on each created or changed page until it reports zero errors, in normal
   and `--reduced-motion` mode.

## Component → classes

| Component | Classes / API | What the user feels |
| --- | --- | --- |
| Button (filled light) | `ui-press ui-focus` | Compresses ~4 px of perimeter with a darker fill, bloom from the finger, springs back past rest and settles |
| Button on a dark fill, ghost, icon button | `ui-press ui-press--on-dark ui-focus` | Same, the fill brightens instead |
| Tile, card, list row, menu item | `ui-press ui-press--surface ui-press--on-dark ui-focus` | Gentle 1.5% press, row tint, bloom |
| Text action, nav link, "Learn more ›" | `ui-dim ui-focus` + `<span class="ui-icon-nudge">›</span>` | Dims under the finger, eases back; chevron slides on hover |
| Inline link in prose | `ui-link ui-focus` | Underline draws on hover/focus, dims on press |
| Switch | `ui-switch ui-focus`, `role="switch"`, `aria-checked` | Thumb stretches under the finger, travels with a snap spring |
| Checkbox | `ui-check ui-focus`, `role="checkbox"`, `aria-checked`, tick `<svg><path>` | Box compresses with a halo, the tick draws itself |
| Segmented control / tabs | `BetterUI.segmented(el)` on a row of buttons with `aria-selected` or `aria-pressed` | One indicator slides to the choice; arrows move |
| Async button | `<span class="ui-btn-state">` with `ui-state-label / -pending / -done`, `BetterUI.runWithState(btn, task)` | Width holds, spinner crossfades in, "Saved ✓" once, repeat presses ignored, shake on error |
| Copy / play-pause | `<span class="ui-swap">` with two icons, `BetterUI.swap(el, ms)` | Old icon spins out, new one springs in |
| Like / bookmark | `aria-pressed` button with `<svg class="ui-pop-icon">` | One pop when it turns on |
| Text field | `ui-field` | Ring grows on focus; `BetterUI.shake(field)` with visible error text |
| Menu / popover / dialog | `ui-pop-in` on `[popover]` or `<dialog>`, `BetterUI.originFrom(pop, trigger)` | Grows from its trigger, leaves faster |
| Disclosure | `<details class="ui-disclosure">`, `<span class="ui-chevron">` in summary | Height animates to auto, chevron turns, summary tints on hover/press |

Disabled controls get `disabled` or `aria-disabled="true"`: no press, no hover, 45% opacity.

## Timing (why it feels alive)

- Press down 60–90 ms; the pressed state is held at least 90 ms so quick taps show.
- Depth is constant in pixels, not a fixed scale: `scale = 1 − 8 / (width + height)`,
  clamped 0.90–0.985. Small icons dip visibly, large cards barely move.
- Release: `--ui-spring-pop` (damping 0.5, ≈16% overshoot of the travel, ≈1% in scale),
  settled in ~450 ms. Indicators and thumbs: `--ui-spring-snap` (≈3%).
- Hover 200 ms, focus ring 160 ms, color with `cubic-bezier(0.25, 0.1, 0.25, 1)`.
- Reduced motion keeps every response that is not movement: fill, bloom, halo, dim,
  focus; scale, travel, and springs are removed.

## Porting to a framework

Keep the CSS as is (classes or CSS modules). For the JS:

- React: one `usePress(ref)` hook that does what `pressOn/pressOff` do (pointer coords →
  `--ui-px/--ui-py`, `--ui-press-scale` from size, `data-pressed` with the 90 ms minimum,
  Space/Enter mirror), used inside the shared `Button`, `IconButton`, `Tile` components.
  Do not reimplement it per page.
- Vue / Svelte: the same as a directive / action (`v-press`, `use:press`).
- Native: the same model with platform tools (SwiftUI `ButtonStyle` with
  `.scaleEffect` + `.spring(response: 0.35, dampingFraction: 0.55)`, Compose
  `Modifier.pointerInput` + `animateFloatAsState(spring(dampingRatio = 0.5f))`).
