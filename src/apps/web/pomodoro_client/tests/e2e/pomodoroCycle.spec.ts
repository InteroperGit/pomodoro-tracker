import { test, expect, type Page } from '@playwright/test';

// ─── UI strings (Russian locale) ─────────────────────────────────────────────
const CATEGORY          = "Категория";
const DESCRIPTION       = "Описание";

const BTN_START         = "СТАРТ";
const BTN_PAUSE         = "ПАУЗА";
const BTN_SKIP          = "ПРОПУСТИТЬ";

const TIMER_TASK        = "25:00";
const TIMER_SHORT_BREAK = "05:00";
const TIMER_LONG_BREAK  = "15:00";

const TEXT_SHORT_BREAK  = "Короткий перерыв";
const TEXT_LONG_BREAK   = "Длинный перерыв";
const TEXT_NO_PLAN      = "Нет задач в плане";

const TIMER_DESCRIPTION = '[data-testid="timer-description"]';
const ARCHIVE_ITEM      = 'li[role="listitem"]';
const PLAN_ITEM         = "li[data-index]";

// ─── Timing constants (real durations — fake clock advances instantly) ────────
const TASK_MS        = 25 * 60 * 1000;   // 1_500_000
const SHORT_BREAK_MS =  5 * 60 * 1000;   //   300_000
const LONG_BREAK_MS  = 15 * 60 * 1000;   //   900_000

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function addTask(page: Page, description = 'Task') {
    await page.getByPlaceholder(CATEGORY).fill('Work');
    await page.getByPlaceholder(DESCRIPTION).fill(description);
    await page.getByPlaceholder(DESCRIPTION).press('Enter');
}

// fastForward fires the setInterval callback once at the target time rather than
// once per second, so _processTick's drift compensation subtracts all elapsed
// milliseconds in a single call. This is both faster and avoids burning extra
// seconds into the next phase's timer.
async function runTaskToEnd(page: Page) {
    await page.clock.fastForward(TASK_MS);
}

async function runShortBreakToEnd(page: Page) {
    await page.clock.fastForward(SHORT_BREAK_MS);
}

async function runLongBreakToEnd(page: Page) {
    await page.clock.fastForward(LONG_BREAK_MS);
}

// Clicks СТАРТ, lets the task run to completion, then lets the short break run to completion.
// After this helper the next plan task is in Pending state.
async function completeCycle(page: Page) {
    await page.getByRole('button', { name: BTN_START }).click();
    await runTaskToEnd(page);
    await runShortBreakToEnd(page);
}

// ─── beforeEach ───────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});

// ─── Timer countdown ──────────────────────────────────────────────────────────

test.describe('Timer countdown', () => {
    test('timer counts down after clicking СТАРТ', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.clock.runFor(1000);

        await expect(page.getByRole('timer')).not.toHaveText(TIMER_TASK);
        await expect(page.getByRole('timer')).toHaveText('24:59');
    });

    test('timer shows "00:01" on the tick just before completing', async ({ page }) => {
        await addTask(page);
        await page.getByRole('button', { name: BTN_START }).click();
        await page.clock.fastForward(TASK_MS - 1000);

        await expect(page.getByRole('timer')).toHaveText('00:01');
    });
});

// ─── Task → Short Break transition ───────────────────────────────────────────

