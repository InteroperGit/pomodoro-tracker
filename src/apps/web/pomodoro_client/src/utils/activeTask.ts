import { type ActivePomodoroTask, ActivePomodoroTaskType, ActivePomodoroTaskStatus } from "../types/task.ts";

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
