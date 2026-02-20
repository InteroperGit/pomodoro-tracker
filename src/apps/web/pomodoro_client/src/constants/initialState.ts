import type {
    ArchivePomodoroTasksState,
    PlanPomodoroTasksState,
} from "../types/context.ts";

export const getInitPlanTasks = (): PlanPomodoroTasksState => ({
    tasks: [],
    statistics: {
        tasksCount: 0,
        tasksTime: 0,
        finishTime: 0,
        nextLongBreak: 0,
        categories: [],
    },
});

export const getInitArchiveTasks = (): ArchivePomodoroTasksState => ({
    tasks: [],
    statistics: {
        tasksCount: 0,
        tasksTime: 0,
        categories: [],
    },
});