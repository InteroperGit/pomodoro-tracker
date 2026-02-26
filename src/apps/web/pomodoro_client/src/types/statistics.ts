import type {PomodoroTaskCategory} from "./category.ts";

/**
 * Статистика по категориям
 * @typedef {Object} PomodoroTaskCategoryStatistics
 * @property {PomodoroTaskCategory} category - категория
 * @property {number} count - количество помидоров в категории
 */
export type PomodoroTaskCategoryStatistics = {
    category: PomodoroTaskCategory;
    count: number;
}

/**
 * Статистика плановых задач
 * @typedef {Object} PlanPomodoroTasksStatistics
 * @property {number} tasksCount - общее количество помидоров
 * @property {number} tasksTime - общее время задач (мс)
 * @property {number} nextLongBreak - время до первого длинного перерыва (мс)
 * @property {number} finishTime - полная длительность плана с перерывами (мс)
 * @property {PomodoroTaskCategoryStatistics[]} categories - статистика по категориям
 */
export type PlanPomodoroTasksStatistics = {
    tasksCount: number;
    tasksTime: number;
    nextLongBreak: number;
    finishTime: number;
    categories: PomodoroTaskCategoryStatistics[];
}

/**
 * Статистика архива выполненных задач
 * @typedef {Object} ArchivePomodoroTasksStatistics
 * @property {number} tasksCount - количество выполненных помидоров
 * @property {number} tasksTime - общее время выполнения (мс)
 * @property {PomodoroTaskCategoryStatistics[]} categories - статистика по категориям
 */
export type ArchivePomodoroTasksStatistics = {
    tasksCount: number;
    tasksTime: number;
    categories: PomodoroTaskCategoryStatistics[];
}