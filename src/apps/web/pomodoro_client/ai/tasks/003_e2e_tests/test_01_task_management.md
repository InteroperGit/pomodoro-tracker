# E2E Test 01 — Task Management

**File**: `tests/e2e/taskManagement.spec.ts`
**Scope**: Add form, plan task list, edit mode, count controls, reorder via drag, archive from plan

## What Is Being Tested

Every user-facing interaction with tasks in the plan section: typing into the add form,
editing existing tasks inline, adjusting the pomodoro count, dragging to reorder, and
archiving a task via the dropdown. All assertions are against the DOM — no internal state
access.

## Setup

```ts
import { test, expect } from '@playwright/test';

// Shared helper: add one task through the UI form
async function addTask(page, category: string, description: string) {
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

### Adding tasks

- **form submits on Enter in the description field**
  - Fill "Work" + "Write tests", press Enter in the description input.
  - Assert a list item with text "Write tests" is visible in the plan list.

- **form submits on Enter in the category field**
  - Fill "Work" in category, press Enter in the category input (description empty).
  - Assert a list item containing "Work" is visible.

- **form submits on "+" button click**
  - Fill both fields, click the "+" button.
  - Assert the task appears in the list.

- **form clears after successful add**
  - Add a task.
  - Assert both inputs are empty after submission.

- **second task appears above the first (front-push)**
  - Add "Task A", then add "Task B".
  - Assert the first item in the list contains "Task B" and the second contains "Task A".

- **empty form does not add a task**
  - Leave both inputs blank, click "+".
  - Assert the plan list remains empty (empty-state element is still visible).

- **form with only category adds the task**
  - Fill "Work" in category, leave description blank, press Enter.
  - Assert a list item appears.

### Editing tasks

- **clicking a task opens edit mode**
  - Add "Work" + "Write tests".
  - Click the task item.
  - Assert an input with value "Write tests" is visible (edit mode active).

- **Enter saves the edited description**
  - Open edit mode, clear the description field, type "Updated description", press Enter.
  - Assert the list item now shows "Updated description".
  - Assert no input fields remain visible inside the task (edit mode closed).

- **Escape cancels the edit and restores original text**
  - Open edit mode, clear and retype something, press Escape.
  - Assert the task still shows the original description.

- **editing another task cancels the current edit**
  - Add two tasks, click the first to open edit mode.
  - Click the second task.
  - Assert the first task reverts to view mode and the second task is in edit mode.

### Pomodoro count

- **count badge starts at 1**
  - Add a task.
  - Assert the count badge displays "1".

- **clicking the count badge increments the count**
  - Add a task, click the count badge.
  - Assert the badge now displays "2".

- **dropdown "+ помидор" increments the count**
  - Add a task, open the "…" dropdown, click "+ помидор".
  - Assert the badge increments by 1.

- **dropdown "− помидор" decrements the count**
  - Add a task, increment count to 2, open dropdown, click "− помидор".
  - Assert the badge shows "1".

- **"− помидор" when count=1 removes the task from the plan**
  - Add a task (count=1), open dropdown, click "− помидор".
  - Assert the task list item is no longer visible.

### Archiving from the plan

- **"В архив" removes task from the plan list**
  - Add "Work" + "My Task".
  - Open the "…" dropdown, click "В архив".
  - Assert the plan list no longer contains "My Task".

- **archived task appears in the archive section**
  - Add and archive "My Task".
  - Assert the archive section contains a row with "My Task".

- **archiving a task with count > 1 only decrements count**
  - Add a task, increment count to 2, archive it via dropdown.
  - Assert the task is still in the plan with count badge "1".
  - Assert the archive section has one entry.

- **archiving the first task activates the next one**
  - Add "Task B", then "Task A".
  - Archive "Task A" (currently first in list).
  - Assert "Task B" is now the active task shown in the timer label or remains in the plan as
    the only entry.

### Reordering via drag

- **dragging a task to a lower position reorders the list**
  - Add "Task C", "Task B", "Task A" (plan order: A, B, C top to bottom).
  - Drag the first item (A) to the position of the third item (C).
  - Assert the list order is now B, C, A.

- **reordering updates the active task when the first item changes**
  - Add two tasks so the first becomes the active task.
  - Drag the first task to the second position.
  - Assert the task that moved to position 1 is reflected in the timer display.

## Selectors Reference

```
Категория input:   page.getByPlaceholder('Категория')
Описание input:    page.getByPlaceholder('Описание')
Add button:        page.getByRole('button', { name: '+' })
Plan task list:    page.getByRole('list')          // outermost ul in plan section
Task item:         page.getByRole('listitem').filter({ hasText: 'Write tests' })
Count badge:       within task item, element showing the number
Dropdown trigger:  page.getByRole('button', { name: '…' }) within task item
Dropdown items:    page.getByRole('menuitem') or page.getByText('В архив')
Edit input:        page.getByDisplayValue('Write tests')   // input in edit mode
```

## Notes

- The "…" dropdown button may require hovering over the task first on desktop to become
  visible, depending on CSS hover states.
- Drag-and-drop tests require Playwright's `dragTo()` or manual `dispatchEvent` for
  HTML5 DataTransfer — use `page.locator(source).dragTo(page.locator(target))`.
- Consider adding `data-testid` attributes to the plan list, count badge, and dropdown
  trigger to make selectors stable across CSS changes.
