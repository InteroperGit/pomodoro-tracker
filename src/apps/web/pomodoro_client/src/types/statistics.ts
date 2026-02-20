import type {PomodoroTaskCategory} from "./category.ts";

export type PomodoroTaskCategoryStatistics = {
    category: PomodoroTaskCategory;
    count: number;
}

export type PlanPomodoroTasksStatistics = {
    tasksCount: number;
    tasksTime: number;
    /** Длительность (мс) от начала до старта первого длинного перерыва; 0 если перерывов нет */
    nextLongBreak: number;
    /** Общая длительность плана (мс) — все помидоры и перерывы */
    finishTime: number;
    categories: PomodoroTaskCategoryStatistics[];
}

export type ArchivePomodoroTasksStatistics = {
    tasksCount: number;
    tasksTime: number;
    categories: PomodoroTaskCategoryStatistics[];
}