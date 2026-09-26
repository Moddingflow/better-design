# Behavior, content, and recovery

Read only the affected components and their shared dependencies. Cover states the requested
flow already permits; do not add unrelated states, integrations, or localization work.

## Tasks and information architecture

Show the user's object, current context, and next step. Use terms from the user's domain.
Keep names consistent across search, details, navigation, and feedback. A visible location,
predictable Back action, and preserved filters are usually more useful than extra instructions.
Do not make users remember data from the previous screen.

One dominant purpose and one primary action per task region are hierarchy heuristics.
Independent regions may each have a primary action. Do not hide frequent actions for a cleaner
screenshot or add a second CTA to satisfy a template. Apply the copy information test in
[ai-slop.md](ai-slop.md) instead of introducing the page with a paragraph about its controls.

## Component contracts

| Component | Behavior and applicable states | Observable check |
| --- | --- | --- |
| Button/link | Buttons issue commands; links navigate. Default, focus-visible, pressed, and pointer hover; disable only for a real reason. Icon-only actions have names. Native form submission needs no onClick | Enter/Space works for buttons; links preserve URL, Back, and opening in another tab; actions change the expected object/view |
| Async submit | Pending preserves geometry and prevents duplicates; success is specific; failure preserves input and permits retry | Two rapid submissions do not create two results; failure is not reported as success |
| Input/select | Persistent associated label; separate hint only when informative; placeholder as example. Distinguish required/readOnly/disabled; choose type/inputmode/autocomplete for the data | Label focuses the field; values survive errors; correctable errors are associated with the field |
| Checkbox/radio/toggle | Value and available action are clear; semantic checked state; persist the value or report failure | Keyboard changes state; persistence failure does not leave a false saved indication |
| Tabs/menu | Follow an established platform/APG pattern, roles, and roving focus/arrows where applicable; focus and selection are distinct | Arrows/Tab behave as expected; panels relate to tabs; Escape closes a popup and restores focus |
| Dialog | Accessible title, appropriate initial focus, inert background, modal containment, usual Escape dismissal, logical focus after closing | Open → Tab/Shift+Tab → Escape → invoker or another logical target if the invoker was removed |
| Navigation | Consistent destination names; visual and semantic current location; meaningful collapse and stable destinations | Navigate and go Back with context restored; important destinations remain available on narrow screens |
| Table/list | Comparable data keeps its columns; a read-only table uses native table semantics. Use a grid only for a distinct keyboard-editing model | Headers/caption/context are accessible; sorting changes order and announces direction; numeric alignment supports comparison |
| Cards/regions | Boundaries express a separate object, tool, or group. Do not make a complex card with independent actions one nested button | Independent actions remain reachable without accidental opening or competing pointer/focus behavior |
| Search/filter | Show query, selected filters, and result count; predictable clear/reset. Distinguish first use, loading, no results, service error, and stale data | Rapid input cannot show an obsolete response; no-results offers a useful reset; errors permit retry |
| Drag/reorder | Provide a non-drag single-pointer method and a separate keyboard path | Move with buttons/menu without holding the pointer, then repeat with keyboard |
| File/image upload | Drop zone from the first version, real file-picker button, and paste where appropriate. Show limits before selection; distinguish idle, drag-over, rejection, uploading, done, and error beyond color | Try one/multiple files, wrong type, excessive size, a drop outside the zone, and keyboard selection; the form remains intact |
| Toast/status | Outcome understandable beyond visual context; suitable status/live region without unnecessary interruption | Status is programmatically available; focus stays put unless needed; critical errors remain until addressed |

Do not give every component the same state matrix. Static text has no pending state,
a toggle needs on/off, async search has response races, and an ordinary link does not need
an invented success toast.

## Drag and drop: include it from the start

If the task includes file selection, include drag and drop in its first version rather
than waiting for a separate request.

### Where it belongs

- **Every file/image upload:** avatar, cover, message/ticket attachment, CSV/JSON import,
  gallery, editor assets, launcher mods/skins/saves. A file input or native picker has a
  corresponding drop zone.
