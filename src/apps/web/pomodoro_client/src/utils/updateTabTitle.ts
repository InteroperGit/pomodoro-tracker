import type { ActivePomodoroTask } from "../types/task.ts";
import {
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
} from "../types/task.ts";
import { t } from '../i18n/index.ts';

/** Заголовок вкладки по умолчанию */
const DEFAULT_TITLE = "Pomodoro";

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
        let label: string;
        if (activeTask.type === ActivePomodoroTaskType.ShortBreak) {
            label = t('tabTitle.shortBreak');
        } else if (activeTask.type === ActivePomodoroTaskType.LongBreak) {
            label = t('tabTitle.longBreak');
        } else {
            label = "Pomodoro";
        }
        document.title = `${timeStr} — ${label}`;
    } else {
        document.title = DEFAULT_TITLE;
    }
}