test.describe('Task → Short Break', () => {
    test('task auto-archives when countdown finishes', async ({ page }) => {
        await addTask(page, 'Task 1');
        await addTask(page, 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        // Task 2 is at index 0 (front-push) so it runs first and lands in the archive.
        // Filter by text to avoid matching stats li[role="listitem"] elements.
        await expect(page.locator(ARCHIVE_ITEM).filter({ hasText: 'Task 2' })).toBeVisible();
        await expect(page.locator(PLAN_ITEM)).toHaveCount(1);
    });

    test('short break auto-starts after task completes', async ({ page }) => {
        await addTask(page, 'Task 1');
        await addTask(page, 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        await expect(page.getByRole('timer')).toHaveText(TIMER_SHORT_BREAK);
        await expect(page.getByRole('button', { name: BTN_START })).not.toBeVisible();
    });

    test('short break shows "ПАУЗА" and "ПРОПУСТИТЬ" buttons', async ({ page }) => {
        await addTask(page, 'Task 1');
        await addTask(page, 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        await expect(page.getByRole('button', { name: BTN_PAUSE })).toBeVisible();
        await expect(page.getByRole('button', { name: BTN_SKIP })).toBeVisible();
    });

    test('timer description changes to "Короткий перерыв" on short break', async ({ page }) => {
        await addTask(page, 'Task 1');
        await addTask(page, 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        await expect(page.locator(TIMER_DESCRIPTION)).toHaveText(TEXT_SHORT_BREAK);
    });
});

// ─── Short Break → Next Task transition ──────────────────────────────────────

test.describe('Short Break → Next Task', () => {
    // With front-push: addTask('Task 1') then addTask('Task 2') → plan = [Task 2, Task 1].
    // The active task is Task 2; after it completes and the break ends, Task 1 becomes active.

    test('next task activates after break countdown finishes', async ({ page }) => {
        await addTask(page, 'Task 1');
        await addTask(page, 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);
        await runShortBreakToEnd(page);

        await expect(page.getByRole('timer')).toHaveText(TIMER_TASK);
        await expect(page.getByRole('button', { name: BTN_START })).toBeVisible();
    });

    test('next task description is visible in the timer section', async ({ page }) => {
        await addTask(page, 'Task 1');
        await addTask(page, 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);
        await runShortBreakToEnd(page);

        // Task 2 was at index 0 and ran; Task 1 is now the active task
        await expect(page.locator(TIMER_DESCRIPTION)).toHaveText('Task 1');
    });

    test('next task is in Pending state after break ends', async ({ page }) => {
        await addTask(page, 'Task 1');
        await addTask(page, 'Task 2');

        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);
        await runShortBreakToEnd(page);

        await expect(page.getByRole('button', { name: BTN_START })).toBeVisible();
        await expect(page.getByRole('button', { name: BTN_PAUSE })).not.toBeVisible();
    });
});

// ─── Long break after 4 pomodoros ────────────────────────────────────────────

test.describe('Long break after 4 pomodoros', () => {
    // A long break fires when shortBreakCount (number of accumulated short breaks)
    // reaches maxShortBreaksSerie (4). That happens after the 5th task completes.

    test('long break activates after the 5th completed task', async ({ page }) => {
        // Need 6 tasks: after 4 cycles Tasks 1-4 are archived, Task 5 has
        // shortBreakCount=4. When Task 5 completes, plan still has Task 6 so
        // the controller picks "longBreak" instead of "idle".
        for (let i = 6; i >= 1; i--) {
            await addTask(page, `Task ${i}`);
        }

        // Complete 4 full cycles (task + short break each)
        for (let i = 0; i < 4; i++) {
            await completeCycle(page);
        }

        // Start and complete the 5th task — this triggers the long break
        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        await expect(page.getByRole('timer')).toHaveText(TIMER_LONG_BREAK);
        await expect(page.locator(TIMER_DESCRIPTION)).toHaveText(TEXT_LONG_BREAK);
    });

    test('long break auto-starts as Active', async ({ page }) => {
        for (let i = 6; i >= 1; i--) {
            await addTask(page, `Task ${i}`);
        }

        for (let i = 0; i < 4; i++) {
            await completeCycle(page);
        }

        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        await expect(page.getByRole('button', { name: BTN_PAUSE })).toBeVisible();
        await expect(page.getByRole('button', { name: BTN_START })).not.toBeVisible();
    });

    test('task after long break starts with a fresh shortBreakCount', async ({ page }) => {
        // Need 7 tasks: Task 5 triggers the long break (Task 6 in plan),
        // long break completes, Task 6 runs. Task 7 must still be in plan so
        // the controller picks "shortBreak" (not "idle") when Task 6 finishes.
        for (let i = 7; i >= 1; i--) {
            await addTask(page, `Task ${i}`);
        }

        // Complete 4 full cycles → shortBreakCount reaches 4
        for (let i = 0; i < 4; i++) {
            await completeCycle(page);
        }

        // Complete the 5th task → long break (shortBreakCount resets to 0 inside long break)
        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        // Complete the long break → Task 6 is now Pending with shortBreakCount=0
        await runLongBreakToEnd(page);

        // Complete Task 6 — shortBreakCount is 0, so next break is a SHORT break
        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        await expect(page.getByRole('timer')).toHaveText(TIMER_SHORT_BREAK);
        await expect(page.locator(TIMER_DESCRIPTION)).toHaveText(TEXT_SHORT_BREAK);
    });
});

// ─── Idle state ───────────────────────────────────────────────────────────────

test.describe('Idle state', () => {
    test('timer shows idle state when last task completes and plan is empty', async ({ page }) => {
        await addTask(page, 'Only task');
        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        await expect(page.getByText(TEXT_NO_PLAN)).toBeVisible();
    });

    test('idle state shows no timer control buttons', async ({ page }) => {
        await addTask(page, 'Only task');
        await page.getByRole('button', { name: BTN_START }).click();
        await runTaskToEnd(page);

        await expect(page.getByRole('button', { name: BTN_START })).not.toBeVisible();
        await expect(page.getByRole('button', { name: BTN_PAUSE })).not.toBeVisible();
    });
});
