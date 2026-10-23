# DESIGN.md — Driftline

> The shared source of interface values. Read this whole file before UI work.
> Use values by role/token name. Add a missing role here and in `styles.css` together.
> Preset: better-design house style (premium ultra-minimal).

Updated: 2026-10-22

## Direction

- **Direction:** house style, premium ultra-minimal (dark, monochrome, content-led). No visual
  cue in the request, no existing system.
- **Concept:** a night-train timetable read in a dark compartment: the night is one line
  from departure to arrival, and the network is a handful of lines between cities.
- **Qualities:** restrained, precise, calm. **Avoid:** travel-brochure photos and sunsets,
  gradient night skies, card grids of icons.
- **Leading elements:** hero = the network map (real routes, each line is a booking
  shortcut); booking = the departure/arrival times; berths = a floor plan of the compartment;
  timetable = the light chapter.
- **Signature details (custom):** the *night bar* (each train drawn on a 17:00–13:00 axis
  over a darker 22:00–07:00 band; the trip bar grows from departure to arrival when a train
  loads) and the selected route drawing itself along the map line.
- **Pool effects:** none.
- **Motion:** calm and weighty; press feedback from the interaction kit on every control;
  the only scene-length motions are the route draw (900 ms) and the trip bar (700 ms).

## Code tokens

| Platform | File | Naming |
| --- | --- | --- |
| web | `styles.css` (`:root`, `[data-theme="light"]`), kit mapping `--ui-*` | `--color-text`, `--space-24`, `--radius-card` |

Units: CSS px. Theme: dark on `:root`; the timetable section is the one light chapter
(`data-theme="light"`).

## Fonts

| Role | Family | Fallback | Weights | Loading |
| --- | --- | --- | --- | --- |
| UI / text | Geologica (variable) | `-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif` | 340, 400, 500 | Google Fonts, non-blocking (`media="print"` swap) so a slow font host never delays the scripts |

Tabular numerals for times, prices, totals.

## Type scale

| Role | Class / where | Size (desktop / phone) | Line height | Weight | Tracking |
| --- | --- | --- | --- | --- | --- |
| hero | `.hero` | 80 / 48 | 1.05 | 500 | -0.035em |
| headline | `.headline` | 56 / 40 | 1.07 | 500 | -0.03em |
| title | train times `.j-end .t` | 40 / 32 | 1.1 | 500 | -0.025em |
| title-2 | `.title-2`, `.total`, class price | 28 | 34px | 500 | -0.02em |
| title-3 | `.sum-title`, `.state h3`, class name | 21–22 | 22–28px | 500 | -0.01em |
| intro | `.intro` | 28 / 21 | 1.18 | 340 | -0.01em |
| lead | `.lead` | 21 | 1.4 | 340 | 0 |
| body | body, fields, buttons | 17 | 1.5 | 340 (buttons 400) | 0 |
| small | labels, nav, meta | 14–15 | 20px | 400 | 0.005em |
| caption | ticks, night prices, footer | 12 | 16px | 400 | 0.01em |

## Color

Preset values, unchanged (see `:root` in `styles.css`): canvas `#000`, surface `#161617`,
surface-raised `#1d1d1f`, text `#f5f5f7`, text-secondary `#a1a1a6`, hairline
`rgb(255 255 255 / 0.1)`, field-border `#86868b`, action `#f5f5f7` / on-action `#000`,
link and focus `#2997ff`, danger `#ff453a`, success `#30d158`, glass `rgb(22 22 23 / 0.8)`.
Light chapter: canvas `#fff`, surface `#f5f5f7`, text `#1d1d1f`, text-secondary `#6e6e73`,
link `#0066cc`, focus `#0071e3`.

Map lines: unselected = field-border (4.9:1 on surface), selected = text, keyboard focus =
link. The night band in the night bar is surface-raised on surface (decorative; the
duration is also given as text).

## Spacing

Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 120. Section padding 120 desktop, 80 phone.
Field row gap 12; label → control 8; nights strip gap 8; class cards gap 12; summary padding 32
(phone 24); tiles 40.

## Layout and keylines

- Containers: `.wrap-app` 1200 content (nav, booking, berths, timetable, footer share its
  left keyline); `.wrap` 980 for the centered hero text; `.wide` 1440 for the map tile.
- Breakpoints: 1067 (summary drops below, class options stack), 900 (berths split stacks,
  timetable becomes row cards), 734 (phone).
- Class comparison: label column 112 + three option columns on a shared subgrid so every
  fact row lines up across options.

## Radii

tile 28 (map, plan), card 18 (class options, summary, states), sheet 20 (review dialog),
field 12, pill 9999 (buttons, nights, chips, segmented).

## Components

- **Buttons:** primary pill 44 (block 56 in the summary), ghost pill with field-border
  inset, icon button 44 round on surface-raised. One filled action per viewport: hero
  "Find a train", summary "Review booking". The nav has no CTA because the booking
  section has its own primary.
- **Nights strip:** pill chips 56 high; selected = action fill (selection indicator).
- **Class option:** `role="radio"` card, selected = 2px inset text ring + filled radio dot
  (not color alone); unavailable = `aria-disabled` with the reason in text.
- **Disabled controls:** `aria-disabled="true"` (keeps focus): pax minus at 1, plus at 6,
  "Review booking" until a class is chosen.

## Motion

Interaction kit (`interaction-kit.css/js`) on every control, mapped: `--ui-focus-ring` →
focus, segmented track/indicator → surface/surface-raised.

| Role | Value |
| --- | --- |
| press / release | kit: 80 ms down (≥ 90 ms held), spring-pop release |
| micro | 200 ms, ease-color (hover, map line color) |
| results crossfade | 260 ms ease-standard; skeleton appears only if a search takes > 120 ms |
| plan swap | 400 ms, 8 px rise + fade |
| total roll | 420 ms ease-out cubic |
| trip bar grow | 700 ms ease-standard |
| route draw | 900 ms ease-standard (scene) |

Reduced motion: route draw, trip bar, total roll and plan rise are dropped (plan crossfades);
press fill, bloom, focus and all state changes remain.

## Voice and copy

Short declarative headlines; verbs on buttons. Sample data is labelled once (footer) and the
booking end is labelled at the point of action ("Demo: nothing is booked or charged.",
"The demo ends here.").

## Discrepancies and exceptions

| Rule | Scope | Reason |
| --- | --- | --- |
| Nav primary pill that appears after the hero | removed | The booking section and summary already hold the page's primary action |
| Hero media is a network diagram, not a product photo | hero | Imagery path 2: the product's own interface (routes are bookable from the map) |
| Selected class card has a 2px ring | class options | Selected-state only (allowed by `border-accent-rounded` exception) |
| Timetable rows align on first baseline | timetable | Route cells carry a second "via" line; times align with the route name |
