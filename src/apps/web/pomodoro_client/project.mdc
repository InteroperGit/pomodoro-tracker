# pomodoro_client — Project Rules

## Stack & tooling

- **Language**: TypeScript (strict, no `any`)
- **Build**: Vite 7 + `tsc`
- **Styles**: CSS Modules (`.module.scss`), Sass
- **Tests**: Vitest (unit/integration), Playwright (e2e)
- **Package manager**: pnpm 10.7.0
- **No UI framework** — custom reactive system (see Architecture)

---

## Project structure

```
src/
├── app/
│   ├── main.ts                  # Entry point — init, localStorage, render loop
│   ├── App.ts                   # Root component
│   ├── appContext.ts            # createContext / registerContext / useContext
│   ├── hooks.ts                 # use* functions — thin wrappers over context.actions
│   ├── config.ts                # Pomodoro timing constants
│   ├── ActiveTaskController.ts  # Timer engine (setInterval, EventBus)
│   └── actions/
│       ├── taskActions.ts
│       ├── timerActions.ts
│       ├── themeActions.ts
│       └── localeActions.ts
├── components/
│   └── ComponentName/
│       ├── index.ts             # Component function + Props type
│       ├── ComponentName.module.scss
│       └── SubComponent.ts      # Sub-components of the same feature
├── types/
│   ├── context.ts               # AppState, AppActions, PomodoroEvent
│   ├── task.ts                  # PomodoroTask, ActivePomodoroTask, enums
│   ├── statistics.ts
│   ├── category.ts
│   ├── component.ts
│   └── iStorage.ts
├── utils/
│   ├── render.ts                # render() + useEffect()
│   ├── store.ts                 # createStore<S>()
│   ├── layout.ts                # useIsMobile(), onLayoutChanged()
│   ├── statistics.ts
│   ├── localStorage.ts
│   ├── eventBus.ts
│   ├── throttle.ts
│   ├── idGenerator.ts
│   ├── html.ts                  # escapeHtml()
│   └── ...
├── i18n/
│   ├── index.ts                 # setLocale(), t(), getCurrentLocale()
│   ├── types.ts
│   └── locales/
│       ├── ru.ts
│       └── en.ts
└── constants/
    └── initialState.ts

tests/
├── e2e/                         # Playwright specs
│   ├── constants.ts             # All shared selectors and text constants
│   └── *.spec.ts
└── integration/                 # Vitest integration tests
    └── helpers.ts

public/
└── assets/icons/                # Static assets (favicon, logo SVG)
```

---

## Architecture — custom reactive system

### Rendering

Components are **plain functions that return HTML strings**. There is no virtual DOM.

```ts
// src/utils/render.ts
export function render<Context>(
    root: HTMLElement,
    app: (ctx: Context) => string,
    ctx: Context
) {
    // 1. Run cleanup from previous render
    // 2. Set root.innerHTML = app(ctx)
    // 3. Run all queued useEffect callbacks
}

export function useEffect(effect: () => void | (() => void)) {
    // Queued and executed after innerHTML is set
    // Returned function is called as cleanup on next render
}
```

**useEffect pattern** — attach DOM event listeners after render:

```ts
export function MyComponent() {
    useEffect(() => {
        const btn = document.getElementById('my-btn');
        const handler = () => doSomething();
        btn?.addEventListener('click', handler);
        return () => btn?.removeEventListener('click', handler); // cleanup
    });
    return `<button id="my-btn">Click</button>`;
}
```

### State

```ts
// src/utils/store.ts
const store = createStore<AppState>(initialState);

store.getState()          // → AppState (current snapshot)
store.setState({ ...s })  // → triggers full re-render via subscribers
store.subscribe(fn)       // → returns unsubscribe function
```

Every `setState` triggers a **full re-render** of the entire app.
Never mutate state directly — always spread: `store.setState({ ...s, field: value })`.

### Context & hooks

The global singleton context is registered once in `main.ts`:

