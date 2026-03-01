import { test, expect, type Page, type Locator } from '@playwright/test';

// ─── Selectors ────────────────────────────────────────────────────────────────
const CATEGORY         = 'Категория';
const DESCRIPTION      = 'Описание';
const TASK_ACTIONS_BTN = 'Действия с задачей';
const MENU_ARCHIVE     = 'В архив';
const MENU_DELETE      = 'Удалить';
const REFRESH_BTN      = 'Обновить задачу';
const PLAN_ITEM        = 'li[data-index]';
const ARCHIVE_TASK_ROW = '[data-testid="archive-task-row"]';
const ARCHIVE_COUNT    = '[aria-label="Количество выполненных задач"]';
const ARCHIVE_STATS    = '[data-testid="archive-stats"]';
const TIMER_CONTAINER  = '#timer-countdown';

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

async function addAndArchive(page: Page, category: string, description: string) {
    await addTask(page, category, description);
    await archiveViaDropdown(page, description);
    await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: description })).toBeVisible();
}

async function openArchiveDropdown(archiveRow: Locator) {
    await archiveRow.getByRole('button', { name: TASK_ACTIONS_BTN }).click();
}

// ─── beforeEach ───────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});

// ─── Empty state ──────────────────────────────────────────────────────────────

test.describe('Empty state', () => {
    test('archive shows empty state when no tasks have been completed', async ({ page }) => {
        await expect(page.getByText('Архив пуст')).toBeVisible();
        await expect(page.getByText('Выполненные задачи появятся здесь')).toBeVisible();
    });
});

// ─── Task appears in archive ──────────────────────────────────────────────────

test.describe('Task appears in archive', () => {
    test('archived task description is visible in the archive list', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Write tests');

        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Write tests' })).toBeVisible();
    });

    test('archived task category is visible', async ({ page }) => {
        await addAndArchive(page, 'Dev', 'Fix bug');

        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Dev' })).toBeVisible();
    });

    test('archived task shows a duration', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Timed task');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Timed task' });
        await expect(archiveRow).toContainText(/\d+ мин/);
    });

    test('archived task shows a completion timestamp', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Timed task');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Timed task' });
        await expect(archiveRow).toContainText(/\d{2}:\d{2}/);
    });
});

// ─── Statistics — archive section ─────────────────────────────────────────────

test.describe('Statistics — archive section', () => {
    test('archive statistics tasksCount increments on each archive', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Task A');
        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('1');

        await addAndArchive(page, 'Work', 'Task B');
        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('2');
    });

    test('archive statistics total time increases after each archive', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Test task');

        await expect(page.locator(ARCHIVE_STATS)).toContainText(/\d+ мин/);
    });

    test('archive statistics categories list appears', async ({ page }) => {
        await addAndArchive(page, 'Dev', 'Test task');

        await expect(page.locator(ARCHIVE_STATS)).toContainText('Dev');
    });
});

// ─── Statistics — plan section consistency ────────────────────────────────────

test.describe('Statistics — plan section consistency', () => {
    test('plan tasksCount decreases after archiving', async ({ page }) => {
        await addTask(page, 'Work', 'Task A');
        await addTask(page, 'Work', 'Task B');
        await expect(page.locator(PLAN_ITEM)).toHaveCount(2);

        await archiveViaDropdown(page, 'Task A');

        await expect(page.locator(PLAN_ITEM)).toHaveCount(1);
    });
});

// ─── Daily goal ───────────────────────────────────────────────────────────────

test.describe('Daily goal', () => {
    test('goal shows remaining count when not yet achieved', async ({ page }) => {
        for (let i = 0; i < 3; i++) {
            await addAndArchive(page, 'Work', `Goal Task ${i}`);
        }

        await expect(page.getByText('осталось 7 из 10')).toBeVisible();
    });

    test('goal shows achievement text when target is reached', async ({ page }) => {
        for (let i = 0; i < 10; i++) {
            await addAndArchive(page, 'Work', `Goal Task ${i}`);
        }

        await expect(page.getByText('Цель достигнута')).toBeVisible();
    });

    test('goal indicator changes visually on achievement', async ({ page }) => {
        for (let i = 0; i < 10; i++) {
            await addAndArchive(page, 'Work', `Goal Task ${i}`);
        }

        const goalEl = page.getByRole('status').filter({ hasText: 'Цель достигнута' });
        await expect(goalEl).toBeVisible();
        await expect(goalEl).not.toContainText('осталось');
    });
});

// ─── Refresh (restore to plan) ────────────────────────────────────────────────

test.describe('Refresh (restore to plan)', () => {
    test('clicking the refresh button moves the task back to the plan', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Write tests');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Write tests' });
        await archiveRow.getByRole('button', { name: REFRESH_BTN }).click();

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Write tests' })).toBeVisible();
        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Write tests' })).not.toBeVisible();
    });

    test('refreshed task appears at the front of the plan', async ({ page }) => {
        await addTask(page, 'Work', 'Task A');
        await addTask(page, 'Work', 'Task B');
        // Front-push order: [Task B (0), Task A (1)]
        await archiveViaDropdown(page, 'Task A');
        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Task A' })).toBeVisible();

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Task A' });
        await archiveRow.getByRole('button', { name: REFRESH_BTN }).click();

        await expect(page.locator(PLAN_ITEM).nth(0)).toContainText('Task A');
    });

    test('plan statistics update after refresh', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Test task');
        await expect(page.locator(PLAN_ITEM)).toHaveCount(0);
        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('1');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Test task' });
        await archiveRow.getByRole('button', { name: REFRESH_BTN }).click();

        await expect(page.locator(PLAN_ITEM)).toHaveCount(1);
        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('0');
    });

    test('refreshed task is immediately selectable as activeTask', async ({ page }) => {
        await addAndArchive(page, 'Work', 'My task');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'My task' });
        await archiveRow.getByRole('button', { name: REFRESH_BTN }).click();

        const timerBlock = page.locator(TIMER_CONTAINER).locator('..');
        await expect(timerBlock.getByText('My task')).toBeVisible();
    });
});

// ─── Delete from archive ──────────────────────────────────────────────────────

test.describe('Delete from archive', () => {
    test('"Удалить" removes the row from the archive', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Delete me');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Delete me' });
        await openArchiveDropdown(archiveRow);
        await page.getByRole('menuitem', { name: MENU_DELETE }).click();

        await expect(page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Delete me' })).not.toBeVisible();
    });

    test('archive statistics decrement after delete', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Task A');
        await addAndArchive(page, 'Work', 'Task B');
        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('2');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Task A' });
        await openArchiveDropdown(archiveRow);
        await page.getByRole('menuitem', { name: MENU_DELETE }).click();

        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('1');
    });

    test('deleting all archive tasks restores the empty state', async ({ page }) => {
        await addAndArchive(page, 'Work', 'Delete me');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).filter({ hasText: 'Delete me' });
        await openArchiveDropdown(archiveRow);
        await page.getByRole('menuitem', { name: MENU_DELETE }).click();

        await expect(page.getByText('Архив пуст')).toBeVisible();
    });
});
