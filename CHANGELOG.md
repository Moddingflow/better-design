# Changelog

## 1.7.0 — unreleased

### Changed

- **The default style applies more reliably.** `house-style.md` now states what is not a visual cue (the product's domain, industry, audience, or name) and what is not a design system to inherit (untouched shadcn/ui, Tailwind, starter-template, Bootstrap, MUI, Chakra, or Mantine defaults), with a token mapping for shadcn/ui and Tailwind. `SKILL.md` names both checks where the default is chosen.
- **Start from the reference.** When the default style applies, the agent starts from `assets/house-style.html` (tokens, type classes, nav, buttons, tiles, section rhythm) instead of composing the look from memory.
- **Page anatomy and imagery.** The default style defines the blocks a site is built from, requires the hero to lead with the product rather than a dashboard or widget, and gives an imagery path for products without photos (own UI in a frame, a drawn monochrome object, or a sized and labeled media slot).
- **Catalogs and shops.** One filled pill per viewport is the page-level action; per-item actions are ghost pills or links, and item cards are media-led.
- **Verification.** A side-by-side screenshot comparison with the reference at 1440 and 390 px and a list of code-level conformance checks (headline weight, font family, palette, shadows, gradients, tile borders, pill shape, filled pills per viewport).
- The effects gallery uses the placeholder product from the reference page.

### Added

- **Live demo** on GitHub Pages (`demo/`, deployed by `.github/workflows/pages.yml`): the same prompt built by an agent with and without the skill, switchable in place, plus the bundled live pages.

## 1.6.0 — 2026-10-20

### Added

- **Interaction kit** (`assets/motion/`): framework-free CSS and JavaScript that every created or redesigned UI adopts before building components. A three-layer press (compress by ~4 px of perimeter within 90 ms with size-aware depth, a fill step, a bloom from the touch point, a spring release with ~1% overshoot), a 90 ms minimum press so quick taps are visible, keyboard press, hover without lift, a focus ring that grows into place, switches, checkboxes, a sliding segmented indicator, pending/done/error button states, icon swaps, a toggle pop, an error shake, popovers and dialogs that grow from their trigger, and height-animated disclosures. Includes a bench page and an adoption guide with React, Vue, Svelte, SwiftUI, and Compose notes.
- **Motion probe** (`scripts/motion_probe.mjs`): a dependency-free Node.js 22+ script that drives headless Chrome, Chromium, or Edge over the DevTools protocol. It hovers, presses (releasing outside the element, so nothing activates), and keyboard-focuses every interactive element; errors on missing press feedback, missing focus, or stuck states, and warns on weak 1–2 px presses, instant returns, missing hover, and `transition: all`. Supports `--reduced-motion`, viewport size, selectors, and JSON output.

### Changed

- The press model in `motion.md` no longer accepts a lone 1–2 px move or a 0.97 scale with an instant return. Controls spring back after a press in every direction; surfaces, text, and sheets still never overshoot.
- Adopting the kit and a zero-error probe run are now part of the workflow and of acceptance in `SKILL.md`.

## 1.5.0 — 2026-10-20

### Added

- **Default style** (`references/house-style.md`): when the user gives no visual direction and nothing exists to inherit, the agent builds in a premium ultra-minimal style — black canvas, near-white Geologica type, two grays, one blue for links and focus, real content as the only color. A user's visual cue always replaces it; existing products are never restyled into it unless asked; games keep their own art direction.
- A filled `DESIGN.house-style.md` preset, a reference render (`house-style.html`), and `house-style.tokens.json`, whose 44 dark and light contrast pairs pass the bundled validator.
- Rule: each fact once per viewport (product name in the nav or above the headline, never both; a nav action appears only after the hero action scrolls away).

### Changed

- Art direction, contract, DESIGN.md, and AI-pattern guidance now state when the default style applies and how its swap test judges content, imagery, and the signature detail instead of the shared palette.

## 1.4.0 — 2026-10-20

### Added

- A dot language for the effects pool: dot-grid fields with a pointer spotlight, any image or text rebuilt from dots, a dotted globe with arcs and HTML markers, pulsing dot bands, data as dot columns, 5×5 LED status icons, bolted plates, dashed seams, corner brackets, a comet on the active card, edge fades on overflow rows, a rotating inline phrase, timed dot navigation, media that settles into a frame on scroll, and section theme flips.
- Composition notes for Cloudflare-, Linear-, and Apple-like stacks, and the rule that dots are a material: a bare dot wallpaper with nothing made of dots remains a generic pattern.

## 1.3.0 — 2026-10-20

### Added

- **Optional effects pool** (`references/effects-library.md`, `assets/effects/`): a live WebGL ordered-dither field, a baked halftone for card sets, film grain, a light orbiting the primary button, brushed-metal words, blueprint rails, hover responses that are not lift-and-scale, a header that morphs into a capsule, a distance-driven coverflow, a barcode ruler scrubber, a swipe story stack, and packets on routing wires. Every effect has budgets, fallbacks, reduced-motion behavior, and a gallery bench page. Nothing in the pool is a default.

## 1.2.0 — 2026-10-07

### Added

- **Layout geometry** (`references/layout-geometry.md`): equal gaps from layout containers, shared alignment lines and keylines, content centered by its visible ink, padding that is never smaller than the gaps it contains, and safe-area reserve.
- `scripts/check_layout.py` with regression tests: an offline, standard-library checker for `better-design-layout-v1` dumps that reports uneven gaps, misaligned rows, columns, and keylines, off-center content, overflow, tight edges, and overlaps.
- Layout dumpers for the web (`dump-dom.js`), Unity (`LayoutDump.cs`), and Godot (`layout_dump.gd`), plus an example dump.
- A `layout` evidence check in the contract validator.

### Changed

- Platform guidance for games now asks for layout containers, TMP cap-line centering, and measured dumps at every supported resolution.

## 1.1.0 — 2026-09-26

### Changed

- Translated all 11 reference guides, the DESIGN.md template, and both contract examples into English. Agent metadata is also English; the Russian README remains an optional reader guide.
- Added explicit skill version metadata for checking installed copies.
- Added copy rules for page narration, label paraphrases, and helper text inserted by default. Expanded redundant-copy detection to semantic repetition across a task region.
- Required an information test for every explanation, optional description slots, and removal of empty description wrappers.
- Preserved necessary consequences, limits, recovery, unfamiliar concepts, and accessible instructions; prohibited invented product facts as filler replacements.
- Applied copy acceptance rules to dense working tools as well as expressive surfaces, with new evaluation cases and an example prompt.
- Added an English-package Cyrillic check to distribution validation. Deliberate multilingual literals in Python regression tests remain unchanged.

The validator's formats, calculations, and executable behavior are unchanged.

## 1.0.0 — 2026-09-26

Initial public release of Better Design.

- Complete UI/UX skill: art direction, `DESIGN.md`, typography, layout, motion, interaction states, accessibility, and evidence-based review.
- Reference guides for web, Apple, Android, desktop, and games / Unity.
- A catalog of generic AI design patterns with contextual replacements and exceptions.
- Design-system template, focused-change and creation contracts, and example tokens.
- Python standard-library validator with its existing regression suite.
- English and Russian README files, installation guide, example prompts, and English validator guide.
- GitHub Actions checks for package integrity, unit tests, and example validation.
- MIT license included in both the repository and the installable skill.

### Publication adjustments

- Preserved the original `SKILL.md`, helper code, tests, and examples.
- Replaced a machine-local sibling-skill link with the public upstream link.
- Generalized a private project example in the game-platform guidance.
- Localized Codex display metadata into English for public distribution.

The detailed reference guides remain in Russian. No cross-agent design-quality benchmark is claimed.
