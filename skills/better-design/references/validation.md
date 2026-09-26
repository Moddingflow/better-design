# Validation and evidence

## Offline CLI

`scripts/validate_design.py` uses only the Python 3.10+ standard library. It reads the
specified UTF-8 JSON file, does not scan a repository, write files, install dependencies,
execute commands, or access the network. Run from the skill folder or supply full paths.

```sh
python -B -X utf8 scripts/validate_design.py contract assets/design-contract.example.json --json
python -B -X utf8 scripts/validate_design.py contract assets/design-contract.create.example.json --json
python -B -X utf8 scripts/validate_design.py tokens assets/tokens.example.json --require-contrast --json
python -B -X utf8 scripts/test_validate_design.py
```

| Exit | Meaning |
| --- | --- |
| 0 | Exactly the checks listed in scope passed; this is not UX acceptance |
| 1 | Invalid contract, unsupported structure/feature, or failed contrast |
| 2 | Unreadable/unparseable input or invalid arguments; no assessment |

JSON output includes ok, scope, counts, issues, contrast, and limitations.
Issues contain code/path/message; contrast ratios retain full computed precision.
Text output states the same boundaries. Duplicate keys, NaN/Infinity/overflow numbers,
and unknown fields fail. Finite-number checks exclude booleans.

See [design-contract.md](design-contract.md). A structural pass with planned, failed, or
unverified checks does not demonstrate a working interface. The helper does not open evidence
files or verify the truth/quality of their claims.

## Custom token subset: `better-design-core-v1`

Adapt the [example](../assets/tokens.example.json) as a small input projection.
Keep the native design system canonical. Use its validator or project only affected values;
do not migrate a token system merely to use this helper.

The root contains only format, tokens, and contrastPairs. Tokens form a non-empty group tree;
each leaf has $type, $value, and optionally a non-empty $description.
Group/leaf names begin with an ASCII letter or underscore, followed by ASCII letters, digits,
underscores, or hyphens. A dot separates paths and is not part of a name. Maximum group depth: 64.

| $type | Literal $value |
| --- | --- |
| color | Object with colorSpace "srgb", components [r,g,b], and optional alpha 1. Exactly three finite components in 0..1 |
| dimension | Object with finite value and unit; px/rem/em/pt/dp/dip. Negative values may be appropriate by role |
| duration | Object with nonnegative value and unit ms/s |
| cubicBezier | [x1,y1,x2,y2], exactly four finite numbers; x1/x2 in 0..1, y may overshoot. CSS cubic-bezier strings are unsupported |
| number | A finite number |
| fontFamily | One non-empty literal family name or a non-empty array of unique non-empty names; reserved syntax below |
| fontWeight | A finite number in 1..1000 |

Any type can use a whole-token alias such as {group.token} as its value with an explicit type.
Checks cover missing targets, cycles, chains, and type equality at every step.
Aliases cannot be interpolated into part of a string/object or an array element.
Types and units are not automatically converted.

Font-family strings are literal names: spaces, Unicode, digits, hyphens, and apostrophes
are permitted. Use an array for fallbacks; a string is not parsed as a CSS family list.
Braces in any string literal, including array elements, produce alias-format errors.
The exception is a valid whole-token alias occupying the entire value.
Parentheses and backslashes are also reserved and produce font-family-syntax errors:
var(...), calc(...), env(...), and CSS escapes are unsupported. Even a literal family name
with these characters falls outside the subset. This checks reserved characters, not the
full CSS/font grammar, font availability, or successful loading.

Unsupported structures fail: type inheritance, group metadata, $extends, $root, $extensions,
JSON Pointer, composite typography/border/shadow/gradient, other color spaces, hex/CSS color
strings, and alpha other than 1. CSS expressions/variables cannot replace the structural or
numeric literals above. Translucent colors are not treated as white or passed silently;
use native project compositing checks. This is inspired by DTCG but does not validate full
DTCG conformance.

Contrast pairs have unique id, foreground/background token paths, purpose
(text/large-text/non-text/custom), non-empty state, and finite minimum from 1 to 21.
Text minimum is at least 4.5; large-text/non-text at least 3. Custom makes no accessibility
claim. Verify large-text size/weight and the necessity of a UI boundary in the actual runtime.

Only declared pairs are checked, not every combination or computed CSS.
List required states/themes explicitly in state/ID. An empty contrastPairs list is valid
for non-color checks and explicitly makes no contrast assertion. With --require-contrast,
an empty list fails. A non-empty list still needs review for coverage.

Luminance uses the sRGB breakpoint 0.04045 and unrounded comparison.
Ratios exclude font rendering, background images, transparency, gradients, and UI context.

## Use each validation layer for its actual purpose

| Layer | Perform | Still required |
| --- | --- | --- |
| Contract/tokens | Helper on explicit inputs or native validator | Implementation and semantic coverage |
| Code | Applicable type/build/lint and existing state/story checks | Usability, runtime, appearance |
| Interaction | Safe fixture, action, observed outcome and recovery | Other states and real users |
| Accessibility | Engine, keyboard, applicable assistive technology | Complete normative/expert audit |
| Render | Inspect current frames at required states/viewports/themes | Behavior outside those frames |
| Performance | Recorded conditions, lab trace/regression or actual field/RUM | One local run cannot establish field p75 |

Do not simulate AST/style lint with regex or infer missing handlers by searching for onClick.
Native submit, routes, and delegates are valid. Automatically detected cards, pills,
overflows, and color/font counts need contextual review.

The helper has no browser automation, screenshots, DOM contrast scanner, keyboard walker,
or screen reader. Use project tools; do not automatically install a browser stack.
Never test destructive live actions by mechanically clicking controls.

## Acceptance and reporting

Accept the requested critical scenarios, including error/Back and required input modes;
fix introduced applicable accessibility defects and inspect the real result.
Record actual command/scenario, runtime/viewport/input/state, result, and evidence path.
Unavailable runtime and unused assistive technology remain unverified with a specific reason.
Report pre-existing findings separately without expanding scope.

Once acceptance passes, stop cosmetic churn. Repeat checks after changes/failures or to
resolve a concrete uncertainty. Before deleting temporary work, verify its exact path;
retain tests and needed evidence.
