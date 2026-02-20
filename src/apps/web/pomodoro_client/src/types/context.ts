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

export type ThemeId = "light" | "dark";

export type AppState = {
    editingPlanTaskIndex?: number | null;
    activeTask?: ActivePomodoroTask | null;
    planTasks: PlanPomodoroTasksState;
    archiveTasks: ArchivePomodoroTasksState;
    theme: ThemeId;
}

export type AppActions = {
    setTheme(theme: ThemeId): void;
    addTask(task: PomodoroTask): void;
    incTask(id: string): void;
    decTask(id: string): void;
    archiveTask(id: string, restTime?: number): void;
    deleteArchiveTask(id: string): void;
    refreshTask(task: PomodoroTask): void;
    startEditTask(index: number): void;
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