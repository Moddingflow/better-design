# Better Design example prompts

[Back to README](../README.md)

These are starting prompts, not measured before-and-after results. Replace the product, route, and constraints with your own. Add actual screenshots, a running preview, or references when available.

## Build a new website

```text
Use better-design to create a booking page for a small climbing gym.
The main task is choosing a session and reserving a place. Use the existing
stack. Derive a visual direction from climbing routes and printed route maps,
compare concrete references, and create DESIGN.md from the chosen system.
Support mobile, tablet, and desktop. Include pending, sold-out, validation,
confirmation, and retry states. Verify the booking path and report evidence.
```

Expected work: a reasoned direction, shared tokens, a complete requested flow, responsive states, and a report that distinguishes implemented behavior from unavailable backend or runtime checks.

## Improve an existing dashboard

```text
Use better-design to improve the readability of the billing dashboard.
Read DESIGN.md first. Preserve the current brand, density, navigation, and
backend behavior. Clarify invoice status and the next action. Check long
customer names, keyboard focus, empty results, loading, and failed requests.
Keep the change limited to billing.
```

Expected work: changes tied to task clarity and consistency, without a broad redesign or invented features.

## Audit without changing code

```text
Use better-design to audit the profile and account settings screens.
Do not edit files. Inspect the running UI at the supported sizes. Check
hierarchy, labels, keyboard access, error recovery, motion, and generic
design patterns. For each finding, give its severity, evidence, affected
task, and smallest useful fix. Mark unavailable checks as unverified.
```

Expected work: actionable findings grounded in current UI evidence. A planned browser check must not appear as a completed check.

## Fix file uploads

```text
Use better-design to finish the image-upload interaction in the editor.
Preserve its layout and API. Include a visible drop zone, a Choose file
button, drag-over feedback, invalid-type and size rejection, per-file
progress, preview, remove/replace, failure, and retry. Dropping outside the
zone must not navigate away or clear entered data. Verify keyboard access
and the touch picker path.
```

Expected work: working input and recovery paths with observable states; drag must have a non-drag alternative.

## Improve motion

```text
Use better-design to improve the interaction feedback in this task list.
Inherit DESIGN.md and the existing animation library. Give buttons visible
press feedback, transition inserted and removed rows, and keep changes
interruptible during rapid input. Respect reduced motion. Check the real
transitions and frame timing; explain any idle animation that remains.
```

Expected work: purposeful feedback using shared motion values, with repeat-input and reduced-motion checks.

## Plan game UI

```text
Use better-design to plan an inventory UI for a fantasy game.
Do not implement yet. Preserve the game's art direction and UI stack.
Cover mouse, keyboard, and gamepad; selection, comparison, equip, discard,
Back/Cancel, long item names, text scaling, and safe areas. Define the
acceptance checks that need the actual game runtime.
```

Expected work: a scoped plan and acceptance criteria. A web mockup does not prove gamepad focus or behavior in the game.

## Remove redundant UI copy

```text
Use better-design to review the notification settings page's copy.
Remove introductions that restate the page title and descriptions that only
paraphrase toggle labels. Compare meaning, not just identical words.
Keep real delivery rules, required alerts, privacy consequences, and error
recovery. Verify those facts against the implementation. Do not invent
explanations or change setting behavior. Omit empty description wrappers.
```

Expected work: concise labels with supporting text only where it supplies a useful new fact. A clear label does not need a subtitle. Necessary accessible instructions and consequences must survive the edit.

## Useful context to provide

- **Task:** what the user needs to accomplish.
- **Surface:** screen, route, component, or current capture.
- **Constraints:** what to preserve, what may change, and whether edits are allowed.
- **System:** existing `DESIGN.md`, tokens, brand, framework, and supported languages.
- **Targets:** devices, sizes, input methods, and relevant accessibility settings.
- **Evidence:** preview commands, safe fixtures, real references, and available test tools.

## Read the result critically

A useful report names the changed decisions, checked actions and states, actual evidence, and remaining gaps. Ask for a narrower claim if a result turns a structural JSON pass into a claim about usability or accessibility compliance.
