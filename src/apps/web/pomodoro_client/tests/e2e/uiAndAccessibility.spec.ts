import { test, expect, type Page } from '@playwright/test';
import {
    CATEGORY, DESCRIPTION,
    TASK_ACTIONS_BTN, EDIT_CATEGORY_LABEL, EDIT_DESCRIPTION_LABEL,
    MENU_ARCHIVE,
    BTN_START, BTN_PAUSE,
    SETTINGS_BTN, DARK_THEME_ITEM, DARK_THEME_CLASS,
    TEXT_NO_PLAN,
    TEXT_PLAN_EMPTY, TEXT_PLAN_EMPTY_SUB, TEXT_ARCHIVE_EMPTY,
    TEXT_NEXT_LONG_BREAK, TEXT_FINISH_TIME,
    ARCHIVE_COUNT,
    TEXT_ANNOUNCE_STARTED, TEXT_ANNOUNCE_PAUSED,
    ANNOUNCER,
    PLAN_ITEM, ARCHIVE_TASK_ROW,
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

// ─── beforeEach ───────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});

// ─── Theme toggle ─────────────────────────────────────────────────────────────

test.describe('Theme toggle', () => {
    test('dark theme class is applied to <html> after clicking "Тёмная тема"', async ({ page }) => {
        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await page.getByRole('menuitem', { name: DARK_THEME_ITEM }).click();

        await expect(page.locator('html')).toHaveClass(DARK_THEME_CLASS);
    });

    test('settings dropdown shows active indicator next to the active theme', async ({ page }) => {
        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await page.getByRole('menuitem', { name: DARK_THEME_ITEM }).click();

        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await expect(page.getByRole('menuitem', { name: /✓/ })).toBeVisible();
    });

    test('clicking "Тёмная тема" a second time reverts to light theme', async ({ page }) => {
        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await page.getByRole('menuitem', { name: DARK_THEME_ITEM }).click();

        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await page.getByRole('menuitem', { name: DARK_THEME_ITEM }).click();

        await expect(page.locator('html')).not.toHaveClass(DARK_THEME_CLASS);
    });

    test('settings dropdown closes after clicking a theme item', async ({ page }) => {
        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await page.getByRole('menuitem', { name: DARK_THEME_ITEM }).click();

        await expect(page.getByRole('button', { name: SETTINGS_BTN }))
            .toHaveAttribute('aria-expanded', 'false');
    });

    test('settings dropdown closes on Escape key', async ({ page }) => {
        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await page.keyboard.press('Escape');

        await expect(page.getByRole('button', { name: SETTINGS_BTN }))
            .toHaveAttribute('aria-expanded', 'false');
    });

    test('settings dropdown closes when clicking outside', async ({ page }) => {
        await page.getByRole('button', { name: SETTINGS_BTN }).click();
        await page.mouse.click(640, 400);

        await expect(page.getByRole('button', { name: SETTINGS_BTN }))
            .toHaveAttribute('aria-expanded', 'false');
    });
});

// ─── Empty states ─────────────────────────────────────────────────────────────

test.describe('Empty states', () => {
    test('plan empty state is shown on first load', async ({ page }) => {
        await expect(page.getByText(TEXT_PLAN_EMPTY)).toBeVisible();
        await expect(page.getByText(TEXT_PLAN_EMPTY_SUB)).toBeVisible();
    });

    test('timer empty state "no plan" is shown when plan is empty', async ({ page }) => {
        await expect(page.getByText(TEXT_NO_PLAN)).toBeVisible();
    });

    test('timer empty state "no plan" persists after archiving all plan tasks', async ({ page }) => {
        await addTask(page, 'Work', 'Solo task');
        await archiveViaDropdown(page, 'Solo task');

        await expect(page.getByText(TEXT_NO_PLAN)).toBeVisible();
    });

    test('archive empty state is shown on first load', async ({ page }) => {
        await expect(page.getByText(TEXT_ARCHIVE_EMPTY)).toBeVisible();
    });

    test('plan empty state disappears once a task is added', async ({ page }) => {
        await addTask(page);

        await expect(page.getByText(TEXT_PLAN_EMPTY)).not.toBeVisible();
    });

    test('archive empty state disappears once a task is archived', async ({ page }) => {
        await addTask(page, 'Work', 'Done task');
        await archiveViaDropdown(page, 'Done task');

        await expect(page.getByText(TEXT_ARCHIVE_EMPTY)).not.toBeVisible();
    });
});

// ─── Keyboard navigation — add form ──────────────────────────────────────────

test.describe('Keyboard navigation — add form', () => {
    test('Tab moves focus from category input to description input', async ({ page }) => {
        await page.getByPlaceholder(CATEGORY).focus();
        await page.keyboard.press('Tab');

        await expect(page.getByPlaceholder(DESCRIPTION)).toBeFocused();
    });

    test('Enter in category input submits the form', async ({ page }) => {
        await page.getByPlaceholder(CATEGORY).fill('Work');
        await page.getByPlaceholder(CATEGORY).press('Enter');

        await expect(page.locator(PLAN_ITEM)).toHaveCount(1);
    });

    test('Enter in description input submits the form and clears inputs', async ({ page }) => {
        await page.getByPlaceholder(CATEGORY).fill('Work');
        await page.getByPlaceholder(DESCRIPTION).fill('My task');
        await page.getByPlaceholder(DESCRIPTION).press('Enter');

        await expect(page.locator(PLAN_ITEM)).toHaveCount(1);
        await expect(page.getByPlaceholder(CATEGORY)).toHaveValue('');
        await expect(page.getByPlaceholder(DESCRIPTION)).toHaveValue('');
    });
});

// ─── Keyboard navigation — edit mode ─────────────────────────────────────────

test.describe('Keyboard navigation — edit mode', () => {
    test('Enter saves the edit', async ({ page }) => {
        await addTask(page, 'Work', 'Original');

        // Click the description text to open edit mode
        await page.locator(PLAN_ITEM).nth(0).getByText('Original').click();

        const descInput = page.getByRole('textbox', { name: EDIT_DESCRIPTION_LABEL });
        await descInput.fill('Updated');
        await descInput.press('Enter');

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Updated' })).toBeVisible();
        // Edit mode should be closed — no edit inputs visible
        await expect(page.getByRole('textbox', { name: EDIT_DESCRIPTION_LABEL })).not.toBeVisible();
    });

    test('Escape cancels the edit', async ({ page }) => {
        await addTask(page, 'Work', 'Original');

        await page.locator(PLAN_ITEM).nth(0).getByText('Original').click();

        const descInput = page.getByRole('textbox', { name: EDIT_DESCRIPTION_LABEL });
        await descInput.fill('Changed');
        await descInput.press('Escape');

        await expect(page.locator(PLAN_ITEM).filter({ hasText: 'Original' })).toBeVisible();
        await expect(page.getByRole('textbox', { name: EDIT_DESCRIPTION_LABEL })).not.toBeVisible();
    });

    test('Tab moves between category and description inputs in edit mode', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        await page.locator(PLAN_ITEM).nth(0).getByText('My task').click();

        // Category input gets auto-focused
        await expect(page.getByRole('textbox', { name: EDIT_CATEGORY_LABEL })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('textbox', { name: EDIT_DESCRIPTION_LABEL })).toBeFocused();
    });
});

