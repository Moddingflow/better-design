# Fonts: choosing past the reflex

Read when a direction is new (dealt, custom, or requested) and no brand or DESIGN.md names
the faces. An inherited system keeps its fonts.

## The rule

One display face and one body face, or one family for both; an optional third face carries
exactly one role (a wordmark, a headline figure, code). Choose the **class** the idea calls
for (roman serif, slab, grotesk, condensed, mono, rounded...), shortlist three faces in it,
and decide by setting the real headline and a real paragraph in each, in every language the
product ships. A face's reputation or a subject association ("books want a serif", "tech
wants a mono") is not a reason.

## Reflex faces

Every model reaches for these first, so on a new direction they read as unchosen. Use one
only when the brief or project names it, or with a reason no other face in its class could
satisfy, written in the direction card.

- **Reflex display/body:** Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Nunito,
  Raleway, Work Sans, DM Sans, Plus Jakarta Sans, Outfit, system-ui, Arial, Helvetica.
- **Saturated display (the first "interesting" answer):** Playfair Display, Cormorant
  Garamond, Fraunces, Instrument Serif, DM Serif Display, Recoleta, Space Grotesk, Syne,
  Bebas Neue, Unbounded; Geist, Instrument Sans, Mona Sans as the whole page.
- **Saturated in Cyrillic work:** Dela Gothic One as display (the v1.8 bench picked it for a
  bakery, a festival, and a finance app), Geologica as the whole page outside the house
  style, Golos Text and Manrope as the automatic body.
- **Reflex text serifs and monos:** Lora, Merriweather, Georgia as body; Space Mono and
  IBM Plex Mono as labels on a page whose material is not mono.

Dense working tools may use a system stack or the platform face; that is a legitimate choice
for Operate-style surfaces, not a reflex, when numerals and language coverage are checked.

Sources for these lists: Hallmark's fonts.md (MIT) and Impeccable's new-work reference
(Apache-2.0), merged and trimmed.

## Faces worth a look, by class

Google Fonts unless noted. **C** = has a Cyrillic subset (verify on the font's page with the
`cyrillic` subset and by rendering a Russian test line; coverage changes between versions).

| Class | Faces |
| --- | --- |
| Roman serif | EB Garamond C, Alegreya C, PT Serif C, Literata C, Spectral C, Piazzolla C, Cardo, Castoro |
| High-contrast serif | Prata C, Yeseva One C, Old Standard TT C, Bodoni Moda, Gloock, Libre Bodoni, Abril Fatface |
| Slab serif | Bitter C, Roboto Slab C, Kelly Slab C, Arvo, Hepta Slab, Zilla Slab, Alfa Slab One |
| Grotesk sans | Golos Text C, Onest C, Manrope C, Commissioner C, IBM Plex Sans C, Rethink Sans, Albert Sans, Public Sans |
| Heavy grotesk / display | Rubik C, Dela Gothic One C, Archivo Black, Archivo (width axis), Inter Tight C |
| Geometric sans | Jost C, Geologica C, Lexend, Josefin Sans, League Spartan, Funnel Display |
| Rounded sans | Comfortaa C, Nunito Sans (heavy, with a reason), Varela Round, Baloo 2 |
| Condensed | Oswald C, Roboto Condensed C, Fira Sans Condensed C, PT Sans Narrow C, Antonio, Big Shoulders Display, Barlow Condensed, Teko, Tektur |
| Mono (code, figures, measurements) | JetBrains Mono C, Fira Code C, IBM Plex Mono C, Martian Mono C, Geist Mono, Courier Prime |
| Pixel | Press Start 2P C, Pixelify Sans C, Silkscreen, VT323, Tiny5 |
| Handwritten | Neucha C, Caveat C, Shantell Sans |

Free foundry sources: Fontshare (Clash Grotesk, Satoshi, General Sans, Gambetta, Erode;
mostly Latin only), Velvetyne, Collletttivo. A paid foundry only when the user confirms a
licence.

## The wordmark

The name in the nav and footer may take a different face from the body; on expressive pages
it should, or the page reads as un-branded. Collapse to one family only when the body voice
is the brand (a letter, a manifesto, a long document).

## Loading

- Load only the weights used, one `<link>` per source with `display=swap`, preconnect first;
  for Cyrillic request the subset (`&subset=cyrillic` is implicit on css2, but the face must
  have it).
- `font-synthesis: none`; load a real italic if a head uses it.
- Self-hosted faces get `font-display: swap` and a metric-matched fallback (`size-adjust`,
  `ascent-override`, `descent-override`) so the swap does not reflow the first screen.
- Theme the browser surfaces too: `::selection`, `caret-color`, `accent-color`, scrollbar
  colour, link `text-underline-offset`, and `tabular-nums` where figures compare.
