import type {PomodoroTaskCategory} from "./category.ts";

export type PomodoroTask = {
    id: string;
    category: PomodoroTaskCategory;
    description: string;
}

export type PlanPomodoroTask = {
    task: PomodoroTask;
    count: number;
}

export type ArchivePomodoroTask = {
    task: PomodoroTask;
    taskTime: number;
    completedAt: number;
}