# Dealt direction: when nobody chose a look

Use this when a surface's identity is part of the task (landing, brand, portfolio, consumer
app, event, shop, launcher) and the user gave **no visual cue** and there is **nothing to
inherit** (no DESIGN.md, brand, code tokens, or live UI). It replaces the old rule "no
direction means the house style". The house style is now one material among many and is
used directly only when the user asks for it ([house-style.md](house-style.md) section 1).

Not for: an existing system (inherit it), an explicit visual request (follow it with
[art-direction.md](art-direction.md)), a focused fix, or an audit.

## Why a deal

Left alone, a model ships its first answer, and its first answer is nearly the same for every
brief: a pale or near-black ground, one careful accent, a split hero, three cards, a figure
row, a closing band. Given a house style, it ships that house style every time. Prohibitions
only move it to the next habit. What breaks convergence is a decision the model did not make
from habit: a dealt starting material, a structure drawn against recent builds, and a rule to
build one of its *lower-ranked* ideas instead of the top one.

Credits: dealing materials and drawing structure against a log are adapted from Hallmark
(MIT, github.com/Nutlope/hallmark); ranking seven directions and building one below the top
two, the physical-scene sentence, the "rut" and the category test are adapted from
Impeccable (Apache-2.0, github.com/pbakaus/impeccable). The wording, vocabulary, materials,
and scripts here are Better Design's own.

## The procedure

Hold all of it in working notes; the user sees it once, as the direction card (step 10).

1. **Scene.** One sentence: who uses this, where, in what light, in what mood. "A couple on
   the sofa on Sunday evening, phones in hand, settling who paid for groceries." The scene,
   not habit, decides light or dark ground and the density.
2. **Material inventory**, one line each:
   - *real*: every concrete thing the brief and project supply (name, place, offer, dates,
     numbers, images);
   - *pictures*: what the page can show and where it comes from (the user's files, the product
     built or captured, a typographic or data-led surface, clearly marked slots);
   - *absent*: every proof it will not have (logos, quotes, metrics, prices nobody gave).
   A page with pictures leads with them; a page of words carries type and facts.
3. **The job.** Name what the visitor comes to do (subscribe, book, visit, attend, buy, try,
   sign up, hire, join, listen) and read that job in [page-anatomy.md](page-anatomy.md):
   where the action lives, which sections are the category's own, and how the page ends.
4. **Name the rut.** Write the page this brief would get without trying, then its obvious
   twist. Neither ships. The common rut, any two of which make a plan a template:
   - split hero (head left, picture or mock right) on a pale or near-black ground;
   - three equal cards, a row of big figures, numbered three steps;
   - small grey or tracked-capital labels above every heading;
   - one careful accent on neutral paper, or near-black with one neon or one blue;
   - a closing band with a form, a dark footer under a huge wordmark.
5. **Calibration clusters.** Refuse these on sight unless the brief pins them or the deal
   handed you the material: cream paper + high-contrast serif + terracotta; near-black +
   one neon accent; broadsheet hairlines + italic serif + mono labels; neo-brutalism with
   hard offset shadows; purple into blue; a hue chosen by category (blue for software, green
   for health, pink for beauty); black canvas + one blue (the house look) without a request.
   Two more that the v1.8 bench caught this process falling into: light paper + one red or
   vermilion "stamp" ink built on printed ephemera (postmarks, stamps, labels, tickets), and
   the place's souvenir as the palette (amber for Kaliningrad, gold domes for Moscow, the sea
   for any coastal town).
   **Category test:** if someone could guess this aesthetic from the category alone, rework.
6. **Tone, as an extreme.** Pick one: editorial, brutal, soft, utilitarian, luxurious,
   playful, technical, austere, loud, nocturnal, handmade. "Clean and modern" is not a tone.
7. **Deal.** Run, with the brief's subject as English keywords (translate a Russian brief):

   ```
   node scripts/deal_direction.mjs deal --keywords "<subject, audience, place>" \
     --job <job> --material photo|product|words|data [--surface app]
   ```

   It prints three materials from different families (cleared against the last builds in
   `~/.better-design/log.json`), a structural draw, and a roll. No Node: pick three rows from
   [materials.md](materials.md) by hand, from three families, none used in this project, and
   write `deal: manual`.
