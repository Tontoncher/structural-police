# **structural-police**
eslint plugin для контроля структуры файлов и импортов

# **Установка**
npm i eslint-plugin-structural-police

# **Настройка**
Правило `import-permission-schema` принимает 4 аргумента:

1. `schema`:_object_ - Схема валидации импортов (подробнее в пункте "Схема")
2. `inheritance`:_boolean_ - Наследование правил. Если у дочернего узла нет собственных
   правил, то будут применены правила ближайшего родителя
3. `entryPoints`:_array of string_ - Массив путей до валидируемых файлов
4. `everywhereAllowed`:_array of string_ - Массив путей до файлов, импорт которых всегда доступен

# **Схема**
Схема описывает структуру проекта, по которой линтер будет проверять корректность расположения
файлов и возможность осуществления импортов.

В схеме могут использоваться 3 ключех слова:

1. `__rules__` - В данном объекте линтер будет искать правила для конкретного узла схемы
2. `__any__` - Разрешает любую структуру дочерниих файлов. Если `__any__` установлен `true`, то
   линтер прекращает поиск правил глубже по схеме и применяет ко всем вложенным файлам уже
   найденые правила, если такие были
3. `__var__<variable_name>` - При помощи такой конструкции можно обобщить несколько разноименных
   директорий с одинаковой внутренней структурой, чтобы исключить дублирование в схеме. Например в
   директории apps у нас лежит три три приложения app-a, app-b и app-c. Если
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

## !!! Важно !!!

1. На одном уровне вложенности может быть только одно ключевое слово `__var__<variable_name>`
2. `__var__` переменные не должны повторяться

## !!! Интересно !!!
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