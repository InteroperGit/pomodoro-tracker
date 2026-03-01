import { test, expect, type Page } from '@playwright/test';
import {
    CATEGORY, DESCRIPTION, ADD_TASK_BTN, TEXT_PLAN_EMPTY,
    TASK_ACTIONS_BTN, EDIT_DESCRIPTION_LABEL, COUNT_BADGE_LABEL,
    MENU_INC, MENU_DEC, MENU_ARCHIVE, PLAN_ITEM, ARCHIVE_ITEM,
} from './constants.ts';

async function addTask(page: Page, category: string, description: string) {
    await page.getByPlaceholder(CATEGORY).fill(category);
    await page.getByPlaceholder(DESCRIPTION).fill(description);
    await page.getByPlaceholder(DESCRIPTION).press('Enter');
}

async function openTaskDropdown(taskItem: ReturnType<Page['locator']>) {
    await taskItem.hover();
    await taskItem.getByRole('button', { name: TASK_ACTIONS_BTN }).click();
}

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});

test.describe('Adding tasks', () => {
    test('form submits on Enter in the description field', async ({ page }) => {
        await page.getByPlaceholder(CATEGORY).fill('Work');
        await page.getByPlaceholder(DESCRIPTION).fill('Write tests');
        await page.getByPlaceholder(DESCRIPTION).press('Enter');

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Write tests' })).toBeVisible();
    });

    test('form submits on Enter in the category field', async ({ page }) => {
        await page.getByPlaceholder(CATEGORY).fill('Work');
        await page.getByPlaceholder(CATEGORY).press('Enter');

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Work' })).toBeVisible();
    });

    test('form submits on "+" button click', async ({ page }) => {
        await page.getByPlaceholder(CATEGORY).fill('Work');
        await page.getByPlaceholder(DESCRIPTION).fill('Click test');
        await page.getByRole('button', { name: ADD_TASK_BTN }).click();

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Click test' })).toBeVisible();
    });

    test('form clears after successful add', async ({ page }) => {
        await addTask(page, 'Work', 'Write tests');

        await expect(page.getByPlaceholder(CATEGORY)).toHaveValue('');
        await expect(page.getByPlaceholder(DESCRIPTION)).toHaveValue('');
    });

    test('second task appears above the first (front-push)', async ({ page }) => {
        await addTask(page, 'Work', 'Task A');
        await addTask(page, 'Work', 'Task B');

        const items = page.locator(PLAN_ITEM);
        await expect(items.nth(0)).toContainText('Task B');
        await expect(items.nth(1)).toContainText('Task A');
    });

    test('empty form does not add a task', async ({ page }) => {
        await page.getByRole('button', { name: ADD_TASK_BTN }).click();

        await expect(page.getByText(TEXT_PLAN_EMPTY)).toBeVisible();
    });

    test('form with only category adds the task', async ({ page }) => {
        await page.getByPlaceholder(CATEGORY).fill('Work');
        await page.getByPlaceholder(CATEGORY).press('Enter');

        await expect(page.locator(PLAN_ITEM)).toHaveCount(1);
    });
});

test.describe('Editing tasks', () => {
    test('clicking a task opens edit mode', async ({ page }) => {
        await addTask(page, 'Work', 'Write tests');
        await page.locator(PLAN_ITEM).filter({ hasText: 'Write tests' }).click();

        await expect(page.locator(`[aria-label="${EDIT_DESCRIPTION_LABEL}"]`)).toBeVisible();
    });

    test('Enter saves the edited description', async ({ page }) => {
        await addTask(page, 'Work', 'Write tests');
        await page.locator(PLAN_ITEM).filter({ hasText: 'Write tests' }).click();

        const descInput = page.locator(`[aria-label="${EDIT_DESCRIPTION_LABEL}"]`);
        await descInput.fill('Updated description');
        await descInput.press('Enter');

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Updated description' })).toBeVisible();
        await expect(page.locator(`[aria-label="${EDIT_DESCRIPTION_LABEL}"]`)).not.toBeVisible();
    });

    test('Escape cancels the edit and restores original text', async ({ page }) => {
        await addTask(page, 'Work', 'Write tests');
        await page.locator(PLAN_ITEM).filter({ hasText: 'Write tests' }).click();

        const descInput = page.locator(`[aria-label="${EDIT_DESCRIPTION_LABEL}"]`);
        await descInput.fill('Changed text');
        await descInput.press('Escape');

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Write tests' })).toBeVisible();
        await expect(page.locator(`[aria-label="${EDIT_DESCRIPTION_LABEL}"]`)).not.toBeVisible();
    });

    test('editing another task cancels the current edit', async ({ page }) => {
        await addTask(page, 'Work', 'Task A');
        await addTask(page, 'Work', 'Task B');

        // After front-push: index 0 = Task B, index 1 = Task A
        const items = page.locator(PLAN_ITEM);

        await items.nth(0).click();
        await expect(items.nth(0).locator(`[aria-label="${EDIT_DESCRIPTION_LABEL}"]`)).toBeVisible();

        await items.nth(1).click();
        await expect(items.nth(0).locator(`[aria-label="${EDIT_DESCRIPTION_LABEL}"]`)).not.toBeVisible();
        await expect(items.nth(1).locator(`[aria-label="${EDIT_DESCRIPTION_LABEL}"]`)).toBeVisible();
    });
});

