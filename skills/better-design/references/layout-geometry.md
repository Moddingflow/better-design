# Layout geometry: spacing, alignment lines, centered content, breathing room

Most "it looks slightly off" defects are geometry: a gap of 16 next to a gap of 22, a row of
buttons whose tops differ by 3px, a settings label that starts 6px right of the one above, a
label sitting 2px low inside its button, a button touching the window edge. Each is small;
together they read as amateur. They are invisible in a downscaled screenshot and easy to
introduce when elements are placed by hand, so this reference treats geometry as something you
**construct with layout rules and then measure**, never something you judge by eye.

Applies to every platform. Game UI is the most exposed because engines make free positioning
(anchors plus magic offsets) the path of least resistance.

## 1. Construct geometry, do not place it

- Every group of siblings is laid out by a layout container with **one gap token**: CSS flex/grid
  `gap`; Unity uGUI `HorizontalLayoutGroup`/`VerticalLayoutGroup`/`GridLayoutGroup` with
  `spacing` and `padding`; UI Toolkit flex with a shared margin class; Godot
  `HBoxContainer`/`VBoxContainer`/`GridContainer` `separation` plus `MarginContainer`; Unreal
  `HorizontalBox`/`VerticalBox`/`UniformGridPanel` slot padding. Hand-set coordinates are for
  genuinely free elements only: world-space markers, diegetic UI, decorative art.
- Never fix a misalignment by nudging one element's offset. Find the shared cause (different
  pivots, mixed anchors, a missing layout group, different control heights, sprite padding)
  and fix it at the container, component, or token.
- Siblings of the same kind share a size: buttons in one row or column have the same height,
  and the same width when they are a set (menu stack, dialog actions, tab bar). Width comes from
  either the longest localized label plus padding or a fixed size token, applied to the whole set.
- One pivot/anchor convention per container. In Unity a row where one child pivots at
  (0.5, 0.5) and another at (0, 1) drifts at every resolution; in a layout group, let the group
  own position and size (`childControlWidth/Height`, `childForceExpand` deliberately set).
- Snap to whole pixels after scaling. Choose control and icon sizes with matching parity
  (an even icon in an even box, odd in odd) so centering never leaves a half-pixel. In Unity
  enable `Canvas.pixelPerfect` only when it does not fight animation; otherwise round positions.

## 2. Spacing rhythm: equal intervals, nested by relationship

- All gaps, paddings, and insets come from the DESIGN.md spacing scale. A value outside the
  scale is a defect unless it is layout math.
- **Same relationship, same gap.** Every gap between items of the same kind in one group is
  identical: all buttons in a menu, all rows in a list, all icons in a toolbar. A different gap
  must mean a different relationship (a new group), and then it is a clearly larger step from
  the scale, not a few pixels more.
- **Proximity ladder.** inside a control < between items in a group < between groups <
  container padding. Concretely, with a 4-based scale: icon↔label 8, item↔item 12–16,
  group↔group 24–32, panel padding 24–32 (phone 16–24).
- **Padding is never smaller than the gaps it contains.** If buttons inside a window are 16
  apart, the window padding is at least 16, usually one step more. Content closer to the frame
  than to its siblings reads as about to fall out.
- Padding is symmetric unless the design says otherwise: left = right, and top = bottom except
  for a header band whose extra space is a token.
- Inner radius = outer radius − inset, so nested shapes keep an even band.

## 3. Alignment lines

Every element sits on at least one line it shares with its neighbours. Define the lines first
(keylines), then attach elements to them.

- **Rows.** Items in a row share a horizontal line: equal-height items share top, center, and
  bottom; mixed-height items (label + toggle, text + button) share their vertical centers, or
  text baselines when several texts sit side by side. Never "roughly level".
- **Columns and lists.** Items stacked in a column share an edge: usually the start edge
  (left in LTR). In a settings list every label starts on one vertical keyline, every control
  starts on (or ends on) a second keyline, and values align on a third. Achieve this with a
  two-column grid or a fixed label column width, never with per-row offsets. Numbers that are
  compared align on the end edge with tabular numerals.
