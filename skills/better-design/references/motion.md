# Motion: a responsive interface

Read this when creating/redesigning a surface or changing elements, states, transitions,
or feedback. For a focused change inside an existing system, use Motion language
(inherit it), the relevant Catalog row, and Accessibility.

A button that does not respond, a panel appearing without an origin, a silently replaced
number, and a jumping list make causality hard to follow. Motion is part of the system
alongside color and type, with character, tokens, hierarchy, and rules.
The goal is **no dead moment and no unnecessary movement**.

## 1. Five functions of motion

Every movement serves at least one named function. Without one, remove the movement.

| Function | Purpose | Example |
| --- | --- | --- |
| **Feedback** | Confirms input before the result arrives | Button compresses on pointerdown; toggle travels under the finger |
| **Causality** | Shows where an element came from or went | Menu expands from its trigger; removed row collapses and neighbors move |
| **Orientation** | Explains forward/back, deeper/higher, and overlay relationships | Forward and Back use opposite directions; a sheet returns to its edge |
| **Value change** | Makes the delta visible | Balance rolls to a new value; progress grows; reward travels to its counter |
| **Signs of life** | Shows real activity when no control is being pressed | A single pulse when connection status changes; a live chart updates |

Signs of life consume attention without responding to input, so use them rarely.

## 2. Motion language from the concept

Use the same subject as the palette and typography; see [art-direction.md](art-direction.md).
Write one sentence about **how objects behave in the product's world**, then define physics,
tempo, and a signature detail.

| Concept | Motion character | Signature detail |
| --- | --- | --- |
| Station departure board | Discrete, stepped, mechanical; no smooth zooming | Split-flap time digits |
| Cellar label | Slow, weighty, long deceleration; reveals rather than zooms | Embossing appears through light on hover |
| Cargo-ship computer | Dry, linear, sharply settled; grid-aligned service movements | Status characters appear for a real event |
| Pocket remote / physical button | Short travel, elastic return, immediate feedback | Key depresses and returns; activation follows the control's semantics without animation delay |
| Bakery chalkboard | Handcrafted but quick | A chalk underline draws on hover/focus |

Record `direction.motion`: character, tempo (fast/restrained/heavy), physics (curves/springs
and overshoot), and one signature detail. In an existing system, find its tokens and live
examples, describe them briefly, and inherit them.

Harmony means related parameters, not identical animations: one token set, consistent
physics, and a consistent spatial model. An elastic button beside an unrelated linear modal
can feel like two different products.

## 3. Motion tokens

Use a small role set. These are neutral starting values, not standards; a weighty or
mechanical concept can change them.

| Role | Duration | Purpose |
| --- | --- | --- |
| `instant` | 0–50 ms | Press color, text selection, cursor |
| `press` | 60–100 ms down, 150–250 ms return | Touch/click feedback |
| `micro` | 100–150 ms | Hover, focus ring, state icon, checkbox |
| `small` | 150–220 ms | Tooltip, dropdown, toast, row expansion |
| `medium` | 220–320 ms | Dialog, sheet, drawer, tab content |
| `large` | 300–450 ms | Screen transition, shared element, layout rearrangement |
| `expressive` | 450–800 ms | Rare success/reward/onboarding/game events; never frequent actions |

| Easing | CSS curve or parameters | Use |
| --- | --- | --- |
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | Movement/change within a screen |
| `enter` | `cubic-bezier(0, 0, 0, 1)` | Fast arrival, gentle settling |
| `exit` | `cubic-bezier(0.3, 0, 1, 1)` | Gentle departure, fast disappearance |
| `emphasized-enter` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Large entrances and forward transitions |
| `emphasized-exit` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Large element/screen exits |
| `linear` | `linear` | Progress, spinner rotation, continuous cycles, color |
| `spring` | stiffness/damping; damping ratio 0.7–1 | Gestures, drag, release, interruptible transitions |

Scaling rules:

- **Higher frequency means shorter duration.** Tabs, command palettes, and shortcuts used
  hundreds of times daily need brief or no animation. Expression belongs to rare events.
- **Greater distance/area means longer duration.** A full-screen movement can use large;
  an 8px shift can use micro. Do not assign one duration to everything.
- **Exits are roughly one-third shorter than entrances.** Do not hold users after their decision.
- **Overshoot/bounce** needs a physical/playful concept and an object with implied mass, such
  as a pressed button, held card, or reward. Do not bounce text and modals.
- Untuned `ease` and `transition: all 300ms` avoid a real decision. List properties and use tokens.

## 4. Choreography: one leading movement

- **One dominant movement per event.** Others have smaller amplitudes and start with it or
  slightly afterward.
- **Origin follows cause.** Popovers/menus grow from the trigger; sheets come from their
  anchored edge; details expand from the selected card.
- **Direction follows the spatial model.** Forward comes from the inline end, Back reverses
  it (mirrored for RTL); depth and hierarchy use consistent scaling/movement.
- **Small amplitudes.** Entrances use 4–24px and/or scale 0.95–0.98 plus opacity, not scale
  from zero or unexplained travel across the screen. Large travel needs a real destination.
