# DESIGN.md — <Product name>

> The shared source of interface values. Read this whole file before UI work.
> Use values by role/token name. Add a missing role here and in code tokens together.
> Preset: better-design house style (premium ultra-minimal). Rules and rationale:
> references/house-style.md in the better-design skill. Replace <placeholders>, delete
> what the project does not use, and record user overrides under Discrepancies.

Updated: <YYYY-MM-DD>

## Direction

- **Direction:** house style, premium ultra-minimal (dark, monochrome, content-led).
- **Concept:** <one sentence from the product's world; it picks imagery and the signature detail>
- **Qualities:** restrained, precise, calm.
- **Avoid:** decorative gradients and glow; card grids of icons; more than one accent.
- **Motion:** calm and weighty, no overshoot; signature motion in the hero scene and chapter
  transitions, immediate press feedback everywhere else.
- **Signature details:** <one, from the concept>; optional pool effects: <for example
  fx:header-morph, fx:dotnav-progress, fx:scroll-zoom, or none>

## Code tokens

| Platform | File | Naming |
| --- | --- | --- |
| web | <src/styles/tokens.css> | `--color-text`, `--space-24`, `--type-body` |

Units: CSS px. Theme: dark by default via `:root`; light via `[data-theme="light"]`
(and `prefers-color-scheme` only when the product follows the system).

## Fonts

| Role | Family | Fallback | Weights | Loading | Notes |
| --- | --- | --- | --- | --- | --- |
| UI / text | Geologica (variable) | `-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif` | 340, 400, 500 | self-hosted `@fontsource-variable/geologica` (OFL-1.1), `font-display: swap` | full Cyrillic; `font-variation-settings: "CRSV" 0, "SHRP" 0, "slnt" 0` |

No other families. Tabular numerals (`font-variant-numeric: tabular-nums`) for prices and specs.

## Type scale

| Role | Token | Size (desktop / phone) | Line height | Weight | Tracking | Usage |
| --- | --- | --- | --- | --- | --- | --- |
| hero | `type-hero` | 80 / 48 | 1.05 | 500 | -0.035em | once per page |
| headline | `type-headline` | 56 / 40 | 1.07 | 500 | -0.03em | section headline |
| title | `type-title` | 40 / 32 | 1.1 | 500 | -0.025em | tile headline |
| intro | `type-intro` | 28 / 21 | 1.18 | 340 | -0.01em | one-line intro under a headline |
| lead | `type-lead` | 21 / 19 | 1.4 | 340 | 0 | larger paragraph |
| body | `type-body` | 17 | 1.5 | 340 | 0 | main text |
| small | `type-small` | 14 | 1.43 | 400 | 0.005em | secondary text, nav, small buttons |
| caption | `type-caption` | 12 | 1.33 | 400 | 0.01em | metadata, legal |

Buttons and numbers use weight 400 at their size.

## Color

| Role | Token | Dark (default) | Light | Usage |
| --- | --- | --- | --- | --- |
| canvas | `color-canvas` | #000000 | #ffffff | page background |
| surface | `color-surface` | #161617 | #f5f5f7 | tiles, grouped sections |
| surface-raised | `color-surface-raised` | #1d1d1f | #ffffff | cards in a section, inputs, menus |
| text | `color-text` | #f5f5f7 | #1d1d1f | main text |
| text-secondary | `color-text-secondary` | #a1a1a6 | #6e6e73 | secondary text, nav links |
| hairline | `color-hairline` | rgb(255 255 255 / 0.1) | rgb(0 0 0 / 0.1) | list and table dividers |
| field-border | `color-field-border` | #86868b | #86868b | input boundaries |
| action | `color-action` | #f5f5f7 | #1d1d1f | primary pill fill |
| on-action | `color-on-action` | #000000 | #ffffff | primary pill label |
| link | `color-link` | #2997ff | #0066cc | text links, selection |
| focus | `color-focus` | #2997ff | #0071e3 | focus ring 2px, offset 2px |
| danger | `color-danger` | #ff453a | #d70015 | errors, with text or icon |
| success | `color-success` | #30d158 | #1a7f37 | confirmations, with text or icon |
| glass | `color-glass` | rgb(22 22 23 / 0.8) | rgb(255 255 255 / 0.72) | sticky nav and floating media controls only; blur 20px, saturate 180% |

Measured contrast pairs (WCAG 2.x):

| Pair | Theme | Ratio | Requirement |
| --- | --- | --- | --- |
| text / canvas | dark | 19.29 | 4.5 |
| text / surface-raised | dark | 15.46 | 4.5 |
| text-secondary / surface-raised | dark | 6.54 | 4.5 |
| link / surface-raised | dark | 5.58 | 4.5 |
| on-action / action | dark | 19.29 | 4.5 |
| danger / surface-raised | dark | 4.94 | 4.5 |
| field-border / surface-raised | dark | 4.65 | 3 (non-text) |
| text / surface | light | 15.46 | 4.5 |
| text-secondary / surface | light | 4.66 | 4.5 |
| link / surface | light | 5.11 | 4.5 |
| focus / canvas | light | 4.70 | 3 (non-text) |
| on-action / action | light | 16.83 | 4.5 |
| danger / surface | light | 4.94 | 4.5 |
| field-border / canvas | light | 3.62 | 3 (non-text) |

State never relies on color alone. Color in the interface comes from real content
(product shots, screenshots, charts); the UI itself stays monochrome plus link/focus blue.

