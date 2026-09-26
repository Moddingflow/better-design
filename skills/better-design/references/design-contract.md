# Контракт и дизайн-решения

Читай для нового потока, нескольких связанных компонентов или решения о визуальной системе.
Для точечной правки запиши только дельту: задача, сохраняемая опора, изменение и проверка.
Создавать отдельный JSON необязательно. Контракт не является новым gate согласования.

## Решения до стилей

Назови аудиторию, частоту использования, исходные данные, основную задачу и её результат.
Выясни, что уже существует: DESIGN.md (прочитать первым, см. [design-md.md](design-md.md)),
live surface, компоненты, токены, typography, icons, input model.
Не подменяй недостающий контекст придуманной персоной или новой функцией.

| Тип поверхности | Основа решения | Ошибка по умолчанию |
| --- | --- | --- |
| Рабочий инструмент | Сканирование, сравнение, предсказуемые действия | Огромный hero и карточка для каждой строки |
| Чтение/editorial | Ритм текста, measure, навигация и содержание | Dashboard chrome вокруг статьи |
| Commerce | Понятные условия, выбор, цена и исправление заказа | Fake urgency, скрытые сборы, навязанный consent |
| Бренд/портфолио | Авторская идея, контент и выразительная иерархия | Шаблонные лозунги и случайная «уникальность» |
| Игра/HUD | Быстрое чтение, состояние мира, ввод и художественная задача | Перенос офисного web-kit в игру |

Референс объясняет принцип (ритм, плотность, материал, навигация), а не даёт разрешение
скопировать чужие assets или выдумать метрики. Существующую идентичность сохраняй,
включая уместный purple, serif, 12px radius, 2px spacing или платформенный material.

Для бренда, лендинга, портфолио, consumer app, игры, editorial и launcher без действующей
системы сначала пройди [art-direction.md](art-direction.md): концепция, референсы,
2–3 направления, выбор. Токены выводятся из выбранного направления, а не из таблицы ниже,
и записываются в DESIGN.md проекта ([шаблон](../assets/DESIGN.template.md)).

## Настраиваемый neutral fallback

Только при отсутствии действующей системы (нет DESIGN.md и код-токенов) и только для рабочих инструментов (CRM, админка,
внутренние формы, IDE-подобные поверхности) или когда пользователь явно просит стандартный
вид. На выразительной поверхности этот набор даёт именно тот обезличенный результат, которого
надо избежать. Это внутренние стартовые значения, не стандарты.

| Область | Старт | Условие пересмотра |
| --- | --- | --- |
| Font | Один UI stack; body 16, secondary 14, metadata 12 CSS px | Платформа, density, glyph coverage, бренд |
| Type | 12/14/16/20/24/32/40; body leading 1.4–1.6 | Роль текста и контейнер; headline не растёт ради пустого места |
| Weight | Обычно 400/500/600/700 | Реально используемые роли; второй data/brand font допустим |
| Space | 0/4/8/12/16/24/32/48/64 | Система проекта и содержимое; не насаждай 4px grid |
| Radius | 0/4/8; capsule по смыслу chip/avatar/control | Платформа/бренд/компонент |
| Elevation | Flat default; до трёх смысловых уровней | Реальная слоистость/overlay |
| Measure | Около 60–80 символов для reading copy | Не ограничивай так таблицы, code и инструменты |
| Motion | Press 60–100ms вниз / 150–250 возврат; micro 100–150; small 150–220; medium 220–320; large 300–450. Easing: standard `cubic-bezier(0.2,0,0,1)`, enter `(0,0,0,1)`, exit `(0.3,0,1,1)`; springs без overshoot | Названная функция, частота и расстояние, reduced-motion вариант; роли и каталог — [motion.md](motion.md) |
| Layout | Content-driven wrap/stack/scroll/collapse | Не скрывать важное и не ломать сравнение данных |

Цвета сначала получают роль: canvas, surface, text, muted text, action/on-action, border,
focus, status, selection. Набор ролей определяется используемыми компонентами; не создавай
пустую огромную палитру. Проверяй нужные пары во всех поддержанных состояниях/темах.

Не вводи raw-величину, когда существующий token соответствует смыслу. Если не соответствует,
проверь необходимость нового token/variant. Проценты, grid fractions, max-content, размеры
изображений, вычисления layout, hairlines и нулевые значения не являются «стилевой энтропией».

## Исключения

Для отхода от baseline достаточно короткой записи `rule, scope, reason, source, impact`.
Пример: «radius: сохранён проектный 12px у диалога; опора — существующий Dialog; новые
варианты не введены». Исключение имеет точную область, не отключает всю проверку.
Эстетическая причина не превращает сломанное действие или недоступный focus в PASS.
Не спрашивай разрешение для обычного обратимого решения в уже согласованных границах.

## Собственный формат `better-design-contract-v1`

