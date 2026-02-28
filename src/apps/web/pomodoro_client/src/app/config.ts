/**
 * Конфигурация приложения Pomodoro
 * @typedef {Object} AppConfig
 * @property {number} taskTime - длительность одного помидора (мс)
 * @property {number} shortBreakTime - длительность короткого перерыва (мс)
 * @property {number} longBreakTime - длительность длинного перерыва (мс)
 * @property {number} longBreakAfter - количество помидоров до длинного перерыва
 */
export type AppConfig = {
    taskTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    longBreakAfter: number;
};

const DEFAULT_POMODORO_TASK_TIME = 25;
const DEFAULT_POMODORO_SHORT_BREAK_TIME = 5;
const DEFAULT_POMODORO_LONG_BREAK_TIME = 15;
const DEFAULT_LONG_BREAK_AFTER = 4;

const MIN_TO_MS = 60 * 1000;

export const appConfig: AppConfig = {
    taskTime: Number(import.meta.env.VITE_TASK_TIME_MIN ?? DEFAULT_POMODORO_TASK_TIME) * MIN_TO_MS,
    shortBreakTime: Number(import.meta.env.VITE_SHORT_BREAK_TIME_MIN ?? DEFAULT_POMODORO_SHORT_BREAK_TIME) * MIN_TO_MS,
    longBreakTime: Number(import.meta.env.VITE_LONG_BREAK_TIME_MIN ?? DEFAULT_POMODORO_LONG_BREAK_TIME) * MIN_TO_MS,
    longBreakAfter: Number(import.meta.env.VITE_LONG_BREAK_AFTER ?? DEFAULT_LONG_BREAK_AFTER),
};
