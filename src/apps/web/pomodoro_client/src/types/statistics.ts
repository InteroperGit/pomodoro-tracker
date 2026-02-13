import type {PomodoroTaskCategory} from "./category.ts";

export type PomodoroTaskCategoryStatistics = {
    category: PomodoroTaskCategory;
    count: number;
}

export type PlanPomodoroTasksStatistics = {
    tasksCount: number;
    tasksTime: number;
    nextLongBreak: number;
    finishTime: number;
    categories: PomodoroTaskCategoryStatistics[];
}

export type ArchivePomodoroTasksStatistics = {
    tasksCount: number;
    tasksTime: number;
    categories: PomodoroTaskCategoryStatistics[];
}