- **User-defined order:** galleries, playlists, priorities, layers, steps, and moving between
  groups such as kanban columns or folders. Buttons/menus remain required alternatives.
- Do not add it to computed ordering, such as sort-by-date, or where there is nothing to drag.

### A clear drop zone

- At rest, use the project's upload icon, "Drop files here or" plus a real "Choose files"
  button, supported types, and size/count limits. A dashed border is a convention, not the
  only cue; text and icon remain visible.
- Match size to role: a large zone for a primary import/gallery task, a compact row for an
  attachment, or the avatar/cover preview itself with a Replace overlay.
- Use DESIGN.md colors, radii, and icons; do not invent a separate uploader style.

| State | Visible result |
| --- | --- |
| Idle | Icon, instruction, picker button, and actual limits |
| File over window | Highlight available drop zones. A single primary zone may use a full-window drop overlay |
| File over zone | Stronger border/background; a concrete release-to-upload message, with count when available |
| Reject | Icon and reason, such as supported formats and size. Reject during dragover when available metadata permits, otherwise per file after drop |
| Uploading | Preview, name, size, per-file determinate progress, and cancel |
| Done | Thumbnail, name, Remove and Replace; keep the zone available for additional files when supported |
| Error | Per-file reason and retry; preserve other files and form data |

- Show image previews from a local object URL immediately; release it after replacement/removal.
- A single-value field replaces its value with an undo path; multiple-value fields append.
- Uploads longer than roughly 10 seconds use determinate progress, not skeletons.

### Alternatives and accessibility

- Drag is never the only path. The picker works with mouse, touch, and keyboard.
  For images in messages, tickets, and editors, support Ctrl/Cmd+V where appropriate.
- On touch, present the zone as a large picker, with camera/gallery choices as appropriate
  (`accept="image/*"`, task-appropriate `capture`). Omit desktop drag wording.
- Announce drop results and errors through a live region; do not move focus after a drop.
- Keyboard reorder: Space to pick up, arrows to move, Space to place, Escape to cancel;
  announce the position, such as "Item 3 of 7."

### Technical correctness

- On web, prevent file `dragover`/`drop` defaults at the window level so an off-target drop
  does not navigate to the file and discard entered data.
- Avoid highlight flicker over children with a dragenter/dragleave counter or relatedTarget
  checks. Reset on drop, dragend, and leaving the window.
- Respond to files (`dataTransfer.types` includes `Files`), not dragged text or links.
- Dragover exposes limited metadata, typically types rather than names/sizes. Validate type,
  size, and count after drop and again on the server.
- Accept directories only when the task requires them.
- In Electron, Tauri, WPF, Qt, and launchers, use the current native file-drop API and the same
  states. A drop must not become window navigation.
- Follow the Drag and Drop zone rows in [motion.md](motion.md).

## Loading: skeletons, spinners, and splash screens

Every async content region needs an explicit loading state. A blank screen, jumping layout,
or "No data" while a request is pending is a defect. Choose by expected duration and whether
the future content shape is known.

| Situation | Indicator | Avoid |
| --- | --- | --- |
| Usually under ~300 ms | Retain existing content; if needed, delay the indicator ~200–300 ms and avoid a flash shorter than ~300–500 ms once shown | A split-second skeleton/spinner |
| Initial screen/list/feed/card/profile load, known shape, ~1–10 s | A **skeleton** matching actual rows, avatars, images, and columns | Abstract boxes or a skeleton whose geometry differs from the final layout |
| Submit, save, toggle, send | Pending **inside the control**, preventing repeats and preserving width | Replacing the form with a skeleton or blocking the whole screen |
| Separate module with unknown shape, such as video/chart/widget | Local spinner within that module | A full-screen spinner blocking ready regions |
| More than ~10 s: import/export/upload/install/process | Determinate progress, stage and remaining work, cancel or background execution | A content skeleton or endless spinner without status |
| App cannot show meaningful UI until required data is ready | **Loading splash** with real stages | Splash for normal screen navigation |

### Skeleton loader

- Match the specific layout and its responsive variants, with a plausible count of rows.
- Replace each region as its data arrives; ready regions do not wait for the slowest.
  Use a short crossfade without shifting layout or sliding content in.
