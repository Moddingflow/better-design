# Validate contracts and design tokens

[Back to README](../README.md)

The optional helper is a read-only Python 3.10+ CLI. It uses the standard library, reads the explicit UTF-8 JSON input, and returns a report. It does not scan your repository, run project commands, access the network, or write output files.

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

## What still needs real UI verification

- Actual colors after opacity, backgrounds, gradients, and overlays.
- Interaction, keyboard navigation, focus, and error recovery.
- Responsive layout, zoom, large text, supported themes, and long content.
- Motion over time, rapid repeated input, reduced motion, and performance.
- Relevant assistive technology and target-device behavior.
- Whether users can complete the intended task.

The repository's CI exercises the helper, examples, and package integrity. It does not certify visual quality, accessibility compliance, or model output across agents.