// ─── Dropdown keyboard behaviour ──────────────────────────────────────────────

test.describe('Dropdown keyboard behaviour', () => {
    test('Escape closes the plan task "…" dropdown', async ({ page }) => {
        await addTask(page);

        const taskItem = page.locator(PLAN_ITEM).nth(0);
        await taskItem.hover();
        const menuBtn = taskItem.getByRole('button', { name: TASK_ACTIONS_BTN });
        await menuBtn.click();

        await expect(page.getByRole('menu').first()).toBeVisible();
        await page.keyboard.press('Escape');

        await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    });

    test('Escape closes the archive row "…" dropdown', async ({ page }) => {
        await addTask(page, 'Work', 'Done');
        await archiveViaDropdown(page, 'Done');

        const archiveRow = page.locator(ARCHIVE_TASK_ROW).nth(0);
        await archiveRow.getByRole('button', { name: TASK_ACTIONS_BTN }).click();

        await expect(page.getByRole('menu').first()).toBeVisible();
        await page.keyboard.press('Escape');

        await expect(
            archiveRow.getByRole('button', { name: TASK_ACTIONS_BTN })
        ).toHaveAttribute('aria-expanded', 'false');
    });
});

// ─── ARIA roles and attributes ────────────────────────────────────────────────

test.describe('ARIA roles and attributes', () => {
    test('plan task list has role="list"', async ({ page }) => {
        await addTask(page);

        await expect(page.getByRole('list').first()).toBeVisible();
    });

    test('timer element has role="timer"', async ({ page }) => {
        await addTask(page);

        await expect(page.getByRole('timer')).toBeVisible();
    });

    test('settings button has aria-haspopup="true"', async ({ page }) => {
        await expect(page.getByRole('button', { name: SETTINGS_BTN }))
            .toHaveAttribute('aria-haspopup', 'true');
    });

    test('settings dropdown has role="menu"', async ({ page }) => {
        await page.getByRole('button', { name: SETTINGS_BTN }).click();

        await expect(page.getByRole('menu')).toBeVisible();
    });

    test('timer aria-live region announces state changes', async ({ page }) => {
        await addTask(page);

        await page.getByRole('button', { name: BTN_START }).click();
        await expect(page.locator(ANNOUNCER)).toContainText(TEXT_ANNOUNCE_STARTED);

        await page.getByRole('button', { name: BTN_PAUSE }).click();
        await expect(page.locator(ANNOUNCER)).toContainText(TEXT_ANNOUNCE_PAUSED);
    });
});

