# Источники и границы утверждений

Сверены при создании 2026-09-10; источники о загрузке добавлены 2026-09-22, о движении — 2026-09-23.
Перед version-specific реализацией обнови нужный источник.
Правила скилла написаны как собственный синтез; чужие prompts/code/assets не включены.
Процесс art direction (концепция из предмета, тест подмены, тест прищура) — собственный
синтез общепринятой практики арт-дирекции, не норматив и не измерение качества.
Каталог [ai-slop.md](ai-slop.md) (добавлен 2026-09-23) — собственная сводка по списку
пользователя и практике детекторов шаблонных паттернов; дубли объединены, у каждого
паттерна есть исключение. Это эвристики для review, не измерение качества.
DESIGN.md — проектная конвенция скилла, а не внешний стандарт.

## Загрузка и запуск

- [NN/g: Skeleton screens](https://www.nngroup.com/articles/skeleton-screens/): до ~1 s
  индикатор не нужен; skeleton для загрузки страницы до ~10 s; spinner для отдельного модуля;
  progress bar дольше ~10 s; skeleton без структуры и для upload/download не использовать.
- [Android splash screen](https://developer.android.com/develop/ui/views/launch/splash-screen):
  системный splash на Android 12+ для всех приложений; удерживать его можно только для
  небольших быстрых загрузок, долгий bootstrap показывай своим интерфейсом.
- [Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching):
  launch screen похож на первый экран приложения, быстро уступает место контенту и не является
  площадкой для бренда.

## Движение

- [Material 3: Motion](https://m3.material.io/styles/motion/overview) и
  [easing and duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs):
  роли длительностей, standard/emphasized кривые, enter-decelerate/exit-accelerate. Числа в
  motion.md — стартовые значения по этой логике, не норматив; концепция их сдвигает.
- [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion):
  цель движения — обратная связь и понимание, прерываемость, Reduce Motion.
- [NN/g: Animation duration](https://www.nngroup.com/articles/animation-duration/) и
  [response time limits](https://www.nngroup.com/articles/response-times-3-important-limits/):
  ~100 ms — ощущение мгновенного отклика; UI-анимации обычно 100–500 ms.
- [web.dev: Animations and performance](https://web.dev/articles/animations-guide):
  composited `transform`/`opacity`, избегать layout/paint в анимации.
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion),
  [View Transition API](https://developer.mozilla.org/docs/Web/API/View_Transition_API) —
  проверяй поддержку браузеров перед использованием.
- WCAG 2.2: [three flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html) (A),
  [pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) (A),
  [animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA).
- [Compose animation](https://developer.android.com/develop/ui/compose/animation/introduction):
  высокоуровневые API, springs, прерываемость.
- Motion-язык из концепции, «ни одного мёртвого момента и ни одного лишнего движения» и
  motion-slop таблица — собственный синтез практики, не измерение качества.

## Практики дизайна и создания skills

- [OpenAI frontend prompting](https://developers.openai.com/api/docs/guides/frontend-prompt):
  домен и существующие conventions, полезный первый экран, полные controls/states,
  restrained operational UI и реальные desktop/mobile screenshots. Эстетические defaults
  этого документа не универсальные стандарты; выразительность games допускается.
- [Impeccable, Paul Bakaus](https://github.com/pbakaus/impeccable), Apache-2.0:
  сохранение brief/визуальной опоры, различение refinement и redesign, functional hardening.
  Из локального snapshot использованы идеи, без копирования текста и обязательных церемоний.
- [Taste Skill](https://github.com/Leonxlnx/taste-skill), MIT: цельная визуальная грамматика
  и критика повторяющихся композиций. Локальные GPT Taste варианты не основание для
  random layouts, обязательного hero/AIDA/GSAP, font blacklists или fake execution.
- [OpenAI skill-creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md): короткое discovery,
  progressive disclosure, проверяемые helper-инварианты и соразмерное forward testing.

## Нормативный web target и informative guidance

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — нормативная рекомендация W3C.
  [Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html),
  [focus appearance AAA](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
  [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
  [dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).
- [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
  [resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html),
  [text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html),
  [label in name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html),
  [error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html).
- [ARIA APG introduction](https://www.w3.org/WAI/ARIA/apg/about/introduction/),
  [modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): informative patterns,
  не готовая production component library и не замена нормативным требованиям.
- [WAI evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/): automation не определяет
  все свойства accessibility; нужна человеческая оценка.
- [GOV.UK error message](https://design-system.service.gov.uk/components/error-message/):
  конкретные ошибки, связь с полем и сохранение ввода; практики дизайн-системы.

## Платформа, tokens и performance

- [Apple design tips](https://developer.apple.com/design/tips/): native design и 44pt targets.
- [Android accessibility](https://developer.android.com/design/ui/mobile/guides/foundations/accessibility):
  native accessibility, рекомендуемые 48dp touch targets.
- [Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/xbox/accessibility/guidelines):
  игровые best practices, не юридическая compliance checklist.
- [Google Web Vitals](https://web.dev/articles/vitals): хорошие p75 LCP/INP/CLS; field/lab
  различаются. Это guidance Google, не WCAG-норма.
- [DTCG format 2025.10](https://www.designtokens.org/tr/2025.10/format/): stable Community
  Group specification, не W3C Standard. Наш `better-design-core-v1` — собственный малый
  формат, вдохновлённый typed tokens/aliases; полной DTCG-conformance не заявляет.

## Исследования: ограниченное значение

- [DesignCoder](https://arxiv.org/abs/2506.13663): полезный повод проверять иерархическую
  генерацию и self-correction; mockup fidelity не доказывает production usability.
- [UXBench mobile reasoning](https://arxiv.org/abs/2606.13192) и
  [UXBench critique actionability](https://arxiv.org/abs/2606.16262) — разные работы.
  Model critic полезен как дополнительный сигнал, не oracle.
- Не воспроизводи неопознанное утверждение об «августовской pattern-completion работе»
  как проверенный факт. Пользовательская интуитивность проверяется задачами и данными.
