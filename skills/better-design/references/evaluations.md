# Evaluating Better Design

Evaluate generator behavior on tasks, not whether a file contains a rule.
After a change, run package validation, executable-helper tests, and several relevant
forward cases. Scale the work to the change.

For an independent pass, give the evaluator the request, skill, and minimal input artifacts
without the expected answer or suspected defect. Use subagents only when allowed by the
active instructions; otherwise perform a separate reproducible review. Isolate fixtures
and outputs from live accounts/production. Inspect actual results and edits, not only reports.

| Case | Realistic request | Observable property |
| --- | --- | --- |
| Incumbent system | Fix button focus in a branded form with purple and a 12px radius | Brand, radius, API, and unrelated UI preserved; no new design system |
| CRM | Find an overdue invoice and change its status | Comparable columns, working filters/actions, clear outcome context |
| Form recovery | Correct a date and save again after failure | Other input preserved, associated error, truthful success |
| Search | Handle loading/no-results/server failure under rapid input | Distinct states; stale responses cannot overwrite new ones |
| Expressive game | Build a bright sci-fi HUD panel for gamepad | Expressive direction, focus/Back, actual engine evidence |
| Editorial | Improve a long article using its existing serif | Appropriate type/measure; no dashboard shell or font blacklist |
| Narrow/long content | Fit a localized form and long numbers on a phone | Essential text/controls accessible without hidden overflow |
| Supported RTL | Fix navigation in an existing Arabic locale | Correct direction/focus; no indiscriminate mirroring |
| Unavailable runtime | Change UI without access to the app/browser | Completed work separated from unverified claims |
| Audit only | Find UI problems without editing code | Findings/evidence only; no mutations or package installation |
| Distinctive landing | Create a neighborhood bakery site with today's menu | Domain-derived concept, analyzed references, 2–3 directions, swap test |
| Indie game page | Create a folk-horror game page | Direction from the game world; trailer/screenshots lead rather than a SaaS template |
| Neutral request | Build a simple standard admin interface | Appropriate neutral fallback; character through precision, without forced creativity |
| Skeleton | Card feed with a 1–3s API response | Layout-matched skeleton, stable replacement, timeout/retry, reduced motion |
| Splash misuse | Add loading feedback between tabs | Local skeleton or retained content instead of splash |
| Splash bootstrap | Launcher server discovery and sign-in | Real stages and recovery, no artificial delay, cached-session bypass |
| DESIGN.md exists | Add settings to a project with DESIGN.md | Read before editing; values follow it; new token documented and coded together |
| DESIGN.md missing | Redesign three screens with existing CSS variables | Derive DESIGN.md from live tokens; record contradictions |
| Drift | Compare screens made in separate sessions | Same role has the same button height, heading size, family, and spacing |
| Slop landing | Create a SaaS landing page without references | Catalog-based scan; contextual replacements for generic cards/palette/glow/badges/copy |
| Slop exception | Work within a documented purple-gradient brand | Brand preserved; justified visual exception recorded |
| Dead UI | Improve a wooden-feeling list/dialog screen | Shared press, dialog, list, and number transitions; no blanket fade-up; reduced-motion feedback |
| Motion language | Create a surface with a specific concept | Concept-derived direction.motion, signature detail, video evidence |
| Motion restraint | Add impressive animation to an admin tool | Named functions and short frequent responses; no intro cascade, parallax, or endless pulses |
| Interruptible | Rapid toggle/sheet/tab interaction and swipes | No queues or stuck states; velocity preserved; truthful final state |
| Focused motion fix | Add button feedback inside an existing system | Inherit tokens/physics; no parallel system or gratuitous library |
| Upload without a D&D request | Add screenshot attachments to a ticket form | Drop zone, window/zone feedback, rejection, preview/progress, picker/paste, safe off-target drop |
| Reorder | Seller-controlled product gallery order | Lift and neighbor movement; button/menu and keyboard alternatives with position announcements |
| Page narration | Clean settings copy that introduces an already obvious page purpose | Remove generic introduction; preserve headings, controls, and genuinely useful scope information |
| Toggle paraphrase | Review "Email notifications" / "Enable or disable email notifications" | Keep the label and control; omit the redundant description and its wrapper |
| Semantic repetition | Remove a differently worded subtitle that repeats a label's meaning | Detect meaning-level duplication without relying on exact-string equality |
| Meaningful helper | Review auto-save with a verified interval and device-only storage | Keep the interval and scope; do not delete useful detail just to shorten the screen |
| Consequence | Simplify destructive or paid settings with verified effects | Preserve irreversible, billing, privacy, and affected-user consequences beside the action |
| No invented facts | Remove redundant help when no interval, limit, or guarantee is known | Delete it rather than inventing a more specific claim |
| Component description slot | Build ten settings rows with two genuinely non-obvious options | Only those two get informative descriptions; no empty wrappers or filler for visual symmetry |
| Accessible help | Shorten visible copy while instructions are linked by aria-describedby | Preserve necessary semantics/instructions and valid references; recheck focus and assistive access |
| First use | Improve an empty import screen | Keep real type/size requirements and the next action; remove prose describing obvious layout |

## Evaluating the copy rules

Provide ordinary UI context and the product facts the agent may use. Include both redundant
copy and explanations that must survive. Ask for the requested change without naming the
expected catalog IDs. Inspect the resulting UI/text and any altered component API.

Record:

- Narration/paraphrases removed, including repetitions with different wording.
- Constraints, consequences, unfamiliar concepts, and accessible instructions preserved.
- Any facts invented to replace removed text.
- Whether description wrappers and spacing disappear when no description is needed.
- Scope boundaries and unavailable runtime checks.

A manual review of synthetic text cases is useful evidence at that scope. It is not an
independent agent benchmark or proof of rendered behavior. Do not substitute string-matching
tests for semantic assessment.

## Comparing outcomes

Compare the same prompts, fixtures, and environment versions with/without the skill across
repeated generations. A blinded reviewer assesses task success and serious defects rather
than guessing the model from style. For originality cases, ask whether screenshots identify
the intended product and whether generations differ appropriately. The same design across
different products fails even if each looks tidy.

Record task completion, critical errors, unintended actions, recovery, keyboard/assistive
access, lost content, token/contract findings, and difficulty taking the first step.
Time on task, backtracking, help requests, and perceived ease need real participants;
agent simulation does not create user statistics. Record sample size and uncertainty.
A 90% success goal may be an internal calibrated target, not a universal UX standard.
One attractive example does not demonstrate reliability or a percentage improvement.

Product A/B work needs a hypothesis, primary metric, guardrails, and protocol before collecting
data. Accessibility and data integrity are not experimental options. A rare focused fix
usually needs a targeted scenario and evidence, not an unnecessary statistical process.

Change the skill in response to reproducible failures. Do not turn one reviewer's preference
into a universal ban. Test the helper through its actual CLI and negative inputs, including
a broken→fixed proof; checking that a rule's text exists does not measure its quality.
