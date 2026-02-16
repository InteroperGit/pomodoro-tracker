import type {ActivePomodoroTask, ArchivePomodoroTask, PlanPomodoroTask, PomodoroTask} from "./task.ts";
import type {ArchivePomodoroTasksStatistics, PlanPomodoroTasksStatistics} from "./statistics.ts";

export type PlanPomodoroTasksState = {
    tasks: PlanPomodoroTask[];
    statistics: PlanPomodoroTasksStatistics;
}

export type ArchivePomodoroTasksState = {
    tasks: ArchivePomodoroTask[];
    statistics: ArchivePomodoroTasksStatistics;
}

export type AppState = {
    editingTaskId?: string | null;
    activeTask?: ActivePomodoroTask | null;
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
    startTask(): void;
    stopTask(): void;
    pauseTask(): void;
    resumeTask(): void;
    completeTask(): void;
    registerTimerTickEventListener(handler: (restTime: number) => void): void;
}