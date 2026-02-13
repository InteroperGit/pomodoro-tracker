import type {PlanPomodoroTask, PomodoroTask} from "./task.ts";
import type {ArchivePomodoroTasksStatistics, PlanPomodoroTasksStatistics} from "./statistics.ts";

export const ActivePomodoroTaskType = {
    Undefined: 0,
    Task: 1,
    ShortBreak: 2,
    LongBreak: 3,
} as const;

export type ActivePomodoroTaskType = typeof ActivePomodoroTaskType[keyof typeof ActivePomodoroTaskType];

const ActivePomodoroTaskStatus = {
    Undefined: 0,
    Pending: 1,
    Active: 2,
    Paused: 3,
    Completed: 4,
} as const;

export type ActivePomodoroTaskStatus = typeof ActivePomodoroTaskStatus[keyof typeof ActivePomodoroTaskStatus];

export type ActivePomodoroTaskState = {
    type: ActivePomodoroTaskType;
    taskId: string | null;
    restTime: number;
    status: ActivePomodoroTaskStatus;
    shortBreakCount: number;
}

export type PlanPomodoroTasksState = {
    tasks: PlanPomodoroTask[];
    statistics: PlanPomodoroTasksStatistics;
}

export type ArchivePomodoroTasksState = {
    tasks: PomodoroTask[];
    statistics: ArchivePomodoroTasksStatistics;
}

export type AppState = {
    editingTaskId?: string | null;
    activeTask?: ActivePomodoroTaskState | null;
    planTasks: PlanPomodoroTasksState;
    archiveTasks: ArchivePomodoroTasksState;
}

export type AppActions = {
    addTask(task: PomodoroTask): void;
    incTask(id: string): void;
    decTask(id: string): void;
    archiveTask(id: string): void;
    startEditTask(id: string): void;
    completeEditTask(task: PomodoroTask): void;
    cancelEditTask(): void;
    reorderTasks(fromIndex: number, toIndex: number): void;
}