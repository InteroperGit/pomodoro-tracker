# E2E Test 02 — Timer Controls

**File**: `tests/e2e/timerControls.spec.ts`
**Scope**: Timer display, start / pause / resume / stop / done / skip button labels and behaviour

## What Is Being Tested

The Timer component UI: what it shows in each state (no tasks, idle, pending, active, paused),
how the control buttons are labeled, and that clicking them transitions the display correctly.
Actual countdown accuracy is NOT tested here (covered in test_03). These tests focus on
the button labels, timer text, and DOM state changes.

## Setup

```ts
import { test, expect } from '@playwright/test';

async function addTask(page, category = 'Work', description = 'Test task') {
    await page.getByPlaceholder('Категория').fill(category);
    await page.getByPlaceholder('Описание').fill(description);
    await page.getByPlaceholder('Описание').press('Enter');
}

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});
```

## Test Cases

### Empty states

- **shows "no plan tasks" empty state when plan is empty**
  - Load the page with no tasks.
  - Assert an element with text "Нет задач в плане" is visible in the timer section.

- **shows "no active task" empty state after all tasks are archived**
  - Add a task, archive it via plan dropdown.
  - Assert an element with text "Нет активной задачи" is visible in the timer section.

### Pending state (task added, not started)

- **timer shows "25:00" when a task is added**
  - Add one task.
  - Assert the timer display reads "25:00".

- **task description appears below the timer**
  - Add a task with description "Write tests".
  - Assert "Write tests" is visible in the timer section.

- **left button label is "СТАРТ" when pending**
  - Add a task.
  - Assert a button with text "СТАРТ" is visible.

- **right button "СТОП" is disabled when pending**
  - Add a task.
  - Assert the "СТОП" button is visible and has the `disabled` attribute.

### Active state (timer running)

- **clicking СТАРТ starts the timer and changes left button to ПАУЗА**
  - Add a task, click "СТАРТ".
  - Assert the left button now reads "ПАУЗА".

- **clicking СТАРТ enables the right СТОП button**
  - Add a task, click "СТАРТ".
  - Assert the "СТОП" button is not disabled.

- **timer display is still "25:00" immediately after clicking СТАРТ**
  - Add a task, click "СТАРТ".
  - Assert the timer still reads "25:00" (first tick hasn't fired).

### Paused state

- **clicking ПАУЗА changes left button to ПРОДОЛЖИТЬ**
  - Add a task, click "СТАРТ", click "ПАУЗА".
  - Assert the left button reads "ПРОДОЛЖИТЬ".

- **clicking ПАУЗА changes right button to СДЕЛАНО**
  - Add a task, click "СТАРТ", click "ПАУЗА".
  - Assert the right button reads "СДЕЛАНО".

- **timer display does not change while paused**
  - Add a task, start and immediately pause.
  - Wait 2 seconds.
  - Assert the timer still reads "25:00" (no ticks during pause).

### Resume from pause

- **clicking ПРОДОЛЖИТЬ changes left button back to ПАУЗА**
  - Add a task, start → pause → click "ПРОДОЛЖИТЬ".
  - Assert the left button reads "ПАУЗА".

- **clicking ПРОДОЛЖИТЬ changes right button back to СТОП**
  - Add a task, start → pause → resume.
  - Assert the right button reads "СТОП".

### Stop (reset to pending)

- **clicking СТОП while active resets timer to "25:00"**
  - Add a task, click "СТАРТ", click "СТОП".
  - Assert the timer reads "25:00".

- **clicking СТОП changes left button back to СТАРТ**
  - Add a task, start → stop.
  - Assert the left button reads "СТАРТ".

- **clicking СТОП disables the right button again**
  - Add a task, start → stop.
  - Assert the right "СТОП" button is disabled.

### Complete task (СДЕЛАНО while paused)

- **clicking СДЕЛАНО removes the task from the plan**
  - Add one task, start → pause → click "СДЕЛАНО".
  - Assert the plan list is empty (or shows empty state).

- **clicking СДЕЛАНО adds the task to the archive**
  - Add one task, start → pause → click "СДЕЛАНО".
  - Assert the archive section contains a row for that task.

### Break controls

- **break shows correct initial time**
  - Add two tasks, start and complete the first (СДЕЛАНО).
  - Assert the timer shows the short break duration (default "05:00").

- **left button during an active break reads "ПАУЗА"**
  - Trigger a short break (complete a task with another in plan).
  - Assert the left button reads "ПАУЗА".

- **right button during a break reads "ПРОПУСТИТЬ"**
  - Trigger a short break.
  - Assert the right button reads "ПРОПУСТИТЬ".

- **ПРОПУСТИТЬ on a break skips to the next task and restores "25:00"**
  - Add two tasks, trigger a short break (complete first task), click "ПРОПУСТИТЬ".
  - Assert the timer reads "25:00" and the left button reads "СТАРТ".

- **ПРОПУСТИТЬ while break is paused also skips**
  - Trigger short break, pause it, click "ПРОПУСТИТЬ".
  - Assert the timer returns to task state.

## Selectors Reference

```
Timer display:         page.getByRole('timer')                     // [role="timer"] element
Left button (СТАРТ):   page.getByRole('button', { name: 'СТАРТ' })
Left button (ПАУЗА):   page.getByRole('button', { name: 'ПАУЗА' })
Left button (ПРОД…):   page.getByRole('button', { name: 'ПРОДОЛЖИТЬ' })
Right button (СТОП):   page.getByRole('button', { name: 'СТОП' })
Right button (СДЕЛАНО):page.getByRole('button', { name: 'СДЕЛАНО' })
Right button (ПРОПУСК):page.getByRole('button', { name: 'ПРОПУСТИТЬ' })
Empty state (timer):   page.getByText('Нет задач в плане')
                       page.getByText('Нет активной задачи')
```

## Notes

- Use `page.clock.install()` to freeze the clock so the interval never fires unless
  explicitly advanced. This prevents flaky timing in tests that check "25:00 immediately
  after start".
- The "СТОП" and "СДЕЛАНО" share the same right-button slot — only one is rendered at a time.
- The short break default is 5 minutes. Set `VITE_SHORT_BREAK_TIME_MIN=0.1` in the test
  environment (or use `page.clock`) to make break tests run faster.
