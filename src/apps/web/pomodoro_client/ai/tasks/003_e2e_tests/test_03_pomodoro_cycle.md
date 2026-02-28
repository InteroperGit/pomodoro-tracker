# E2E Test 03 — Automatic Pomodoro Cycle

**File**: `tests/e2e/pomodoroCycle.spec.ts`
**Scope**: Full timer countdown → auto-archive → break → next task → long break → idle flow

## What Is Being Tested

The automatic transitions driven by the real timer: task countdown reaches zero → task is
archived automatically → short break auto-starts → break countdown reaches zero → next task
activates → after four pomodoros a long break fires → when no tasks remain the timer goes
idle. All timing is controlled via Playwright's built-in fake clock so tests run in
milliseconds.

## Setup

```ts
import { test, expect } from '@playwright/test';

// Use short durations via env vars to avoid advancing the clock by 25 minutes.
// In playwright.config.ts set:
//   env: { VITE_TASK_TIME_MIN: '0.017', VITE_SHORT_BREAK_TIME_MIN: '0.017',
//           VITE_LONG_BREAK_TIME_MIN: '0.017', VITE_LONG_BREAK_AFTER: '4' }
// 0.017 minutes ≈ 1 second — sufficient for clock-based tests.

async function addTask(page, description = 'Task') {
    await page.getByPlaceholder('Категория').fill('Work');
    await page.getByPlaceholder('Описание').fill(description);
    await page.getByPlaceholder('Описание').press('Enter');
}

// Completes the currently active task by letting the clock run past its duration.
async function runTimerToCompletion(page) {
    await page.clock.runFor(2000); // advance 2 s; task time is ~1 s in test env
}

test.beforeEach(async ({ page }) => {
    await page.clock.install(); // freeze real time; control manually
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});
```

## Test Cases

### Timer countdown

- **timer counts down after clicking СТАРТ**
  - Add a task, click "СТАРТ".
  - Advance clock by 1 second.
  - Assert the timer display has decreased from its initial value (e.g., changes from
    "00:01" to "00:00" when task time is 1 s, or shows a smaller value).

- **timer shows "00:00" just before completing**
  - Add a task, start it, advance clock to just before task duration.
  - Assert the timer reads "00:00" (last tick before completion).

### Task → Short Break transition

- **task auto-archives when countdown finishes**
  - Add two tasks, start the first, let the clock run past task duration.
  - Assert the archive section contains one entry.
  - Assert the plan list has one fewer task.

- **short break auto-starts after task completes**
  - Add two tasks, start and let the first run to completion.
  - Assert the timer is no longer "25:00" — it shows the break duration ("05:00" or the
    test-env equivalent).
  - Assert no "СТАРТ" button is visible (break is already Active).

- **short break shows "ПАУЗА" and "ПРОПУСТИТЬ" buttons**
  - Trigger a short break via timer completion.
  - Assert the left button reads "ПАУЗА" and the right reads "ПРОПУСТИТЬ".

- **timer section title / description changes to "Короткий перерыв"**
  - Trigger a short break.
  - Assert the text "Короткий перерыв" is visible in the timer section.

### Short Break → Next Task transition

- **next task activates after break countdown finishes**
  - Add two tasks, complete the first (auto-break), let the break run to completion.
  - Assert the timer reads the task duration again ("25:00" or test-env equivalent).
  - Assert the left button reads "СТАРТ".
  - Assert the second task's description is visible in the timer section.

- **next task is in Pending state (not auto-started)**
  - After the break ends, assert the left button reads "СТАРТ" (not "ПАУЗА"),
    confirming the next task must be started manually.

### Long break after 4 pomodoros

- **long break activates after the 4th completed task**
  - Add 5 tasks. Complete 4 full pomodoro cycles (each: start task → clock to completion →
    break → clock to completion). Start and complete the 5th task.
  - Assert the timer shows the long break duration ("15:00" or test-env equivalent).
  - Assert the text "Длинный перерыв" is visible in the timer section.

- **long break auto-starts as Active**
  - After the 4th task completes, assert the left button reads "ПАУЗА" (not "СТАРТ"),
    confirming the long break is already running.

- **task after long break starts with fresh shortBreakCount**
  - Complete the long break.
  - Start the 5th task and complete it.
  - Assert that the next break is a short break (not another long break).

### Idle state

- **timer shows idle state when last task completes and plan is empty**
  - Add one task (no others in plan), start it, let the clock run to completion.
  - Assert the timer section shows "Нет активной задачи" or an equivalent idle empty state.

- **idle state shows no timer buttons**
  - After reaching idle, assert neither "СТАРТ" nor "ПАУЗА" buttons are visible.

## Playwright Configuration Notes

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        env: {
            VITE_TASK_TIME_MIN: '0.017',        // ~1 second per task
            VITE_SHORT_BREAK_TIME_MIN: '0.017', // ~1 second short break
            VITE_LONG_BREAK_TIME_MIN: '0.017',  // ~1 second long break
            VITE_LONG_BREAK_AFTER: '4',
        },
    },
    use: { baseURL: 'http://localhost:5173' },
});
```

## Notes

- `page.clock.install()` freezes `Date`, `setTimeout`, `setInterval`, and
  `performance.now`. After `page.clock.install()`, Playwright controls time manually.
- `page.clock.runFor(ms)` advances fake time and triggers any pending intervals/timeouts.
- The app uses `setInterval` with a 1 s period + `performance.now` for drift compensation.
  When using `page.clock`, both are controlled together so the tick fires normally.
- The long break threshold of 4 short breaks means you need 5 tasks and 4 break cycles to
  trigger it. Each "cycle" = start task + runFor(task duration) + runFor(break duration).
- Use `await expect(page.getByRole('timer')).toHaveText(...)` for timer display assertions.
- Add `data-testid="timer-description"` to the task description element inside the Timer
  component to make description assertions stable.
