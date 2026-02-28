# Task 03 — Introduce a Testing Strategy (Vitest)

**Category**: Testing
**Priority**: High
**Effort**: Medium
**Phase**: 3 — Testing & Developer Experience Infrastructure

## Problem

There are no tests of any kind. This is especially risky given:
- `ActiveTaskController` contains non-trivial phase-transition logic (`_determineNextPhase`, `shortBreakCount` tracking, long break after 4 pomodoros) that is entirely untested.
- `getPlanTasksStatistics` in `src/utils/statistics.ts` computes time-dependent values using `Date.now()`.
- `sanitizeActiveTask`, `escapeHtml`, `throttle`, and `generateId` are pure utilities suitable for unit tests.
- The `render` / `useEffect` lifecycle has no regression coverage.

## Solution

1. Add Vitest: `pnpm add -D vitest` — integrates with Vite config with zero extra configuration, supports TypeScript natively.
2. Write unit tests for `ActiveTaskController` covering:
   - `start → pause → resume → complete`
   - Long break triggering after `maxShortBreaksSerie`
   - `activateNextTask` with empty plan (idle)
   - Restoring from persisted active state
3. Write unit tests for `statistics.ts` using `vi.useFakeTimers()`.
4. Write unit tests for pure utilities: `sanitizeActiveTask`, `escapeHtml`, `throttle`, `generateId`.
5. Write integration tests for `createStore` + `render()` by mounting to `document.createElement("div")`.
6. Add scripts to `package.json`:
   - `"test": "vitest run"`
   - `"test:watch": "vitest"`

## Files Likely Affected

- `package.json` — add vitest dev dependency and test scripts
- `vite.config.ts` — add test config block if needed
- `src/app/ActiveTaskController.test.ts` — new file
- `src/utils/statistics.test.ts` — new file
- `src/utils/*.test.ts` — new files for pure utilities
- `src/utils/render.test.ts` — new file

## Expected Benefit

Regression safety for the timer engine's phase transitions (the most complex domain logic). Provides a foundation to add coverage alongside future features without restructuring the testing setup.
