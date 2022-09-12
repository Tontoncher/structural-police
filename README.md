[RU](https://github.com/Tontoncher/structural-police/blob/master/README.md) | [EN](https://github.com/Tontoncher/structural-police/blob/master/README-en.md)

# structural-police
eslint plugin для контроля структуры файлов и импортов

# Установка
npm i eslint-plugin-structural-police

# Быстрый старт
```
// .eslintrc.[js|yml|json]

{
    "plugins": [
        // ... какие-то твои плагины
        "structural-police"
    ],
    "extends": [
        // ... какие-то твои конфиги плагинов
        
        // один из конфигов
        "plugin:structural-police/recommended"
        // или
        "plugin:structural-police/featureSliced"
    ],
}
```

# Правила плагина

- [import-order](#import-order)
- [import-permission-schema](#import-permission-schema)
- [no-default-export](#no-default-export)

_____

## import-order

### Настройка
Правило `import-order` принимает 5 аргументов:

1. `groups`:_array of object_ - Массив групп импортов (подробнее в пункте "Группы")
2. `behaviorRelatedComment`:_string_ - Вариант поведения комментариев, находящихся
   непосредственно перед импортов при использовании функции автофикса (флаг --fix).
   При значении `link` (default value) все комментарии перемещаются вместе с импортом.
   При значении `delete` все комментарии удаляются
3. `blankLineAfterEveryGroup`:_boolean_ - Нужно ли после каждой группы импортов
   вставлять пустую строку (default value: false)
4. `groupNamePrefix`:_string_ - Префикс необходимый, чтобы отличать обычные комментарии
   от названий групп импортов (default value: ' # '). Например: `// # GroupName`
5. `customErrorMessages`:_object_ - Объект с колбэками, формирующими тексты
   ошибок (подробнее в пункте "Кастомные сообщения ошибок")

### Группы
У каждого объекта группы есть 4 параметра:

- `name`. Если есть `name`, то перед этой группой необходим комментарий с названием группы
- `priority` отвечает за приоритет разбора импортов по группам. То есть если импорт удовлетворяет
   условиям двух групп, то он будет размещен в групу с наивысшим приоритетом (default value: 1)
- `importPathMatch` содержит регулярное выражение по которому проверяется импортируемый путь (default value: /^/)
- `blankLineAfter` отвечает за наличие пустой строки после группы (default value: false)

Пример
```js
groups: [
   {                  priority: 0, importPathMatch: /^/,      blankLineAfter: true },
   { name: 'actions', priority: 2, importPathMatch: /Action/, blankLineAfter: false },
   { name: 'stores',  priority: 2, importPathMatch: /Store/ },
   { name: 'styles',  priority: 1, importPathMatch: /.css$/,  blankLineAfter: true },
]
```

### Кастомные сообщения ошибок
Если есть желание изменить тексты ошибок выбрасываемых линтом, то можно сделать это, передав
в аргумент `customErrorMessages` объект со своими колбэками.
В правиле есть три типа ошибок `mustBeAfter`, `blankLineDetected`, `blankLineExpected`,
`needAddComment` и `needRemoveComment`, каждый из которых вызывается при разных проблемах:
1. `mustBeAfter` вызывается, если нарушен порядок импортов
2. `blankLineDetected` вызывается, если обнаружена лишняя пустая строка между импортами
3. `blankLineExpected` вызывается, если после группы с `blankLineAfter` нет пустой строки
4. `needAddComment` вызывается, если перед группой с `name` нет комментария с названием
5. `needRemoveComment` вызывается для неправильных названий групп

Ниже приведен объект с дефолтными колбэками, тут же можно посмотреть какие аргументы должны принимать колбэки
```js
const defaultErrorMessages = {
   mustBeAfter: ({ importPath, mustBeAfterImportPath }) =>
      `This import must be after import from "${mustBeAfterImportPath}"`,
      
   blankLineDetected: ({ importPath, groupName }) =>
      `Must not be blank line after import from "${importPath}"`,
      
   blankLineExpected: ({ importPath, groupName }) =>
      `Need blank line after imports group "${groupName}"`,
      
   needAddComment: ({ groupName, newComment }) =>
      `Before imports group "${groupName}" must be comment with groups name "${newComment}"`,
      
   needRemoveComment: () => 
      `Need remove wrong groups name`,
}
```

___

## import-permission-schema

### Настройка
Правило `import-permission-schema` принимает 5 аргументов:

1. `schema`:_object_ - Схема валидации импортов (подробнее в пункте "Схема")
2. `inheritance`:_boolean_ - Наследование правил. Если у дочернего узла нет собственных
   правил, то будут применены правила ближайшего родителя
3. `entryPoints`:_array of string_ - Массив путей до валидируемых файлов
4. `everywhereAllowed`:_array of string_ - Массив путей до файлов, импорт которых всегда доступен
5. `customErrorMessages`:_object_ - Объект с колбэками, формирующими тексты
   ошибок (подробнее в пункте "Кастомные сообщения ошибок")

### Схема
Схема описывает структуру проекта, по которой линтер будет проверять корректность расположения
файлов и возможность осуществления импортов.

В схеме могут использоваться 3 ключех слова:

1. `__rules__` - В данном объекте линтер будет искать правила для конкретного узла схемы
2. `__any__` - Разрешает любую структуру дочерниих файлов. Если `__any__` установлен `true`, то
   линтер прекращает поиск правил глубже по схеме и применяет ко всем вложенным файлам уже
   найденые правила, если такие были
3. `__var__<variable_name>` - При помощи такой конструкции можно обобщить несколько разноименных
   директорий с одинаковой внутренней структурой, чтобы исключить дублирование в схеме. Например в
   директории apps у нас лежит три приложения app-a, app-b и app-c. Если
   у первых двух одинаковая структура, то схему можно составить следующим образом:
```
apps: {
    'app-c': {
        // Какая-то схема
    },
    __var__similar_apps: {
        // Какая-то другая схема
    },
},
```
В данном случае проверка будет происходить следующим образом:

Поиск правил для файла `apps/app-c/index.ts`: Зашли в `apps`, зашли в `app-c`,
нашли правила для `index.ts`

Поиск правил для файла `apps/app-a/index.ts`: Зашли в `apps`, не нашли объект
`app-a`, поэтому зашли в первый попавшийся `__var__<variable_name>`, если такой есть

### Кастомные сообщения ошибок
Если есть желание изменить тексты ошибок выбрасываемых линтом, то можно сделать это, передав
в аргумент `customErrorMessages` объект со своими колбэками.
В правиле есть три типа ошибок `importDisallow`, `missingFile` и `missingRules`, каждый из
которых вызывается при разных проблемах:
1. `importDisallow` вызывается, если в файле найден импорт из запрещенного правилами (схемой) источника
2. `missingFile` вызывается, если проверяемый файл не описан в схеме
3. `missingRules` вызывается для проверяемого файла в схеме не найдены правила

Ниже приведен объект с дефолтными колбэками, тут же можно посмотреть какие аргументы должны принимать колбэки
```js
const defaultErrorMessages = {
   importDisallow: ({ filePath, importPath, absoluteImportPath }) =>
      `Not allowed to import from "${absoluteImportPath}"`,
   
   missingFile: ({ schemaPath, missingNode }) =>
      `The file is not described in the schema. In "${schemaPath}" expected a node "${missingNode}"`,
   
   missingRules: ({ schemaPath }) =>
      `There is no set of rules in the "${schemaPath}"`,
}
```

### Правила

Правила можно передать в любой узел схемы под ключем `__rules__`. Правила содержат 3 необязательных ключа:

1. `defaultAllowed`:_boolean_ - Импорт со всех адресов разрешен, если true. Запрещен, если false (default value: true)
2. `allowed`:_array of string_ - Массив разрешенных адресов для исключения из `defaultAllowed = true`
3. `disallowed`:_array of string_ - Массив запрещенных адресов для исключения из `defaultAllowed = false`

### !!! Важно !!!

1. На одном уровне вложенности может быть только одно ключевое слово `__var__<variable_name>`
2. `__var__` переменные не должны повторяться
3. Если в узле отсутствуют правила и аргумент inheritance выставлен на false (отключено наследование правил),
   то это приведет к ошибке

### !!! Интересно !!!
Переменные, указанные при составлении дерева файлов можно использовать в написании правил.
```
apps: {
    __var__similar_apps: {
        featuers: {},
        shared: {},
    },
},
```
В нашей схеме есть переменная <similar_apps>, полученная при указании ключевого слова `__var__`
вместо названий приложений app-a, app-b. И мы хотим разрешить импорт из shared в
featuers, но только в рамках одного приложения (то есть в app-b/featuers нельзя сделать
импорт модуля из app-a/shared).
Настроить такие ограничения можно разместив следующие правила в объекте `features`
```
__rules__: {
    defaultAllowed: false,
    allowed: [
        'apps/__var__similar_apps/shared',
    ],
},
```
Логика проверки путей работает таким образом, что она вместо `__var__` переменных подставит узлы,
из пути проверяемого файла. То есть находясь в файле `apps/app-a/featuers/index.ts`
переменная __var__similar_apps, используемая в правилах будет заменена на `app-a`, а
находясь в `apps/app-b/featuers/index.ts` - на `app-b`.
Проще говоря, переменная `__var__<variable_name>` - это текущая директория для каждого файла


___

## no-default-export
Правило `no-default-export` запрещает использование дефолтных экспортов


