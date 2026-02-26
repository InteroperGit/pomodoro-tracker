import { type ActivePomodoroTask, ActivePomodoroTaskType, ActivePomodoroTaskStatus } from "../types/task.ts";

/**
 * Валидирует и очищает активную задачу, возвращает null если она невалидна
 * @param {ActivePomodoroTask|null|undefined} activeTask - активная задача
 * @returns {ActivePomodoroTask|null} валидная задача или null
 */
export const sanitizeActiveTask = (activeTask: ActivePomodoroTask | null | undefined): ActivePomodoroTask | null => {
    if (!activeTask) {
        return null;
    }

    if (activeTask.type === ActivePomodoroTaskType.Undefined 
        || activeTask.status === ActivePomodoroTaskStatus.Undefined) {
        return null;
    }

    if (activeTask.restTime <= 0) {
        return null;
    }

    if (activeTask.type === ActivePomodoroTaskType.Task && !activeTask.task) {
        return null;
    }

    return activeTask;
}
