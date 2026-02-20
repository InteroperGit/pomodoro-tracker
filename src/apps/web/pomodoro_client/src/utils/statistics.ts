import type {ArchivePomodoroTask, PlanPomodoroTask} from "../types/task.ts";
import type {
    ArchivePomodoroTasksStatistics,
    PlanPomodoroTasksStatistics,
} from "../types/statistics.ts";

export type PlanStatisticsConfig = {
    taskTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    longBreakAfter: number;
};

function getPlanCategories(tasks: PlanPomodoroTask[]) {
    const map = new Map<string, number>();
    tasks.forEach(({ task, count }) => {
        const key = task.category.name;
        map.set(key, (map.get(key) ?? 0) + count);
    });
    return Array.from(map.entries(), ([name, count]) => ({
        category: { name },
        count,
    }));
}

export function getPlanTasksStatistics(
    tasks: PlanPomodoroTask[],
    config: PlanStatisticsConfig
): PlanPomodoroTasksStatistics {
    const { taskTime, shortBreakTime, longBreakTime, longBreakAfter } = config;
    const tasksCount = tasks.reduce((sum, t) => sum + t.count, 0);
    const longBreaksCount = Math.floor(tasksCount / longBreakAfter);
    const shortBreaksCount = Math.max(0, tasksCount - 1 - longBreaksCount);

    const totalTime =
        tasksCount * taskTime +
        shortBreaksCount * shortBreakTime +
        longBreaksCount * longBreakTime;
    const finishTime = Date.now() + totalTime;

    const timeUntilFirstLongBreak =
        longBreakAfter * taskTime +
        (longBreakAfter - 1) * shortBreakTime;
    const nextLongBreak =
        tasksCount >= longBreakAfter ? Date.now() + timeUntilFirstLongBreak : 0;

    return {
        tasksCount,
        tasksTime: tasksCount * taskTime,
        nextLongBreak,
        finishTime,
        categories: getPlanCategories(tasks),
    };
}

function getArchiveCategories(tasks: ArchivePomodoroTask[]) {
    const map = new Map<string, number>();
    tasks.forEach(({ task }) => {
        const key = task.category.name;
        map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries(), ([name, count]) => ({
        category: { name },
        count,
    }));
}

export function getArchiveTasksStatistics(
    tasks: ArchivePomodoroTask[]
): ArchivePomodoroTasksStatistics {
    const tasksCount = tasks.length;
    const tasksTime = tasks.reduce((sum, t) => sum + t.taskTime, 0);
    return {
        tasksCount,
        tasksTime,
        categories: getArchiveCategories(tasks),
    };
}
