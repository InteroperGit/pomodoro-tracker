import type {ActivePomodoroTask, ArchivePomodoroTask, PlanPomodoroTask, PomodoroTask} from "./task.ts";
import type {ArchivePomodoroTasksStatistics, PlanPomodoroTasksStatistics} from "./statistics.ts";

/**
 * Состояние плановых задач
 * @typedef {Object} PlanPomodoroTasksState
 * @property {PlanPomodoroTask[]} tasks - массив плановых задач
 * @property {PlanPomodoroTasksStatistics} statistics - статистика плана
 */
export type PlanPomodoroTasksState = {
    tasks: PlanPomodoroTask[];
    statistics: PlanPomodoroTasksStatistics;
}

/**
 * Состояние архива выполненных задач
 * @typedef {Object} ArchivePomodoroTasksState
 * @property {ArchivePomodoroTask[]} tasks - массив выполненных задач
 * @property {ArchivePomodoroTasksStatistics} statistics - статистика архива
 */
export type ArchivePomodoroTasksState = {
    tasks: ArchivePomodoroTask[];
    statistics: ArchivePomodoroTasksStatistics;
}

/** Идентификатор темы ("light" или "dark") */
export type ThemeId = "light" | "dark";

/**
 * События Pomodoro (запуск, завершение, начало перерыва)
 * @typedef {Object} PomodoroEvent
 * @property {string} type - тип события (started, completed, breakStarted)
 * @property {string} taskType - тип задачи (task, shortBreak, longBreak)
 */
export type PomodoroEvent =
    | { type: "started"; taskType: "task" | "shortBreak" | "longBreak" }
    | { type: "completed"; taskType: "task" | "shortBreak" | "longBreak" }
    | { type: "breakStarted"; taskType: "shortBreak" | "longBreak" };

/**
 * Полное состояние приложения
 * @typedef {Object} AppState
 * @property {number|null} [editingPlanTaskIndex] - индекс редактируемой задачи
 * @property {ActivePomodoroTask|null} [activeTask] - текущая активная задача
 * @property {PlanPomodoroTasksState} planTasks - плановые задачи
 * @property {ArchivePomodoroTasksState} archiveTasks - архив задач
 * @property {ThemeId} theme - текущая тема
 */
export type AppState = {
    editingPlanTaskIndex?: number | null;
    activeTask?: ActivePomodoroTask | null;
    planTasks: PlanPomodoroTasksState;
    archiveTasks: ArchivePomodoroTasksState;
    theme: ThemeId;
}

/**
 * Действия для изменения состояния приложения
 * @typedef {Object} AppActions
 */
export type AppActions = {
    /** Изменить тему приложения */
    setTheme(theme: ThemeId): void;
    /** Добавить новую задачу в план */
    addTask(task: PomodoroTask): void;
    /** Увеличить количество помидоров задачи */
    incTask(id: string): void;
    /** Уменьшить количество помидоров задачи */
    decTask(id: string): void;
    /** Переместить задачу в архив */
    archiveTask(id: string, restTime?: number): void;
    /** Удалить задачу из архива */
    deleteArchiveTask(index: number): void;
    /** Обновить задачу в плане */
    refreshTask(task: PomodoroTask): void;
    /** Начать редактирование задачи */
    startEditTask(index: number): void;
    /** Завершить редактирование и сохранить задачу */
    completeEditTask(task: PomodoroTask): void;
    /** Отменить редактирование */
    cancelEditTask(): void;
    /** Изменить порядок задач */
    reorderTasks(fromIndex: number, toIndex: number): void;
    /** Запустить таймер текущей задачи */
    startTask(): void;
    /** Остановить таймер */
    stopTask(): void;
    /** Поставить таймер на паузу */
    pauseTask(): void;
    /** Возобновить таймер */
    resumeTask(): void;
    /** Завершить текущую задачу */
    completeTask(): void;
    /** Подписать на события тика таймера */
    registerTimerTickEventListener(handler: (restTime: number) => void): void;
}