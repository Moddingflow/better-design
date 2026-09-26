# Contracts and design decisions

Read this for a new flow, several related components, or a visual-system decision.
For a focused fix, record only the task, preserved baseline, change, and check.
A separate JSON file is optional. The contract introduces no new approval gate.

## Decisions before styles

Identify the audience, frequency of use, inputs, primary task, and outcome. Inspect what
exists: DESIGN.md first (see [design-md.md](design-md.md)), live UI, components, tokens,
typography, icons, and input model. Do not fill context gaps with an invented persona or feature.

| Surface | Basis for decisions | Common mistake |
| --- | --- | --- |
| Working tool | Scanning, comparison, predictable actions | Huge hero and a card for every row |
| Reading/editorial | Text rhythm, line measure, navigation, content | Dashboard chrome around an article |
| Commerce | Clear terms, selection, price, and order correction | Fake urgency, hidden fees, forced consent |
| Brand/portfolio | A specific concept, content, expressive hierarchy | Generic slogans and arbitrary uniqueness |
| Game/HUD | Fast reading, world state, input, artistic task | Moving an office web kit into a game |

References explain rhythm, density, material, or navigation; they do not authorize copying
assets or fabricating metrics. Preserve existing identity, including appropriate purple,
serif type, a 12px radius, 2px spacing, or a platform's material language.

For a brand, landing page, portfolio, consumer app, game, editorial product, or launcher with
no system, use [art-direction.md](art-direction.md): concept, references, 2–3 directions, choice.
Derive tokens from that choice, not the fallback table, and record them in DESIGN.md
using the [template](../assets/DESIGN.template.md).

## Configurable neutral fallback

Use only when no system exists (neither DESIGN.md nor code tokens) and the task is a working
tool such as CRM, admin, internal forms, or an IDE-like surface, or when the user explicitly
wants a standard appearance. Expressive surfaces need their own direction.
These are internal starting values, not standards.

| Area | Starting point | Reconsider for |
| --- | --- | --- |
| Font | One UI stack; body 16, secondary 14, metadata 12 CSS px | Platform, density, glyph coverage, brand |
| Type | 12/14/16/20/24/32/40; body leading 1.4–1.6 | Text role and container; do not enlarge headlines merely to fill space |
| Weight | Usually 400/500/600/700 | Actual roles; a second data/brand font is allowed |
| Space | 0/4/8/12/16/24/32/48/64 | Project system/content; do not impose a 4px grid |
| Radius | 0/4/8; capsules for appropriate chips/avatars/controls | Platform, brand, component |
| Elevation | Flat by default; up to three meaningful levels | Real layering/overlays |
| Measure | Roughly 60–80 characters for reading text | Do not impose this on tables, code, or tools |
| Motion | Press 60–100 ms down / 150–250 return; micro 100–150; small 150–220; medium 220–320; large 300–450. Standard cubic-bezier(0.2,0,0,1), enter (0,0,0,1), exit (0.3,0,1,1); springs without overshoot | Named function, frequency, distance, reduced-motion variant; see [motion.md](motion.md) |
| Layout | Content-driven wrap/stack/scroll/collapse | Preserve essential content and data comparison |

Assign colors semantic roles first: canvas, surface, text, muted text, action/on-action,
border, focus, status, and selection. Create only roles used by components; avoid an empty
oversized palette. Check needed pairs in all supported states/themes.

Use an existing token when its meaning fits. Otherwise justify a new token/variant.
Percentages, grid fractions, max-content, image dimensions, layout calculations, hairlines,
and zero values are not arbitrary style drift.

## Exceptions

A short `rule, scope, reason, source, impact` record is enough for a baseline exception.
Example: preserve the existing Dialog's 12px radius, without introducing new variants.
Exceptions are scoped; they do not disable the whole review. Aesthetic reasons cannot turn
a broken action or inaccessible focus into a pass. Routine reversible decisions within
authorized scope do not need another permission request.

