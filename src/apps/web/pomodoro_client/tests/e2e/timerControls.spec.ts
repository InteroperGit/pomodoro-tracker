import { test, expect, type Page, type Locator } from '@playwright/test';

// ─── UI strings (Russian locale) ─────────────────────────────────────────────
const CATEGORY          = "Категория";
const DESCRIPTION       = "Описание";

const BTN_START         = "СТАРТ";
const BTN_STOP          = "СТОП";
const BTN_PAUSE         = "ПАУЗА";
const BTN_RESUME        = "ПРОДОЛЖИТЬ";
const BTN_DONE          = "СДЕЛАНО";
const BTN_SKIP          = "ПРОПУСТИТЬ";

const TIMER_NO_PLAN     = "Нет задач в плане";
const TIMER_TASK        = "25:00";
const TIMER_SHORT_BREAK = "05:00";

const TIMER_CONTAINER   = "#timer-countdown";   // scopes queries to the timer block
const PLAN_ITEM         = "li[data-index]";
const ARCHIVE_ITEM      = 'li[role="listitem"]';
const TASK_ACTIONS_BTN  = "Действия с задачей";
const MENU_ARCHIVE      = "В архив";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function addTask(page: Page, category = 'Work', description = 'Test task') {
    await page.getByPlaceholder(CATEGORY).fill(category);
    await page.getByPlaceholder(DESCRIPTION).fill(description);
    await page.getByPlaceholder(DESCRIPTION).press('Enter');
}

async function openTaskDropdown(taskItem: Locator) {
    await taskItem.hover();
    await taskItem.getByRole('button', { name: TASK_ACTIONS_BTN }).click();
}

// ─── beforeEach ───────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});

// ─── Empty states ─────────────────────────────────────────────────────────────

test.describe('Empty states', () => {
    test('shows "no plan tasks" empty state when plan is empty', async ({ page }) => {
        await expect(page.getByText(TIMER_NO_PLAN)).toBeVisible();
    });

    test('shows "no plan tasks" empty state after all tasks are archived', async ({ page }) => {
        await addTask(page);

        const taskItem = page.locator(PLAN_ITEM).nth(0);
        await openTaskDropdown(taskItem);
        await page.getByRole('menuitem', { name: MENU_ARCHIVE }).click();

        await expect(page.getByText(TIMER_NO_PLAN)).toBeVisible();
    });
});

// ─── Pending state ────────────────────────────────────────────────────────────

test.describe('Pending state', () => {
    test('timer shows "25:00" when a task is added', async ({ page }) => {
        await addTask(page);

        await expect(page.getByRole('timer')).toHaveText(TIMER_TASK);
    });

    test('task description appears below the timer', async ({ page }) => {
        await addTask(page, 'Work', 'Write tests');

        // Scope to the timer container to avoid matching the plan task description
        const timerBlock = page.locator(TIMER_CONTAINER).locator('..');
        await expect(timerBlock.getByText('Write tests')).toBeVisible();
    });

    test('left button label is "СТАРТ" when pending', async ({ page }) => {
        await addTask(page);

        await expect(page.getByRole('button', { name: BTN_START })).toBeVisible();
    });

    test('"СТОП" button is visible and styled as disabled when pending', async ({ page }) => {
        await addTask(page);

        const stopBtn = page.getByRole('button', { name: BTN_STOP });
        await expect(stopBtn).toBeVisible();
        await expect(stopBtn).toHaveCSS('cursor', 'not-allowed');
    });
});

// ─── Active state ─────────────────────────────────────────────────────────────

test.describe('Active state', () => {
    test('clicking СТАРТ changes left button to ПАУЗА', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();

        await expect(page.getByRole('button', { name: BTN_PAUSE })).toBeVisible();
    });

    test('clicking СТАРТ enables the СТОП button', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();

        await expect(page.getByRole('button', { name: BTN_STOP })).not.toHaveCSS('cursor', 'not-allowed');
    });

    test('timer display is still "25:00" immediately after clicking СТАРТ', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();

        await expect(page.getByRole('timer')).toHaveText(TIMER_TASK);
    });
});

// ─── Paused state ─────────────────────────────────────────────────────────────

