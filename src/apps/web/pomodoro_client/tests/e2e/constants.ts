import { ru } from '../../src/i18n/locales/ru.ts';

// ─── Form inputs ──────────────────────────────────────────────────────────────
export const CATEGORY               = ru['plan.add.categoryPlaceholder'];
export const DESCRIPTION            = ru['plan.add.descriptionPlaceholder'];
export const ADD_TASK_BTN           = ru['plan.add.submitAriaLabel'];
export const TASK_ACTIONS_BTN       = ru['plan.task.actionsAriaLabel'];
export const EDIT_DESCRIPTION_LABEL = ru['plan.task.editDescriptionAriaLabel'];
export const COUNT_BADGE_LABEL      = ru['plan.task.editCountAriaLabel'];

// ─── Plan menu items ──────────────────────────────────────────────────────────
export const MENU_INC               = ru['plan.task.menuIncrement'];
export const MENU_DEC               = ru['plan.task.menuDecrement'];
export const MENU_ARCHIVE           = ru['plan.task.menuArchive'];

// ─── Timer buttons ────────────────────────────────────────────────────────────
export const BTN_START              = ru['timer.button.start'];
export const BTN_STOP               = ru['timer.button.stop'];
export const BTN_PAUSE              = ru['timer.button.pause'];
export const BTN_RESUME             = ru['timer.button.resume'];
export const BTN_DONE               = ru['timer.button.done'];
export const BTN_SKIP               = ru['timer.button.skip'];

// ─── Timer & plan messages ────────────────────────────────────────────────────
export const TEXT_NO_PLAN           = ru['timer.empty.noPlanTitle'];
export const TEXT_PLAN_EMPTY        = ru['plan.empty.title'];
export const TEXT_SHORT_BREAK       = ru['break.short'];
export const TEXT_LONG_BREAK        = ru['break.long'];

// ─── Archive messages ─────────────────────────────────────────────────────────
export const MENU_DELETE            = ru['archive.task.menuDelete'];
export const REFRESH_BTN            = ru['archive.task.refreshAriaLabel'];
export const TEXT_ARCHIVE_EMPTY     = ru['archive.empty.title'];
export const TEXT_ARCHIVE_SUBTITLE  = ru['archive.empty.subtitle'];

// ─── Goal messages — partial matches against archive.target.* templates ───────
export const TEXT_GOAL_REMAINING      = 'осталось 7 из 10'; // scenario: 3 of 10 archived
export const TEXT_GOAL_ACHIEVED       = 'Цель достигнута';  // prefix of archive.target.achieved
export const TEXT_GOAL_REMAINING_PART = 'осталось';         // word in archive.target.remaining

// ─── Toolbar ─────────────────────────────────────────────────────────────────
export const SETTINGS_BTN           = ru['toolbar.settings'];
export const DARK_THEME_ITEM        = new RegExp(ru['toolbar.darkTheme']);
export const DARK_THEME_ACTIVE      = /✓/;
export const DARK_THEME_CLASS       = /theme-dark/;

// ─── Timer display values ─────────────────────────────────────────────────────
export const TIMER_TASK             = '25:00';
export const TIMER_SHORT_BREAK      = '05:00';
export const TIMER_LONG_BREAK       = '15:00';
export const TIMER_AFTER_1S         = '24:59';
export const TIMER_LAST_SECOND      = '00:01';

// ─── Duration patterns ────────────────────────────────────────────────────────
export const DURATION_PATTERN       = /\d+ мин/;
export const TIMESTAMP_PATTERN      = /\d{2}:\d{2}/;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const PLAN_ITEM              = 'li[data-index]';
export const ARCHIVE_ITEM           = 'li[role="listitem"]';
export const ARCHIVE_TASK_ROW       = '[data-testid="archive-task-row"]';
export const ARCHIVE_COUNT          = '[aria-label="Количество выполненных задач"]';
export const ARCHIVE_STATS          = '[data-testid="archive-stats"]';
export const TIMER_CONTAINER        = '#timer-countdown';
export const TIMER_DESCRIPTION      = '[data-testid="timer-description"]';

// ─── Storage ─────────────────────────────────────────────────────────────────
export const STORAGE_KEY            = 'pomodorostate';
