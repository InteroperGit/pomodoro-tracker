import { test, expect, type Page } from '@playwright/test';
import {
    CATEGORY, DESCRIPTION, TASK_ACTIONS_BTN, COUNT_BADGE_LABEL,
    MENU_ARCHIVE, BTN_START, BTN_PAUSE, BTN_RESUME, BTN_DONE, SETTINGS_BTN, PLAN_ITEM,
    TIMER_TASK, TEXT_PLAN_EMPTY,
    DARK_THEME_CLASS, DARK_THEME_ITEM, DARK_THEME_ACTIVE,
    ARCHIVE_TASK_ROW, ARCHIVE_COUNT, STORAGE_KEY,
} from './constants.ts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function addTask(page: Page, category = 'Work', description = 'Test task') {
    await page.getByPlaceholder(CATEGORY).fill(category);
    await page.getByPlaceholder(DESCRIPTION).fill(description);
    await page.getByPlaceholder(DESCRIPTION).press('Enter');
}

async function archiveViaDropdown(page: Page, description: string) {
    const item = page.locator(PLAN_ITEM).filter({ hasText: description });
    await item.hover();
    await item.getByRole('button', { name: TASK_ACTIONS_BTN }).click();
    await page.getByRole('menuitem', { name: MENU_ARCHIVE }).click();
}

// Waits for the 1 s save throttle to flush, then reloads the page.
async function saveAndReload(page: Page) {
    await page.waitForTimeout(1100);
    await page.reload();
}

// ─── beforeEach ───────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});

// ─── Plan tasks survive reload ────────────────────────────────────────────────

test.describe('Plan tasks survive reload', () => {
    test('task description is visible after reload', async ({ page }) => {
        await addTask(page, 'Work', 'Write tests');
        await saveAndReload(page);

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Write tests' })).toBeVisible();
    });

    test('task category is visible after reload', async ({ page }) => {
        await addTask(page, 'Dev', 'Fix bug');
        await saveAndReload(page);

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Dev' })).toBeVisible();
    });

    test('task count (> 1) is preserved after reload', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        const badge = page.locator(PLAN_ITEM).filter({ hasText: 'My task' })
            .getByRole('status', { name: COUNT_BADGE_LABEL });
        await badge.click(); // → 2
        await badge.click(); // → 3

        await saveAndReload(page);

        await expect(
            page.locator(PLAN_ITEM).filter({ hasText: 'My task' })
                .getByRole('status', { name: COUNT_BADGE_LABEL })
        ).toHaveText('3');
    });

    test('task order is preserved after reload', async ({ page }) => {
        // Front-push means last added is at index 0; result: [A, B, C]
        await addTask(page, '', 'Task C');
        await addTask(page, '', 'Task B');
        await addTask(page, '', 'Task A');

        await saveAndReload(page);

        const items = page.locator(PLAN_ITEM);
        await expect(items.nth(0)).toContainText('Task A');
        await expect(items.nth(1)).toContainText('Task B');
        await expect(items.nth(2)).toContainText('Task C');
    });

    test('plan task count is preserved after reload', async ({ page }) => {
        await addTask(page, 'Work', 'Task A');
        await addTask(page, 'Work', 'Task B');

        await saveAndReload(page);

        await expect(page.locator(PLAN_ITEM)).toHaveCount(2);
    });
});

// ─── Archive tasks survive reload ─────────────────────────────────────────────

test.describe('Archive tasks survive reload', () => {
    test('archived task description is visible after reload', async ({ page }) => {
        await addTask(page, 'Work', 'Old task');
        await archiveViaDropdown(page, 'Old task');
        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Old task' })).toBeVisible();

        await saveAndReload(page);

        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Old task' })).toBeVisible();
    });

    test('archived task category is visible after reload', async ({ page }) => {
        await addTask(page, 'QA', 'Review PR');
        await archiveViaDropdown(page, 'Review PR');
        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Review PR' })).toBeVisible();

        await saveAndReload(page);

        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'QA' })).toBeVisible();
    });

    test('archive tasksCount statistic is preserved after reload', async ({ page }) => {
        await addTask(page, 'Work', 'Task A');
        await addTask(page, 'Work', 'Task B');
        await archiveViaDropdown(page, 'Task A');
        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Task A' })).toBeVisible();
        await archiveViaDropdown(page, 'Task B');
        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Task B' })).toBeVisible();

        await saveAndReload(page);

        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('2');
    });

    test('archive completedAt timestamp is preserved after reload', async ({ page }) => {
        await addTask(page, 'Work', 'Timed task');
        await archiveViaDropdown(page, 'Timed task');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Timed task' });
        const timeText = (await archiveRow.locator('time').textContent())!.trim();

        await saveAndReload(page);

        await expect(
            page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Timed task' }).locator('time')
        ).toHaveText(timeText);
    });
});

