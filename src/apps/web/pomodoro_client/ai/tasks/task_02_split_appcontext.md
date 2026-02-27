# Task 02 — Split `appContext.ts` into Focused Modules

**Category**: Architecture / Code Quality
**Priority**: High
**Effort**: Medium
**Phase**: 4 — Structural Improvements

## Problem

`src/app/appContext.ts` is 746 lines and serves three entirely different responsibilities:
- Context creation and store/controller wiring (`createContext`, `registerContext`, `useContext`)
- All 15 action implementations (`addTask`, `incTask`, `decTask`, `archiveTask`, `startTask`, `pauseTask`, `stopTask`, `resumeTask`, `completeTask`, `reorderTasks`, `startEditTask`, `completeEditTask`, `cancelEditTask`, `refreshTask`, `setTheme`)
- 20+ hook-style re-export functions (`useAddTask`, `useStartTask`, etc.) that simply forward to `context.actions`

Any action change requires navigating a 746-line file. The hook re-exports duplicate the `AppActions` interface names verbatim, adding noise.

## Solution

1. Extract action implementations into:
   - `src/app/actions/taskActions.ts`
   - `src/app/actions/timerActions.ts`
   - `src/app/actions/themeActions.ts`
2. Keep `createContext` in `appContext.ts` for wiring only — composing the action slices.
3. Move hook-style functions to `src/app/hooks.ts`.
4. Move `applyTheme` to `src/utils/theme.ts`.

## Files Likely Affected

- `src/app/appContext.ts` — reduce to wiring only
- `src/app/actions/taskActions.ts` — new file
- `src/app/actions/timerActions.ts` — new file
- `src/app/actions/themeActions.ts` — new file
- `src/app/hooks.ts` — new file
- `src/utils/theme.ts` — new file

## Expected Benefit

Each action file becomes 50–100 lines. Changes to timer logic don't require opening the same file as task management logic. Easier onboarding for new contributors.

## Note

Best tackled after tests exist (Task 03) so the refactor can be verified against the test suite.
