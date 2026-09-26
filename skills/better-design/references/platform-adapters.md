# Platform adapters

Read only the relevant section. Preserve the existing stack and design system.
Do not move a task to web just to use the helper. Use current documentation and the
environment's prescribed tools for version-specific APIs, including Context7 resolve→query
where required. Do not send private code in documentation queries.

## Apple native

Preserve native controls, semantic colors, Dynamic Type/text scaling, safe areas, and
platform navigation. Support VoiceOver, external keyboard, and focus on shipped devices.
A launch screen resembles the first screen without extending startup; use a separate
staged app screen for long bootstrap (see Loading in behavior-and-content.md).

Apple design guidance uses 44pt touch targets. Do not replace points with CSS pixels or
break native controls to impose a global radius scale.
Check the current HIG for the relevant control/device; inspect actual native UI, large text,
contrast, landscape, and Back/Cancel.
Keep system springs and interruptible swipe-back/sheet gestures. accessibilityReduceMotion
replaces spatial movement with crossfades; use meaningful system haptic feedback.

## Android native

Use the project's Material or other established language rather than mixing Apple/web patterns.
Do not add another splash Activity over Android 12+ SplashScreen. Retain the system splash
only for short local preparation.
Preserve system Back, insets, font scaling, TalkBack semantics, and supported input modes.
The recommended 48dp target is not 44 CSS px. Check actual runtime and text settings.
Do not add a library solely to match a web baseline.

Use Compose animation APIs, springs, and interruption. Read values in graphicsLayer lambdas
to avoid unnecessary recomposition. Respect Remove animations/animator duration scale and
Predictive Back. Press feedback should not wait for networking or recomposition; activation
follows the flow's semantics. Check at 5× animation duration and on a weak device.

## Desktop

Identify the actual native or embedded-web stack. For web surfaces, also check window sizing,
DPI/multiple monitors, minimum dimensions, keyboard shortcuts, activation focus, dialog
ownership, and system navigation.
Native UI uses platform accessibility APIs and units. Familiar system fonts, menus, and
shortcuts take priority over forced uniformity. Resize/scaling must not clip controls, and
operation status must be available to assistive technology.

Do not duplicate OS window/tray animations. Honor Windows animation effects and macOS Reduce
Motion, exposed through prefers-reduced-motion in embedded web. Window resizing must not
trigger layout animation on every frame.
Use native Explorer/Finder file-drop behavior where the app accepts imports, mods, skins,
saves, or attachments, with states from behavior-and-content.md. Off-target drops must not
navigate the embedded browser to the file.

## Games / Unity

First identify the screen's task: HUD, inventory, settings, tactical comparison, or pause.
Preserve art direction and the UI stack. Expressive game interfaces are appropriate when
state and action remain readable against the real world, at viewing distance and gameplay speed.

- Establish supported mouse/keyboard/gamepad/touch input and switching behavior.
- Check visible selection, spatial focus, wrap/boundaries, Back/Cancel, no focus dead ends,
  and prompts for the active device. Required actions cannot depend only on hover.
- Check aspect ratios, safe areas, subtitle/text scale, supported locales, long item names,
  world contrast, paused/unpaused states, and animation's effect on reading.
- Level/asset loading is a legitimate splash: real progress, connection/lobby stages, retry,
  and no fake percentage. Match the game's art direction.
- Motion and game feel can include hit-stop, squash/stretch, camera shake, particles, and
  sound. Preserve immediate input and readable HUD; offer reduced shake/flashing.
  Use the existing animation/tween system.
- Consider remapping and hold/repeat/timing when part of the flow; do not add a new
  accessibility subsystem for an alignment fix.
- Measure engine CPU/GPU/layout/allocations against the game budget. Core Web Vitals do
  not assess Unity performance.
- Use the actual engine/player and devices. An HTML prototype cannot prove gamepad focus,
  UI Toolkit layout, world contrast, or built-player behavior.
- Follow existing UI pipelines, approval rules, and build requirements. If a project requires
  a prototype or fresh player build after runtime UI changes, fulfill that requirement.
  This skill does not impose it on other projects.

Xbox Accessibility Guidelines provide useful game guidance; do not present them as legal
certification or WCAG conformance for a native game. See [sources.md](sources.md).