```ts
const ctx = createContext(initialState, onTickHandler, onPomodoroHandler);
registerContext(ctx);
```

Components access state and actions through `use*` hooks:

```ts
import { useAddTask, useStartTask, useSetTheme } from '../../app/hooks.ts';

// Inside a useEffect, attach to a DOM event:
useEffect(() => {
    const btn = document.getElementById('start-btn');
    const handler = () => useStartTask();
    btn?.addEventListener('click', handler);
    return () => btn?.removeEventListener('click', handler);
});
```

All hooks call `useContext()` internally — they never take `ctx` as argument.

---

## Component conventions

### Structure

```ts
// src/components/MyFeature/index.ts
import styles from './MyFeature.module.scss';
import { t } from '../../i18n';

export type MyFeatureProps = {
    isMobile: boolean;
    data: SomeState;
};

export function MyFeature({ isMobile, data }: MyFeatureProps): string {
    return `
        <div class="${styles.my_feature}">
            ${t('my_feature.title')}
        </div>
    `;
}
```

### Rules

- Component functions return `string` — always.
- Props type is always a named export: `export type XxxProps`.
- Sub-components of the same feature go in the same folder, not in a shared `/components/shared/`.
- If a component is only used inside one parent, keep it in the parent's folder.
- Use `escapeHtml()` from `src/utils/html.ts` for all user-provided text in HTML:

```ts
import { escapeHtml } from '../../utils/html.ts';

`<span>${escapeHtml(task.description)}</span>`
```

---

## i18n

Always use `t()` for visible text — never hardcode Russian/English strings.

```ts
import { t } from '../../i18n';

t('plan.add.categoryPlaceholder')              // → 'Категория'
t('plan.stats.finishTime')                     // → 'Время окончания'
t('archive.target.remaining', { count: 3 })   // → 'осталось 3 из 10'
```

Translation keys live in `src/i18n/locales/ru.ts` and `src/i18n/locales/en.ts`.
Template params use `{paramName}` syntax in locale strings.

---

## CSS Modules

```ts
import styles from './MyComponent.module.scss';

// Single class
`<div class="${styles.my_component}">`

// Conditional modifier
`<div class="${styles.my_component} ${isMobile ? styles.my_component_mobile : ''}">`
```

**Dark theme** — target with `:global(html.theme-dark)`:

```scss
.my_component {
    background: var(--color-bg);

    :global(html.theme-dark) & {
        background: var(--color-bg-dark);
    }
}
```

**Responsive breakpoints**:

```scss
.plan_task {
    // desktop: 3-column grid
    @media (max-width: 400px) { /* narrow mobile */ }
    @media (max-width: 359px) { /* single column */ }
}
```

Mobile breakpoint constant: `MOBILE_STATE = 768` in `src/utils/layout.ts`.

---

## Actions pattern

Actions live in `src/app/actions/`. Each `create*Actions` factory receives `store` and
returns a plain object of functions. They never use `useContext()` — they receive
dependencies through parameters.

```ts
// src/app/actions/taskActions.ts
export function createTaskActions(
    store: Store<AppState>,
    taskController: ActiveTaskController,
    planStatisticsConfig: PlanStatisticsConfig
) {
    return {
        addTask(task: PomodoroTask): void {
            const s = store.getState();
            const updatedTasks = [{ task, count: 1 }, ...s.planTasks.tasks];
            store.setState({
                ...s,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedTasks,
                    statistics: getPlanTasksStatistics(updatedTasks, planStatisticsConfig),
                },
            });
        },
    };
}
```

**Validation** — actions throw `Error` on invalid input, never silently fail:

```ts
if (!id) {
    throw new Error("Failed to inc task. Id is not initialized");
}
```

---

## TypeScript rules

- Strict mode: `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`, `erasableSyntaxOnly`
- **No `any`** — ESLint enforces `@typescript-eslint/no-explicit-any: error`
- Import paths must include `.ts` extension: `import { foo } from './foo.ts'`
- Target: ES2022

