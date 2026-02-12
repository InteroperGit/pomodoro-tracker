import type {PomodoroTaskCategory} from "./category.ts";

export type PomodoroTaskCategoryStatistics = {
    category: PomodoroTaskCategory;

    count: number;
}

export type PlanPomodoroTasksStatistics = {
    tasksCount: number;

    tasksTime: string;

    nextLongBreak: string;

    finishTime: string;

    categories: PomodoroTaskCategoryStatistics[];
}

export type ArchivePomodoroTasksStatistics = {
    tasksCount: number;

    tasksTime: string;

    categories: PomodoroTaskCategoryStatistics[];
}