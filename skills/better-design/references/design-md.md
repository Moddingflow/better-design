# DESIGN.md: the shared source for the interface

DESIGN.md records the project's direction, fonts, type scale, colors, spacing, radii,
component sizes, icons, motion, and prohibited patterns. Screens made in different sessions
by different agents or people should use the same values. Otherwise, repeated changes can
produce 40px and 44px versions of the same button, three heading fonts, and arbitrary radii.

## 1. Find and read it first

- Before any UI work, look for `DESIGN.md` at the root, then `docs/DESIGN.md`,
  `design/DESIGN.md`, and paths named in CLAUDE.md/AGENTS.md/README. Match filenames
  case-insensitively. A monorepo may have a shared file and package-specific refinements.
- **Read the whole file before inspecting components or writing code.** It is required input.
- Take new or changed values **from DESIGN.md by token/role name**: family, size, weight,
  line height, color, spacing, radius, control height, icon size, duration, and easing.
  Do not eyeball, round, or introduce a nearby value because it seems slightly better.
- A missing value is a system decision. First check whether an existing role fits. Otherwise,
  add the role to DESIGN.md and code tokens **in the same change**, and report it.
  An undocumented one-off value is a defect.
- Find existing component variants by size, intent, and density. Record a new button, field,
  or card variant in the component section rather than styling it locally.

## 2. When to create it

| Situation | Action |
| --- | --- |
| New project/interface (`mode: create`) | Create DESIGN.md from the chosen direction and tokens before laying out screens |
| Redesign or changes to several components without a file | Derive it **from live code**: CSS variables, themes, and tokens. Record contradictions under Discrepancies rather than silently fixing them |
| One-element fix without a file | Use existing tokens; do not create the file unless requested. Offer it in one line in the report |
| User asks to document the system | Create it even for a small change |
| Audit | Do not create/edit it; report absence or staleness as a finding |

Use [DESIGN.template.md](../assets/DESIGN.template.md). Include only roles actually used;
remove empty sections instead of leaving TBD. Use the project's documentation language.

If the project has agent instructions, suggest a line saying:
"Before any UI work, read DESIGN.md and use its values."
Change another instruction file only with the user's authorization.

## 3. Required contents

Use **closed sets**: list the permitted values; do not introduce unlisted values.

- **Direction:** one-sentence concept, target/avoided qualities, and motion character from
  the contract's `direction`.
- **Fonts:** 1–2 families, rarely a third data/mono family; roles, fallbacks, weights,
  loading method, and glyph coverage.
- **Type scale:** display, h1/h2/h3, body, small body, caption, label, mono as needed;
  size, line height, weight, tracking, and usage. Prefer no more than 6–8 steps.
- **Color:** canvas, surface, raised surface, text, muted text, border, action/on-action,
  focus, selection, and status roles; values per theme and code token names.
  Record permitted foreground/background pairs with measured contrast.
- **Spacing:** a scale such as 0/4/8/12/16/24/32/48/64; within-group, between-group,
  and container-padding rules.
- **Radii:** 2–4 values with control/card/overlay/pill roles and a nesting rule.
- **Borders and depth:** hairline width, elevation levels, and permitted usage.
- **Icons:** one set, usually 2–3 sizes, stroke, and alignment with text.
- **Components:** button sm/md/lg height, padding, type, radius, icon size; input, list row,
  card, and target sizes.
- **Layout:** grid, maximum width, breakpoints, safe areas, and density.
- **Motion:** durations, curves/springs, press response, and reduced-motion behavior;
  see [motion.md](motion.md).
- **Voice and copy:** tone, prohibited patterns, number/date formats, punctuation, and
  when helper text adds information; use the copy rules in [ai-slop.md](ai-slop.md).
- **Project-specific prohibitions:** relevant catalog IDs and explicit visual brand exceptions.
- **Code mapping:** canonical token locations per platform and name mappings.
- **Discrepancies and exceptions:** `rule, scope, reason, source` for known departures.

## 4. Keep DESIGN.md and code tokens aligned

- Code renders the UI, so values live in CSS variables, theme objects, or Kotlin/Swift
  constants. DESIGN.md is their **normative description of roles and rules**.
  They must agree. Components reference tokens instead of literals.
- Change a token and its documentation together. Unsynchronized edits are defects.
- If code and DESIGN.md disagree, do not silently choose or add a third value. Synchronize
  when the task establishes the intended change; otherwise identify the discrepancy and
  ask which value is authoritative.
- Platforms sharing a visual system retain consistent values; document units and px/dp/pt
  mappings explicitly.
- A task contract describes a particular flow. DESIGN.md describes the shared system;
  the contract's `system.tokenSource` references it.

## 5. Check conformance

After editing and before acceptance:

1. Inspect style literals in changed code: hex/rgb/hsl, px/rem/dp/pt, font family/size,
   radius, shadow, and transition/duration. Each is a documented token or legitimate
   layout value such as 0, a 1px hairline, %, fr, calc, aspect ratio, or media dimensions.
   See SKILL.md section 4.
2. Collect actual rendered values with computed styles or a layout inspector: families,
   font sizes, button/input heights, radii, and text colors. They stay within the documented
   sets; the same role uses the same value across screens.
3. Compare matching components on neighboring screens: primary-button height, heading
   level, and group spacing.
4. Record a `tokens` check: values compared, out-of-system findings, and fixes.
   A count of unique values is a review signal, not an automatic failure.