test.describe('Paused state', () => {
    test('clicking ПАУЗА changes left button to ПРОДОЛЖИТЬ', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();

        await expect(page.getByRole('button', { name: BTN_RESUME })).toBeVisible();
    });

    test('clicking ПАУЗА changes right button to СДЕЛАНО', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();

        await expect(page.getByRole('button', { name: BTN_DONE })).toBeVisible();
    });

    test('timer display does not change while paused', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();

        await page.clock.fastForward(2_000);

        await expect(page.getByRole('timer')).toHaveText(TIMER_TASK);
    });
});

// ─── Resume from pause ────────────────────────────────────────────────────────

test.describe('Resume from pause', () => {
    test('clicking ПРОДОЛЖИТЬ changes left button back to ПАУЗА', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_RESUME }).click();

        await expect(page.getByRole('button', { name: BTN_PAUSE })).toBeVisible();
    });

    test('clicking ПРОДОЛЖИТЬ changes right button back to СТОП', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_RESUME }).click();

        await expect(page.getByRole('button', { name: BTN_STOP })).toBeVisible();
    });
});

// ─── Stop (reset to pending) ──────────────────────────────────────────────────

test.describe('Stop', () => {
    test('clicking СТОП while active resets timer to "25:00"', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_STOP }).click();

        await expect(page.getByRole('timer')).toHaveText(TIMER_TASK);
    });

    test('clicking СТОП changes left button back to СТАРТ', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_STOP }).click();

        await expect(page.getByRole('button', { name: BTN_START })).toBeVisible();
    });

    test('clicking СТОП disables the right button again', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_STOP }).click();

        await expect(page.getByRole('button', { name: BTN_STOP })).toHaveCSS('cursor', 'not-allowed');
    });
});

// ─── Complete task (СДЕЛАНО) ──────────────────────────────────────────────────

test.describe('Complete task', () => {
    test('clicking СДЕЛАНО removes the task from the plan', async ({ page }) => {
        await addTask(page, 'Work', 'My task');
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_DONE }).click();

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'My task' })).not.toBeVisible();
    });

    test('clicking СДЕЛАНО adds the task to the archive', async ({ page }) => {
        await addTask(page, 'Work', 'My task');
        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_DONE }).click();

        await expect(page.locator(ARCHIVE_ITEM).filter({ hasText: 'My task' })).toBeVisible();
    });
});

// ─── Break controls ───────────────────────────────────────────────────────────

test.describe('Break controls', () => {
    test('break shows "05:00" after completing a task', async ({ page }) => {
        await addTask(page, 'Work', 'Task 1');
        await addTask(page, 'Work', 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_DONE }).click();

        await expect(page.getByRole('timer')).toHaveText(TIMER_SHORT_BREAK);
    });

    test('left button during an active break reads "ПАУЗА"', async ({ page }) => {
        await addTask(page, 'Work', 'Task 1');
        await addTask(page, 'Work', 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_DONE }).click();

        await expect(page.getByRole('button', { name: BTN_PAUSE })).toBeVisible();
    });

    test('right button during a break reads "ПРОПУСТИТЬ"', async ({ page }) => {
        await addTask(page, 'Work', 'Task 1');
        await addTask(page, 'Work', 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_DONE }).click();

        await expect(page.getByRole('button', { name: BTN_SKIP })).toBeVisible();
    });

    test('ПРОПУСТИТЬ skips break and restores "25:00" with СТАРТ', async ({ page }) => {
        await addTask(page, 'Work', 'Task 1');
        await addTask(page, 'Work', 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_DONE }).click();
        await page.getByRole('button', { name: BTN_SKIP }).click();

        await expect(page.getByRole('timer')).toHaveText(TIMER_TASK);
        await expect(page.getByRole('button', { name: BTN_START })).toBeVisible();
    });

    test('ПРОПУСТИТЬ while break is paused also skips', async ({ page }) => {
        await addTask(page, 'Work', 'Task 1');
        await addTask(page, 'Work', 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await page.getByRole('button', { name: BTN_DONE }).click();

        // Break is now Active → pause it
        await page.getByRole('button', { name: BTN_PAUSE }).click();
        // Skip from paused break
        await page.getByRole('button', { name: BTN_SKIP }).click();

        await expect(page.getByRole('timer')).toHaveText(TIMER_TASK);
        await expect(page.getByRole('button', { name: BTN_START })).toBeVisible();
    });
});
