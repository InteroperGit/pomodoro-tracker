import type {PomodoroTaskCategory} from "./category.ts";

/**
 * Базовая структура Pomodoro задачи
 * @typedef {Object} PomodoroTask
 * @property {string} id - уникальный идентификатор
 * @property {PomodoroTaskCategory} category - категория задачи
 * @property {string} description - описание задачи
 */
export type PomodoroTask = {
    id: string;
    category: PomodoroTaskCategory;
    description: string;
}

/**
 * Плановая задача с количеством помидоров
 * @typedef {Object} PlanPomodoroTask
 * @property {PomodoroTask} task - задача
 * @property {number} count - количество помидоров
 */
export type PlanPomodoroTask = {
    task: PomodoroTask;
    count: number;
}

/**
 * Выполненная задача с временем завершения
 * @typedef {Object} ArchivePomodoroTask
 * @property {PomodoroTask} task - задача
 * @property {number} taskTime - время выполнения (мс)
 * @property {number} completedAt - временная метка завершения (мс)
 */
export type ArchivePomodoroTask = {
    task: PomodoroTask;
    taskTime: number;
    completedAt: number;
}

/**
 * Типы активной задачи (помидор, перерыв)
 * @enum {number}
 */
export const ActivePomodoroTaskType = {
    Undefined: 0,
    Task: 1,
    ShortBreak: 2,
    LongBreak: 3,
} as const;

/** Тип активной задачи (значение из ActivePomodoroTaskType) */
export type ActivePomodoroTaskType = typeof ActivePomodoroTaskType[keyof typeof ActivePomodoroTaskType];

/**
 * Статусы активной задачи
 * @enum {number}
 */
export const ActivePomodoroTaskStatus = {
    Undefined: 0,
    Pending: 1,
    Active: 2,
    Paused: 3,
    Completed: 4,
} as const;

/** Статус активной задачи (значение из ActivePomodoroTaskStatus) */
export type ActivePomodoroTaskStatus = typeof ActivePomodoroTaskStatus[keyof typeof ActivePomodoroTaskStatus];

/**
 * Текущая активная задача (помидор или перерыв)
 * @typedef {Object} ActivePomodoroTask
 * @property {ActivePomodoroTaskType} type - тип (помидор/перерыв)
 * @property {PomodoroTask|null} [task] - задача (если это помидор)
 * @property {number} restTime - оставшееся время (мс)
 * @property {ActivePomodoroTaskStatus} status - статус
 * @property {number} shortBreakCount - количество выполненных коротких перерывов
 */
export type ActivePomodoroTask = {
    type: ActivePomodoroTaskType;
    task?: PomodoroTask | null;
    restTime: number;
    status: ActivePomodoroTaskStatus;
    shortBreakCount: number;
}