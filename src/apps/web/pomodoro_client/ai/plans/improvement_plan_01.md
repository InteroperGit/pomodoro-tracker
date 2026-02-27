# Pomodoro Client — Improvement Plan

## Summary

The Pomodoro client is a well-structured, framework-free TypeScript application with a clean custom reactive system, strict typing, and CSS Modules theming. Its primary weaknesses are an event-listener leak in the timer tick subscription that silently worsens over time, a monolithic `appContext.ts` that will become a maintenance bottleneck, a complete absence of tests or CI, stale computed statistics, and several accessibility gaps including a broken HTML `lang` attribute and disabled user zoom. The improvement strategy is to fix the silent runtime defect first, then split the monolith, introduce targeted testing, and address UX/accessibility issues.

---

## Phase 1 — Fix Silent Runtime Defects (Highest Priority)

### 1. Fix Timer Tick Listener Leak
**Category**: Architecture / Code Quality | **Priority**: High | **Effort**: Small

**Problem**: Every render, the `Timer` component registers a new `tick` handler via `registerTimerTickEventListener` but never removes the old one (`EventBus.removeEventListener` is never called). After many renders, dozens of stale handlers fire on every tick, wasting CPU and potentially causing stale-closure bugs.

**Solution**:
1. Change `AppActions.registerTimerTickEventListener` to return an `Unsubscribe` function.
2. Expose a `removeEventListener` path from `ActiveTaskController`.
3. Update the `Timer` component's `useEffect` cleanup to call the returned unsubscribe.

**Expected Benefit**: Timer tick callbacks execute exactly once per tick regardless of how many renders have occurred. Prevents potential future stale-closure state corruption.

---

### 4. Fix Stale Computed Statistics
**Category**: Architecture / Performance | **Priority**: Medium | **Effort**: Small

**Problem**: `getPlanTasksStatistics` stores `finishTime` as an absolute `Date.now()` timestamp inside state (and localStorage). This value goes stale immediately after it is computed — a re-render without a state change, or loading the app the next day, will display an incorrect finish time.

**Solution**:
1. Remove `finishTime` and `nextLongBreak` from `PlanPomodoroTasksStatistics` and from localStorage serialization.
2. Replace with `totalRemainingTime: number` (pure duration in ms).
3. Compute the display timestamp at render time: `Date.now() + totalRemainingTime`.

**Expected Benefit**: Statistics are always accurate at render time. Removes a class of subtle "finish time is in the past" display bugs.

---

## Phase 2 — Reliability & Correctness

### 5. Add Runtime State Schema Validation on localStorage Restore
**Category**: Architecture / Security | **Priority**: Medium | **Effort**: Small

**Problem**: `localStorage.getItem` does an unchecked `JSON.parse(item) as T` cast. If persisted state was written by an older app version with a different `AppState` shape, the cast succeeds silently and the app proceeds with a structurally invalid object, causing runtime crashes.

**Solution**:
1. Write `validateAppState(raw: unknown): AppState | null` in `src/utils/stateSchema.ts` with explicit structural checks.
2. Call it in `main.ts` instead of the unchecked cast.
3. On validation failure, fall back to `getInitPlanTasks()` / `getInitArchiveTasks()`.

**Expected Benefit**: Eliminates a class of runtime crashes from stale or corrupted persisted state. Makes future schema changes safe to deploy.

---

### 6. Handle Page Visibility Changes in the Timer
**Category**: UX / Architecture | **Priority**: Medium | **Effort**: Small–Medium

**Problem**: No `visibilitychange` event handler exists. When the browser tab is hidden and shown again, the countdown display is stale until the next `setInterval` tick. If a pomodoro completes while the tab is hidden, the completion notification is silently missed.

**Solution**:
1. Add a `visibilitychange` handler in `main.ts` or `ActiveTaskController`.
2. When the tab becomes visible, immediately compute elapsed time since `_lastTime` and emit a `tick` event to snap the display to the correct value.
3. Optionally use the Web Notifications API to surface completed pomodoros while the tab is hidden.

**Expected Benefit**: Users see the correct remaining time immediately on returning to the tab. Completed pomodoros are not silently missed.

---

### 7. Fix Accessibility Gaps
**Category**: UX / Accessibility | **Priority**: Medium | **Effort**: Small

**Problem**: Several accessibility issues are present:
1. `<html lang="en">` but all UI text is in Russian — screen readers use wrong pronunciation engine.
2. `user-scalable=0` in the viewport meta tag violates WCAG 2.1 SC 1.4.4 (Resize Text, Level AA).
3. `aria-live="polite"` on the timer countdown fires ~1500 announcements per 25-minute session.
4. Typo in aria-label: `"Количество помодоро"` should be `"помидоро"`.

**Solution**:
1. Change `<html lang="en">` to `<html lang="ru">` in `index.html`.
2. Remove `user-scalable=0` from the viewport meta tag.
3. Change the countdown to `aria-live="off"` and update a visually-hidden `aria-live="polite"` element only at key moments (start, pause, every 5 minutes, completion).
4. Fix the typo in all aria-labels.

**Expected Benefit**: Correct screen reader pronunciation, WCAG compliance, elimination of 1500 announcements per session, correct semantic labeling.

