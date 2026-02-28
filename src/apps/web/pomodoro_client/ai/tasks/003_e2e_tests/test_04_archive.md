# E2E Test 04 — Archive Management

**File**: `tests/e2e/archive.spec.ts`
**Scope**: Archive display, statistics, daily goal, refresh to plan, delete from archive

## What Is Being Tested

Everything a user can see and do in the archive section: tasks that appear after completion,
their displayed metadata (time, completion date), the daily goal counter, the refresh button
that moves a task back to plan, and the dropdown delete action. Statistics in both the plan
and archive sections are verified to stay consistent.

## Setup

```ts
import { test, expect } from '@playwright/test';

async function addTask(page, category = 'Work', description = 'Test task') {
    await page.getByPlaceholder('Категория').fill(category);
    await page.getByPlaceholder('Описание').fill(description);
    await page.getByPlaceholder('Описание').press('Enter');
}

// Archives a task through the plan dropdown (manual archive, not timer completion).
async function archiveViaDropdown(page, description: string) {
    const item = page.getByRole('listitem').filter({ hasText: description });
    await item.getByRole('button', { name: '…' }).click();
    await page.getByText('В архив').click();
}

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});
```

## Test Cases

### Empty state

- **archive shows empty state when no tasks have been completed**
  - Load the page with no tasks.
  - Assert an element containing "Архив пуст" is visible.
  - Assert the subtitle "Выполненные задачи появятся здесь" is visible.

### Task appears in archive

- **archived task description is visible in the archive list**
  - Add "Work" + "Write tests", archive via dropdown.
  - Assert the archive section contains a row with "Write tests".

- **archived task category is visible**
  - Add "Dev" + "Fix bug", archive via dropdown.
  - Assert the archive row shows "Dev".

- **archived task shows a duration (taskTime)**
  - Add and archive a task.
  - Assert the archive row contains a formatted time string (e.g., "25:00" or similar
    `mm:ss` pattern).

- **archived task shows a completion timestamp**
  - Add and archive a task.
  - Assert the archive row contains a time of day string (hours and minutes visible).

### Statistics — archive section

- **archive statistics tasksCount increments on each archive**
  - Archive one task, assert archive statistics show "1".
  - Archive another task, assert archive statistics show "2".

- **archive statistics total time increases after each archive**
  - Archive a task.
  - Assert the "Общее время" value in archive statistics is non-zero and formatted.

- **archive statistics categories list appears**
  - Archive a task with category "Dev".
  - Assert "Dev" appears in the archive statistics categories list.

### Statistics — plan section consistency

- **plan tasksCount decreases after archiving**
  - Add two tasks (tasksCount = 2).
  - Archive one.
  - Assert plan statistics show tasksCount = 1.

### Daily goal

- **goal shows remaining count when not yet achieved**
  - Archive 3 tasks (default goal = 10).
  - Assert text containing "осталось 7 из 10" is visible (or equivalent remaining count).

- **goal shows achievement text when target is reached**
  - Archive 10 tasks (may require adding and archiving 10 items; or set
    `VITE_DAILY_GOAL` env to a lower number if supported).
  - Assert text containing "Цель достигнута" is visible.

- **goal indicator applies a special CSS class or visual change on achievement**
  - Reach the daily goal.
  - Assert the goal element has a class or attribute indicating achieved state
    (e.g., check for specific text change or icon change).

### Refresh (restore to plan)

- **clicking the refresh button moves the task back to the plan**
  - Add and archive "Write tests".
  - Click the refresh (↻) button on the archive row.
  - Assert "Write tests" appears in the plan list.
  - Assert the archive row for "Write tests" is no longer visible.

- **refreshed task appears at the front of the plan**
  - Add "Task A" and "Task B" to plan. Archive "Task A".
  - Refresh "Task A" from archive.
  - Assert "Task A" is the first item in the plan list.

- **plan statistics update after refresh**
  - Archive then refresh a task.
  - Assert plan tasksCount increases by 1.
  - Assert archive tasksCount decreases by 1.

- **refreshed task is immediately selectable as activeTask**
  - Archive the only task, refresh it.
  - Assert the timer section shows the refreshed task's description.

### Delete from archive

- **"Удалить" removes the row from the archive**
  - Add and archive "Delete me".
  - Open the archive row's "…" dropdown, click "Удалить".
  - Assert the archive row for "Delete me" is no longer visible.

- **archive statistics decrement after delete**
  - Archive two tasks, delete one via dropdown.
  - Assert archive tasksCount is now 1.

- **deleting all archive tasks restores the empty state**
  - Archive one task, delete it.
  - Assert "Архив пуст" is visible again.

## Selectors Reference

```
Archive empty state:   page.getByText('Архив пуст')
Archive list:          locate by containing section / heading "СДЕЛАНО"
Archive row:           page.getByRole('row').filter({ hasText: 'Write tests' })
                       or page.locator('[data-testid="archive-task"]').filter(...)
Refresh button:        within archive row, page.getByRole('button', { name: /↻|refresh/i })
Archive dropdown:      within archive row, page.getByRole('button', { name: '…' })
Delete item:           page.getByText('Удалить')
Goal text:             page.getByText(/осталось|Цель достигнута/)
Archive stats:         section containing "Выполнено помидоров" and "Общее время"
```

## Notes

- The archive renders as a table on desktop and stacked on mobile. Selectors should use
  text content or role-based queries rather than table-specific roles for portability.
- The refresh (↻) button currently has no text label — add `aria-label="Вернуть в план"`
  to the button in the component to make it selectable via `getByRole('button', { name: 'Вернуть в план' })`.
- The daily goal (default 10) is hardcoded. If it is later made configurable via env var,
  the test setup should lower it so tests don't require archiving 10 tasks.
- Add `data-testid="archive-task-row"` to `ArchiveTask` and `data-testid="archive-stats"`
  to `ArchiveTasksStatistics` for stable test selectors.