- **Text vs. its box.** Align text by its visible start, not by its container's padding: a label
  inside a padded row and a heading outside it must still start on the same keyline if they
  belong to the same column.
- **Window structure.** Title, content, and the action row share the window's content edges;
  the action row is anchored to a consistent corner or centered as a set, identically in every
  dialog of the product.
- Optical exceptions are explicit: a large heading's side bearing, a round icon next to square
  ones. Correct them once in the component or token and record why.

## 4. Content inside small controls

Small controls (buttons, chips, tabs, slots, toggles, icon buttons) are where misplacement is
most visible, because the margin of error is a few pixels.

- **Center by the visible ink, not by the line box.** Font line boxes include ascender and
  descender space, so a label "centered" by its line box sits low or high, worse for all-caps
  and Cyrillic. Fixes per stack:
  - Web: `text-box: trim-both cap alphabetic` (where supported) or equal padding tuned to the
    font's cap height, verified by measurement; set `line-height` explicitly on controls.
    Default line-box centering measurably puts caps about 1px low in a 56px button at 16px
    system-ui, so even untouched browser buttons need this check.
  - Unity TextMeshPro: use `Midline` or `Capline` vertical alignment for single-line labels in
    controls (`Middle` uses font metrics), zero the text margins unless they are a token, and
    disable auto-size or bound it with a minimum that still fits.
  - Godot: `vertical_alignment = CENTER` follows font ascent/descent; correct a consistently
    low font once with `FontVariation.spacing_top/spacing_bottom`, not per label.
  - Unreal: check the font's ascent/descent in the font asset; align with the slot, not offsets.
- **Icons: measure the sprite, not the rect.** Transparent padding in a sprite or SVG viewBox
  moves the visible icon off-center. Trim the asset or use the engine's padding data, and keep
  all icons of a set on the same canvas size with the same internal margin.
- **Optical centering is declared, not improvised.** Asymmetric glyphs (a play triangle, an
  arrow, a speech bubble) are centered by visual mass: shift toward the light side by roughly
  5–10% of the icon width. Bake the offset into the icon asset or the icon-button component,
  and declare it (`optical` in the layout dump) so a check can tell intent from error.
- **Icon + label.** One gap token between them, the pair centered as a unit, icon vertically
  centered on the label's cap height. The same pair uses the same gap and icon size in every
  control of the set.
- **Start-aligned content** (list rows, menu items with leading icons) uses the same start inset
  in every sibling control, and is still vertically centered.
- **Fit.** Content keeps at least the control's padding on every side for the longest supported
  localized string. Horizontal padding ≥ vertical padding. A primary action label never
  truncates or shrinks below the type scale; widen the set, wrap to two lines by design, or
  shorten the copy.

## 5. Breathing room: nothing clipped, nothing on the edge

- Nothing overflows its parent: no button, label, icon, focus ring, or glow clipped by the
  window, panel, mask, or screen. Scroll regions are the only legitimate overflow, and their
  content still keeps padding inside the viewport.
- Nothing sits on the edge: every child keeps at least the parent's padding from every edge.
  Treat a 0–4px distance to a frame as a defect even when nothing is clipped yet; at another
  aspect ratio or language it will be.
- Screen-level margin: interactive UI stays inside the platform safe area (notches, rounded
  corners, TV overscan; console title-safe is about 90% of the screen). On PC, keep at least
  the panel padding token from the window edge at the smallest supported resolution.
- Leave reserve for growth: localized text (German, Russian often +30–40%), large numbers,
  200% text, controller glyphs replacing key labels, hover/pressed scale (a 1.05 scale on a
  button that is 2px from the edge will clip). Reserve = scale headroom + focus ring width.
- A dense surface may use smaller tokens; it does not get to drop the padding rule. When content
  does not fit, change the layout (scroll, columns, pagination, collapse), never the margins.
- Check every supported resolution and aspect ratio (games: 16:9, 16:10, 21:9, 4:3 or 1280×800
  handhelds, a notched phone in both orientations; web: the viewport matrix). Anchors and Canvas
  Scaler `match` settings must keep the composition, not just keep it on screen.

## 6. Measure

Eyeballing fails at the 1–4px scale where these defects live, and a screenshot scaled to fit
a context window hides them completely. Use both layers below.

