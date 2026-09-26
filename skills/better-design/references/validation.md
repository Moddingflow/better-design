# Проверки и доказательства

## Офлайн CLI

`scripts/validate_design.py` использует только Python 3.10+ standard library. Читает ровно
переданный UTF-8 JSON, не сканирует repository, не пишет файлы, не ставит зависимости,
не запускает команды и не обращается в сеть. Запускай из папки скилла или укажи полный путь.

```powershell
python -B -X utf8 scripts/validate_design.py contract assets/design-contract.example.json --json
python -B -X utf8 scripts/validate_design.py contract assets/design-contract.create.example.json --json
python -B -X utf8 scripts/validate_design.py tokens assets/tokens.example.json --require-contrast --json
python -B -X utf8 scripts/test_validate_design.py
```

| Exit | Значение |
| --- | --- |
| 0 | Прошли ровно проверки, перечисленные в `scope`; это не UX acceptance |
| 1 | Нарушен контракт, есть неподдержанная структура/feature или не прошёл contrast |
| 2 | Нельзя прочитать/разобрать вход или неверные аргументы; результат не оценён |

`--json` возвращает `ok`, `scope`, `counts`, `issues`, `contrast`, `limitations`.
Каждая issue имеет code/path/message; ratio в JSON сохраняет полную вычисленную точность.
В text mode выводятся те же границы. Duplicate JSON keys, NaN/Infinity/overflow numbers
и неизвестные поля не принимаются. Конечные numbers не включают bool.

Контракт описан в [design-contract.md](design-contract.md). Структурный PASS с checks
`planned`, `fail` или `unverified` не свидетельствует о работе интерфейса. Хелпер не читает
файлы по `evidence` и не проверяет правдивость/качество указанных доказательств.

## Собственный token subset `better-design-core-v1`

[Пример](../assets/tokens.example.json) можно адаптировать как небольшой input projection.
Оставь исходную DS каноничной. Если проект использует другой формат, используй его validator
или явно спроецируй только затронутые значения. Не мигрируй tokens ради этого хелпера.

Root содержит только `format`, `tokens`, `contrastPairs`. `tokens` — непустое дерево групп;
каждый лист содержит `$type`, `$value` и необязательный непустой `$description`.
Имя группы/листа: ASCII буква/underscore, затем ASCII буквы/digits/underscore/hyphen.
Точка — разделитель path, не часть имени. Глубина групп до 64.

| `$type` | Literal `$value` |
| --- | --- |
| `color` | `{ "colorSpace": "srgb", "components": [r,g,b], "alpha": 1 }`; ровно три конечных числа 0..1; alpha можно опустить |
| `dimension` | `{ "value": finiteNumber, "unit": "px" }`; units px/rem/em/pt/dp/dip, отрицательные значения допустимы по роли |
| `duration` | `{ "value": nonNegativeNumber, "unit": "ms" }`; units ms/s |
| `cubicBezier` | `[x1, y1, x2, y2]` — ровно четыре конечных числа; x1/x2 в 0..1, y может выходить за 0..1 (overshoot). CSS-строка `cubic-bezier(...)` не принимается |
| `number` | Конечное число |
| `fontFamily` | Одно непустое literal family name или непустой массив уникальных непустых имён; reserved syntax описан ниже |
| `fontWeight` | Конечное число 1..1000 |

Любой тип может иметь whole-token alias `{group.token}` в `$value`, с явным `$type`.
Проверяются отсутствующие цели, циклы, цепочки и совпадение типа на каждом переходе.
Alias не вставляется в часть строки/объекта или элемент массива. Типы/единицы не преобразуются автоматически.

