import type {PomodoroTaskCategory} from "./category.ts";

export type PomodoroTaskCategoryStatistics = {
    category: PomodoroTaskCategory;

    count: number;
}

export type PlanPomodoroTasksStatistics = {
    nextLongBreak: string;

    finishTime: string;

    categories: PomodoroTaskCategoryStatistics[];
}

export type ArchivePomodoroTasksStatistics = {
    categories: PomodoroTaskCategoryStatistics[];
}