test.describe('Pomodoro count', () => {
    test('count badge starts at 1', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        const taskItem = page.locator(PLAN_ITEM).filter({ hasText: 'My task' });
        await expect(taskItem.getByRole('status', { name: COUNT_BADGE_LABEL })).toHaveText('1');
    });

    test('clicking the count badge increments the count', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        const taskItem = page.locator(PLAN_ITEM).filter({ hasText: 'My task' });
        const badge = taskItem.getByRole('status', { name: COUNT_BADGE_LABEL });
        await badge.click();

        await expect(badge).toHaveText('2');
    });

    test('dropdown "+ помидор" increments the count', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        const taskItem = page.locator(PLAN_ITEM).filter({ hasText: 'My task' });
        const badge = taskItem.getByRole('status', { name: COUNT_BADGE_LABEL });
        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_INC }).click();

        await expect(badge).toHaveText('2');
    });

    test('dropdown "− помидор" decrements the count', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        const taskItem = page.locator(PLAN_ITEM).filter({ hasText: 'My task' });
        const badge = taskItem.getByRole('status', { name: COUNT_BADGE_LABEL });

        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_INC }).click();
        await expect(badge).toHaveText('2');

        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_DEC }).click();
        await expect(badge).toHaveText('1');
    });

    test('"− помидор" when count=1 removes the task from the plan', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        const taskItem = page.locator(PLAN_ITEM).filter({ hasText: 'My task' });
        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_DEC }).click();

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'My task' })).not.toBeVisible();
    });
});

test.describe('Archiving from the plan', () => {
    test('"В архив" removes task from the plan list', async ({ page }) => {
        await addTask(page, 'Work', 'My Task');

        const taskItem = page.locator(PLAN_ITEM).filter({ hasText: 'My Task' });
        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_ARCHIVE }).click();

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'My Task' })).not.toBeVisible();
    });

    test('archived task appears in the archive section', async ({ page }) => {
        await addTask(page, 'Work', 'My Task');

        const taskItem = page.locator(PLAN_ITEM).filter({ hasText: 'My Task' });
        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_ARCHIVE }).click();

        await expect(page.locator(ARCHIVE_ITEM).filter({ hasText: 'My Task' })).toBeVisible();
    });

    test('archiving a task with count > 1 only decrements count', async ({ page }) => {
        await addTask(page, 'Work', 'My Task');

        const taskItem = page.locator(PLAN_ITEM).filter({ hasText: 'My Task' });
        const badge = taskItem.getByRole('status', { name: COUNT_BADGE_LABEL });

        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_INC }).click();
        await expect(badge).toHaveText('2');

        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_ARCHIVE }).click();

        await expect(taskItem).toBeVisible();
        await expect(badge).toHaveText('1');
        await expect(page.locator(ARCHIVE_ITEM).filter({ hasText: 'My Task' })).toBeVisible();
    });

    test('archiving the first task leaves the next one in the plan', async ({ page }) => {
        await addTask(page, 'Work', 'Task B');
        await addTask(page, 'Work', 'Task A');

        // After front-push: index 0 = Task A, index 1 = Task B
        const firstItem = page.locator(PLAN_ITEM).nth(0);
        await expect(firstItem).toContainText('Task A');

        await openTaskDropdown(firstItem);
        await page.getByRole('menuitem', { name: MENU_ARCHIVE }).click();

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Task A' })).not.toBeVisible();
        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Task B' })).toBeVisible();
    });
});

test.describe('Reordering via drag', () => {
    test('dragging a task to a lower position reorders the list', async ({ page }) => {
        await addTask(page, '', 'Task C');
        await addTask(page, '', 'Task B');
        await addTask(page, '', 'Task A');

        // After front-push: index 0 = A, 1 = B, 2 = C
        const items = page.locator(PLAN_ITEM);
        await expect(items.nth(0)).toContainText('Task A');
        await expect(items.nth(1)).toContainText('Task B');
        await expect(items.nth(2)).toContainText('Task C');

        await items.nth(0).dragTo(items.nth(2));

        await expect(items.nth(0)).toContainText('Task B');
        await expect(items.nth(1)).toContainText('Task C');
        await expect(items.nth(2)).toContainText('Task A');
    });

    test('reordering updates active task when first item changes', async ({ page }) => {
        await addTask(page, '', 'Task B');
        await addTask(page, '', 'Task A');

        // After front-push: index 0 = Task A, index 1 = Task B
        const items = page.locator(PLAN_ITEM);
        await expect(items.nth(0)).toContainText('Task A');

        await items.nth(0).dragTo(items.nth(1));

        await expect(items.nth(0)).toContainText('Task B');
    });
});
