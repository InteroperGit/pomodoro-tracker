import type { AppState } from "../types/context.ts";

function isObject(val: unknown): val is Record<string, unknown> {
    return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isValidTask(val: unknown): boolean {
    if (!isObject(val)) {
        return false;
    }
    const { task } = val;
    if (!isObject(task)) {
        return false;
    }
    if (typeof task.id !== "string") {
        return false;
    }
    if (typeof task.description !== "string") {
        return false;
    }
    if (!isObject(task.category)) {
        return false;
    }
    if (typeof task.category.name !== "string") {
        return false;
    }
    return true;
}

function isValidPlanTask(val: unknown): boolean {
    if (!isObject(val)) {
        return false;
    }
    if (typeof val.count !== "number") {
        return false;
    }
    return isValidTask(val);
}

function isValidArchiveTask(val: unknown): boolean {
    if (!isObject(val)) {
        return false;
    }
    if (typeof val.taskTime !== "number") {
        return false;
    }
    if (typeof val.completedAt !== "number") {
        return false;
    }
    return isValidTask(val);
}

/**
 * Валидирует сырые данные из localStorage и приводит их к AppState
 * @param {unknown} raw - распарсенный объект из localStorage
 * @returns {AppState|null} валидное состояние или null при ошибке структуры
 */
export function validateAppState(raw: unknown): AppState | null {
    if (!isObject(raw)) {
        return null;
    }

    const { planTasks, archiveTasks } = raw;

    if (!isObject(planTasks)) {
        return null;
    }
    if (!Array.isArray(planTasks.tasks)) {
        return null;
    }
    if (!planTasks.tasks.every(isValidPlanTask)) {
        return null;
    }

    if (!isObject(archiveTasks)) {
        return null;
    }
    if (!Array.isArray(archiveTasks.tasks)) {
        return null;
    }
    if (!archiveTasks.tasks.every(isValidArchiveTask)) {
        return null;
    }

    return raw as AppState;
}