[Пример refine](../assets/design-contract.example.json) — небольшой web-поток сохранения имени.
[Пример create](../assets/design-contract.create.example.json) — новый сайт с направлением
`origin: new`, motion-языком, skeleton-загрузкой меню и проверками `distinctiveness` и `motion`.
Валидатор проверяет только описанные ниже поля, не JSON Schema общего назначения.
Неизвестные поля, неверные типы, пустые обязательные строки/списки и повторные ID отклоняются.
Все поля обязательны, кроме `verification.checks[].note` и `direction` (правила ниже);
`evidence` всегда массив.

| Путь | Содержание |
| --- | --- |
| `format`, `mode`, `scope`, `assumptions` | Версия; create/refine/audit/plan; точная область; список допущений, может быть пустым |
| `platform` | `kind`, `units`, непустые `inputs`, `locales`, `directions`, `themes` |
| `platform.kind → units` | web→css-px; ios→pt; android→dp; desktop→dip/px; game→px/engine |
| `platform.inputs` | pointer, keyboard, touch, gamepad, assistive; только реально поддержанные |
| `platform.directions` | ltr и/или rtl; это список поддержки, не новая i18n-функция |
| `system` | Непустые `authority`, `tokenSource`, `density`, `expression`, `rationale`; существующий источник каноничен. Если есть DESIGN.md, `tokenSource` называет его и файлы код-токенов |
| `direction` | Обязателен при `mode: create`, иначе необязателен. `origin` (new/inherited), `concept`, непустые `qualities` и `avoid`, `palette`, `typography` |
| `direction` при `origin: new` | Дополнительно `references[]` (`source`, `takeaway`; хотя бы один, цель 3–5), `alternatives[]` (≥2, `id`, `premise`), `chosen` — ID альтернативы, непустой `signature`, непустой `motion` (характер, темп, физика, фирменная motion-деталь); нужны хотя бы один check `distinctiveness` и один check `motion` |
| `direction` при `origin: inherited` | `references`, `alternatives`/`chosen`, `signature`, `motion` необязательны; если указаны `alternatives` или `chosen`, действуют те же правила; указанный `motion` — непустая строка |
| `tasks[]` | `id`, `scenario`, `outcome`, `priority` (primary/secondary), `recovery`; хотя бы одна primary |
| `components[]` | `id`, `kind`, `taskIds`, `states`, `responsive`, `actions`; taskIds/states непустые |
| `actions[]` | `id`, `kind`, `label`, `taskId`, `outcome`, `risk`, `protection`, `recovery` |
| `actions.kind` | command/navigation/submit/toggle/select/edit/drag |
| `risk → protection` | normal/high; none/reversible/check/review. Для high нельзя none |
| `verification.viewports[]` | Положительные конечные `width`, `height`, `unit` в единицах platform. Для web нужен хотя бы один; native допускает [] |
| `verification.checks[]` | `id`, `taskIds`, `componentIds`, `kind`, `scenario`, `status`, `evidence`, необязательный `note` |
| `checks.kind` | structure/tokens/contrast/render/interaction/keyboard/a11y/assistive/performance/localization/distinctiveness/motion |
| `checks.status` | planned/pass/fail/unverified; pass/fail требуют evidence, unverified требует note; planned не содержит evidence |
| `exceptions[]` | `rule`, `scope`, `reason`, `source`, `impact`; массив может быть пустым |

Допустимые `components.kind`: button, link, input, select, toggle, checkbox, radio, tabs,
menu, dialog, table, list, navigation, search, region, text, image, chart, custom.
У button/link/input/select/toggle/checkbox/radio/tabs/menu/navigation/search есть хотя бы
одно действие. У остальных `actions: []` допустим; например, readonly table или region.
Это структурное ограничение декларации, не анализ соответствия реализации.

ID — уникальные непустые строки внутри tasks/components/checks; action ID уникальны
среди всех компонентов. Ссылки указывают на существующие ID. Действие связано с задачей
своего компонента. Каждая задача представлена компонентом и проверкой; каждый компонент
представлен проверкой. Checks имеют непустые taskIds, а componentIds могут быть пусты
для проверки всего сценария. У каждого указанного check-компонента должна быть хотя бы
одна общая задача с check. Декларация coverage не доказывает фактическое покрытие.

Для записи результатов обновляй статусы по доказательствам. Структурный PASS разрешён
у контракта с planned/fail/unverified: он говорит о корректной записи, не о готовности UI.
Заполненный `direction` и check `distinctiveness` не оценивают красоту: evidence такого
check — скриншоты и запись теста подмены/прищура с тем, что было изменено по итогам.
Evidence check `motion` — видео или покадровая запись переходов (обычно на замедлении),
список найденных мёртвых моментов/idle-шума и прогон reduced motion; статичный скриншот
его не подтверждает.

Для точечной правки без JSON достаточно строки в дельте: какие переходы добавлены/изменены,
какие motion tokens использованы и что проверено при reduced motion.
