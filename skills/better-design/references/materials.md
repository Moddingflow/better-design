# Materials: dealt starting points for an undirected surface

Read through [direction-deal.md](direction-deal.md); `scripts/deal_direction.mjs` reads the
table below and deals three rows. A material says what a surface is made of (ground, ink,
type voice, surface, signal). It never says what the page contains, in what order, or how it
is laid out: two briefs in one material must still produce two different pages.

A dealt material is a **starting point that the concept transforms**, not a theme to paste:

- Keep its axes (ground band, display class, accent band, posture) unless the concept
  argues for changing one; then change exactly one and say why in the direction card.
- Choose the actual hues, faces, and textures from the product's world. The `faces` column
  is a sample of the class, not a prescription: shortlist three faces of the class, at most
  one from this column, and never a display face or a ground/signal hue family the deal
  lists as recent. Check Cyrillic coverage when the product needs it ([fonts.md](fonts.md)).
  (The v1.8 bench showed why: with one sample face per class, three of six unrelated builds
  converged on the same Cyrillic display face and two on the same saffron ground.)
- Never copy another material's signal into it, and never add decoration the row does not
  name.

The idea of dealing materials instead of letting the model choose its habit comes from
Hallmark (MIT, github.com/Nutlope/hallmark); these rows, names, and axes are our own.

## Axes

- **ground**: `light` (L above ~85%), `mid` (30–85%, a coloured or grey ground), `dark`
  (under 30%).
- **display**: `roman-serif`, `high-contrast-serif`, `slab-serif`, `grotesk-sans`,
  `grotesk-heavy`, `geometric-sans`, `rounded-sans`, `condensed`, `mono`, `pixel`, `hand`.
- **accent**: `warm` (hue 10–60°), `cool` (200–300°), `green` (100–180°), `neutral`
  (no chromatic signal), `multi` (two or more inks).
- **posture** (how much of the surface the colour takes): `restrained` (accent under ~5% of
  a screen), `committed` (one colour carries 30–60% of the surface), `full` (several colours
  share the surface), `drenched` (the ground itself is the colour).
- **family**: the deal never hands out two rows of one family.

## Catalogue