## Custom format: `better-design-contract-v1`

The [refine example](../assets/design-contract.example.json) covers a small name-saving flow.
The [create example](../assets/design-contract.create.example.json) includes a new direction,
motion language, menu skeletons, and distinctiveness/motion checks.
The validator checks the fields below; it is not a general JSON Schema tool.
Unknown fields, wrong types, empty required strings/lists, and duplicate IDs fail.
All fields are required except `verification.checks[].note` and `direction` under the
rules below. Evidence is always an array.

| Path | Contents |
| --- | --- |
| `format`, `mode`, `scope`, `assumptions` | Version; create/refine/audit/plan; exact scope; assumptions list, possibly empty |
| `platform` | kind, units, non-empty inputs/locales/directions/themes |
| `platform.kind → units` | web→css-px; ios→pt; android→dp; desktop→dip/px; game→px/engine |
| `platform.inputs` | pointer, keyboard, touch, gamepad, assistive; only actual support |
| `platform.directions` | ltr and/or rtl; a support declaration, not a new i18n feature |
| `system` | Non-empty authority, tokenSource, density, expression, rationale. Existing sources remain canonical. Name DESIGN.md and code-token files when present |
| `direction` | Required for mode create, otherwise optional. origin (new/inherited), concept, non-empty qualities/avoid, palette, typography |
| New direction | Also references[] with source/takeaway (at least one, target 3–5); alternatives[] with ≥2 id/premise entries; chosen alternative ID; non-empty signature and motion (character, tempo, physics, signature detail). Requires a distinctiveness and a motion check |
| Inherited direction | references, alternatives/chosen, signature, and motion are optional. If alternatives/chosen are supplied, the same rules apply; supplied motion must be non-empty |
| `tasks[]` | id, scenario, outcome, priority (primary/secondary), recovery; at least one primary |
| `components[]` | id, kind, taskIds, states, responsive, actions; taskIds and states are non-empty |
| `actions[]` | id, kind, label, taskId, outcome, risk, protection, recovery |
| `actions.kind` | command/navigation/submit/toggle/select/edit/drag |
| Risk and protection | risk normal/high; protection none/reversible/check/review. High cannot use none |
| `verification.viewports[]` | Positive finite width/height and platform unit. At least one for web; native may use [] |
| `verification.checks[]` | id, taskIds, componentIds, kind, scenario, status, evidence, optional note |
| Check kinds | structure/tokens/contrast/render/interaction/keyboard/a11y/assistive/performance/localization/distinctiveness/motion |
| Check status | planned/pass/fail/unverified. Pass/fail need evidence; unverified needs note; planned has no evidence |
| `exceptions[]` | rule, scope, reason, source, impact; may be empty |

Component kinds: button, link, input, select, toggle, checkbox, radio, tabs, menu, dialog,
table, list, navigation, search, region, text, image, chart, custom.
Buttons/links/inputs/selects/toggles/checkboxes/radios/tabs/menus/navigation/search require at
least one action. Others may use actions: [], such as a read-only table or region.
This validates declarations, not implementation conformance.

IDs are unique non-empty strings within tasks/components/checks; action IDs are unique
across all components. References resolve to existing IDs. An action belongs to a task
of its component. Each task has a component and check; each component has a check.
Check taskIds are non-empty; componentIds may be empty for a whole-scenario check.
Each named check component shares at least one task with that check.
Declared coverage does not prove actual coverage.

Update statuses from evidence. A structurally valid contract can contain planned, failed,
or unverified checks; a structural pass says nothing about UI readiness.
Direction and distinctiveness fields do not assess beauty: evidence includes screenshots,
swap/squint findings, and changes made. Motion evidence requires video or frame-by-frame
records, usually slowed, plus dead moments/idle noise findings and a reduced-motion run.
A still screenshot cannot prove motion.

For a focused change without JSON, record changed transitions, motion tokens, and reduced-motion
checks in the brief change record.