### 6.1 Numeric check with `check_layout.py`

1. Dump the rendered layout to `better-design-layout-v1` JSON. Ready-made dumpers:
   - Web: [dump-dom.js](../assets/layout-dump/dump-dom.js) — run in the page (browser tool or
     DevTools) with a root selector; it collapses wrapper elements and measures text ink.
   - Unity: [LayoutDump.cs](../assets/layout-dump/LayoutDump.cs) — copy into an `Editor`
     folder; menu **Tools › Better Design › Dump UI Layout** in Play mode at the target Game
     view resolution. Covers uGUI (TextMeshPro ink, sprite padding, layout-group padding) and
     UI Toolkit. Writes `Temp/better-design-layout.json` (Unity's own temp folder).
   - Godot 4: [layout_dump.gd](../assets/layout-dump/layout_dump.gd) — call
     `LayoutDump.dump(root_control)` from a debug key; writes `user://better-design-layout.json`.
   - Other stacks: produce the same JSON from the engine's widget tree (Unreal Widget
     Reflector data, a native accessibility tree, a design tool export).
2. Edit only what the dumper cannot know: mark intentional overlaps (`overlap`), edge-docked
   bars (`edge`), declared optical offsets (`optical`), start-aligned controls (`align`), and
   groups that intentionally use a larger gap (`group`). Add the DESIGN.md spacing scale.
3. Run from the skill folder (see [validation.md](validation.md) for the format and exit codes):

   ```sh
   python -B -X utf8 scripts/check_layout.py path/to/layout.json
   ```

4. Fix every error at its cause, re-dump, re-run. Repeat at each resolution in the matrix.

What it reports: `overflow`, `tight-edge`, `overlap`, `uneven-gap`, `misaligned-row`,
`misaligned-column`, `misaligned-keyline` (settings-style lists), `off-center` content in
controls, `inconsistent-inset` across sibling controls, and warnings for `off-scale` values,
`size-mismatch`, `icon-size-mismatch`, `inset-below-gap`, and `cannot-measure`.
It is conservative: ambiguous groupings are skipped rather than guessed, so a PASS covers the
listed checks on the dumped nodes only, not the visual quality of the screen.

### 6.2 Visual check at real scale

- Capture at the native target resolution and inspect **crops at 1:1 or 2–4× zoom**: each
  button row, each list's start edge, each small control. Never judge 2px from a full-screen
  thumbnail.
- Turn on layout debug overlays where they exist (browser layout/flex overlays and outlines;
  Unity Scene view rect gizmos; Godot *Visible Canvas Items* / *Show Control rects*; Unreal
  Widget Reflector) and look for edges that almost but not quite line up.
- Squint at a column: start edges should form one clean vertical line; rows should form one
  clean horizontal band.

### 6.3 Record

Record a `layout` check in the contract or report: resolutions dumped, the command and result,
fixed findings, and any intentionally retained exception with its reason.

## 7. Failure catalog

| Symptom | Usual cause | Fix at the cause |
| --- | --- | --- |
| One button's gap differs | Hand-placed child, or a spacer object in a layout group | Remove manual offsets/spacers; one `spacing` token |
| Row tops differ by a few px | Mixed pivots/anchors, or different control heights | Shared size token; layout group owns position |
| Settings labels start at different x | Per-row padding, labels with different alignment, or no shared column | Two-column grid / fixed label column width |
| Label low inside button | Line-box centering (TMP `Middle`, CSS line-height, Godot font ascent) | Cap/ink centering per section 4 |
| Icon off-center in its slot | Transparent sprite/SVG padding, or no optical offset on an asymmetric glyph | Trim asset or use padding data; declare optical offset in the component |
| Button touches or exits the window | Fixed widths + long localization, hover scale, missing padding | Padding token, content-sized set, reserve for scale and focus ring |
| Fine at 16:9, broken at 21:9/4:3 | Anchors stretch some children but not siblings; Canvas Scaler `match` unsuited | One anchor convention per container; test the aspect matrix |
| Half-pixel blur or 1px drift | Odd/even size mismatch, fractional scaling | Matching parity; round positions after scaling |
