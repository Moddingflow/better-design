# Sources and limits of claims

Sources were checked when the original skill was created on 2026-09-10; loading sources
were added on 2026-09-22 and motion sources on 2026-09-23. Refresh the relevant source
before version-specific implementation. Translation in v1.1.0 is not a new verification
of every external source.

The rules are an original synthesis; third-party prompts, code, and assets are not bundled.
The art-direction process (domain-derived concept, swap test, squint test) synthesizes common
practice; it is not a standard or a quality measurement.
The [AI slop catalog](ai-slop.md), added on 2026-09-23, combines user-requested patterns
and practical review heuristics, with duplicates consolidated and contextual exceptions.
The copy information test and expanded narration/paraphrase rules added on 2026-09-26
are also practical guidance, not validated claims of a measured UX improvement.
DESIGN.md is this skill's project convention, not an external standard.

## Loading and launch

- [NN/g: Skeleton screens](https://www.nngroup.com/articles/skeleton-screens/): no indicator
  for roughly sub-second responses; skeletons for page loads up to about 10s; spinners for
  individual modules; progress for longer work. Avoid shapeless skeletons and skeletons for transfers.
- [Android splash screen](https://developer.android.com/develop/ui/views/launch/splash-screen):
  Android 12+ system splash behavior; retain it only for brief preparation and show long
  bootstrap inside the app.
- [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching):
  launch screens resemble the first app screen and quickly yield to content.

## Motion

- [Material 3: Motion](https://m3.material.io/styles/motion/overview) and
  [easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs):
  duration roles, standard/emphasized curves, decelerating entrances and accelerating exits.
  Numbers in motion.md are starting values inspired by this logic, not normative requirements.
- [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion):
  feedback, comprehension, interruption, and Reduce Motion.
- [NN/g: Animation duration](https://www.nngroup.com/articles/animation-duration/) and
  [response time limits](https://www.nngroup.com/articles/response-times-3-important-limits/):
  roughly 100ms for immediate-feeling response; common UI animations around 100–500ms.
- [web.dev: Animations and performance](https://web.dev/articles/animations-guide):
  composited transform/opacity and avoiding layout/paint work during animation.
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion)
  and [View Transition API](https://developer.mozilla.org/docs/Web/API/View_Transition_API):
  check current browser support before use.
- WCAG 2.2: [three flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) (A),
  [pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) (A), and
  [animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA).
- [Compose animation](https://developer.android.com/develop/ui/compose/animation/introduction):
  high-level APIs, springs, and interruption.
- Concept-derived motion language, the no-dead-moments principle, and the motion-slop table
  are a synthesis of practice, not measurements of quality.

## Design and skill-writing practice

- [OpenAI frontend prompting](https://developers.openai.com/api/docs/guides/frontend-prompt):
  domain and existing conventions, a useful first viewport, complete controls/states,
  restrained operational UI, and real desktop/mobile screenshots. Aesthetic defaults are
  not universal standards; expressive game interfaces remain appropriate.
- [Impeccable, Paul Bakaus](https://github.com/pbakaus/impeccable), Apache-2.0:
  preserving the brief/visual grounding, distinguishing refinement from redesign, and
  functional hardening. Ideas were consulted from a local snapshot without copying text
  or adopting mandatory ceremonies.
- [Taste Skill](https://github.com/Leonxlnx/taste-skill), MIT: coherent visual language and
  critique of repetitive compositions. Local GPT Taste variants do not justify random layouts,
  mandatory hero/AIDA/GSAP, font blacklists, or fake execution.
- [OpenAI skill-creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md):
  concise discovery, progressive disclosure, checkable helper invariants, and proportionate
  forward testing.

## Normative web target and informative guidance

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) is a normative W3C Recommendation.
  See [contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html),
  [focus appearance AAA](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
  [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), and
  [dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).
- Also see [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
  [resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html),
  [text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html),
  [label in name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html), and
  [error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html).
- [ARIA APG introduction](https://www.w3.org/WAI/ARIA/apg/about/introduction/) and
  [modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) provide informative
  patterns, not a production component library or replacement for normative requirements.
- [WAI evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/):
  automation cannot assess every accessibility property; human evaluation is necessary.
- [GOV.UK error message](https://design-system.service.gov.uk/components/error-message/):
  specific errors, associated fields, and preservation of input.

## Platforms, tokens, and performance

- [Apple design tips](https://developer.apple.com/design/tips/): native design and 44pt targets.
- [Android accessibility](https://developer.android.com/design/ui/mobile/guides/foundations/accessibility):
  native accessibility and recommended 48dp touch targets.
- [Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/xbox/accessibility/guidelines):
  game guidance, not a legal certification checklist.
- [Google Web Vitals](https://web.dev/articles/vitals): good p75 LCP/INP/CLS thresholds and
  field/lab distinctions. Google guidance is not a WCAG requirement.
- [DTCG format 2025.10](https://www.designtokens.org/tr/2025.10/format/):
  a stable Community Group specification, not a W3C Standard. better-design-core-v1 is a
  small custom format inspired by typed tokens/aliases, without full DTCG conformance.

## Research: limited implications

- [DesignCoder](https://arxiv.org/abs/2506.13663): motivation for checking hierarchical
  generation and self-correction; mockup fidelity does not prove production usability.
- [UXBench mobile reasoning](https://arxiv.org/abs/2606.13192) and
  [UXBench critique actionability](https://arxiv.org/abs/2606.16262) are different works.
  A model critic is an additional signal, not an oracle.
- Do not repeat an unidentified claim about an "August pattern-completion paper" as a
  verified fact. Assess usability through tasks and evidence.
