import styles from "./Timer.module.scss";
import globalStyles from "../global.module.scss";
import {
    type ActivePomodoroTask,
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
    type PlanPomodoroTask
} from "../../types/task.ts";
import {generateId} from "../../utils/idGenerator.ts";
import {useEffect} from "../../utils/render.ts";

export type TimerProps = {
    isMobile: boolean;
    activeTask?: ActivePomodoroTask | null;
    planTasks: PlanPomodoroTask[];
    actions: {
        startTask: () => void;
        stopTask: () => void;
        pauseTask: () => void;
        resumeTask: () => void;
        completeTask: () => void;
        registerActiveTaskTimerTick: (handler: (restTime: number) => void) => void;
    }
}

const getTime = (time: number): { minutes: string, seconds: string } => {
    const timeSec = time / 1000;
    const min = Math.floor(timeSec / 60);
    const sec = Math.floor(timeSec % 60);

    const minutes = min.toString().padStart(2, "0");
    const seconds = sec.toString().padStart(2, "0");

    return {
        minutes,
        seconds,
    }
}

const getButtonTitles = (task: ActivePomodoroTask) => {
    switch (task.type) {
        case ActivePomodoroTaskType.Undefined:
            return ["", ""];
        case ActivePomodoroTaskType.Task:
            switch (task.status) {
                case ActivePomodoroTaskStatus.Undefined:
                    return ["", ""];
                case ActivePomodoroTaskStatus.Pending:
                    return ["СТАРТ", "СТОП"];
                case ActivePomodoroTaskStatus.Active:
                    return ["ПАУЗА", "СТОП"];
                case ActivePomodoroTaskStatus.Paused:
                    return ["ПРОДОЛЖИТЬ", "СДЕЛАНО"];
                default:
                    return ["", ""];
            }
        case ActivePomodoroTaskType.ShortBreak:
        case ActivePomodoroTaskType.LongBreak:
            switch (task.status) {
                case ActivePomodoroTaskStatus.Undefined:
                    return ["", ""];
                case ActivePomodoroTaskStatus.Active:
                    return ["ПАУЗА", "ПРОПУСТИТЬ"];
                case ActivePomodoroTaskStatus.Paused:
                    return ["ПРОДОЛЖИТЬ", "ПРОПУСТИТЬ"]
                default:
                    return ["", ""];
            }
        default:
            return ["", ""];
    }
}

export function Timer({ isMobile, activeTask, planTasks, actions }: TimerProps) {
    if (!activeTask || planTasks.length === 0) {
        return `
                <div class="${styles.timer} ${isMobile ? styles.timer_mobile : ""} ${styles.timer__empty}">
                    <div class="${styles.timer__empty_icon}">⏰</div>
                    <div class="${styles.timer__empty_title}">Нет активной задачи</div>
                    <div class="${styles.timer__empty_subtitle}">Начните помодоро или перерыв</div>
                </div>
            `;
    }

    const { restTime, task } = activeTask;

    const leftButtonId = generateId();
    const rightButtonId = generateId();
    const timerCountdownId = generateId();

    const { minutes, seconds } = getTime(restTime);
    const [leftButtonTitle, rightButtonTitle] = getButtonTitles(activeTask);

    const timerTypeStyle = activeTask.type === ActivePomodoroTaskType.Task
        ? styles.timer__task
        : styles.timer__break;

    const rightButtonDisabled =
        activeTask.type === ActivePomodoroTaskType.Task
            && activeTask.status === ActivePomodoroTaskStatus.Pending
        ? `${styles.disabled}`
        : "";

    useEffect(() => {
        const leftButton = document.getElementById(leftButtonId);
        const rightButton = document.getElementById(rightButtonId);

        if (!leftButton || !rightButton) {
            return;
        }

        actions.registerActiveTaskTimerTick((restTime) => {
            const { minutes, seconds } = getTime(restTime);
            const timerCountdown = document.getElementById(timerCountdownId);

            if (!timerCountdown) {
                return;
            }

            timerCountdown.innerHTML = `${minutes}:${seconds}`;
        });

        leftButton.addEventListener("click", () => {
            if (activeTask.type === ActivePomodoroTaskType.Task
                || activeTask.type === ActivePomodoroTaskType.ShortBreak
                || activeTask.type === ActivePomodoroTaskType.LongBreak) {
                switch (activeTask.status) {
                    case ActivePomodoroTaskStatus.Pending:
                        actions.startTask();
                        break;
                    case ActivePomodoroTaskStatus.Active:
                        actions.pauseTask();
                        break;
                    case ActivePomodoroTaskStatus.Paused:
                        actions.resumeTask();
                        break;
                }
            }
        });

        rightButton.addEventListener("click", () => {
            if (activeTask.type === ActivePomodoroTaskType.Task
                || activeTask.type === ActivePomodoroTaskType.ShortBreak
                || activeTask.type === ActivePomodoroTaskType.LongBreak) {
                switch (activeTask.status) {
                    case ActivePomodoroTaskStatus.Active:
                        if (activeTask.type === ActivePomodoroTaskType.Task) {
                            actions.stopTask();
                        }
                        else if (activeTask.type === ActivePomodoroTaskType.ShortBreak
                            || activeTask.type === ActivePomodoroTaskType.LongBreak) {
                            actions.completeTask();
                        }

                        break;
                    case ActivePomodoroTaskStatus.Paused:
                        actions.completeTask();
                        break;
                }
            }
        });
    });

    return isMobile
        ?   `
                <div class="${styles.timer} ${styles.timer_mobile} ${timerTypeStyle}">
                    <div 
                        id="${timerCountdownId}"
                        class="${styles.timer__countdown}">
                        ${minutes}:${seconds}
                    </div>
        
                    <div class="${styles.timer__description}">
                        ${task ? task.description : ""}
                    </div>
                    
                    <div class="${styles.timer__buttons_mobile}">
                        <button 
                            id="${leftButtonId}"
                            class="${globalStyles.button} ${styles.timer_button}">
                            ${leftButtonTitle}
                        </button>
                        <button 
                            id="${rightButtonId}"
                            class="${globalStyles.button} ${styles.timer_button} ${rightButtonDisabled}">
                            ${rightButtonTitle}
                        </button>
                    </div>
                </div>
            `
        :   `
                <div class="${styles.timer} ${timerTypeStyle}">
                    <div 
                        id="${timerCountdownId}"
                        class="${styles.timer__countdown}">
                        ${minutes}:${seconds}
                    </div>
        
                    <div class="${styles.timer__description}">
                        ${task ? task.description : ""}
                    </div>
        
                    <div class="${styles.timer__buttons}">
                        <button 
                            id="${leftButtonId}"
                            class="${globalStyles.button} ${styles.timer_button}">
                            ${leftButtonTitle}
                        </button>
                        <button 
                            id="${rightButtonId}"
                            class="${globalStyles.button} ${styles.timer_button} ${rightButtonDisabled}">
                            ${rightButtonTitle}
                        </button>
                    </div>
                </div>
            `;
}