- **Stagger:** 20–40ms between at most 5–8 animated items, total no longer than medium–large.
  Remaining items appear with the last animated item.
- **Continuity:** elements shared between states move between them instead of disappearing
  and being recreated.
- **Stable layout:** insertion, removal, expansion, and sorting move neighboring elements
  using FLIP or framework layout animation.
- **Input stays available.** The next screen is immediately interactive; an exit delays
  an entrance by no more than a couple of frames.

## 5. Catalog: what moves and how

| Event | Motion | Mistake |
| --- | --- | --- |
| Button touch/click | Immediate pointerdown scale 0.96–0.98 or 1–2px travel and darkening; release returns with press timing using standard or a non-overshooting spring. Activation follows its own semantics without waiting | Feedback only on release; action waits for the animation |
| Hover, only with `hover: hover` | Micro background/underline/icon change on interactive targets | Every card lifts and casts a shadow; noninteractive content implies an action |
| Focus-visible | Ring appears instant–micro without expanding from zero | Focus becomes temporarily invisible |
| Toggle/checkbox/radio | Thumb travels or checkmark draws at micro timing; value updates immediately | State is available only after animation |
| Tabs/segmented control | Selection indicator moves; content crossfades or shifts briefly in a meaningful direction | Indicator disappears and respawns |
| Dropdown/popover/tooltip | Scale 0.96→1 and opacity from trigger, small entrance, shorter exit. Tooltip delay about 300–500ms, without repeated delay between neighbors | Falling from the screen top; equal enter/exit timing |
| Dialog | Backdrop fade; panel scale 0.96→1 and opacity at medium timing; reverse faster | Unmotivated sideways flight |
| Sheet/drawer | Arrives from its edge at medium timing; gesture follows the finger and releases with velocity-preserving spring | A draggable-looking sheet cannot be swiped back |
| Screen navigation | Model-consistent push/pop at large timing; peer top-level tabs crossfade | Sliding between peer tabs; unrelated transition per screen |
| List insert/remove/reorder | New row expands/fades; removed row collapses; neighbors move | Row vanishes and everything below jumps |
| Accordion/section | Animate height via grid rows, interpolate-size, or animateContentSize; rotate chevron | Height and scroll position jump |
| Skeleton to content | Small crossfade without layout shift, independently as regions become ready | Whole-screen flash or sliding content that changes layout |
| Button pending | Micro crossfade between label and progress; preserve width | Resizing button or a 100ms spinner flash |
| Number/balance change | Small–medium roll using tabular numerals; brief delta where useful | Instant replacement or animation on every live-data tick |
| Result contributing to a total | Item travels to basket/counter; counter responds and updates | Item flies away but the total stays unchanged |
| Success | One short accent, such as a checkmark or Saved label | Confetti on every save |
| Validation error | Visible field error and text; optional single ±4–6px shake ≤300ms | Shake without explanation or shaking the whole form |
| Toast/status | Small entrance from its edge; pause auto-hide on hover/focus | Covers the primary action or removes an error before it can be read |
| Drag | Object follows immediately, with lift/shadow/scale 1.02; target highlights and neighbors make room | Object lags behind the finger |
| File drop zone | Micro border/background on dragenter; icon lifts 2–4px; dropped rows insert, previews crossfade, progress grows; rejection may shake the icon once with its reason | Flicker over children, no drag-over response, or dropped file disappears without feedback |
| Pull-to-refresh/overscroll | Follows the finger with the platform's elastic return | Custom physics conflict with the system |

## 6. Life without noise

An interface feels alive through **responses**, not constant movement.

- Every interactive target responds to press and focus. User-caused state changes transition.
- Briefly mark new content, changed values, and status with reveal/pulse/highlight fading in
  about one second, with information beyond color.
- Ambient motion comes from the concept: at most one per screen, slow (period ≥2s), low
  amplitude, peripheral, away from reading text. Stop it when hidden, offscreen, or under
  reduced motion. Infinite CTA pulses, orbs, and shifting gradients are noise.
- An empty/waiting state may use one slow concept-derived motif, but still needs truthful
  status and a path to act.
- Sound/haptics can support mobile/game feedback through platform APIs and system settings.
  Use brief meaningful responses; do not vibrate on every scroll or hover.

## 7. Physics and interruption

- Animations are **interruptible and retargetable** from the current value. Repeated input
  does not build a queue.
- Preserve gesture velocity: a released sheet/card continues with initial velocity rather
  than restarting from zero.
- Prefer springs for gesture-interruptible motion, with explicit damping/stiffness or
  bounce/duration; avoid overshoot if it is absent from the established language.
- Animation does not change the outcome. Cancellation returns to truthful state.
  The model updates immediately; its presentation animates.

## 8. Performance

Jank reads as malfunction.

- Prefer composited transform/opacity, and filter only over small areas. Use FLIP or
  framework layout animation for size/position/margins; use a pre-rendered layer and opacity
  for large shadows/blur.
- Frame budgets: 16.7ms at 60Hz, 8.3ms at 120Hz. Press feedback appears by the next frame.
- Apply will-change selectively during animation, not across the whole tree. Avoid dozens
  of infinite animations and animating every row during scrolling.
