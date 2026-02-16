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

export const ActivePomodoroTaskType = {
    Undefined: 0,
    Task: 1,
    ShortBreak: 2,
    LongBreak: 3,
} as const;

export type ActivePomodoroTaskType = typeof ActivePomodoroTaskType[keyof typeof ActivePomodoroTaskType];

export const ActivePomodoroTaskStatus = {
    Undefined: 0,
    Pending: 1,
    Active: 2,
    Paused: 3,
    Completed: 4,
} as const;

export type ActivePomodoroTaskStatus = typeof ActivePomodoroTaskStatus[keyof typeof ActivePomodoroTaskStatus];

export type ActivePomodoroTask = {
    type: ActivePomodoroTaskType;
    task?: PomodoroTask | null;
    restTime: number;
    status: ActivePomodoroTaskStatus;
    shortBreakCount: number;
}