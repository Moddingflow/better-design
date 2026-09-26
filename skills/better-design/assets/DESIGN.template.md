# DESIGN.md — <Product name>

> The shared source of interface values. Read this whole file before UI work.
> Use values by role/token name. Add a missing role here and in code tokens together.
> Do not introduce undocumented interface values.
>
> Remove sections the project does not need; do not leave TBD.

Updated: <YYYY-MM-DD>

## Direction

- **Concept:** <one sentence naming the object/place/craft that defines the language>
- **Qualities:** <three>
- **Avoid:** <three concrete qualities>
- **Motion:** <character, tempo, physics, signature motion detail>
- **Signature details:** <one or two>

## Code tokens

| Platform | File | Naming |
| --- | --- | --- |
| <web> | <src/styles/tokens.css> | `--color-text`, `--space-4` |
| <android> | <app/.../Theme.kt> | `AppColors.text`, `Space.s4` |

Units: <document CSS px / dp / pt mapping>.

## Fonts

| Role | Family | Fallback | Weights | Loading | Notes |
| --- | --- | --- | --- | --- | --- |
| UI / text | <Family> | <system-ui, sans-serif> | <400, 500, 600> | <bundled / @fontsource / res/font> | <required language coverage> |
| Mono / numerals | <Family Mono> | <ui-monospace, monospace> | <400, 500> | <method> | <tabular-nums> |

No other families. Use tabular numerals for comparisons.

## Type scale

| Role | Token | Size | Line height | Weight | Tracking | Usage |
| --- | --- | --- | --- | --- | --- | --- |
| display | `type-display` | <40> | <1.1> | <600> | <-0.02em> | <once per screen> |
| h1 | `type-h1` | <28> | <1.2> | <600> | <-0.01em> | <screen title> |
| h2 | `type-h2` | <20> | <1.3> | <600> | <0> | <section> |
| body | `type-body` | <16> | <1.5> | <400> | <0> | <main text> |
| body-small | `type-small` | <14> | <1.45> | <400> | <0> | <secondary text> |
| label | `type-label` | <13> | <1.2> | <500> | <0.01em> | <buttons, fields> |
| caption | `type-caption` | <12> | <1.4> | <400> | <0> | <metadata> |

## Color

| Role | Token | Light | Dark | Usage |
| --- | --- | --- | --- | --- |
| canvas | `color-canvas` | <value> | <value> | <app background> |
| surface | `color-surface` | <value> | <value> | <panels, cards> |
| text | `color-text` | <value> | <value> | <main text> |
| text-muted | `color-text-muted` | <value> | <value> | <secondary text> |
| border | `color-border` | <value> | <value> | <hairline> |
| action | `color-action` | <value> | <value> | <primary button, links> |
| on-action | `color-on-action` | <value> | <value> | <text on action> |
| focus | `color-focus` | <value> | <value> | <focus ring> |
| danger | `color-danger` | <value> | <value> | <error with icon/text> |

Measured contrast pairs:

| Pair | Theme | Ratio | Requirement |
| --- | --- | --- | --- |
| text / canvas | <light> | <measured ratio> | 4.5 |
| on-action / action | <light> | <measured ratio> | 4.5 |
| focus / canvas | <light> | <measured ratio> | 3 (non-text) |

State never relies on color alone.

## Spacing

Scale: <0, 4, 8, 12, 16, 24, 32, 48, 64>. Tokens: space-1 = 4 … space-16 = 64.

- Within a group (label/field, icon/text): <4–8>
- Between group items: <12–16>
- Between groups/sections: <24–48>
- Container padding: <16 phone / 24 desktop>

## Radii

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| control | `radius-control` | <8> | <buttons, fields> |
| container | `radius-container` | <12> | <panels, cards> |
| overlay | `radius-overlay` | <16> | <dialog, sheet> |
| pill | `radius-pill` | <9999> | <chip, avatar> |

Inner radius = outer radius − inset.

## Borders and depth

- Hairline: <1px color-border>. Thicker borders identify selected/focus/error states.
- Elevation: <flat default; 1 dropdown/popover; 2 dialog/sheet>. Shadows belong to overlays.

## Icons

- Set: <Lucide / Material Symbols / custom>. No mixed sets.
- Sizes: <16 in text/dense lists, 20 in buttons, 24 in navigation>. Stroke: <1.5>.
- Position next to text, align to cap height, and avoid decorative colored tiles.

## Components

### Button

| Size | Height | Horizontal padding | Type | Icon | Radius |
| --- | --- | --- | --- | --- | --- |
| sm | <32> | <12> | type-label | <16> | radius-control |
| md | <40> | <16> | type-label | <20> | radius-control |
| lg | <48> | <20> | type-body | <20> | radius-control |

Variants: <primary, secondary, ghost, danger>. One primary per task region.
States: default, pointer hover, pressed, focus-visible, pending, disabled.

### Input

Height <40>, padding <12>, label above in type-label, informative hint in type-caption,
and a textual error below. Descriptions are optional; omit their wrapper when unnecessary.

### <Other project components>

Target size: <44×44 pt / 48×48 dp / ≥24 CSS px with a 44px touch preference>.

## Layout

- Breakpoints: <360, 768, 1024, 1440>.
- Content max width: <1200>; reading measure: <60–80 characters>.
- Grid: <12 columns with 24 gutter / 4 columns with 16 gutter>.

## Motion

| Role | Token | Value |
| --- | --- | --- |
| press | `motion-press` | <80ms down / 180ms return> |
| micro | `motion-micro` | <120ms> |
| small | `motion-small` | <180ms> |
| medium | `motion-medium` | <260ms> |
| large | `motion-large` | <380ms> |
| standard | `ease-standard` | <cubic-bezier(0.2, 0, 0, 1)> |
| enter | `ease-enter` | <cubic-bezier(0, 0, 0, 1)> |
| exit | `ease-exit` | <cubic-bezier(0.3, 0, 1, 1)> |

Press: <scale 0.97 on pointerdown>. Reduced motion replaces movement with crossfade while retaining feedback.

## Voice and copy

- Tone: <voice>. Buttons name actions, for example "Save changes."
- Numbers/dates: <locale formats>. Punctuation: <language-appropriate quotes and unit spacing>.
- Avoid: <generic claims, forced contrast slogans, page narration, label paraphrases>.
- Helper text is optional. Keep only new facts needed to choose, predict consequences,
  enter valid data, or recover. Preserve necessary accessible instructions.
- Verified product facts used in explanations: <source of limits, timing, scope, and consequences>.

## Prohibited in this project

- <slop:icon-tile, slop:ai-palette, slop:lazy-cool and applicable copy IDs from the catalog>
- Deliberate visual brand exceptions: <for example, Geist chosen for a documented reason>

## Discrepancies and exceptions

| Rule | Scope | Reason | Source |
| --- | --- | --- | --- |
| <12px radius on legacy Dialog> | <Dialog> | <until migration> | <issue/commit> |
