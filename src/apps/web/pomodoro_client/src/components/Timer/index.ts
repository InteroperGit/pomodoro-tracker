import styles from "./Timer.module.scss";
import globalStyles from "../global.module.scss";
import type {ActivePomodoroTask} from "../../types/task.ts";

export type TimerProps = {
    activeTask?: ActivePomodoroTask | null
}

const getTime = (time: number): { minutes: number, seconds: number } => {
    const timeSec = time / 1000;
    const minutes = Math.floor(timeSec / 60 );
    const seconds = Math.floor((timeSec % 60) / 60);

    return {
        minutes,
        seconds,
    }
}

export function Timer({ activeTask }: TimerProps) {
    if (!activeTask) {
        return "<div>Нет активной задачи</div>";
    }

    const { restTime, task } = activeTask;

    const humanRestTime = getTime(restTime);
    const minutes = humanRestTime.minutes.toString().padStart(2, "0");
    const seconds = humanRestTime.seconds.toString().padStart(2, "0");

    return `
        <div class="${styles.timer}">
            <div class="${styles.timer__countdown}">
                ${minutes}:${seconds}
            </div>

            <div class="${styles.timer__description}">
                ${task.description}
            </div>

            <div class="${styles.timer__buttons}">
                <button class="${globalStyles.button} ${styles.timer_button}">
                    СТАРТ
                </button>
                <button class="${globalStyles.button} ${styles.timer_button}">
                    ВЫПОЛНЕНО
                </button>
            </div>
        </div>
    `;
}