| slug | family | ground | display | accent | posture | material | faces (a sample of the class) | keywords |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `departure-board` | signage | dark | condensed | warm | committed | matte black ground, signal-yellow rows, condensed caps-free numerals, times set first | Tektur, Antonio, Big Shoulders Display | transport, travel, schedule, logistics, delivery, timetable, booking, event, festival, tickets, status |
| `enamel-sign` | signage | light | geometric-sans | cool | committed | white enamel plates with deep cobalt fields, rounded plate corners, bold geometric letters | Jost, Lexend, Josefin Sans | city, street, local, shop, cafe, bakery, community, municipal, club, sport |
| `cyanotype` | print | mid | grotesk-sans | neutral | drenched | Prussian-blue ground, white line work and type, sun-print softness on photographs | IBM Plex Sans, Commissioner, Public Sans | architecture, engineering, plan, studio, science, botany, research, api, infrastructure |
| `riso-zine` | print | light | grotesk-heavy | multi | full | off-white stock, two misregistered inks (fluorescent pink and medium blue), heavy grotesk, halftone photos | Rubik, Archivo Black, Bricolage Grotesque | zine, music, festival, community, art, youth, newsletter, school, club, event |
| `tabloid` | print | light | grotesk-heavy | warm | restrained | grey newsprint, black ink, one tomato red, massive tight headlines, column rules | Oswald, Anton, Roboto Condensed | news, newsletter, media, magazine, politics, opinion, weekly, launch, announcement |
| `swiss-poster` | print | light | grotesk-heavy | warm | committed | white ground, flush-left heavy grotesk at poster scale, one vermilion field, strict columns | Onest, Inter Tight, Archivo | design, agency, conference, architecture, exhibition, portfolio, studio, event |
| `azulejo` | craft | light | roman-serif | cool | committed | white glaze, cobalt pattern panels, roman serif, square tile rhythm | Alegreya, PT Serif, Lora | restaurant, cafe, travel, hotel, ceramics, pottery, tiles, mediterranean, food, bakery |
| `celadon` | craft | mid | roman-serif | green | drenched | pale celadon ground, ink-grey type, glaze-pooled darker green, quiet serif | Cormorant, Spectral, Cardo | ceramics, pottery, tea, craft, wellness, spa, school, workshop, slow |
| `kiln-oxide` | craft | dark | slab-serif | warm | committed | fired-clay brown-black ground, iron-oxide orange, slab serif, fingerprint-close photos | Bitter, Kelly Slab, Arvo | ceramics, kiln, bakery, bread, coffee, roastery, workshop, maker, forge |
| `field-guide` | nature | light | slab-serif | green | restrained | grey-green paper, plate numbers, slab captions, specimen photographs on white | Roboto Slab, Zilla Slab, Hepta Slab | nature, farm, garden, outdoor, hiking, plants, ecology, school, kids, education |
| `herbarium` | nature | light | high-contrast-serif | green | restrained | pressed-plant white, ink black, high-contrast serif, one moss green | Prata, Yeseva One, Gloock | botanical, florist, garden, cosmetics, perfume, apothecary, tea, herbal |
| `glacier` | nature | light | grotesk-sans | cool | restrained | ice white with blue-grey neutrals, airy grotesk, cold daylight photos | Manrope, Albert Sans, Rethink Sans | health, clinic, medical, water, climate, calm, therapy, sleep, finance |
| `sodium-lamp` | night | dark | condensed | warm | committed | warm brown-black night, sodium orange light, condensed type, grain on photos | Fira Sans Extra Condensed, Barlow Condensed, Big Shoulders Text | bar, jazz, night, music, club, street food, festival, film, cinema |
| `velvet-programme` | night | dark | high-contrast-serif | warm | committed | deep wine ground, brass-gold signal used sparingly, high-contrast serif, programme columns | Old Standard TT, Bodoni Moda, Playfair Display | theatre, opera, jazz, concert, wine, restaurant, luxury, hotel, gala |
| `instrument-panel` | digital | dark | mono | green | restrained | graphite ground, phosphor green readouts, mono for figures only, ruled instrument cells | JetBrains Mono, Martian Mono, Azeret Mono | developer, api, monitoring, devops, infrastructure, cli, terminal, data, dashboard |
| `receipt` | digital | light | mono | neutral | restrained | thermal-paper white, black mono, dashed perforations as real separators, totals right-aligned | IBM Plex Mono, Courier Prime, Fira Code | finance, budget, expenses, shop, pos, accounting, receipts, invoices, couples |
| `arcade` | play | dark | pixel | multi | full | CRT-black ground, pixel display face, three saturated inks, score-style numerals | Press Start 2P, Pixelify Sans, Silkscreen | game, gaming, retro, arcade, kids, esports, challenge, quiz, hackathon |
| `paper-cut` | play | light | rounded-sans | multi | full | bright cut-paper layers with real offset shadows, rounded heavy sans, primary inks | Comfortaa, Baloo 2, Nunito | kids, family, school, toys, playground, learning, birthday, party |
| `sports-kit` | play | mid | condensed | multi | drenched | team-colour ground, contrast stripe, condensed numerals as big as faces | Teko, Russo One, Sofia Sans Extra Condensed | sport, club, running, fitness, team, league, race, tournament, gym |
| `bauhaus` | form | light | geometric-sans | multi | full | white ground, red/yellow/blue primaries as solid geometric fields, geometric sans | Geologica, League Spartan, Funnel Display | education, school, design, museum, architecture, art, kids, workshop |
| `concrete` | form | mid | grotesk-heavy | warm | restrained | raw concrete grey, black heavy grotesk, safety-orange signal, exposed structure | Unbounded, Krona One, Syncopate | construction, architecture, industrial, coworking, gym, brutalist, developer, tool |
| `terrazzo` | form | light | rounded-sans | multi | full | speckled pale ground, three chip colours, soft rounded sans, generous radius | Varela Round, Nunito Sans, Mulish | home, interior, cafe, family, app, wellness, couples, lifestyle, pets |
| `ink-wash` | quiet | light | roman-serif | neutral | restrained | white paper, black ink at three densities, brush-soft photos, lots of measured space | EB Garamond, Literata, Shippori Mincho | tea, poetry, writing, books, meditation, japanese, gallery, publishing |
| `linen-press` | quiet | light | grotesk-sans | warm | restrained | unbleached linen grey (not cream), charcoal ink, one rust signal, tight grotesk | Golos Text, Hanken Grotesk, Figtree | fashion, textile, clothing, studio, interior, furniture, craft, shop |
| `cartography` | structure | light | condensed | cool | restrained | map paper white, contour-grey linework, one water blue, condensed labels in sentence case | PT Sans Narrow, Fira Sans Condensed, Encode Sans Condensed | maps, travel, delivery, logistics, city, outdoor, hiking, real estate, location |
| `ledger-grid` | structure | light | grotesk-sans | green | restrained | white page, ruled ledger lines that hold real figures, tabular numerals, bank-note green | Source Sans 3, Karla, Chivo | finance, budget, accounting, bank, couples, expenses, saas, b2b, analytics |
| `vinyl-sleeve` | music | mid | grotesk-heavy | multi | drenched | one saturated sleeve colour as ground, heavy type set like a record cover, square crops | Dela Gothic One, Climate Crisis, Bowlby One | music, album, label, festival, podcast, radio, dj, concert |
| `darkroom` | photo | dark | grotesk-sans | warm | restrained | safelight-red accent on deep grey, photographs as the light source, small captions | Sora, Schibsted Grotesk, Epilogue | photography, film, studio, gallery, portfolio, cinema, art |
| `house` | quiet | dark | grotesk-sans | cool | restrained | the house style: black canvas, near-white type, two greys, one blue for links and focus ([house-style.md](house-style.md)) | per house-style preset | premium, minimal, apple, hardware, device, product launch, keynote |

## Apps and dense tools

For a working surface (dashboard, admin, editor, settings) the deal keeps `restrained` or
`committed` postures and reads the material as **ground, type voice, and signal** only:
grids, density, and component sizes come from the task, not the material. A material whose
display class is `pixel` or `hand` is never dealt for an app.
