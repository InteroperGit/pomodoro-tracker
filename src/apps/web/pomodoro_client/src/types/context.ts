import type {PlanPomodoroTask, PomodoroTask} from "./task.ts";
import type {ArchivePomodoroTasksStatistics, PlanPomodoroTasksStatistics} from "./statistics.ts";

export type PlanTasksState = {
    tasksCount: number;
    tasksTime: string;
    planTasks: PlanPomodoroTask[];
    statistics: PlanPomodoroTasksStatistics;
}

export type ArchiveTasksState = {
    tasksCount: number;
    tasksTime: string;
    tasks: PomodoroTask[];
    statistics: ArchivePomodoroTasksStatistics;
}

export type AppState = {
    activeTaskId?: string | null;
    editingTaskId?: string | null;
    planTasksState: PlanTasksState;
    archiveState: ArchiveTasksState;
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