# Task 06 — Handle Page Visibility Changes in the Timer

**Category**: UX / Architecture
**Priority**: Medium
**Effort**: Small–Medium
**Phase**: 2 — Reliability & Correctness

## Problem

The `ActiveTaskController._startTimer()` method uses `setInterval` with `performance.now()` drift compensation. However, there is no `visibilitychange` event handler in the codebase.

When the browser tab is hidden, most browsers throttle `setInterval` to fire at most once per second or less. When the tab becomes visible again, the drift compensation correctly computes the elapsed time from `_lastTime`, but there is a window between the tab becoming visible and the next `setInterval` tick where the displayed countdown is stale.

More importantly, if the timer completes while the tab is hidden, the `completed` event fires correctly on the next tick, but the user is not looking at the tab and receives no notification.

## Solution

### Part A — Snap Timer Display on Tab Focus (Small)
1. Add `document.addEventListener("visibilitychange", ...)` in `main.ts` or `ActiveTaskController`.
2. When the tab becomes visible (`document.visibilityState === "visible"`), if a timer is active, immediately compute elapsed time since `_lastTime`, apply it to `restTime`, and emit a `tick` event to update the display without waiting for the next interval.

### Part B — Web Notifications for Completed Pomodoros (Medium)
1. Request `Notification.requestPermission()` on first user interaction (e.g., when starting the first task).
2. In `ActiveTaskController`, when the `completed` event fires and `document.hidden === true`, fire a `new Notification(...)` with the appropriate message (task done / break done).
3. Handle permission denial gracefully — fall back to the existing in-app toast only.

## Files Likely Affected

- `src/app/main.ts` — add `visibilitychange` handler
- `src/app/ActiveTaskController.ts` — expose method to snap timer state
- `src/app/appContext.ts` — wire notification permission request to an action

## Expected Benefit

Users see the correct remaining time immediately on returning to the tab. Completed pomodoros are not silently missed when the tab is not in focus, matching standard Pomodoro app behavior.