В `fontFamily` строки считаются буквальными именами: пробелы, Unicode, цифры, дефисы и
апострофы допустимы. Для fallback используй JSON-массив; строка не разбирается в CSS-список.
В каждом строковом literal, включая элементы массива, `{` и `}` зарезервированы и дают
`alias-format` в любой позиции. Исключение — корректный whole-token alias, занимающий
весь `$value`. Символы `(`, `)` и `\` также зарезервированы и дают `font-family-syntax`:
функции вроде `var(...)`, `calc(...)`, `env(...)` и CSS escapes не поддерживаются.
Даже буквальное имя шрифта с этими reserved символами выходит за границы subset.
Это проверка перечисленных символов, не CSS/font parser: другие строки не проверяются
по грамматике CSS, наличию шрифта или успешности его загрузки.

Неподдержанные структуры дают FAIL: type inheritance, group metadata, `$extends`, `$root`,
`$extensions`, JSON Pointer, composite typography/border/shadow/gradient, other color spaces,
hex/CSS strings в color value и alpha отличная от 1. CSS expressions/variables не заменяют
структурные или числовые literals в таблице; для `fontFamily` действует явный резерв выше.
Полупрозрачный цвет
не считается белым и не получает pass: нужна корректная project-native composition check.
Формат вдохновлён DTCG, но не является полным DTCG и не проверяет его conformance.

`contrastPairs` — массив объектов с уникальным `id`, `foreground`, `background` (token paths),
`purpose` (text/large-text/non-text/custom), непустым `state`, конечным `minimum` от 1 до 21.
Для text minimum не меньше 4.5, large-text/non-text не меньше 3. У custom нет accessibility
утверждения. Размер/вес large text и необходимость UI-границы подтверждай в runtime.

Проверяются только объявленные пары, не все комбинации цветов и не computed CSS.
Явно перечисляй нужные состояния/темы в state/ID. Для проверки только dimension/type
`contrastPairs: []` допустим и явно сообщает отсутствие contrast assertion.
Для цветового gate передавай `--require-contrast`: пустой список тогда FAIL.
Сама непустота не доказывает полноту покрытия, это предмет review.

Luminance использует sRGB breakpoint 0.04045 и unrounded comparison. Полученная ratio
не учитывает font rendering, фоновые изображения, прозрачность, градиенты и окружение UI.

## Применяй уровни по назначению

| Слой | Выполни | Что ещё остаётся |
| --- | --- | --- |
| Contract/tokens | Хелпер для явных inputs или project-native validator | Проверить реализацию и семантическое покрытие |
| Код | Применимые текущие type/build/lint, существующие state/story checks | Удобство, runtime и внешний вид |
| Interaction | Безопасный fixture, действие, наблюдаемый результат и recovery | Другие состояния/реальные пользователи |
| Accessibility | Engine + keyboard + применимый AT-проход | Полный нормативный/экспертный аудит |
| Render | Актуальные кадры нужных states/viewports/themes и просмотр | Поведение за пределами кадра |
| Performance | Условия, lab trace/regression или настоящий field/RUM | Field p75 нельзя получить из одного local run |

Не имитируй AST/style lint регулярками и не объявляй отсутствующий handler по поиску onClick.
Native submit, routes и delegates легитимны. Автоматически найденные cards/pills/overflows
и подсчёты цветов/шрифтов — кандидаты на review, пока контекст не подтверждён.

Хелпер не включает browser automation, screenshots, contrast scanner по DOM, keyboard
walker или screen reader. Используй инструменты проекта, не устанавливай browser stack
автоматически. Live destructive actions не тестируй механическим перебором кликов.

## Приёмка и отчёт

Прими критичные запрошенные сценарии, включая ошибку/возврат и нужный ввод; исправь
введённые change-ом применимые accessibility defects; осмотри реальный результат.
Запиши actual command/scenario, runtime/viewport/input/state, результат и evidence path.
Невозможный запуск или неиспользованный AT оставь unverified с точной причиной.
Назови pre-existing findings отдельно, не расширяя задачу без основания.

Не зацикливайся на косметике после прохождения приёмки. Перезапускай проверки после
изменений/провалов или для конкретной оставшейся неопределённости. Удаляй созданный
одноразовый мусор только после проверки точного пути; тесты и нужные evidence сохраняй.
