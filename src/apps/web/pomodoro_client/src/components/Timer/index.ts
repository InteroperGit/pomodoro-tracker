import styles from "./Timer.module.scss";
import globalStyles from "../global.module.scss";
import {EmptyState} from "../EmptyState/index.ts";
import {
    type ActivePomodoroTask,
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
    type PlanPomodoroTask
} from "../../types/task.ts";
import { useEffect } from "../../utils/render.ts";

let _prevTimerType: ActivePomodoroTaskType | undefined;

/** Стабильные id элементов таймера (одно приложение на странице). */
const TIMER_LEFT_BUTTON_ID = "timer-left-btn";
const TIMER_RIGHT_BUTTON_ID = "timer-right-btn";
const TIMER_COUNTDOWN_ID = "timer-countdown";

/** Подписи кнопок управления таймером. */
const BUTTON_TITLES = {
    START: "СТАРТ",
    STOP: "СТОП",
    PAUSE: "ПАУЗА",
    RESUME: "ПРОДОЛЖИТЬ",
    DONE: "СДЕЛАНО",
    SKIP: "ПРОПУСТИТЬ",
} as const;

/**
 * Пропсы компонента таймера.
 * @property {boolean} isMobile - признак мобильного вида.
 * @property {ActivePomodoroTask | null | undefined} [activeTask] - текущая активная задача или перерыв.
 * @property {PlanPomodoroTask[]} planTasks - задачи в плане.
 * @property {Object} actions - действия таймера и подписка на тик.
 */
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
    };
};

/**
 * Преобразует время в миллисекундах в объект с минутами и секундами (строки с ведущим нулём).
 * @param {number} time - время в мс.
 * @returns {{ minutes: string, seconds: string }}
 */
const getTime = (time: number): { minutes: string, seconds: string } => {
    const timeSec = time / 1000;
    const min = Math.floor(timeSec / 60);
    const sec = Math.floor(timeSec % 60);

    const minutes = min.toString().padStart(2, "0");
    const seconds = sec.toString().padStart(2, "0");

    return {
        minutes,
        seconds,
    };
};

/**
 * Возвращает подписи левой и правой кнопок в зависимости от типа и статуса задачи.
 * @param {ActivePomodoroTask} task - активная задача или перерыв.
 * @returns {[string, string]} [leftTitle, rightTitle]
 */
const getButtonTitles = (task: ActivePomodoroTask): [string, string] => {
    switch (task.type) {
        case ActivePomodoroTaskType.Undefined:
            return ["", ""];
        case ActivePomodoroTaskType.Task:
            switch (task.status) {
                case ActivePomodoroTaskStatus.Undefined:
                    return ["", ""];
                case ActivePomodoroTaskStatus.Pending:
                    return [BUTTON_TITLES.START, BUTTON_TITLES.STOP];
                case ActivePomodoroTaskStatus.Active:
                    return [BUTTON_TITLES.PAUSE, BUTTON_TITLES.STOP];
                case ActivePomodoroTaskStatus.Paused:
                    return [BUTTON_TITLES.RESUME, BUTTON_TITLES.DONE];
                default:
                    return ["", ""];
            }
        case ActivePomodoroTaskType.ShortBreak:
        case ActivePomodoroTaskType.LongBreak:
            switch (task.status) {
                case ActivePomodoroTaskStatus.Undefined:
                    return ["", ""];
                case ActivePomodoroTaskStatus.Active:
                    return [BUTTON_TITLES.PAUSE, BUTTON_TITLES.SKIP];
                case ActivePomodoroTaskStatus.Paused:
                    return [BUTTON_TITLES.RESUME, BUTTON_TITLES.SKIP];
                default:
                    return ["", ""];
            }
        default:
            return ["", ""];
    }
};

/**
 * Компонент таймера Pomodoro: обратный отсчёт, описание задачи, кнопки управления.
 * При отсутствии активной задачи или задач в плане показывает пустое состояние.
 *
 * @param {TimerProps} props - пропсы компонента.
 * @returns {string} HTML‑разметка блока таймера или пустого состояния.
 */
