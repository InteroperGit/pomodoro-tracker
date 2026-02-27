# Task 01 — Fix Timer Tick Listener Leak

**Category**: Architecture / Code Quality
**Priority**: High
**Effort**: Small
**Phase**: 1 — Fix Silent Runtime Defects

## Problem

Every render, the `Timer` component registers a new `tick` handler via `registerTimerTickEventListener` but never removes the old one (`EventBus.removeEventListener` is never called). After many renders, dozens of stale handlers fire on every tick, wasting CPU and potentially causing stale-closure bugs.

The root cause is that `registerTimerTickEventListener` in `AppActions` has no way to return an unsubscribe function — the action type is `void`. The `Timer` component's `useEffect` does return a cleanup, but that cleanup only removes button click listeners, not the tick subscription.

## Solution

1. Change `AppActions.registerTimerTickEventListener` to return an `Unsubscribe` function (type already exists in `src/utils/store.ts`).
2. Expose a `removeEventListener` path from `ActiveTaskController` / `EventBus`.
3. Update the `Timer` component's `useEffect` cleanup to call the returned unsubscribe.

## Files Likely Affected

- `src/app/appContext.ts` — change return type of `registerTimerTickEventListener`
- `src/app/ActiveTaskController.ts` — expose unsubscribe from `addEventListener`
- `src/components/Timer/index.ts` — call unsubscribe in `useEffect` cleanup

## Expected Benefit

Timer tick callbacks execute exactly once per tick regardless of how many renders have occurred. Prevents potential future stale-closure state corruption.
