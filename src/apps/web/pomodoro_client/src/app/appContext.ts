import type { AppState, PomodoroEvent } from "../types/context.ts";
import { ActivePomodoroTaskType } from "../types/task.ts";
import { createStore } from "../utils/store.ts";
import { ActiveTaskController, type ActiveTaskControllerConfiguration } from "./ActiveTaskController.ts";
import { createTaskActions } from "./actions/taskActions.ts";
import { createTimerActions } from "./actions/timerActions.ts";
import { createThemeActions } from "./actions/themeActions.ts";
import { createLocaleActions } from "./actions/localeActions.ts";
import { setLocale } from '../i18n';
import { appConfig } from "./config.ts";

let context: AppContext;

/**
 * Создает контекст приложения с управлением состоянием и действиями
 * @param {AppState} initialState - начальное состояние приложения
 * @param {Function} onTickCallback - callback при каждом тике таймера
 * @param {Function} [onPomodoroCallback] - callback при событиях помидора
 * @returns {AppContext} контекст приложения со store и actions
 */
export function createContext(
    initialState: AppState,
    onTickCallback: (state: AppState) => void,
    onPomodoroCallback?: (event: PomodoroEvent) => void
) {
    setLocale(initialState.locale);

    const configuration: ActiveTaskControllerConfiguration = {
        taskTime: appConfig.taskTime,
        shortBreakTime: appConfig.shortBreakTime,
        longBreakTime: appConfig.longBreakTime,
        maxShortBreaksSerie: appConfig.longBreakAfter,
    };

    if (initialState.activeTask
        && (initialState.activeTask.type === ActivePomodoroTaskType.Undefined
            || initialState.activeTask.status === ActivePomodoroTaskType.Undefined)) {
        initialState.activeTask = null;
    }

    const taskController = new ActiveTaskController(configuration);

    if (initialState.activeTask) {
        taskController.activateTask(initialState.activeTask);
    } else {
        taskController.activateNextTask(initialState.planTasks.tasks, true);
    }

    initialState.activeTask = taskController.activeTask;

    const store = createStore<AppState>(initialState);

    const taskActions = createTaskActions(store, taskController, appConfig);
    const timerActions = createTimerActions(store, taskController, onPomodoroCallback);
    const themeActions = createThemeActions(store);
    const localeActions = createLocaleActions(store);

    const actions = { ...taskActions, ...timerActions, ...themeActions, ...localeActions };

    taskController.addEventListener("tick", (restTime?: number) => {
        const s = store.getState();
        if (s.activeTask && restTime) {
            s.activeTask.restTime = restTime;
            onTickCallback(s);
        }
    });

    taskController.addEventListener("completed", () => {
        let s = store.getState();

        if (!s.activeTask) {
            return;
        }

        const completedType = s.activeTask.type;
        if (s.activeTask.type === ActivePomodoroTaskType.Task && s.activeTask.task) {
            taskActions.archiveTask(s.activeTask.task.id, s.activeTask.restTime);
        }

        s = store.getState();

        taskController.activateNextTask(s.planTasks.tasks);

        const nextTask = taskController.activeTask;

        if (completedType === ActivePomodoroTaskType.Task) {
            onPomodoroCallback?.({ type: "completed", taskType: "task" });
        } else if (completedType === ActivePomodoroTaskType.ShortBreak) {
            onPomodoroCallback?.({ type: "completed", taskType: "shortBreak" });
        } else if (completedType === ActivePomodoroTaskType.LongBreak) {
            onPomodoroCallback?.({ type: "completed", taskType: "longBreak" });
        }

        if (nextTask.type === ActivePomodoroTaskType.ShortBreak) {
            onPomodoroCallback?.({ type: "breakStarted", taskType: "shortBreak" });
        } else if (nextTask.type === ActivePomodoroTaskType.LongBreak) {
            onPomodoroCallback?.({ type: "breakStarted", taskType: "longBreak" });
        }

        store.setState({ ...s, activeTask: nextTask });
    });

    taskController.addEventListener("idle", () => {
        console.log("Все задачи успешно выполнены");
    });

    return { store, actions };
}

/**
 * Регистрирует глобальный контекст приложения
 * @param {AppContext} ctx - контекст для регистрации
 */
export function registerContext(ctx: AppContext) {
    if (!ctx) {
        throw new Error("Failed to register uninitialized context.");
    }

    context = ctx;
}

/**
 * Получает зарегистрированный контекст приложения
 * @returns {AppContext} контекст приложения
 */
export function useContext() {
    if (!context) {
        throw new Error("Failed to use a context. Context is not initialized");
    }

    return context;
}

export type AppContext = ReturnType<typeof createContext>;
