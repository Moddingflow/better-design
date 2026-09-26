# Платформенные адаптеры

Читай только подходящий раздел. Сохраняй существующий стек и дизайн-систему.
Не переносись на web только ради доступного хелпера. Для синтаксиса и version-specific
API используй текущую документацию и prescribed tools среды, включая Context7 resolve→query
там, где это требуется. Не передавай приватный код в запрос документации.

## Apple native

Сохраняй native controls, semantic colors, Dynamic Type/text scaling, safe areas и
платформенную навигацию. Поддержи VoiceOver, внешнюю клавиатуру и focus по shipped devices.
Launch screen повторяет первый экран и не несёт долгой загрузки; долгий bootstrap —
отдельный экран с этапами (см. «Загрузка» в behavior-and-content.md).
Apple design tips дают touch target 44pt; не подменяй pt CSS-пикселями и не ломай
существующий platform control ради глобальной radius scale.
Смотри актуальный HIG для нужного control/device; проверяй реальную native surface,
увеличенный текст, контраст, landscape и доступный способ Back/Cancel.
Motion: системные springs и прерываемые жесты (swipe-back, sheet detents) не заменяй своими
кривыми; `accessibilityReduceMotion` меняет перемещение на crossfade. Haptics — через
системные feedback generators, по смыслу события.

## Android native

Используй проектный Material/иной принятый язык без смеси Apple/web-паттернов.
Не добавляй отдельную splash Activity поверх системного `SplashScreen` (Android 12+);
удерживай системный splash только для быстрой локальной подготовки.
Сохраняй системный Back, insets, font scaling, TalkBack semantics, pointer/keyboard
и touch по целевой среде. Android рекомендует touch targets 48dp; это не 44 CSS px.
Рендер/AT проверяй в реальном target runtime и настройках размера текста.
Не добавляй новую библиотеку ради стилистического совпадения с web baseline.
Motion: Compose-анимации (`animate*AsState`, `AnimatedVisibility`, `AnimatedContent`,
`spring`), значения читай в `graphicsLayer {}` без лишней recomposition; поддержи Predictive
Back; учитывай «Убрать анимации» / animator duration scale. Отклик на нажатие не должен ждать
сетевой отправки или recomposition — визуальный pressed-state и действие стартуют на touch-down,
если так устроен поток. Проверяй с «Масштабом длительности анимации» 5× и на слабом устройстве.

## Desktop

Установи фактический UI stack: native или embedded web. Для web-surface применимы
web-проверки, но отдельно проверь окна, DPI/multi-monitor scaling, минимальный размер,
клавиатурные shortcuts, focus activation, dialog ownership и системную навигацию.
У native используй platform accessibility APIs и реальные единицы проекта.
Системный font stack, знакомое меню и ожидаемые shortcuts приоритетнее унификации платформ.
Проверяй, что resize/scaling не отрезает нижние controls и что статус операции доступен AT.
Motion: не дублируй системные анимации окон и tray; системное отключение анимаций
(Windows «Эффекты анимации», macOS Reduce Motion) в embedded web приходит как
`prefers-reduced-motion`. Resize окна не должен вызывать анимацию layout на каждый кадр.
Drag & Drop из проводника/Finder — ожидаемое поведение desktop: везде, где приложение принимает
файлы (импорт, моды, скины, сохранения, вложения), принимай их через платформенное событие
file drop с состояниями из раздела «Drag & Drop» в behavior-and-content.md. Drop на окно вне
зоны не открывает файл как навигацию embedded web.

## Games / Unity

Сначала задача экрана: HUD, инвентарь, настройки, тактическое сравнение или пауза.
Сохраняй art direction и выбранный UI stack. Выразительный игровой интерфейс допустим,
если состояние и действие читаемы на реальном фоне, расстоянии просмотра и скорости игры.

- Определи реально поставляемые mouse/keyboard/gamepad/touch inputs и способ переключения.
- Проверь видимую текущую selection, spatial focus, wrap/границы, Back/Cancel, отсутствие
  focus dead ends и prompts для активного устройства. Нужные действия не зависят только от hover.
- Проверь aspect ratios, safe areas, subtitle/text scale, supported locales, long item names,
  contrast поверх мира, paused/unpaused состояния и влияние animation на чтение.
- Loading screen уровня/ассетов — законный splash: реальный прогресс, этапы подключения
  к серверу/лобби, сбой с retry, без фейкового процента; оформлен в art direction игры.
- Motion и juice (hit-stop, squash-and-stretch, тряска камеры, частицы, звук) — законная
  часть языка игры, но UI-движение не задерживает ввод и не перекрывает чтение HUD; тряска
  и вспышки получают настройку уменьшения. Используй tween/animation систему проекта.
- Учитывай remapping и hold/repeat/timing, если они относятся к изменяемому потоку;
  не добавляй новый accessibility subsystem в задачу о выравнивании кнопки.
- Измеряй engine CPU/GPU/layout/allocations по бюджету игры. CWV не оценка Unity performance.
- Используй фактический engine/player и устройства. HTML-прототип не доказывает gamepad
  focus, UI Toolkit layout, world contrast или работу собранного player.
- Соблюдай уже действующий проектный UI pipeline, approval и build rules. Если проект
  требует прототип или свежую player-сборку после изменений runtime UI, выполни эти
  требования. Этот скилл не вводит такие правила в другие проекты.

Xbox Accessibility Guidelines полезны как практические рекомендации для игр; не называй
их юридической сертификацией или WCAG-conformance native-игры. Ссылки — [sources.md](sources.md).
