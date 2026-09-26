# Copy review cases for v1.1.0

These synthetic cases were reviewed manually while updating the skill. They exercise the
information test and its exceptions. They are examples of applying the rules, not an
independent model evaluation, a browser run, or measured user research.

Only product facts supplied in each case may be used. No production screen or account was changed.

| Context and input | Reviewed result | Reason |
| --- | --- | --- |
| Notifications settings; introduction: “Choose which alerts you receive and personalize your notification experience.” The controls already name all alert categories | Remove the introduction; keep the heading and controls | Describes the obvious page task without an additional fact |
| Toggle “Show message previews”; helper: “See a preview of your messages in notifications.” | Keep the toggle label; omit helper and description wrapper | A semantic paraphrase even though the wording differs |
| Toggle “Include shared files”; verified helper: “Files owned by teammates count toward your storage quota.” | Keep the helper | Ownership and quota consequences affect the choice |
| Toggle “Automatic archiving”; verified helper: “Moves completed items out of the active list after 90 days. You can restore them from Archive.” | Keep the timing, destination, and recovery information | An unfamiliar action and its consequences need explanation |
| Toggle “Background updates”; helper repeats “Update in the background.” No schedule or network policy is known | Remove the helper; do not invent timing, battery savings, or Wi-Fi-only behavior | A missing product fact cannot be fabricated to justify a subtitle |
| Button “Remove member”; verified consequence: “They lose access immediately. Their existing comments remain.” | Keep the consequence adjacent to the action | Access timing and retained content are not implied by the label |
| Empty report list; “Use this page to view and manage reports,” with a Create report button | Show “No reports yet” and the existing Create report action | The actual state and next action are enough |
| First-time column mapping; verified requirement: “Map one column to Email before importing. Rows without an email are skipped.” | Keep the instruction | A prerequisite and data-handling consequence are necessary orientation |
| Account ID field has an associated label and an aria-describedby hint: “Use the 8-character ID printed on your invoice.” | Keep the hint and association | Format and where to find the value help valid input; this is not label repetition |
| Ten-row preferences component requires a subtitle prop; only two rows have useful helper facts | Make the description optional; render wrappers only for those two rows | Layout symmetry does not justify filler in the other eight |

## Review findings

- The information test distinguishes a paraphrase from a new consequence, even without identical words.
- Removing filler does not imply deleting every description or shortening all text to a word limit.
- First-use guidance, unfamiliar actions, irreversible effects, formats, and accessibility instructions remain necessary.
- The component guidance covers both the text and the empty space left by deleting it.

Runtime layout, screen-reader behavior, and whether an independently run agent follows these
rules remain outside this manual review. Use the [evaluation guide](../../skills/better-design/references/evaluations.md)
for a broader evaluation protocol.
