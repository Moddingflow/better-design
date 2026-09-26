# AI slop catalog

The single source of rules for generic generation patterns. SKILL.md and other files
link here instead of duplicating entries. Motion patterns are detailed in
[motion.md](motion.md), section 10; only their IDs are listed here.

Slop is a decision made from model habit rather than the product: it could move to any
other site unchanged. Each entry gives a **signal** visible in the render or code, a
**replacement**, and a **legitimate exception**. Replace the underlying decision; simply
removing decoration can produce another generic template. For redundant copy, removing
the sentence is the correct replacement when the existing label already does its job.

## How to use this catalog

- For creation/redesign, review the plan before rendering, then run a **slop scan** on
  current screenshots and actual interface copy using the review section below.
- For a focused change, avoid introducing these patterns. Report existing patterns outside
  the requested scope without redesigning unrelated code.
- Use entry IDs (such as `slop:icon-tile`) in findings and `distinctiveness` evidence.
- An exception must follow from the product, content, or DESIGN.md, not "it looks nice."
  An intentional visual brand pattern recorded in DESIGN.md is not slop.
- Visual severity: on an expressive surface, three or more unjustified matches, or any
  match in the first viewport, are an error (failed swap test); an isolated match elsewhere
  is a warning. In dense working tools, visual genericness is a warning.
- Copy severity is separate: newly authored page narration, label paraphrases, or repeated
  helper text with no new information are errors in any UI, including dense tools.
  Fix them within the affected scope. Do not count necessary explanations as failures.

## Composition and cards

| ID and signal | Replace with | Legitimate exception |
| --- | --- | --- |
| `identical-card-grid` — a 3×N grid of identical icon-heading-paragraph cards, all with equal weight | A structure derived from content: comparison table, steps, one large example and a list, or an annotated screenshot. Group related content and emphasize the primary item | Items are genuinely comparable peers, such as products or pricing plans, and differ through real data |
| `icon-tile` — an icon in a colored rounded square above a heading; decorative 40–64 px icons | A line-sized icon next to the heading without a backing tile, or no icon. Large graphics must carry information | The icon is the object itself, as in launcher apps or file types |
| `cardocalypse` — cards nested inside cards, each adding padding, radius, and shadow | One container per object; spacing and headings for groups; shadows for actual overlays such as menus/dialogs. Prefer at most one surface within a page and two within an overlay | Nesting expresses a real object hierarchy, such as an order containing line items |
| `side-tab-card` — a colored stripe on the left edge of every rounded card | Remove meaningless stripes. For meaningful states/categories, use a consistent marker with text or an icon and a legend | The stripe represents real priority/severity with a non-color cue and is not applied indiscriminately |
| `border-accent-rounded` — a thick (≥2 px) colored border around a rounded card | A token-based hairline or a difference in surface color | The border identifies a selected, focused, or error state and appears only in that state |
| `hero-metric` — a huge number with a tiny caption and a row of statistics beneath | Lead with a metric only when it explains the product; include period, source, and comparison | The product is the metric, as in a dashboard or tracker, and context is adjacent |
| `oversized-hero` — a long display headline occupies the entire first viewport | About 8–10 words or a smaller size; show the offer, action, and evidence in the first viewport | Typography is the chosen compositional direction and the action remains visible without scrolling |
| `marketing-in-tool` — a hero and promotional sections inside a working tool | Open directly on the work: data, next action, and current context | No general exception |
| `centered-everything` — everything centered at similar sizes | One dominant element, a stepped scale, and deliberate axes/asymmetry | A short, single-purpose screen such as sign-in or an empty state |
| `decorative-grid-bg` — a grid/dot background that measures nothing | A plain background or a motif from the concept | A canvas, map, or editor needs a grid for alignment/measurement |

## Color and light

