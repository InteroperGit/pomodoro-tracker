import type { ActivePomodoroTask } from "../types/task.ts";
import {
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
} from "../types/task.ts";

const DEFAULT_TITLE = "Pomodoro";

const TYPE_LABELS: Record<number, string> = {
    [ActivePomodoroTaskType.Task]: "Pomodoro",
    [ActivePomodoroTaskType.ShortBreak]: "Перерыв",
    [ActivePomodoroTaskType.LongBreak]: "Длинный перерыв",
};

const getTimeStr = (timeMs: number): string => {
    const sec = Math.floor(timeMs / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

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
