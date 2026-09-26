# Web: applicable quality checks

The default target is WCAG 2.2 AA, including applicable A criteria. This is not a complete
audit. WCAG is normative; APG supplies informative guidance. Internal style preferences
and numbers do not become standards. See [sources.md](sources.md).

## Semantics and accessibility

| Check | Exact scope |
| --- | --- |
| Text contrast 1.4.3 | Normal text ≥4.5:1; large text ≥3:1: 18pt regular or 14pt bold, approximately 24/18.67 CSS px. Do not round a failing ratio upward. Placeholders are text. Exceptions include inactive, incidental/decorative text, and logos |
| Non-text 1.4.11 | ≥3:1 for necessary component/state information and meaningful graphics against adjacent colors. Not every divider or a comparison between nonadjacent default/hover states. Inactive and unmodified user-agent exceptions apply |
| Focus | Visible and logical without positive tabindex. AA 2.4.11: authored content must not fully obscure the component. Full visibility (2.4.12), a 2 CSS px perimeter-equivalent area, and same-pixel contrast (2.4.13) are AAA enhancements |
| Targets 2.5.8 | AA: 24×24 CSS px or applicable spacing/equivalent/inline/user-agent/essential exceptions. Prefer 44×44 for touch as an internal enhanced target. One small bounding box does not prove a violation |
| Keyboard 2.1.1/2.1.2 | Applicable operations work without a pointer; no unintended trap. Modal containment is valid with an expected exit |
| Label in name 2.5.3 | Accessible name includes visible text; starting with it is useful practice. An icon-only control needs a meaningful name |
| Labels/errors | Associated labels/instructions (3.3.2), textual error identification (3.3.1), and known correction suggestions (3.3.3). Preserve entered data |
| Status 4.1.3 | Meaningful updates without focus changes are available to assistive technology; do not announce every cosmetic change |
| Drag 2.5.7 | A non-drag single-pointer alternative is required except where an applicable exception holds. Keyboard alternatives serve a separate requirement |
| Consequences 3.3.4 | Applicable legal/financial/data/test submissions need reversibility, checking, or review/confirmation. Not a mandatory modal for every Save |
| Input/auth 3.3.7/3.3.8 | Avoid unjustified re-entry of known information; allow password managers/paste and appropriate help or alternatives to cognitive tests |
| Flashing 2.3.1 | A: at most three flashes per second, or below general/red flash thresholds. Includes status blinking, glitch effects, and game strobes |
| Pause 2.2.2 | A: automatically starting motion/blinking/scrolling lasting more than 5 s alongside other content needs pause/stop/hide unless essential |
| Motion 2.3.3 | AAA: interaction-triggered animation can be disabled. Reduced-motion support improves quality: remove spatial movement/scale/parallax while retaining feedback/state. See [motion.md](motion.md) |

Use native semantics and appropriate headings, landmarks, lists, tables, and forms.
Use ARIA where needed. Hide decorative icons from assistive technology; give informative
images meaningful alt text and decorative images empty alt text. Supplement graphics and
color states with accessible values or other cues. An accessibility tree is not a screen-reader run.

## Responsive layouts and text

Choose wrap, stack, contained scrolling, collapse, or structural preservation for each
affected block. Recheck context and the primary action after adaptation. Do not conceal bugs
with `overflow-x: hidden`; a correct page scrollWidth can hide clipped descendants.

For a new web flow, start with 320×800, 375×812, 768×1024, 1024×768, and 1440×900.
Narrow the matrix to actual risk for a focused change. Add short-height and breakpoint-boundary
cases when sticky regions, menus, or dialogs might obscure content.

- Reflow 1.4.10: a 320 CSS px equivalent width for vertical flow (1280 at 400% zoom);
  a 256 CSS px equivalent height for horizontal flow. Necessary two-dimensional content,
  such as some tables/maps, has exceptions; inspect the surrounding interface separately.
- Resize 1.4.4: up to 200% text size without lost content/function. This is separate from
  reflow. Device scale factor is not text resizing. Use actual browser text/zoom controls;
  a CSS override is diagnostic only when rendered text is confirmed to double.
- Text spacing 1.4.12: tolerate line height 1.5, paragraph spacing 2em, letter spacing .12em,
  and word spacing .16em together without loss. These are override tests, not required
  default styles; account for applicability to the writing system.
- Check focus and contrast in supported themes. Text changes require expansion, long-string,
  and glyph-coverage checks. Test RTL where already supported or requested.
- Under reduced motion, remove unnecessary movement while preserving state, feedback, and
  control. Test both DevTools/automation emulation and the operating-system setting.

Inspect descendants, intended scroll regions, overlays, sticky content, clipped characters,
wrapped labels, covered targets, and broken assets. One bounding-box scan cannot prove there
are no overlaps. Review a new golden image semantically before accepting it.

## Runtime and safe scenarios

Use the project's browser/test setup; do not automatically install another stack.
Define the fixture, action, and expected object/screen/state. Test the primary flow, invalid
input, service failure, recovery/Back, and keyboard path. Do not click through live controls
mechanically. Test navigation as navigation and native submit as submit; no onClick is not a defect.

An accessibility engine on current DOM can locate specific issues. Also walk Tab/Shift+Tab,
Enter/Space, Escape, and pattern-appropriate arrows. For a substantial new flow, use actual
assistive technology on headings, forms, errors, modals, and status when available.
If runtime or assistive technology is unavailable, identify the exact unverified properties.

## Performance

Prefer transform/opacity animation; use FLIP/View Transitions for layout movement.
Press feedback must not worsen INP: show the pressed state in the same frame and schedule
heavy work afterward. Check long frames with CPU throttling in the Performance panel;
use an animation inspector to slow and step through transitions.

Do not add assets, fonts, dependencies, or effects without a task reason. Reserve dimensions
and aspect ratios, load needed weights/sizes, and keep controls stable during pending or label
changes. Consider long lists, search, and input responsiveness. Choose virtualization from
measurements and check its keyboard, focus, and assistive-technology effects.

Google's good Core Web Vitals thresholds are p75 LCP ≤2.5 s, INP ≤200 ms, and CLS ≤0.1,
separately for mobile/desktop. These are Google guidance, not WCAG/W3C standards.
Field/RUM data establishes field p75; Lighthouse, local traces, and synthetic CI supply
diagnostics/regression checks under recorded conditions. Without field data, report it as
unmeasured. Set JavaScript/image/font budgets from the project rather than a universal 200 KB
limit. Report tradeoffs using measured quantities.
