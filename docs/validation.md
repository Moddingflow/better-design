# Validate contracts and design tokens

[Back to README](../README.md)

The repository bundles three optional, read-only checkers:

| Tool | Checks | Needs |
| --- | --- | --- |
| `validate_design.py` | Design contracts, a small token format, declared contrast pairs | Python 3.10+ |
| `check_layout.py` | Spacing, alignment, centering, and containment in a dumped layout | Python 3.10+ |
| `motion_probe.mjs` | Press, hover, focus, and release behavior of every control on a page | Node.js 22+, Chrome / Chromium / Edge |

The Python helpers use the standard library, read the explicit UTF-8 JSON input, and return a report. They do not scan your repository, run project commands, access the network, or write output files.

## Run the bundled examples

From the repository root:

```sh
python -B -X utf8 skills/better-design/scripts/validate_design.py contract skills/better-design/assets/design-contract.example.json --json
python -B -X utf8 skills/better-design/scripts/validate_design.py contract skills/better-design/assets/design-contract.create.example.json --json
python -B -X utf8 skills/better-design/scripts/validate_design.py tokens skills/better-design/assets/tokens.example.json --require-contrast --json
python -B -X utf8 skills/better-design/scripts/test_validate_design.py
```

`-B` avoids Python bytecode files, and `-X utf8` makes input/output encoding explicit. Replace the example path with your own input. Keep the native project token source authoritative.

## Contract checks

The `contract` command validates `better-design-contract-v1`. Start with the [focused-change example](../skills/better-design/assets/design-contract.example.json) or the [creation example](../skills/better-design/assets/design-contract.create.example.json). The [contract reference](../skills/better-design/references/design-contract.md) describes the fields.

The schema covers scope, platform, design system, components, actions, states, and evidence records. A structurally valid record may still contain planned, failed, or unverified checks. The helper does not open evidence files or verify that a test happened.

## Token checks

The `tokens` command accepts `better-design-core-v1`, a small custom token format inspired by typed design tokens. It is not a full DTCG implementation.

| Supported | Boundaries |
| --- | --- |
| Opaque sRGB colors | Numeric components in the range 0–1; alpha must be 1 if present |
| Dimensions and durations | Explicit values and supported units |
| Cubic Bézier values | Four numeric coordinates with valid x ranges |
| Numbers, font families, font weights | Literal values with the helper's documented restrictions |
| Whole-token aliases | Existing target, no cycles, and matching types |
| Declared contrast pairs | Opaque color pairs, their declared purposes, and minimum ratios |

Unsupported features fail rather than being silently treated as valid. These include translucent colors, gradients, composite typography, CSS expressions, and full DTCG group metadata. See the [complete format reference](../skills/better-design/references/validation.md).

`--require-contrast` rejects an empty contrast-pair list. A non-empty list still does not prove that you listed every important combination or state. Contrast comparisons use the computed ratio without rounding a failure into a pass.

## Report and exit codes

JSON output includes `ok`, `scope`, `counts`, `issues`, `contrast`, and `limitations`. Issues provide a code, path, and message.

| Exit code | Meaning |
| --- | --- |
| `0` | The explicitly listed structural/color checks passed |
| `1` | Validation failed, including unsupported input features |
| `2` | Input could not be read/parsed, or CLI arguments were invalid |

## Layout geometry

Dump a rendered screen to `better-design-layout-v1` JSON with the dumper for your stack in [`assets/layout-dump`](../skills/better-design/assets/layout-dump/) (web DOM, Unity, Godot), then check it:

```sh
python -B -X utf8 skills/better-design/scripts/check_layout.py skills/better-design/assets/layout.example.json
python -B -X utf8 skills/better-design/scripts/check_layout.py path/to/dump.json --json
python -B -X utf8 skills/better-design/scripts/test_check_layout.py
```

Errors include `uneven-gap`, `misaligned-row`, `misaligned-column`, `misaligned-keyline`, `off-center`, `overflow`, `tight-edge`, and `overlap`. A clean result covers the dumped nodes at that resolution only. See the [layout guide](../skills/better-design/references/layout-geometry.md) and the [format reference](../skills/better-design/references/validation.md).

## Motion probe

```sh
node skills/better-design/scripts/motion_probe.mjs skills/better-design/assets/motion/kit.html
node skills/better-design/scripts/motion_probe.mjs http://localhost:5173/settings --width 390 --height 844
node skills/better-design/scripts/motion_probe.mjs http://localhost:5173/settings --reduced-motion --json
```

The probe launches a headless browser with a temporary profile, opens the page, and for up to `--max` (60) visible interactive elements compares computed styles before and after hover, pointer-down, release, and keyboard focus. The press is released outside the element, so no click is dispatched; still point it at fixtures rather than a live account. It finds the browser automatically or uses `--chrome PATH` / `CHROME_PATH`.

| Result | Meaning |
| --- | --- |
| error | No press feedback within 60 ms, no visible focus, or a state that sticks after release |
| warning | A weak 1–2 px press, an instant return without a spring, no hover, `transition: all`, or instant state changes |

Exit code `1` means at least one error. The probe shows that states change; it does not judge whether the motion is beautiful, so still review key transitions slowed down.

## What still needs real UI verification

- Actual colors after opacity, backgrounds, gradients, and overlays.
- Interaction, keyboard navigation, focus, and error recovery.
- Responsive layout, zoom, large text, supported themes, and long content.
- Motion quality over time, rapid repeated input, and performance (the probe covers presence of feedback, not taste).
- Relevant assistive technology and target-device behavior.
- Whether users can complete the intended task.

The repository's CI exercises the helpers, examples, the motion probe on the bundled bench pages, and package integrity. It does not certify visual quality, accessibility compliance, or model output across agents.