## Spacing

Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 120, 160. Tokens: space-4 … space-160.

- Within a group (label/field, icon/text): 4–8
- Headline → intro: 12–16; intro → actions: 24–32; between actions: 16–24
- Between items of one kind: 16–24; tile padding: 40–64 desktop, 24–32 phone
- Section padding: 120–160 desktop, 80 phone
- Screen edge margin: 24 phone, auto-centered container on desktop
- Siblings of one kind use one gap token, laid out by a container, never by hand offsets.

## Alignment and keylines

- Rows share centers; button pairs share one height.
- Hero may be centered; feature sections use a left keyline at the container edge.
- Settings and lists: labels on the text keyline (16 from the group edge), values and
  chevrons end on the right keyline; separators inset to the text keyline.

## Radii

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| tile | `radius-tile` | 28 | large feature tiles, media frames |
| card | `radius-card` | 18 | cards, grouped lists |
| field | `radius-field` | 12 | inputs, menus |
| pill | `radius-pill` | 9999 | buttons, chips, segmented controls |

Inner radius = outer radius − inset.

## Borders and depth

- Dark: flat; separation by tone (canvas → surface → surface-raised). No shadows.
- Light: one overlay shadow `0 12px 40px rgb(0 0 0 / 0.12)` for menus and dialogs only.
- Hairlines only for lists, tables, and dividers; cards have no border.

## Icons

- Set: SF Symbols on Apple platforms; Lucide (1.5 stroke) on the web. No mixed sets.
- Sizes: 16 inline, 20 in buttons, 24 in navigation. Never inside colored tiles.

## Components

### Button

| Size | Height | Horizontal padding | Type | Icon | Radius |
| --- | --- | --- | --- | --- | --- |
| sm | 32 | 16 | type-small | 16 | radius-pill |
| md | 44 | 22 | type-body | 20 | radius-pill |
| lg | 56 | 28 | type-body | 20 | radius-pill |

Variants: primary (action fill), secondary (ghost pill, 1px field-border), link (link color +
chevron "›"). One primary per viewport; never two filled buttons side by side.
States: default, pointer hover (fill lightens/darkens 6%), pressed (scale 0.97), focus-visible,
pending (label crossfades to progress, width kept), disabled.

### Input

Height 44, padding 14, surface-raised fill, 1px field-border, radius-field, label above in
type-small text-secondary, error text below in danger with an icon.

### Navigation

Height 52; transparent over the hero, glass after scroll; links type-small text-secondary,
current link text; one primary pill at the end that appears only after the hero's primary
action has scrolled out of view. The product name is shown in the nav and not repeated above
the hero headline.

### Tile

surface fill, radius-tile, padding 40–64; headline type-title, one line type-lead
text-secondary, one link; real image may bleed off the edge (clipped by the tile).

Target size: 44×44 minimum for touch.

## Layout

- Breakpoints: 375, 734, 1068, 1440.
- Content max width: 980 for text-led sections, 1440 for media; reading measure ≤ 70 characters.
- Grid: 12 columns with 24 gutter desktop; 4 columns with 16 gutter phone.

## Motion

| Role | Token | Value |
| --- | --- | --- |
| press | `motion-press` | 80ms down, held ≥ 90ms; scale 1 − 8/(w+h) (0.90–0.985); fill step; bloom from the touch point |
| release | `motion-release` | 520ms `spring-pop` (≈1% overshoot), from the interaction kit |
| snap | `ease-spring-snap` | 420–460ms, ≈3% overshoot: switch thumbs, segmented indicators |
| micro | `motion-micro` | 200ms (hover, color) |
| small | `motion-small` | 300ms (menus, tooltips) |
| medium | `motion-medium` | 400ms (sheets, dialogs) |
| scene | `motion-scene` | 600–1000ms (hero and chapter scenes only) |
| standard | `ease-standard` | cubic-bezier(0.28, 0.11, 0.32, 1) |
| color | `ease-color` | cubic-bezier(0.25, 0.1, 0.25, 1) |
| exit | `ease-exit` | cubic-bezier(0.3, 0, 1, 1) |

Surfaces, text, and sheets never overshoot; controls spring back after a press. No fade-up
on every section. Controls use the interaction kit (assets/motion in the better-design skill)
and the page passes `scripts/motion_probe.mjs` with zero errors. Reduced motion replaces movement with crossfade
while retaining feedback.

## Voice and copy

- Tone: calm, confident, specific. Headlines 2–6 words naming a real benefit; one concrete
  intro sentence; buttons are verbs ("Buy", "Get started", "Learn more").
- Avoid: exclamation marks, generic claims, "Not X. Y." slogans, page narration, label
  paraphrases, helper text without new facts.

## Prohibited in this project

- slop:ai-palette, slop:gradient-text (except a recorded product-color headline),
  slop:lazy-cool, slop:background-glow, slop:icon-tile, slop:identical-card-grid,
  slop:eyebrow-and-badge, slop:scroll-reveal-all, and the copy IDs.
- Deliberate exceptions of the house style: centered hero; monochrome
  palette shared with other house-style products (character comes from content and the
  signature detail).

## Discrepancies and exceptions

| Rule | Scope | Reason | Source |
| --- | --- | --- | --- |
| <user override, e.g. accent #34c759 for actions> | <whole product> | <user request> | <conversation date> |