- Do not block the main thread with heavy rendering/parsing during transitions. Defer,
  split work, or show the appropriate skeleton.
- Check a weak device or 4–6× CPU throttling. Simplify movement when over budget; preserve feedback.

## 9. Accessibility and settings

- **Reduced motion preserves feedback.** Under prefers-reduced-motion, Android Remove
  animations, iOS Reduce Motion, or disabled Windows animation effects, remove movement,
  scale, parallax, zoom, and rotation. Use crossfades or instant changes; retain press
  color/brightness, visible state, and progress.
- Avoid large full-screen zoom, parallax, scroll-jacking, and spatial rotation as vestibular
  triggers; remove them under reduced motion.
- **WCAG 2.3.1 (A):** no more than three flashes per second unless below applicable thresholds.
- **WCAG 2.2.2 (A):** automatic motion/blinking/scrolling longer than 5 seconds alongside other
  content needs pause/stop/hide unless essential. Infinite ambient motion is a common risk.
- **WCAG 2.3.3 (AAA):** interaction-triggered animation can be disabled.
- Important state must remain visible in the final frame and accessible through text, roles,
  or live regions; animation cannot be its only carrier.
- Do not move text being read or targets being pressed. Avoid typewriter effects on text
  that must be read immediately.

## 10. Motion slop: patterns and replacements

Part of [ai-slop.md](ai-slop.md); use its IDs in findings.

| Pattern | Replacement |
| --- | --- |
| `scroll-reveal-all` — fade-up/AOS on every section | Reveal only when it explains appearance; initially visible content does not need an entrance |
| `intro-cascade` — 1–2 seconds before the first click | Make the first useful screen immediately interactive; loading choreography at most large, once |
| `bounce-everything` — identical overshoot everywhere | Concept-derived physics; only objects with implied mass can spring |
| `attention-everywhere` — bouncing buttons, wiggling icons, floating badges | One cue at the right time; other elements stay still until interaction |
| `pulsing-status-dot` — motion despite unchanged status | Static status stays still; one pulse on change; continuous movement only for real recording/transfer/activity |
| Every card lifts and shadows on hover | Feedback matches actual interactivity |
| Infinite CTA pulse/glow, gradients, orbs, particles | Concept-derived ambient detail or stillness |
| Parallax, scroll-jacking, sticky scenes for spectacle | Native scrolling; scroll-driven motion only for meaningful relationships or reading progress |
| Typewriter on ready text or fake thinking delay | Real streaming data and truthful status |
| `transition: all 0.3s ease` everywhere | Listed properties and role-based tokens |
| A spinner flashes for 150ms | Loading-indicator timing in [behavior-and-content.md](behavior-and-content.md) |
| Animation decorates emptiness | A named function from section 1 |

## 11. Platform implementation

- **Web:** CSS transitions for states, keyframes for cycles, Web Animations API for programmatic
  or interruptible motion, and supported View Transitions for screens/shared elements with
  fallback. Include prefers-reduced-motion and hover capability queries. Animate height
  through grid-template-rows or supported interpolate-size. Scroll-driven animation needs
  fallback and reduced-motion handling. Avoid a new library when existing tools suffice.
- **Svelte/React/Vue:** use the stack's existing mechanisms, such as Svelte transition/animate:flip
  or an already installed library's layout animation.
- **Android/Compose:** animate*AsState, updateTransition, AnimatedVisibility, AnimatedContent,
  animateContentSize, spring. Read animation values in graphicsLayer lambdas to avoid
  recomposition. Respect animator duration scale and system Predictive Back.
- **iOS/SwiftUI:** withAnimation, animation(_:value:), springs, matchedGeometryEffect,
  and the accessibilityReduceMotion environment value.
- **Desktop:** do not duplicate OS window animations. Respect system settings, exposed in
  embedded web through prefers-reduced-motion.
- **Games/Unity:** hit-stop, squash/stretch, camera effects, particles, and sound can belong to
  the language. Preserve HUD readability and immediate input; provide reduced shake/flashing.
  Use the project's existing tween system.

## 12. Verify motion

Code and still screenshots do not prove motion quality.

1. Record video or frames of key transitions. Review slowly: DevTools at 10–25%, Android
   animator duration scale 5×, or Simulator Slow Animations.
2. Check origins/directions, jerks, layout jumps, one dominant movement, and abrupt state cuts.
3. **Repeated-input test:** rapid clicks, open-close-open, swipe, and cancellation midway
   through a transition must not queue, stick, or report false outcomes.
4. **Dead moments:** walk the primary flow and identify input with no visible response within
   roughly 100ms or state changes that abruptly cut.
5. **Noise:** list motion while idle and its function and pause/stop behavior.
6. With reduced motion/system animations off, preserve functionality, feedback, and state
   without spatial movement or parallax.
7. Capture traces/frame timing under a weak-device profile; check long frames.
8. Confirm shared tokens/physics and a signature detail that supports the task.

Record a motion check: scenarios, review speed, dead moments/noise, and corrections.
Still screenshots alone are not motion evidence.
