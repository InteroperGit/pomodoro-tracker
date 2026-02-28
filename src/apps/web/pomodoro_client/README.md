# Pomodoro Client

Веб-приложение для управления задачами с использованием техники Pomodoro. Написано на чистом TypeScript без UI-фреймворков — с собственной минималистичной реактивной системой.

## Возможности

- Таймер Pomodoro: 25 мин работа / 5 мин короткий перерыв / 15 мин длинный перерыв (после 4 помидоров)
- Список запланированных задач с drag-and-drop сортировкой
- Архив выполненных задач со статистикой
- Светлая и тёмная тема
- Сохранение состояния в `localStorage`
- Web Notifications при завершении помидора или перерыва
- Адаптивная вёрстка (мобильная / десктопная)
- Поддержка screen reader (ARIA live-регионы, `role="timer"`)

## Команды

Все команды выполняются из директории `src/apps/web/pomodoro_client/` через pnpm:

```bash
pnpm install        # Установить зависимости
pnpm dev            # Запустить dev-сервер
pnpm build          # Проверка типов + сборка (tsc && vite build)
pnpm typecheck      # Только проверка TypeScript (без emit)
pnpm lint           # ESLint
pnpm lint:fix       # ESLint с автоисправлением
pnpm test           # Запустить тесты (vitest)
pnpm preview        # Предпросмотр production-сборки
```

## Конфигурация через переменные окружения

Создайте `.env` файл в корне `pomodoro_client/`, если нужно переопределить тайминги:

```env
VITE_TASK_TIME_MIN=25          # Длительность помидора (мин), по умолчанию 25
VITE_SHORT_BREAK_TIME_MIN=5    # Короткий перерыв (мин), по умолчанию 5
VITE_LONG_BREAK_TIME_MIN=15    # Длинный перерыв (мин), по умолчанию 15
VITE_LONG_BREAK_AFTER=4        # Помидоров до длинного перерыва, по умолчанию 4
```

## Архитектура

### Кастомная реактивная система

Приложение **не использует** React, Vue или другие UI-фреймворки. Реализована собственная минималистичная реактивная система:

- **Компоненты** — чистые функции `(props) => string`, возвращающие HTML-строку.
- **`render(root, App, ctx)`** — устанавливает `root.innerHTML`, затем запускает очередь mount-эффектов. Перед следующим рендером вызываются cleanup-функции предыдущего.
- **`useEffect(fn)`** — регистрирует side-effect после рендера. Возвращаемая функция вызывается как cleanup при следующем рендере.
- **`createStore<S>(initial)`** — возвращает `{ getState, setState, subscribe }`. Каждый `setState` уведомляет всех подписчиков и запускает полный перерендер.

### Контекст приложения (`src/app/appContext.ts`)

`createContext(initialState, onTickCallback, onPomodoroCallback)` связывает store и `ActiveTaskController`. Возвращает `{ store, actions }`.

Глобальный синглтон регистрируется через `registerContext(ctx)` и доступен компонентам через хук-функции (`useStartTask()`, `useAddTask(task)`, `useSetTheme(theme)` и др.).

### Движок таймера (`src/app/ActiveTaskController.ts`)

Управляет циклом Pomodoro:
- Использует `setInterval` (1 с тик) с компенсацией пропущенных тиков через `performance.now()`.
- Генерирует события через `EventBus`: `tick` (остаток мс), `completed`, `idle`.
- `activateNextTask(planTasks)` управляет переходами: задача → короткий перерыв → длинный перерыв → idle.
- `snapTick()` — мгновенно синхронизирует таймер при возврате на вкладку (`visibilitychange`).

### Персистентность

Состояние сериализуется в `localStorage` под ключом `pomodoro:state`. Сохранения throttled до 1 с. При загрузке данные проходят валидацию через `stateSchema.ts`.

## Структура проекта

```
src/
├── app/
│   ├── actions/              # Действия: taskActions, timerActions, themeActions
│   ├── ActiveTaskController.ts  # Движок таймера Pomodoro
│   ├── App.ts                # Главный компонент
│   ├── appContext.ts         # Контекст и глобальный store
│   ├── config.ts             # Тайминги (читает env-переменные)
│   ├── hooks.ts              # use* хуки для доступа к store и actions
│   └── main.ts               # Точка входа
│
├── components/
│   ├── ArchiveTasks/         # Архив выполненных задач
│   ├── Dropdown/             # Выпадающее меню
│   ├── EmptyState/           # Заглушка пустого состояния
│   ├── Footer/               # Подвал
│   ├── PlanTasks/            # Список запланированных задач (с DnD)
│   ├── Timer/                # Таймер с кнопками управления
│   ├── Toast/                # Toast-уведомления
│   └── Toolbar/              # Шапка с навигацией и настройками
│
├── constants/
│   └── initialState.ts       # Начальное состояние store
│
├── css/
│   ├── default_theme.css     # Светлая тема (CSS custom properties)
│   └── dark_theme.css        # Тёмная тема
│
├── types/                    # TypeScript-типы всех сущностей
│
└── utils/
    ├── eventBus.ts           # Типизированная шина событий
    ├── html.ts               # Экранирование HTML (XSS-защита)
    ├── layout.ts             # Определение мобильного layout
    ├── localStorage.ts       # Обёртка над localStorage
    ├── notifications.ts      # Web Notifications API
    ├── render.ts             # render() и useEffect()
    ├── stateSchema.ts        # Валидация состояния из localStorage
    ├── statistics.ts         # Расчёт статистики задач
    ├── store.ts              # Реактивный store
    ├── throttle.ts           # Throttle-утилита
    ├── time.ts               # Форматирование времени
    └── theme.ts              # Переключение CSS-темы
```

## Тесты

Тесты написаны на [Vitest](https://vitest.dev/). Покрывают утилиты и `ActiveTaskController`:

```
src/utils/store.test.ts
src/utils/render.test.ts
src/utils/statistics.test.ts
src/utils/stateSchema.test.ts
src/utils/html.test.ts
src/utils/throttle.test.ts
src/utils/idGenerator.test.ts
src/utils/activeTask.test.ts
src/app/ActiveTaskController.test.ts
```