export function Timer({ isMobile, activeTask, planTasks, actions }: TimerProps) {
    if (planTasks.length === 0) {
        return `
            <div class="${styles.timer} ${isMobile ? styles.timer_mobile : ""} ${styles.timer__empty}">
                ${EmptyState({
                    variant: "timer_no_plan",
                    title: "Нет задач в плане",
                    subtitle: "Добавьте задачи в план выше",
                    className: styles.timer__empty_content,
                })}
            </div>
        `;
    }

    if (!activeTask) {
        return `
            <div class="${styles.timer} ${isMobile ? styles.timer_mobile : ""} ${styles.timer__empty}">
                ${EmptyState({
                    variant: "timer_no_active",
                    title: "Нет активной задачи",
                    subtitle: "Начните помодоро или перерыв",
                    className: styles.timer__empty_content,
                })}
            </div>
        `;
    }

    const { restTime, task } = activeTask;

    const { minutes, seconds } = getTime(restTime);
    const [leftButtonTitle, rightButtonTitle] = getButtonTitles(activeTask);

    const modeChanged = _prevTimerType !== undefined && _prevTimerType !== activeTask.type;
    _prevTimerType = activeTask.type;

    const timerTypeStyle = activeTask.type === ActivePomodoroTaskType.Task
        ? styles.timer__task
        : styles.timer__break;

    const transitionClass = modeChanged ? styles.timer__mode_enter : "";

    const rightButtonDisabled =
        activeTask.type === ActivePomodoroTaskType.Task
            && activeTask.status === ActivePomodoroTaskStatus.Pending
            ? styles.disabled
            : "";

    useEffect(() => {
        const leftButton = document.getElementById(TIMER_LEFT_BUTTON_ID);
        const rightButton = document.getElementById(TIMER_RIGHT_BUTTON_ID);

        if (!leftButton || !rightButton) {
            return;
        }

        actions.registerActiveTaskTimerTick((restTime) => {
            const { minutes, seconds } = getTime(restTime);
            const timerCountdown = document.getElementById(TIMER_COUNTDOWN_ID);
            if (timerCountdown) {
                timerCountdown.textContent = `${minutes}:${seconds}`;
            }
        });

        const handleLeftClick = () => {
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
        };

        const handleRightClick = () => {
            if (activeTask.type === ActivePomodoroTaskType.Task
                || activeTask.type === ActivePomodoroTaskType.ShortBreak
                || activeTask.type === ActivePomodoroTaskType.LongBreak) {
                switch (activeTask.status) {
                    case ActivePomodoroTaskStatus.Active:
                        if (activeTask.type === ActivePomodoroTaskType.Task) {
                            actions.stopTask();
                        } else if (activeTask.type === ActivePomodoroTaskType.ShortBreak
                            || activeTask.type === ActivePomodoroTaskType.LongBreak) {
                            actions.completeTask();
                        }
                        break;
                    case ActivePomodoroTaskStatus.Paused:
                        actions.completeTask();
                        break;
                }
            }
        };

        leftButton.addEventListener("click", handleLeftClick);
        rightButton.addEventListener("click", handleRightClick);

        return () => {
            leftButton.removeEventListener("click", handleLeftClick);
            rightButton.removeEventListener("click", handleRightClick);
        };
    });

    const countdownAriaLabel = `Осталось времени: ${minutes} минут ${seconds} секунд`;

    return isMobile
        ? `
            <div class="${styles.timer} ${styles.timer_mobile} ${timerTypeStyle} ${transitionClass}">
                <div
                    id="${TIMER_COUNTDOWN_ID}"
                    class="${styles.timer__countdown}"
                    role="status"
                    aria-live="polite"
                    aria-label="${countdownAriaLabel}">
                    ${minutes}:${seconds}
                </div>
                <div class="${styles.timer__description} ${styles.timer__description_mobile}">
                    ${task ? task.description : ""}
                </div>
                <div class="${styles.timer__buttons_mobile}">
                    <button
                        id="${TIMER_LEFT_BUTTON_ID}"
                        type="button"
                        class="${globalStyles.button} ${styles.timer_button}"
                        aria-label="${leftButtonTitle}">
                        ${leftButtonTitle}
                    </button>
                    <button
                        id="${TIMER_RIGHT_BUTTON_ID}"
                        type="button"
                        class="${globalStyles.button} ${styles.timer_button} ${rightButtonDisabled}"
                        aria-label="${rightButtonTitle}">
                        ${rightButtonTitle}
                    </button>
                </div>
            </div>
        `
        : `
            <div class="${styles.timer} ${timerTypeStyle} ${transitionClass}">
                <div
                    id="${TIMER_COUNTDOWN_ID}"
                    class="${styles.timer__countdown}"
                    role="status"
                    aria-live="polite"
                    aria-label="${countdownAriaLabel}">
                    ${minutes}:${seconds}
                </div>
                <div class="${styles.timer__description}">
                    ${task ? task.description : ""}
                </div>
                <div class="${styles.timer__buttons}">
                    <button
                        id="${TIMER_LEFT_BUTTON_ID}"
                        type="button"
                        class="${globalStyles.button} ${styles.timer_button}"
                        aria-label="${leftButtonTitle}">
                        ${leftButtonTitle}
                    </button>
                    <button
                        id="${TIMER_RIGHT_BUTTON_ID}"
                        type="button"
                        class="${globalStyles.button} ${styles.timer_button} ${rightButtonDisabled}"
                        aria-label="${rightButtonTitle}">
                        ${rightButtonTitle}
                    </button>
                </div>
            </div>
        `;
}