---

## Code style

Always use curly braces and a new line for control flow — never inline bodies:

```ts
// ✅ correct
if (condition) {
    return;
}

for (const item of items) {
    process(item);
}

// ❌ wrong
if (condition) return;
for (const item of items) process(item);
```

---

## Dropdown behavior

Reuse the `useDropdown()` utility for any dropdown menu:

```ts
import { dropdownMarkup, useDropdown } from '../Dropdown';

// In component render:
dropdownMarkup({
    wrapClass: styles.wrap,
    buttonId: 'my-btn',
    buttonClass: styles.btn,
    buttonContent: `<i class="fa-solid fa-gear"></i>`,
    buttonAriaLabel: t('toolbar.settings'),
    dropdownId: 'my-dropdown',
    items: [
        { id: 'item-1', content: 'Option 1' },
        { id: 'item-2', content: 'Option 2' },
    ],
})

// In useEffect:
useEffect(() => {
    return useDropdown({
        buttonId: 'my-btn',
        dropdownId: 'my-dropdown',
        openClass: dropdownStyles.dropdown_open,
        align: 'right',
        itemHandlers: {
            'item-1': () => doSomethingA(),
            'item-2': () => doSomethingB(),
        },
    });
});
```

---

## Static assets

Static assets (images, icons, favicon) must be placed in `public/`.
Files outside `public/` are not copied to `dist/` unless imported as modules.

Reference public assets in JS/TS:

```ts
// Use import.meta.env.BASE_URL — set once in AppState (main.ts) and passed as prop
src="${baseUrl}assets/icons/pomodoro.svg"
```

Reference public assets in `index.html`:

```html
<link rel="icon" href="/assets/icons/favicon.ico" />
```

---

## Build targets

| Script | Base URL | Target |
|---|---|---|
| `pnpm build` | `/` | nginx / Docker |
| `pnpm build:gh-pages` | `/pomodoro-tracker/` | GitHub Pages |

`import.meta.env.BASE_URL` is read only in `main.ts` and stored in `AppState.baseUrl`.

---

## localStorage

State key: `pomodoro:state`. Saves are throttled to 1 s.

```ts
const storage = new LocalStorage('pomodoro');
storage.setItem<AppState>('state', state);
storage.getItem<AppState>('state');
```

Loaded state is validated with `validateAppState()` before use — returns `null` on
invalid schema, triggering a fresh default state.

---

## Timer engine

`ActiveTaskController` manages the Pomodoro cycle:

- 25 min task → 5 min short break → repeat × 4 → 15 min long break
- Uses `setInterval` (1 s), compensates for missed ticks via `performance.now()`
- Emits `tick` (remaining ms), `completed`, `idle` via `EventBus`

Idle state is `{ type: Undefined, status: Undefined }` — **not** `null`.
`!activeTask` never fires in store code; check `activeTask.type` instead.

---

## e2e tests

- All selectors and text constants live in `tests/e2e/constants.ts` — import from there, never hardcode in specs.
- `beforeEach`: `goto('/') → localStorage.clear() → reload()`
- Use `page.clock.install()` only in specs that need fake time.
- Dropdown closed state: `aria-expanded="false"` on the trigger button.
- Archive CSS animation delay: 1.1 s before `archiveTask` fires.
- Mobile layout: set viewport + `page.reload()` in a nested `beforeEach`.

---

## Commit message convention

```
[Prefix] Short imperative summary (≤72 chars)
```

| Prefix | When |
|---|---|
| `[BugFix]` | Fixes incorrect behaviour |
| `[Feature]` | New user-facing functionality |
| `[Refactoring]` | Code restructure, no behaviour change |
| `[Style]` | CSS / visual only |
| `[Doc]` | Documentation only |
| `[Test]` | Tests only |
| `[Chore]` | Tooling, config, deps, CI |
