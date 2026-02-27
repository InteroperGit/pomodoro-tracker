# Task 04 — Fix Stale Computed Statistics

**Category**: Architecture / Performance
**Priority**: Medium
**Effort**: Small
**Phase**: 1 — Fix Silent Runtime Defects

## Problem

`getPlanTasksStatistics` in `src/utils/statistics.ts` computes `finishTime` and `nextLongBreak` using `Date.now()` at the moment the function is called — i.e., at action dispatch time. These timestamps are then stored in the state object inside `planTasks.statistics` and serialized to `localStorage`.

Every time the app re-renders without a state change, the displayed finish time is the value computed potentially many minutes earlier. Worse, values loaded from `localStorage` on next visit will be stale by hours or days, showing a finish time in the past.

## Solution

1. Remove `finishTime` and `nextLongBreak` from `PlanPomodoroTasksStatistics` (and from localStorage serialization).
2. Replace them with `totalRemainingTime: number` (pure duration in ms, computed from task/break durations) and `longBreakThreshold: number`.
3. Compute display-ready timestamps at render time in the component: `Date.now() + state.planTasks.statistics.totalRemainingTime`.
4. Update `PlanTasksStatistics.ts` and `ArchiveTasksStatistics.ts` accordingly.

## Files Likely Affected

- `src/types/statistics.ts` — update `PlanPomodoroTasksStatistics` type
- `src/utils/statistics.ts` — change `getPlanTasksStatistics` to return duration instead of absolute timestamp
- `src/components/PlanTasksStatistics/index.ts` — compute display timestamp at render time
- `src/components/ArchiveTasksStatistics/index.ts` — same

## Expected Benefit

Statistics are always accurate at render time regardless of when state was last mutated. Removes a class of subtle "finish time is in the past" display bugs. localStorage persists only stable, version-agnostic data.
