import type {ArchivePomodoroTask, PlanPomodoroTask} from "../types/task.ts";
import type {
    ArchivePomodoroTasksStatistics,
    PlanPomodoroTasksStatistics,
} from "../types/statistics.ts";

/**
 * Конфигурация для расчета статистики плана
 * @typedef {Object} PlanStatisticsConfig
 * @property {number} taskTime - время на один помидор (мс)
 * @property {number} shortBreakTime - время короткого перерыва (мс)
 * @property {number} longBreakTime - время длинного перерыва (мс)
 * @property {number} longBreakAfter - после скольких помидоров идет длинный перерыв
 */
export type PlanStatisticsConfig = {
    taskTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    longBreakAfter: number;
};

/**
 * Получить статистику по категориям из плана
 * @param {PlanPomodoroTask[]} tasks - массив плановых задач
 * @returns {Object[]} статистика по категориям
 */
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

/**
 * Рассчитать статистику плана с учетом перерывов
 * @param {PlanPomodoroTask[]} tasks - массив плановых задач
 * @param {PlanStatisticsConfig} config - конфигурация времени
 * @returns {PlanPomodoroTasksStatistics} полная статистика плана
 */
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

/**
 * Получить статистику по категориям из архива
 * @param {ArchivePomodoroTask[]} tasks - массив выполненных задач
 * @returns {Object[]} статистика по категориям
 */
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

/**
 * Рассчитать статистику архива выполненных задач
 * @param {ArchivePomodoroTask[]} tasks - массив выполненных задач
 * @returns {ArchivePomodoroTasksStatistics} статистика архива
 */
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
