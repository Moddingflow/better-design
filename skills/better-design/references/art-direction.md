# Art direction: an idea before styles

Read this for creation or redesign when a surface is new or identity is part of the task:
a brand, landing page, portfolio, consumer app, game, editorial product, or launcher.
For a change within an existing system, use "Inherited direction" below.

An average model response combines familiar templates. Prohibitions may push it toward
the next popular template without creating character. Character needs a process: a concept
from the subject, analyzed references, genuinely different options, a deliberate choice,
and critique of the rendered result.

## 1. A concept from the subject

Write one sentence naming **the object, place, or craft in the product's world that defines
the interface's language**. Derive it from the domain, audience, and content.

| Generic | Derived from the subject |
| --- | --- |
| "Modern, clean, minimal" | "A station departure board: monospaced rows, yellow on black, departure time first" |
| "Premium and elegant" | "A cellar label: high-contrast serif, paper, embossing, batch number" |
| "Playful and bright" | "The computer panel of an old cargo ship: grid, service codes, amber" |

Add three target qualities and three concrete qualities to avoid, such as banking blue,
SaaS glassmorphism, or a children's cartoon style.

## 2. Analyze references

Collect 3–5 real works: websites, products, posters, packaging, game interfaces, typography,
architecture, or film. AI-generated images and marketplace templates are not references.
User-provided references take priority.

For each, write one line naming **exactly what you are taking**: rhythm, density, number
presentation, material, light, or the text/image relationship. "The overall vibe" is not
analysis. A reference explains a principle; it does not authorize copying assets, text,
logos, or metrics.

## 3. Explore, then choose

Describe 2–3 directions with different **leading devices**, not different button colors:

- **Typographic:** type scale, weight contrast, and layout organize the composition.
- **Image-led:** photography, illustration, or 3D organizes it.
- **Structural:** a grid, diagram, data, or spatial model organizes it.

Give each 3–5 lines: leading device, palette, type, and first-viewport composition.
Choose one for a reason tied to the task and audience. If the user participates, show concise
options; do not turn this into a mandatory approval gate.

## 4. Use constraints deliberately

- **Palette:** one logic derived from material, era, product, or content; 1–2 accents and
  neutrals tinted toward its temperature. Assign canvas, text, action, and status roles.
- **Type:** shortlist three families from the concept, then choose with a reason. Check glyph
  coverage, including Cyrillic when needed, weights, numerals, and actual sizes. No font is
  prohibited. Habitually replacing Inter with Space Grotesk, DM Sans, or Instrument Serif
  is still a template choice.
- **Grid and rhythm:** one grid with a defined step and deliberate exceptions.
- **Motion:** how things behave in the concept's world: tempo, weight, physics, and elasticity.
  A board flips in steps, a label appears slowly, a console responds with a short spring.
  Derive duration/easing/spring tokens and one signature motion detail. Palette, type, and
  motion should speak in one voice; strict typography with cartoon bouncing is inconsistent.
  See [motion.md](motion.md).

## 5. Composition: dominance and contrast

- Give each screen or section **one leading element**; the rest supports it.
- Make scale contrast visible: expressive display text can be 3–5 times body size rather
  than one 1.25 step. Working tools need smaller steps but still need clear hierarchy.
- Asymmetry, offset axes, large crops, and deliberate departures from the grid are valid
  tools. Centering everything can signal a missing compositional decision.
- Adjacent sections differ in structure, not just wording; see `identical-card-grid` in
  [ai-slop.md](ai-slop.md).
- Empty space has a function: pause, emphasis, or grouping.
- **Squint test:** a blurred grayscale screenshot should still show hierarchy and a leading
  element. An even gray mass has no useful hierarchy.

## 6. Signature details and craft

Choose 1–2 memorable details that are difficult to obtain from a generic template:
number presentation, a divider, a custom hover response, photo cropping, a recurring motif,
a game's result sound/animation, or a signature transition/press response.
Where appropriate, let at least one detail exist in motion. A still detail appears in a
screenshot; motion is experienced through use. Neither may obstruct the task.

Craft includes:

- Optical alignment of icons and large letters, beyond bounding boxes.
- Deliberate kerning, line height, and negative tracking for large display headings.
- `font-variant-numeric: tabular-nums` for comparisons; correct dashes, locale-appropriate
  quotation marks, and nonbreaking spaces around units or short words where appropriate.
- Hanging punctuation and deliberate alignment for editorial work.
- Consistent light/shadow direction and nested radii (inner radius = outer radius − inset).
- Images with an intentional crop and light direction, rather than a generic person at a laptop.

## 7. Critique the render

Do a separate critique after the interface works, in addition to functional QA:

1. Capture key screens at the target viewports.
2. **Swap test:** replace the brand and content mentally with another company in the category.
   If the design fits unchanged, identify transferable layout, palette, or imagery and replace
   it with a decision derived from the concept.
3. Run the **squint test**.
4. Compare the result with the concept and references. Rework or remove generic elements.
5. Confirm that expression has not broken the task, contrast, focus, or reflow.
6. **Motion test:** record the key scenario. Find dead moments and determine whether the press
   responses and state transitions express this product or reuse generic fade-ups/bounces.
   See [motion.md](motion.md).
7. Run the [AI slop scan](ai-slop.md), including its copy information test. Record matched
   IDs, replacements, and justified exceptions.

Record swap/squint and slop-scan findings in a `distinctiveness` check, and motion evidence
in a `motion` check. Put the selected direction and tokens in the project's DESIGN.md so
later screens use the same values. Re-examine a critique pass that finds nothing.

## Inherited direction

When DESIGN.md, a brand, or a design system exists, inherit its concept. Use its Direction
section when present; otherwise summarize the live interface in one sentence and identify
type, palette, motifs, motion tokens, and motion character. Work within those constraints.
A button fix does not justify redesigning the product for originality.

## When not to run the full process

- Audit or focused change: verify that the change preserves existing character.
- Dense working tools such as CRM, admin, or IDE surfaces: express character through precision,
  data typography, and one or two details. The neutral fallback in
  [design-contract.md](design-contract.md) is appropriate.
- An explicit request for a simple, standard, system-like interface is itself a direction.
