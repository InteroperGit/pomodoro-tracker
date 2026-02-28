# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

The entire application lives under `src/apps/web/pomodoro_client/`. All commands below must be run from that directory.

```
src/apps/web/pomodoro_client/
├── src/
│   ├── app/             # Entry point, context, timer controller
│   ├── components/      # UI components (each in its own folder)
│   ├── constants/       # Initial state
│   ├── css/             # Global styles and themes
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Shared utilities
```

## Commands

All commands run from `src/apps/web/pomodoro_client/` using pnpm:

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + bundle (tsc && vite build)
pnpm typecheck    # TypeScript check only (no emit)
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm preview      # Preview production build
```

There are no tests in this project.

## Commit Message Convention

Use a bracketed prefix to classify every commit:

| Prefix | When to use |
|--------|-------------|
| `[BugFix]` | Fixes a defect or incorrect behaviour |
| `[Feature]` | Adds new user-facing functionality |
| `[Refactoring]` | Restructures code without changing behaviour |
| `[Style]` | Visual / CSS changes only |
| `[Doc]` | Documentation updates only |
| `[Chore]` | Tooling, config, dependencies, CI |

Format:
```
[Prefix] Short imperative summary (≤72 chars)

Optional body explaining the why, not the what. Wrap at 72 chars.
```

## Architecture

### Custom Reactive Framework

This app does **not** use React, Vue, or any UI framework. It implements its own minimal reactive system:

**Rendering** (`src/utils/render.ts`):
- Components are plain TypeScript functions that return HTML strings.
- `render(root, App, ctx)` sets `root.innerHTML`, then runs queued mount effects. Cleanup functions from the previous render are called before the next one.
- `useEffect(fn)` registers a side-effect to run after the current render. If it returns a function, that function is called as cleanup on the next render.

**State** (`src/utils/store.ts`):
- `createStore<S>(initial)` returns `{ getState, setState, subscribe }`.
- Every `setState` notifies all subscribers, triggering a full re-render.

### App Context (`src/app/appContext.ts`)

`createContext(initialState, onTickCallback, onPomodoroCallback)` wires together the store and `ActiveTaskController`. It exposes `{ store, actions }`.

A global singleton is registered via `registerContext(ctx)` and accessed by the `use*` hook-style functions (e.g. `useStartTask()`, `useAddTask(task)`, `useSetTheme(theme)`). These functions are imported directly by components; they do not take the context as an argument.

### Timer Engine (`src/app/ActiveTaskController.ts`)

`ActiveTaskController` manages the Pomodoro cycle:
- **Timing**: 25 min task / 5 min short break / 15 min long break / long break after every 4 pomodoros.
- Uses `setInterval` (1 s tick). Compensates for missed ticks using `performance.now()`.
- Emits three events via `EventBus`: `tick` (with remaining ms), `completed`, `idle`.
- `activateNextTask(planTasks, preferTask?)` drives phase transitions: task → short break → long break → idle.

### Persistence

State is serialized to `localStorage` under the key `pomodoro:state`. Saves are throttled to 1 s to avoid excessive writes during timer ticks.

### Components

Each component is a folder under `src/components/` containing:
- An `index.ts` exporting a function `ComponentName(props): string`.
- One or more `*.module.scss` files for scoped styles (CSS Modules via Vite).

Components are pure render functions — they do not hold internal state. State lives in the global store and is passed as props. Side effects (event listeners, etc.) use `useEffect`.

### Styling

- CSS Modules (`.module.scss`) for component-scoped styles.
- Global CSS custom properties define the design tokens in `src/css/default_theme.css` and `src/css/dark_theme.css`.
- Dark mode is toggled by adding/removing the `theme-dark` class on `<html>`.

### Code Style

- Always use curly braces for `if`, `else`, `for`, and `while` blocks. Always place the body on the next line — never inline. Example: `if (x) { return; }` is wrong; use:
  ```ts
  if (x) {
      return;
  }
  ```

### TypeScript Config

Strict mode is on with `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`, and `erasableSyntaxOnly`. Import paths must include the `.ts` extension (`allowImportingTsExtensions: true`). No `any` types allowed (ESLint rule `@typescript-eslint/no-explicit-any: error`).
