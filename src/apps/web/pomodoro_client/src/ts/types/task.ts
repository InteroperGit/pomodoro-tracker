import type {PomodoroTaskCategory} from "./category.ts";

export type PomodoroTask = {
    category: PomodoroTaskCategory;

    description: string;
}

export type PlanPomodoroTask = {
    task: PomodoroTask;

    count: number;
}