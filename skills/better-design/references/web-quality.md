# Web: применимые проверки

Цель по умолчанию — WCAG 2.2 AA, включающая применимые A-критерии. Ни один список ниже
не является полным аудитом. Нормативный источник — WCAG, APG — informative guidance;
наши числа для стиля и предпочтения не становятся стандартами. Ссылки — [sources.md](sources.md).

## Семантика и доступность

| Проверка | Точная граница |
| --- | --- |
| Text contrast 1.4.3 | Обычный текст ≥4.5:1; large ≥3:1: 18pt regular или 14pt bold, примерно 24/18.67 CSS px. Не округляй failing ratio вверх. Placeholder тоже текст. Есть исключения для inactive, incidental/decorative и logos |
| Non-text 1.4.11 | ≥3:1 для необходимой информации о компоненте/состоянии и значимой графики относительно соседних цветов. Не для каждого divider, не между несоседними default/hover. Есть inactive и unmodified user-agent exceptions |
| Focus | Видим и логично идёт без positive tabindex. AA 2.4.11: компонент не полностью перекрыт authored content. Полная видимость (2.4.12), площадь 2 CSS px perimeter и same-pixel contrast (2.4.13) — AAA, полезные усиления |
| Targets 2.5.8 | AA 24×24 CSS px либо применимые spacing/equivalent/inline/user-agent/essential exceptions. Для touch предпочитай 44×44 как внутренний enhanced target. Один маленький bbox не доказывает нарушение |
| Keyboard 2.1.1/2.1.2 | Все применимые операции доступны без pointer; нет непреднамеренной ловушки. Modal containment допустим с ожидаемым выходом |
| Label in name 2.5.3 | Accessible name содержит видимый текст; начинать с него — полезная практика. Иконке без текста нужен meaningful name |
| Labels/errors | Связанные labels/instructions (3.3.2); текстовое описание ошибки (3.3.1); известное исправление (3.3.3). Сохраняй данные при ошибке |
| Status 4.1.3 | Значимые updates без смены focus доступны AT; не объявляй каждое косметическое изменение |
| Drag 2.5.7 | Нужна single-pointer альтернатива без dragging, кроме применимых exceptions. Keyboard alternative выполняет отдельную задачу и не заменяет pointer alternative |
| Consequences 3.3.4 | Для применимых legal/financial/data/test submissions — reversibility, checking или review/confirm. Не обязательная modal для каждого Save |
| Input/auth 3.3.7/3.3.8 | Не заставляй повторять известную в процессе информацию без основания; допускай password manager/paste, не создавай cognitive test без подходящей помощи/альтернативы |
| Flashing 2.3.1 | A: не более трёх вспышек в секунду либо ниже general/red flash thresholds. Касается мигающих статусов, glitch-эффектов, стробов в играх |
| Pause 2.2.2 | A: автоматически начинающееся движение/мигание/прокрутка дольше 5 s параллельно с другим контентом — pause/stop/hide, кроме essential. Бесконечный ambient, карусели, бегущие строки |
| Motion 2.3.3 | AAA: анимацию от взаимодействия можно отключить. `prefers-reduced-motion` — усиление качества: убрать перемещение/масштаб/параллакс, сохранить отклик и состояние. Подробно — [motion.md](motion.md) |

Используй native semantics, структуру headings/landmarks/list/table/form и ARIA только по делу.
Decorative icon скрыт от AT; informative image имеет смысловой alt, decorative — пустой alt.
Графику/цветовые состояния дополни доступными текстовыми значениями или другими признаками.
Не считай accessibility tree реальным запуском screen reader.

## Responsive и текст

Для каждого изменяемого блока выбери wrap, stack, contain-scroll, collapse или сохранение
структуры. Проверяй primary action и контекст после адаптации. Не маскируй баг через
`overflow-x: hidden`; page scrollWidth может выглядеть правильным при обрезанных потомках.

Для нового web-потока исходная матрица: 320×800, 375×812, 768×1024, 1024×768, 1440×900.
Сузь её по реальному риску при точечной правке; добавь short-height и границы breakpoint,
если sticky header/footer, menu или dialog могут перекрыть содержимое.

- Reflow 1.4.10: 320 CSS px equivalent width для вертикального потока (1280 при 400% zoom).
  Для горизонтального потока — equivalent height 256 CSS px. Necessary 2D content,
  например некоторые tables/maps, имеет exceptions; оболочку проверь отдельно.
- Resize 1.4.4: увеличение текста до 200% без потери content/function. Это отдельный тест
  от reflow. Device scale factor — не text resize. Используй реальный browser text/zoom;
  CSS override пригоден как диагностика, если подтверждено удвоение rendered текста.
- Text spacing 1.4.12: совместно line-height 1.5, paragraph spacing 2em, letter-spacing .12em,
  word-spacing .16em без потери. Это переносимость override, не обязательный исходный стиль;
  учитывай применимость к writing system.
- В поддержанных темах проверь focus и contrast. При текстовых изменениях проверь expansion,
  long strings и font glyph coverage. RTL нужен при существующей/запрошенной поддержке.
- Под reduced motion убери ненужное перемещение, сохрани состояние, обратную связь и управление.
  Проверяй через эмуляцию `prefers-reduced-motion` в DevTools/automation и системную настройку.

На screenshot смотри дочерние элементы, intended scroll regions, overlays, sticky области,
обрезку букв/чисел, перенесённые labels, перекрытые targets и broken assets. Один bbox-скан
не доказывает отсутствие overlap. Не принимай новый golden image без смыслового просмотра.

## Runtime и безопасные сценарии

Используй проектный browser/test setup, не устанавливай стек автоматически.
Для action test задай fixture, действие и ожидаемый объект/экран/state. Проверь primary flow,
invalid input, service failure, recovery/back и keyboard путь. Не перебирай кликами live controls.
Навигацию тестируй как навигацию, native submit — как submit; отсутствие onClick не дефект.

Accessibility engine на актуальном DOM помогает найти конкретные проблемы. Дополнительно
пройди Tab/Shift+Tab, Enter/Space, Escape и arrows по паттерну. Для существенного нового
потока добавь реальный AT-проход по headings, forms, errors, modal и status, когда доступен.
Если runtime или AT недоступен, назови именно непроверенные свойства и оставь их unverified.

## Производительность

Анимируй `transform`/`opacity`; изменение layout-свойств — через FLIP/View Transitions.
Отклик на нажатие не должен ухудшать INP: визуальный pressed-state ставится в том же кадре,
тяжёлая работа — после. Проверяй переходы в Performance panel с CPU throttling на long frames;
DevTools Animations panel позволяет замедлить и покадрово пройти переход.

Не добавляй assets, fonts, dependencies и effects без задачи. Резервируй dimensions/aspect-ratio,
загружай нужные веса/размеры, сохраняй геометрию controls при pending/смене label.
Учитывай длинные списки, поиск и отзывчивость ввода; virtualization выбирай по измерению
и проверь её влияние на клавиатуру, focus и AT.

Google CWV good thresholds: p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, отдельно mobile/desktop.
Это guidance Google, не WCAG/W3C standard. Field/RUM показывает полевой p75; Lighthouse,
локальный trace и synthetic CI дают диагностику/регрессии при записанных условиях.
Без field data результат «не измерен». Budget JS/image/font определяй по проекту,
а не объявляй 200KB универсальным лимитом. Сообщай trade-off измеренными величинами.