// ─── Active task state survives reload ───────────────────────────────────────

test.describe('Active task state survives reload', () => {
    test('pending task is restored (timer shows task duration)', async ({ page }) => {
        await addTask(page);
        await saveAndReload(page);

        await expect(page.getByRole('timer')).toHaveText(TIMER_TASK);
    });

    test('active task is restored (timer resumes running)', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await saveAndReload(page);

        await expect(page.getByRole('button', { name: BTN_PAUSE })).toBeVisible();
    });

    test('paused task is restored correctly', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await saveAndReload(page);

        await expect(page.getByRole('button', { name: BTN_RESUME })).toBeVisible();
        await expect(page.getByRole('button', { name: BTN_DONE })).toBeVisible();
    });

    test('restTime is preserved across reload', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();

        // Let 2 real seconds pass so the timer decrements
        await page.waitForTimeout(2000);
        await page.getByRole('button', { name: BTN_PAUSE }).click();

        const timerText = (await page.getByRole('timer').textContent())!.trim();
        expect(timerText).not.toBe('25:00');

        await saveAndReload(page);

        await expect(page.getByRole('timer')).toHaveText(timerText);
    });
});

// ─── Theme preference survives reload ────────────────────────────────────────

test.describe('Theme preference survives reload', () => {
    test('dark theme is restored after reload', async ({ page }) => {
        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await page.getByRole('menuitem', { name: DARK_THEME_ITEM }).click();

        await saveAndReload(page);

        await expect(page.locator('html')).toHaveClass(DARK_THEME_CLASS);

        // Settings dropdown should indicate dark theme is active
        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await expect(page.getByRole('menuitem', { name: DARK_THEME_ACTIVE })).toBeVisible();
    });

    test('light theme (default) is preserved after reload', async ({ page }) => {
        await page.reload();

        await expect(page.locator('html')).not.toHaveClass(DARK_THEME_CLASS);
    });
});

// ─── Complex state round-trip ─────────────────────────────────────────────────

test.describe('Multiple tasks — full state snapshot', () => {
    test('complex state round-trips correctly', async ({ page }) => {
        await addTask(page, 'Work', 'Task A');
        await addTask(page, 'Work', 'Task B');
        await addTask(page, 'Dev', 'Task C');

        // Increment Task A count to 2
        const taskAItem = page.locator(PLAN_ITEM).filter({ hasText: 'Task A' });
        await taskAItem.getByRole('status', { name: COUNT_BADGE_LABEL }).click();

        // Archive Task C
        await archiveViaDropdown(page, 'Task C');
        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Task C' })).toBeVisible();

        await saveAndReload(page);

        await expect(page.locator(PLAN_ITEM)).toHaveCount(2);
        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('1');
        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Task A' })).toBeVisible();
        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Task B' })).toBeVisible();
        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Task C' })).toBeVisible();
        await expect(
            page.locator(PLAN_ITEM).filter({ hasText: 'Task A' })
                .getByRole('status', { name: COUNT_BADGE_LABEL })
        ).toHaveText('2');
    });
});

// ─── Corrupted or missing storage ─────────────────────────────────────────────

test.describe('Corrupted or missing storage', () => {
    test('app loads cleanly when localStorage is empty', async ({ page }) => {
        await expect(page.getByText(TEXT_PLAN_EMPTY)).toBeVisible();
    });

    test('app loads cleanly when localStorage contains invalid JSON', async ({ page }) => {
        await page.evaluate((key) => localStorage.setItem(key, 'not json'), STORAGE_KEY);
        await page.reload();

        await expect(page.getByText(TEXT_PLAN_EMPTY)).toBeVisible();
    });

    test('app loads cleanly when localStorage contains a partial state', async ({ page }) => {
        await page.evaluate(
            (key) => localStorage.setItem(key, JSON.stringify({ planTasks: null })),
            STORAGE_KEY
        );
        await page.reload();

        await expect(page.getByText(TEXT_PLAN_EMPTY)).toBeVisible();
    });
});