8. **Rank seven, build the roll.** Write seven directions, one line each: the idea from the
   product's world, ground, type voice, signal colour, signature. Three may start from the
   dealt materials (transformed by the idea); the rest come from the product's world: what it
   looked like before the web, what it would be as a physical object, what its people wear,
   print, or use. At least three families among the seven, at most one literal reading of
   the product's name or place, at least two on a dark or mid ground, and at most two built
   on paper or print. Rank them honestly, then **build the one the roll names (#3 to #7),
   never #1 or #2**: your top two are what every run would ship. Move to an adjacent rank
   only for a factual reason (it cannot be legible, accessible, or true to the audience);
   taste is never a reason. Show #1 in one line as the road not taken.
9. **Structure.** Take the draw's shape, first-screen posture, nav, footer, first section,
   and the two compositions to leave out, unless the brief's material refuses a pick; name
   every swap. **Mirror test:** would a neighbouring brief in the same category get this exact
   combination? If yes, change one decision and say which.
10. **Direction card**, said once in the reply before building, and written into DESIGN.md:

    ```markdown
    **Direction** · deal 48ceb302, material 2/3 kiln-oxide → "the bakery's 5 a.m. oven room"
    - Scene · regulars stopping by before work, dark street, warm window light
    - Built · rank #5 of 7 (road not taken, #1: cream paper, serif, clay accent)
    - Type · Bitter 700 for heads, Golos Text for text (both Cyrillic)
    - Palette · committed: fired-clay ground, iron-oxide orange signal, flour-white text
    - Structure · marquee first screen, poster hero, slab nav, statement footer; left out: split, card grid
    - Job · book: today's bake and the pre-order times in the first screen; ends on hours and address
    - Signature · the day's bake list set as an oven-door timetable, the first thing you read
    - Absent · prices, reviews, opening year (slots, marked in the handoff)
    ```

11. **Build** with [art-direction.md](art-direction.md) sections 4 to 6 inside this
    direction: palette, type ([fonts.md](fonts.md)), and motion derived from the idea. Pick
    the display face from a shortlist of three in the material's class, at most one of them
    from the material row and none from the deal's recent faces. A face that keeps winning
    across unrelated briefs is a new reflex: add it to fonts.md's saturated list.
12. **Log** after the build so the next deal moves away from it:

    ```
    node scripts/deal_direction.mjs log --entry '{"material":"kiln-oxide","axes":"dark/slab-serif/warm","face":"Bitter","hue":"iron-oxide 30","shape":"marquee","hero":"poster","nav":"slab","footer":"statement","seed":"48ceb302"}'
    ```

    A custom direction logs `"material":"custom"` with its real axes. The next deal lists the
    recent display faces (never reuse one of the last five) and hue families (move at least
    40° from the last three), so builds cannot settle on a new favourite.

## Craft before boldness

A bold direction executed at 3 of 5 loses to a safe one executed at 4; the v1.8 bench showed
exactly that, with clipped table text and a stray first-screen banner costing bolder pages
their win. Before the critique, check on the render at every width:

- the nav's outer edges sit on the content column's edges;
- no text is truncated or spills out of its cell, badge, or column (an ellipsis only with the
  full value available, never on the value the row exists for);
- the first screen holds the headline, one sentence, and the primary action on desktop
  and on a phone, with nothing else competing (no banners, notices, or chips above it);
- one dominant element per screen: a big figure and a big headline do not compete;
- the material's decoration (texture, stamp, ground colour) never lowers the contrast or
  legibility of text that carries the task.

**Samples are marked for the person who replaces them, not painted on the page.** Put
sample content in the handoff list, in DESIGN.md, and on the element (`data-sample`, a code
comment); on the page it looks like real content, with at most one quiet line in the footer
saying the page is a prototype with sample content. Never a full-width "sample page" banner,
dashed "sample" chips, or "example data" captions in the first screen. Facts nobody gave
(prices, addresses, reviews, counts) are still never stated as real: use a neutral form
("Address to be confirmed", a price slot showing "—") inside the section that owns the fact, never in
the header or the first screen, or leave the section out. The first screen shows only what
is real or reads as real sample content.
- Display type: check word spacing and letter fit on the rendered headline in every
  language the page ships; a display serif with tight tracking can collapse spaces
  ("Threenights").

## Working tools

A dashboard, admin, editor, or settings surface with no cue still gets a deal
(`--surface app`): the material sets ground, type voice, and signal, while density, grid, and
component sizes come from the task. Keep the posture restrained or committed, express
character through data typography and precision, and never put a page hero or marketing
section inside the tool. The roll for an app names #2 or #3, not #3 to #7: a working tool
needs a direction that is not the reflex, but its execution (dense tables that never
clip, statuses that fit their columns, scannable rows) outranks novelty.

## Pre-emit critique

Before the sweep, score the plan 1 to 5 on six axes; anything under 3 is revised first.

| Axis | 3 | 5 |
| --- | --- | --- |
| Philosophy | has a tone | has an argument a reader could disagree with |
| Hierarchy | needs a second look | survives the squint test |
| Execution | two or three loose details | passes the slop scan first time |
| Specificity | fits the category | could belong to no other product |
| Restraint | keeps one decoration too many | lost something you liked |
| Variety | differs from the rut on three structural decisions | shares almost nothing with the last builds |

Name the weakest axis and the fix taken. Never invent a weakness to fill the field.

## What still binds

Everything in SKILL.md: DESIGN.md as the source of values, layout geometry, motion and the
interaction kit, accessibility, real states, the slop catalog, and honest facts. A dealt
material never excuses low contrast, a missing focus ring, or invented proof.