| ID and signal | Replace with | Legitimate exception |
| --- | --- | --- |
| `ai-palette` — purple-to-blue gradients across buttons, text, and backgrounds; bright cyan/purple on dark; habitual blue/purple accents on pure white or near-black | A palette with a named origin in the product, material, era, or content; 1–2 accents and tinted neutrals | These are established brand colors in DESIGN.md or brand guidelines |
| `gradient-text` — gradients inside headings or numbers | One solid color; emphasis through size, weight, and position | An established brand logo/wordmark |
| `lazy-cool` — glass panels, neon edges, and glowing borders accumulate without a function | Dark surfaces distinguished by lightness, with a purposeful accent | Light belongs to the concept's world, such as a HUD or instrument panel, and is restrained |
| `background-glow` — a radial halo behind the hero, spotlights behind sections, orbs, or bokeh | Spacing, contrast, a clear heading, or real product imagery | Light is part of the photograph/illustration rather than an added decorative effect |
| `beige-default` — cream/beige as a substitute for choosing a palette | Keep cream when it comes from the subject, such as paper, flour, or linen; choose the other colors with equal care | It follows from the concept and is recorded in the direction |

## Typography

Font selection is covered in SKILL.md section 4 and [art-direction.md](art-direction.md).

| ID and signal | Replace with | Legitimate exception |
| --- | --- | --- |
| `default-font` — habitual Inter/Geist/system sans everywhere, or an unexplained switch to the next trend | Three candidates derived from the concept and a reasoned choice | The brand/DESIGN.md font, or a dense tool where numerals and required language coverage justify the choice |
| `flat-hierarchy` — headings and body are nearly the same size and weight; the page cannot be scanned | A stepped DESIGN.md scale with distinct size, weight, and spacing. Use these before adding another family | No general exception |
| `italic-serif-display` — a huge italic serif headline used as an editorial shortcut | Type derived from the product's character | An editorial/brand direction that deliberately selected this serif |
| `eyebrow-and-badge` — a small label or pill above the heading, such as "NEW" or "Features," repeating it | Remove it if it adds nothing; move useful words into the heading/subheading. Avoid making a non-action badge look clickable | The label conveys navigation, a real category, date, or status |

## Motion

See [motion.md](motion.md), sections 6 and 10.

| ID and signal | Replace with |
| --- | --- |
| `attention-everywhere` — bouncing buttons, wiggling icons, floating badges all compete | Motion with a named function; one cue at the relevant moment |
| `pulsing-status-dot` — a status dot pulses while nothing changes | Static status stays still; a single response to a status change; motion for real activity |
| `scroll-reveal-all`, `intro-cascade`, `bounce-everything` | The motion-slop table in motion.md |

## Images and icons

| ID and signal | Replace with | Legitimate exception |
| --- | --- | --- |
| `rough-svg` — a hastily drawn mascot or scene makes a finished page feel unfinished | A crafted illustration or photograph with an intentional crop, or no image | The illustration has the same level of craft as the rest of the interface |
| `stock-imagery` — a generic person at a laptop, random emoji, or mixed icon sets | Specific product imagery and one icon set | No general exception |
| `sparkles-ai` — sparkles/a magic wand are the only indication of an AI feature | Name the operation and show its input and result | No general exception |

## Copy

| ID and signal | Replace with | Legitimate exception |
| --- | --- | --- |
| `page-narration` — a page explains its own title or lists the controls it contains: "Manage your notification preferences here" above Notification settings | Start with the relevant controls, data, or next action. Remove the introduction if the heading already establishes the task | A genuinely unfamiliar workflow needs brief orientation, eligibility, prerequisites, or scope that the title cannot convey |
| `label-paraphrase` — a toggle named "Email notifications" has a description saying "Enable or disable email notifications"; buttons are explained by repeating their verbs | A precise label, with no default description. Add only verified consequences or constraints the label omits | New information changes the decision: "Security alerts are always sent" or "Uses approximately 2 GB per hour on mobile data" when true |
| `redundant-copy` — label, placeholder, hint, tooltip, repeated heading, or adjacent card all express the same fact | State the fact once at the point of need. Remove duplicates across the whole task region, including differently worded paraphrases | A necessary accessible name or independently encountered context may repeat a fact; do not remove required semantics or recovery guidance |
| `helper-text-by-default` — every settings row or card gets a subtitle because the component/template has a description slot | Make the description optional and omit its empty wrapper/spacing. Retain explanations only where they add decision-relevant information | The individual row has a non-obvious effect, prerequisite, format, limit, cost, privacy implication, or recovery step |
| `generic-claims` — "supercharge," "world-class," "seamless," or "Everything you need to build amazing products" | The specific action available and its concrete benefit in this product | No general exception |
| `forced-contrast` — repeated "Not a feature. A platform." slogans | State useful information directly; explain a distinction only when it matters | One deliberate brand headline using the device |
| `dash-overuse` — an em dash in every sentence joins unrelated thoughts | Separate distinct thoughts with periods or use natural punctuation. Preserve punctuation required by the language | No general exception |
| `fake-content` — lorem ipsum, fabricated testimonials, metrics, customer logos, or avatars | Real content; clearly labeled fixtures in prototypes | No general exception |