---

## Phase 3 — Testing & Developer Experience Infrastructure

### 3. Introduce a Testing Strategy (Vitest)
**Category**: Testing | **Priority**: High | **Effort**: Medium

**Problem**: There are no tests of any kind. The most complex logic — `ActiveTaskController` phase transitions, `getPlanTasksStatistics` (time-dependent), and the `render` / `useEffect` lifecycle — has no regression coverage. A change to cleanup ordering or phase transition logic can break everything silently.

**Solution**:
1. Add Vitest (`pnpm add -D vitest`) — integrates with Vite config with zero extra configuration.
2. Write unit tests for `ActiveTaskController`: start → pause → resume → complete, long break after 4 pomodoros, empty plan → idle.
3. Write unit tests for `statistics.ts` using `vi.useFakeTimers()`.
4. Write unit tests for pure utilities: `sanitizeActiveTask`, `escapeHtml`, `throttle`, `generateId`.
5. Write integration tests for `createStore` + `render()` by mounting to a `document.createElement("div")`.
6. Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to `package.json`.

**Expected Benefit**: Regression safety for the timer engine. Provides a foundation to add coverage alongside future features without restructuring the testing setup.

---

### 8. Add CI Pipeline
**Category**: Developer Experience | **Priority**: Medium | **Effort**: Small

**Problem**: No CI configuration exists. Contributors can push code that fails TypeScript compilation or ESLint rules without any automatic feedback.

**Solution**:
1. Add a GitHub Actions workflow at `.github/workflows/ci.yml`.
2. Jobs: `typecheck` (`pnpm typecheck`), `lint` (`pnpm lint`), `build` (`pnpm build`), `test` (`pnpm test`).
3. Trigger on `push` and `pull_request` to `main`.
4. Cache `node_modules` using the pnpm cache action.

**Expected Benefit**: Broken builds caught immediately on push. TypeScript errors from refactoring surfaced before merging.

---

## Phase 4 — Structural Improvements

### 2. Split `appContext.ts` into Focused Modules
**Category**: Architecture / Code Quality | **Priority**: High | **Effort**: Medium

**Problem**: `src/app/appContext.ts` is 746 lines serving three entirely different responsibilities: context wiring, all 15 action implementations, and 20+ hook-style re-export functions. Any action change requires navigating a 746-line file.

**Solution**:
1. Extract action implementations into `src/app/actions/taskActions.ts`, `timerActions.ts`, and `themeActions.ts`.
2. Keep `createContext` in `appContext.ts` for wiring only — composing the action slices.
3. Move hook-style functions to `src/app/hooks.ts`.
4. Move `applyTheme` to `src/utils/theme.ts`.

**Expected Benefit**: Each action file becomes 50–100 lines. Changes to timer logic don't require opening the same file as task management logic. Easier onboarding for new contributors.

---

## Phase 5 — Polish

### 9. Align CSS Custom Properties Across Themes
**Category**: Code Quality / UX | **Priority**: Low | **Effort**: Small

**Problem**: `dark_theme.css` defines `--text-primary` and `--text-secondary` that have no counterpart in `default_theme.css`. Any component using `var(--text-primary)` will get `unset` in light mode, potentially rendering text invisible.

**Solution**:
1. Audit all `.module.scss` files for `var(--*)` usage to build a complete list of required properties.
2. Add all missing variables to `default_theme.css` with light-mode values.
3. Ensure `dark_theme.css` overrides every variable defined in `default_theme.css`.
4. Add brief comments above each variable group explaining its semantic role.

**Expected Benefit**: No light-mode component can accidentally use an undefined variable. Adding a third theme only requires one CSS file with the known variable set.

---

### 10. Decouple `isMobile` from Prop Drilling
**Category**: Architecture / Performance | **Priority**: Low | **Effort**: Small

**Problem**: `isMobile` is computed on every render and prop-drilled through 4 component levels (`App` → `Timer`, `PlanTasks`, `ArchiveTasks` → `PlanTask`, `ArchiveTask`). `onLayoutChanged` also manually calls `render()` with a fragile `hasActiveInput()` workaround.

**Solution**:
1. Add `isMobile: boolean` to `AppState`.
2. On breakpoint change, call `store.setState({ ...s, isMobile: newValue })` — this triggers the normal re-render lifecycle.
3. Remove the manual `render()` call and `hasActiveInput()` guard from `onLayoutChanged`.
4. Components read `isMobile` from the state object instead of accepting it as a prop.

**Expected Benefit**: `isMobile` participates in the standard state-driven lifecycle. The `hasActiveInput` workaround is eliminated. Prop-drilling through the entire component tree is removed.

---

## Implementation Roadmap

| Phase | Items | Goal |
|-------|-------|------|
| 1 | #1, #4 | Fix silent runtime defects with highest impact-to-effort ratio |
| 2 | #5, #6, #7 | Reliability, crash prevention, and accessibility compliance |
| 3 | #3, #8 | Testing foundation and CI enforcement |
| 4 | #2 | Structural refactor (safe to do after tests exist) |
| 5 | #9, #10 | Polish: theme consistency and architectural cleanliness |
