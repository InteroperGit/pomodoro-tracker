# Task 10 — Decouple `isMobile` from Prop Drilling

**Category**: Architecture / Performance
**Priority**: Low
**Effort**: Small
**Phase**: 5 — Polish

## Problem

`isMobile` is computed on every render and prop-drilled through 4 levels of components:

```
App → Timer, PlanTasks, ArchiveTasks → PlanTask, ArchiveTask
```

Every intermediate component must thread `isMobile` even if it does not use it directly. Additionally, `onLayoutChanged` in `main.ts` manually calls `render(root, App, ctx)` with a fragile `hasActiveInput()` guard — a workaround that duplicates the existing state-driven re-render mechanism.

## Problem Details

- `isMobile` is recomputed from `window.innerWidth` on every render rather than being treated as state.
- `onLayoutChanged` calls `render()` directly, bypassing the standard `store.setState → subscriber → render` flow.
- The `hasActiveInput()` guard is a heuristic that may not cover all focus cases (e.g., custom focus traps).

## Solution

1. Add `isMobile: boolean` to the `AppState` type in `src/types/`.
2. Initialize it in `getInitState()` using `window.innerWidth < 768`.
3. In `onLayoutChanged` (in `main.ts`), replace the manual `render()` call with `store.setState({ ...store.getState(), isMobile: newValue })` — this triggers the normal subscriber → re-render lifecycle.
4. Remove the `hasActiveInput()` guard and the manual `render()` call from `onLayoutChanged`.
5. In `App.ts`, read `isMobile` from `ctx.store.getState()` instead of computing it from `window.innerWidth`.
6. Remove `isMobile` from all component prop signatures and read it from state where needed.

## Files Likely Affected

- `src/types/` — add `isMobile` to `AppState`
- `src/constants/` — initialize `isMobile` in init state
- `src/app/main.ts` — update `onLayoutChanged`, remove manual `render()` call
- `src/app/App.ts` — read `isMobile` from state
- `src/components/Timer/index.ts` — remove `isMobile` prop
- `src/components/PlanTasks/index.ts` — remove `isMobile` prop
- `src/components/ArchiveTasks/index.ts` — remove `isMobile` prop
- `src/components/PlanTask/index.ts` — remove `isMobile` prop
- `src/components/ArchiveTask/index.ts` — remove `isMobile` prop

## Expected Benefit

`isMobile` participates in the standard state-driven render lifecycle. The `hasActiveInput` workaround and the second `render()` call in `main.ts` are eliminated. Prop-drilling of `isMobile` through the entire component tree is removed.