### Require every explanation to add information

For each page introduction, subtitle, field description, tooltip, and help block, ask:
**What specific fact would the user lose if this sentence disappeared?**

Keep text that helps users choose correctly, predict a consequence, enter valid data, or
recover. If the answer is only the page's purpose, the label's meaning, or an already visible
state, remove it. Evaluate meaning, not exact string equality or sentence length.

- Do not write an instruction manual inside an ordinary working screen. A settings page
  should expose its settings; a dashboard should expose its data and next actions.
- Prefer a self-explanatory label. Do not use a vague label to justify a paragraph beneath it.
- Never invent limits, savings, security guarantees, or behavior to give helper text a purpose.
  Missing product facts belong in the implementation investigation, not fabricated UI copy.
- Keep decision-critical information next to the action. Optional detail can use progressive
  disclosure; an important warning must not be available only on hover or behind a help icon.
- Preserve accessible labels/descriptions, units, formats, requirements, unfamiliar concepts,
  safety/privacy/billing consequences, and actionable errors. Concision must not hide the task.
- An empty state may explain why there is no content and how to start; it must not narrate
  controls that are already obvious. Onboarding can teach an unfamiliar operation, without
  repeating that lesson throughout the everyday interface.
- Do not replace deleted prose with badges, callouts, decorative filler, or more tooltips.
  Let the space close naturally. This rule applies to interface copy, not to documentation
  whose actual purpose is explaining a feature.

| Before | After | Why |
| --- | --- | --- |
| Heading "Settings"; subtitle "Customize settings to make the application work your way" | Heading and relevant settings, no subtitle | The sentence adds no actionable fact |
| "Dark mode" / "Turn dark mode on or off" | "Dark mode" | The control and label already convey the operation |
| "Auto-save" / "Automatically saves your work" | "Auto-save" / "Saves every 30 seconds on this device" **only if verified** | Interval and storage scope can change the decision |
| "Delete workspace" / "Delete your workspace" | "Delete workspace" / "Permanently deletes its projects for all members" **only if true** | Irreversibility, affected objects, and scope must remain visible |
| "No reports" / "This section displays your reports" | "No reports yet" and "Create report" | Gives the actual state and a next action |
| "Upload file" / "Use this button to upload your file" | "Upload file" / "PDF or CSV, up to 20 MB" **when these are the real limits** | Supported input and size are useful |

## Behavior

| ID and signal | Replace with |
| --- | --- |
| `dead-controls` — inert buttons/links or fake success without a backend | Fewer working controls with truthful outcomes; state backend limitations honestly |

## Review: slop scan

Once the interface works, review current screenshots for every target viewport, plus
the visible copy and the accessible names/descriptions of the affected task region:

1. Inspect every catalog section. Record the ID, exact location, and any product/DESIGN.md
   justification that makes a visual pattern intentional.
2. Count visual matches in the first viewport separately.
3. Run the information test on every introduction and helper sentence. Compare each with
   its heading, label, control state, and neighboring text. Catch semantic repetition even
   when the words differ. A sentence being short does not make it useful.
4. Remove unjustified narration and paraphrases; retain necessary consequences, constraints,
   recovery, and accessibility information. Verify those facts against actual behavior.
5. Replace other unjustified matches using the catalog, capture the result again, and
   check that removal has not hidden an action or meaningful grouping.
6. If a new expressive surface has no findings, take a second look at cards, glow, heading
   labels, and copy. Do not invent defects just to fill the report.

Record findings in a `distinctiveness` evidence check: matched IDs, replacements, retained
exceptions, and their reasons. For copy, include representative before/after text and the
specific information preserved. A copy-only review can use extracted strings and context;
it does not prove that the rendered layout or accessibility behavior was tested.
Pattern counts are review signals, not a measure of beauty.