- Keep shimmer/pulse restrained; under reduced motion, use a static or very slow treatment.
- Mark the region `aria-busy="true"`, announce loading once, and hide skeleton shapes from
  assistive technology with `aria-hidden`; they do not take focus.
- On timeout/failure, show an error with reason and retry. A failed load is not an empty list.
- On a cached revisit, show cached content and refresh it instead of reverting to a skeleton.

### Loading splash: only for genuine bootstrap

A splash is a full-screen startup phase, appropriate only when the app **cannot show a
meaningful interface** until necessary long operations finish:

- Discovering a network, server, device, or lobby and connecting.
- Signing in, restoring a session, obtaining a license or access rights.
- Initial sync, required configuration, or a client update.
- Loading game assets, a level, or shader cache.

Requirements:

- Show **real stages** in order, such as finding a network, signing in, and loading a profile.
  Long stages get real progress or counts; never invent a percentage.
- Each stage has applicable recovery: a clear reason, retry, offline mode, sign-out,
  or another server. Include a timeout rather than hanging indefinitely.
- Add no delay for a logo or animation. Show the interface once required data is ready.
- With sufficient cached session/data, skip the splash and refresh in the background.
- Follow the product's art direction; keep stage text readable and respect reduced motion.
- Do not use it for screen navigation, ordinary list loads, ready server-rendered HTML,
  or short operations that fit local pending/skeleton states.

An OS launch screen (iOS or Android 12+ `SplashScreen`) covers process startup and should
be brief. Long data bootstrap belongs in the app's own staged screen, not an extended
branding launch screen. See [sources.md](sources.md).

## Errors and consequences

For invalid input, name the field and correction. In a long form, connect an error summary
to the fields and move focus appropriately. Preserve other answers. Do not disable submit
in a way that conceals the reason; essential help must not require hovering a disabled control.

Service failure, missing permission, offline state, and an empty response have different
causes. Show applicable reasons and real next steps rather than raw exceptions. Retrying
preserves request/context and prevents duplicates. Do not promise undo if it cannot work.

For high-consequence actions, use actual reversibility, checking, or review. Name the object,
scope, and action. Deleting a row with undo and deleting an account need different protection.
This is product UX guidance, not a new approval requirement for the agent.

## Copy and data

- Buttons name the action and, where necessary, its object: "Save changes," "Delete invoice."
  "Continue" can be clear within a contextual multistep flow; evaluate its outcome.
- Errors explain the problem and recovery, such as a valid email format. A generic failure
  message without a next step is insufficient, but do not invent a cause.
- Apply the **Copy** rules and information test in [ai-slop.md](ai-slop.md), the canonical
  source for page narration, label paraphrases, redundant copy, and default helper text.
  A description slot is optional. Keep useful limits, units, formats, shortcuts, consequences,
  and explanations of unfamiliar actions.
- Brevity is a heuristic: 1–4 words for a button and roughly 120 characters for a hint can
  aid review. Do not cut necessary meaning or translations to meet a quota.
- Use truthful content. Label prototype fixtures; do not present sample revenue, testimonials,
  avatars, or message delivery as real results.
- Check zero/one/many, long names, unbroken strings, large numbers, and empty fields.
  Use valid long dates, such as "September 30, 2026, 11:59:59 PM"; invalid dates test errors.

## Localization and motion

Use existing message-level i18n, placeholders/plurals, and locale formatters rather than
assembling grammatical fragments. Do not add an i18n library for a button fix or interpolate
user data as markup.

Test expanded translations and long data without losing content/actions. Ellipsis is suitable
for secondary data only with a way to reveal the complete value, never for a critical error.
For supported RTL, use base direction and logical layout; mirror directional semantics,
not every number, chart, media control, or brand mark.

Motion belongs to behavior. Give applicable component states a transition and each press
immediate feedback. Use [motion.md](motion.md) for functions, tokens, choreography, and checks.
Inherit existing duration/easing values and preserve feedback/state under reduced motion.
Do not animate every row or scroll event by default. Long operations need truthful status;
use the loading guidance above rather than delaying work for an animation.
