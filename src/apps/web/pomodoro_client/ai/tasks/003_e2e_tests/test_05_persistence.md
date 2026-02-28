# E2E Test 05 — State Persistence

**File**: `tests/e2e/persistence.spec.ts`
**Scope**: localStorage save / restore — all state survives a hard page reload

## What Is Being Tested

The app serialises its state to `localStorage` under the key `pomodoro:state` and restores
it on the next load. This test suite verifies that every user-visible piece of state is
round-tripped correctly: plan tasks (content, count, order), archive tasks, active timer
state, theme, and statistics. It also verifies that corrupted or missing storage is handled
gracefully (the app loads with a blank slate rather than crashing).

## Setup

```ts
import { test, expect } from '@playwright/test';

async function addTask(page, category = 'Work', description = 'Test task') {
    await page.getByPlaceholder('Категория').fill(category);
    await page.getByPlaceholder('Описание').fill(description);
    await page.getByPlaceholder('Описание').press('Enter');
}

async function reload(page) {
    await page.reload();
    // Wait for the app to finish rendering after reload
    await page.waitForSelector('body');
}

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});
```

## Test Cases

### Plan tasks survive reload

- **task description is visible after reload**
  - Add "Work" + "Write tests".
  - Reload the page.
  - Assert "Write tests" is visible in the plan list.

- **task category is visible after reload**
  - Add "Dev" + "Fix bug".
  - Reload.
  - Assert "Dev" is visible in the plan list.

- **task count (> 1) is preserved after reload**
  - Add a task, increment count to 3.
  - Reload.
  - Assert the count badge shows "3".

- **task order is preserved after reload**
  - Add "Task C", "Task B", "Task A" (plan order A, B, C).
  - Reload.
  - Assert the list order is still A, B, C.

- **plan statistics are preserved after reload**
  - Add two tasks (tasksCount = 2).
  - Reload.
  - Assert the plan statistics still show tasksCount = 2.

### Archive tasks survive reload

- **archived task description is visible after reload**
  - Add and archive "Old task".
  - Reload.
  - Assert "Old task" is visible in the archive section.

- **archived task category is visible after reload**
  - Add "QA" + "Review PR", archive it.
  - Reload.
  - Assert "QA" is visible in the archive row.

- **archive tasksCount statistic is preserved after reload**
  - Archive 2 tasks.
  - Reload.
  - Assert archive statistics show tasksCount = 2.

- **archive completedAt timestamp is preserved (same time shown)**
  - Archive a task, note the completion time displayed.
  - Reload.
  - Assert the same completion time is displayed after reload.

### Active task state survives reload

- **activeTask in Pending state is restored (timer shows task duration)**
  - Add a task (it starts as Pending, showing "25:00").
  - Reload.
  - Assert the timer still reads "25:00".

- **activeTask in Active state is restored (timer resumes)**
  - Add a task, click "СТАРТ".
  - Reload.
  - Assert the left button reads "ПАУЗА" (task was Active and is restored as running).
  - Assert the timer display is at or below "25:00" (restTime preserved).

- **activeTask in Paused state is restored**
  - Add a task, start → pause.
  - Reload.
  - Assert the left button reads "ПРОДОЛЖИТЬ".
  - Assert the right button reads "СДЕЛАНО".

- **restTime is preserved across reload (timer doesn't reset)**
  - Add a task, start it, let 5 seconds pass (use `page.clock` or a short delay),
    then pause.
  - Note the displayed time (should be less than "25:00").
  - Reload.
  - Assert the timer shows the same reduced time (not "25:00").

### Theme preference survives reload

- **dark theme is restored after reload**
  - Open settings, click "Тёмная тема" to enable dark mode.
  - Reload.
  - Assert the `<html>` element has the `theme-dark` class (or the page looks dark).
  - Assert the settings dropdown still shows the theme as active.

- **light theme (default) is preserved after reload**
  - Ensure light theme is active, reload.
  - Assert the `<html>` element does NOT have the `theme-dark` class.

### Multiple tasks — full state snapshot

- **complex state round-trips correctly**
  - Add 3 tasks, increment one count to 2, archive one.
  - Note plan and archive counts before reload.
  - Reload.
  - Assert plan count, archive count, and task descriptions all match the pre-reload state.

### Corrupted or missing storage

- **app loads cleanly when localStorage is empty**
  - Clear localStorage, reload.
  - Assert the plan shows the empty-state placeholder (no crash, no blank screen).

- **app loads cleanly when localStorage contains invalid JSON**
  - Set `localStorage.setItem('pomodoro:state', 'not json')`, reload.
  - Assert the app renders correctly with an empty plan.

- **app loads cleanly when localStorage contains a partial / corrupt state object**
  - Set `localStorage.setItem('pomodoro:state', JSON.stringify({ planTasks: null }))`, reload.
  - Assert the app renders correctly with an empty plan.

## Selectors Reference

```
Plan list first item:  page.getByRole('listitem').first()
Count badge:           within a plan task item, element showing the numeric count
Timer display:         page.getByRole('timer')
Left button:           page.getByRole('button', { name: 'ПАУЗА' }) etc.
Theme check:           page.locator('html').getAttribute('class')
Archive rows:          page.locator('[data-testid="archive-task-row"]') (add this attr)
Archive stats count:   page.getByText(/Выполнено помидоров:/).locator('+ *')
                       or data-testid on the value element
```

## Notes

- The app throttles localStorage writes to 1 second. In tests, wait at least 1 second after
  making a state change before reloading, OR call `await page.waitForFunction(...)` to
  confirm the key is written.
  Alternatively, force-flush by calling `window.dispatchEvent(new Event('beforeunload'))` if
  the app listens to that event, or expose a test-only flush helper.
- A simpler approach: `await page.evaluate(() => new Promise(r => setTimeout(r, 1100)))`
  before `page.reload()` to ensure the throttled save has fired.
- `page.clock.install()` is NOT used here so real time passes and the save throttle fires
  naturally. If needed, call `page.clock.install({ now: Date.now() })` and then
  `page.clock.runFor(1100)` to advance past the throttle without waiting in real time.
- The storage key is `pomodoro:state`. Verify this in `src/app/` (look for the persistence
  subscribe call) before writing the corruption tests.