// ─── Statistics visibility ────────────────────────────────────────────────────

test.describe('Statistics visibility', () => {
    test('plan statistics section absent with no tasks, visible after adding one', async ({ page }) => {
        await expect(page.getByText(TEXT_NEXT_LONG_BREAK)).not.toBeVisible();

        await addTask(page);

        await expect(page.getByText(TEXT_NEXT_LONG_BREAK)).toBeVisible();
    });

    test('plan statistics show next long break time', async ({ page }) => {
        await addTask(page);

        await expect(page.getByText(TEXT_NEXT_LONG_BREAK)).toBeVisible();
    });

    test('plan statistics show estimated finish time', async ({ page }) => {
        await addTask(page);

        await expect(page.getByText(TEXT_FINISH_TIME)).toBeVisible();
    });

    test('archive statistics count is 0 initially, increments after archiving', async ({ page }) => {
        // Stats section is always rendered; verify count starts at 0 and updates
        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('0');

        await addTask(page, 'Work', 'Done task');
        await archiveViaDropdown(page, 'Done task');

        await expect(page.locator(ARCHIVE_COUNT)).toHaveText('1');
    });
});

// ─── Responsive layout — desktop ─────────────────────────────────────────────

test.describe('Responsive layout — desktop', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.reload();
    });

    test('navigation is rendered in toolbar on desktop', async ({ page }) => {
        // Navigation renders an empty <nav> on desktop (isMobile=false)
        await expect(page.getByRole('navigation', { name: 'Основное меню' })).toBeAttached();
    });

    test('plan task items use desktop layout class on desktop', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        // Desktop renders without the mobile class modifier
        const taskDiv = page.locator(PLAN_ITEM).nth(0).locator('[data-planTaskId]');
        await expect(taskDiv).not.toHaveClass(/plan_task_mobile/);
    });
});

// ─── Responsive layout — mobile ──────────────────────────────────────────────

test.describe('Responsive layout — mobile', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.reload();
    });

    test('navigation is not rendered in toolbar on mobile', async ({ page }) => {
        // Navigation component is not rendered at all when isMobile=true
        await expect(page.getByRole('navigation', { name: 'Основное меню' })).not.toBeAttached();
    });

    test('plan task items apply mobile layout class on mobile', async ({ page }) => {
        await addTask(page, 'Work', 'My task');

        // Mobile renders the plan_task_mobile modifier class
        const taskDiv = page.locator(PLAN_ITEM).nth(0).locator('[data-planTaskId]');
        await expect(taskDiv).toHaveClass(/plan_task_mobile/);
    });

    test('archive task items apply mobile layout class on mobile', async ({ page }) => {
        await addTask(page, 'Work', 'Done task');
        await archiveViaDropdown(page, 'Done task');

        // Mobile renders the archive_task_mobile modifier class on the row
        const archiveRow = page.locator(ARCHIVE_TASK_ROW).nth(0);
        await expect(archiveRow).toHaveClass(/archive_task_mobile/);
    });
});
