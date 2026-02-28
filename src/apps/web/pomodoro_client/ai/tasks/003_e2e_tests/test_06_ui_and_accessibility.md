# E2E Test 06 — UI, Theme, and Accessibility

**File**: `tests/e2e/uiAndAccessibility.spec.ts`
**Scope**: Theme toggle, empty states, keyboard navigation, ARIA roles, screen-reader live
regions, responsive layout switching

## What Is Being Tested

Visual and behavioural aspects of the UI that are not covered by business-logic tests:
the dark/light theme toggle and its visual effect, empty-state placeholders in every
section, keyboard-driven workflows (adding a task, editing, cancelling), the ARIA attribute
contract, screen-reader announcements from the timer live region, and how the layout adapts
between mobile and desktop viewports.

## Setup

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});
```

## Test Cases

### Theme toggle

- **dark theme class is applied to <html> after clicking "Тёмная тема"**
  - Open the settings dropdown (click "Настройки").
  - Click "Тёмная тема".
  - Assert `document.documentElement.classList` contains `theme-dark`.

- **settings dropdown shows a checkmark (or active indicator) next to the active theme**
  - Enable dark theme.
  - Open settings dropdown.
  - Assert the "Тёмная тема" menu item contains "✓" or has an active attribute.

- **clicking "Тёмная тема" a second time reverts to light theme**
  - Enable dark, open settings again, click "Тёмная тема" again.
  - Assert `theme-dark` class is removed from `<html>`.

- **settings dropdown closes after clicking a theme item**
  - Open dropdown, click "Тёмная тема".
  - Assert the dropdown menu is no longer visible.

- **settings dropdown closes on Escape key**
  - Open the settings dropdown, press Escape.
  - Assert the dropdown menu is no longer visible.

- **settings dropdown closes when clicking outside**
  - Open the dropdown, click somewhere else on the page.
  - Assert the dropdown menu is no longer visible.

### Empty states

- **plan empty state is shown on first load**
  - Assert text "Список задач пуст" and "Добавьте задачу в план" are visible.

- **timer empty state "no plan" is shown when plan is empty**
  - Assert text "Нет задач в плане" is visible in the timer area.

- **timer empty state "no active task" appears after all tasks are archived**
  - Add and archive one task. Assert "Нет активной задачи" is visible.

- **archive empty state is shown on first load**
  - Assert text "Архив пуст" is visible.

- **plan empty state disappears once a task is added**
  - Add a task. Assert "Список задач пуст" is no longer visible.

- **archive empty state disappears once a task is archived**
  - Add and archive a task. Assert "Архив пуст" is no longer visible.

### Keyboard navigation — add form

- **Tab moves focus from category input to description input**
  - Focus the category input, press Tab.
  - Assert the description input is focused.

- **Enter in category input submits the form**
  - Type a category, press Enter while category input is focused.
  - Assert a task appears in the plan list (requires at least the category field filled).

- **Enter in description input submits the form**
  - Type in both fields, press Enter in the description input.
  - Assert the task is added and both inputs clear.

### Keyboard navigation — edit mode

- **Enter saves the edit**
  - Add a task, click it to open edit mode.
  - Change the description, press Enter.
  - Assert the updated text is visible and edit mode is closed.

- **Escape cancels the edit**
  - Add a task, click to open edit mode, press Escape.
  - Assert the original text is still shown and edit mode is closed.

- **Tab moves between category and description inputs in edit mode**
  - Open edit mode, verify Tab cycles between the two edit inputs.

### Dropdown keyboard behaviour

- **Escape closes the plan task "…" dropdown**
  - Add a task, open its "…" dropdown, press Escape.
  - Assert the dropdown closes without performing any action.

- **Escape closes the archive row "…" dropdown**
  - Archive a task, open its "…" dropdown, press Escape.
  - Assert the dropdown closes.

### ARIA roles and attributes

- **plan task list has role="list"**
  - Add at least one task.
  - Assert `page.getByRole('list')` within the plan section resolves.

- **timer element has role="timer"**
  - Add a task.
  - Assert `page.getByRole('timer')` resolves.

- **settings button has aria-haspopup="true"**
  - Assert the "Настройки" button has `aria-haspopup="true"`.

- **settings dropdown has role="menu"**
  - Open the settings dropdown.
  - Assert an element with `role="menu"` is visible.

- **timer aria-live region announces state changes**
  - The timer component contains an `aria-live="polite"` element.
  - Start a task; assert the live region text changes to "Таймер запущен" (or equivalent).
  - Pause; assert it changes to "Таймер на паузе".

### Statistics visibility

- **plan statistics section appears only when plan has tasks**
  - With no tasks, assert the plan statistics section (finish time, categories) is absent.
  - Add a task; assert the statistics section is now visible.

- **plan statistics show next long break time**
  - Add tasks. Assert text matching "Следующий длинный перерыв" is visible.

- **plan statistics show estimated finish time**
  - Add tasks. Assert text matching "Время окончания" is visible.

- **archive statistics section appears only when archive has tasks**
  - With empty archive, assert "Выполнено помидоров" heading is absent.
  - Archive a task; assert it becomes visible.

### Responsive layout — desktop (≥ 1280 px wide)

- **navigation is visible in toolbar on desktop**
  - Set viewport to `{ width: 1280, height: 800 }`.
  - Assert the main navigation element inside the toolbar is visible.

- **plan task items use horizontal (grid) layout on desktop**
  - Set wide viewport, add a task.
  - Assert category and description appear side by side (check that both are visible in the
    same visual row by comparing bounding boxes: `category.y ≈ description.y`).

### Responsive layout — mobile (≤ 480 px wide)

- **navigation is hidden in toolbar on mobile**
  - Set viewport to `{ width: 375, height: 812 }`.
  - Assert the main navigation element is not visible.

- **plan task items use stacked layout on mobile**
  - Set mobile viewport, add a task.
  - Assert category appears above description (category.y < description.y).

- **archive task items use stacked layout on mobile**
  - Set mobile viewport, archive a task.
  - Assert the archive row items are stacked (category and actions below description).

## Selectors Reference

```
Settings button:        page.getByText('Настройки')  (or getByRole with aria-label)
Dark theme menu item:   page.getByText('Тёмная тема')
Dropdown menu:          page.getByRole('menu')
Menu items:             page.getByRole('menuitem')
Theme class check:      await page.locator('html').getAttribute('class')
Timer live region:      page.locator('[aria-live]')  within timer section
Plan list:              page.getByRole('list')        within plan section
Timer element:          page.getByRole('timer')
Plan stats section:     page.getByText('Следующий длинный перерыв').locator('..')
Archive stats section:  page.getByText('Выполнено помидоров').locator('..')
```

## Notes

- Accessibility assertions (ARIA roles, `aria-haspopup`, etc.) are best paired with the
  `@playwright/test` accessibility audit via `page.accessibility.snapshot()` for broader
  coverage.
- For responsive layout tests, set the viewport using `page.setViewportSize()` inside the
  test rather than in a separate project config, so both sizes can live in one file.
- The live-region text announcement test may require a small `waitFor` to allow the DOM
  update to propagate after the action.
- Consider adding `data-testid` to: the toolbar navigation element, the plan statistics
  section, and the archive statistics section, to avoid brittle text-based parent selectors.
