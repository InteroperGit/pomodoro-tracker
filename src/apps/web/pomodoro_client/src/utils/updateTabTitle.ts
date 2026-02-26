import type { ActivePomodoroTask } from "../types/task.ts";
import {
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
} from "../types/task.ts";

/** Заголовок вкладки по умолчанию */
const DEFAULT_TITLE = "Pomodoro";

/**
 * Метки типов задач для отображения в заголовке вкладки
 * @type {Record<number, string>}
 */
const TYPE_LABELS: Record<number, string> = {
    [ActivePomodoroTaskType.Task]: "Pomodoro",
    [ActivePomodoroTaskType.ShortBreak]: "Перерыв",
    [ActivePomodoroTaskType.LongBreak]: "Длинный перерыв",
};

/**
 * Форматирует время в формат ММ:СС
 * @param {number} timeMs - время в миллисекундах
 * @returns {string} отформатированное время
 */
const getTimeStr = (timeMs: number): string => {
    const sec = Math.floor(timeMs / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * Обновляет заголовок вкладки браузера с информацией об активной задаче
 * @param {ActivePomodoroTask|null|undefined} activeTask - активная задача
 */
export function updateTabTitle(activeTask: ActivePomodoroTask | null | undefined): void {
    const showCountdown =
        activeTask &&
        (activeTask.status === ActivePomodoroTaskStatus.Active ||
            activeTask.status === ActivePomodoroTaskStatus.Paused) &&
        activeTask.restTime != null;

    if (showCountdown) {
        const timeStr = getTimeStr(activeTask.restTime);
        const label = TYPE_LABELS[activeTask.type] ?? "Pomodoro";
        document.title = `${timeStr} — ${label}`;
    } else {
        document.title = DEFAULT_TITLE;
    }
}
