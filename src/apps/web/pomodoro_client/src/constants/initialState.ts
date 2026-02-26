import type {
    ArchivePomodoroTasksState,
    PlanPomodoroTasksState,
} from "../types/context.ts";

/**
 * Инициализирует начальное состояние плановых задач
 * @returns {PlanPomodoroTasksState} пустое состояние плана
 */
export const getInitPlanTasks = (): PlanPomodoroTasksState => ({
    tasks: [],
    statistics: {
        tasksCount: 0,
        tasksTime: 0,
        finishTime: 0,
        nextLongBreak: 0,
        categories: [],
    },
});

/**
 * Инициализирует начальное состояние архива задач
 * @returns {ArchivePomodoroTasksState} пустое состояние архива
 */
export const getInitArchiveTasks = (): ArchivePomodoroTasksState => ({
    tasks: [],
    statistics: {
        tasksCount: 0,
        tasksTime: 0,
        categories: [],
    },
});