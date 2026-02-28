import "@fortawesome/fontawesome-free/css/all.min.css";
import { findById } from "../utils/dom";
import { App } from "./App";
import { type AppState, type PomodoroEvent } from "../types/context.ts";
import {createContext, registerContext} from "./appContext.ts";
import {appConfig} from "./config.ts";
import {applyTheme} from "../utils/theme.ts";
import {getPlanTasksStatistics} from "../utils/statistics.ts";
import {render} from "../utils/render.ts";
import {onLayoutChanged} from "../utils/layout.ts";
import {LocalStorage} from "../utils/localStorage.ts";
import { throttle } from "../utils/throttle.ts";
import { getInitArchiveTasks, getInitPlanTasks } from "../constants/initialState.ts";
import { sanitizeActiveTask } from "../utils/activeTask.ts";
import { updateTabTitle } from "../utils/updateTabTitle.ts";
import { validateAppState } from "../utils/stateSchema.ts";
import { showToast } from "../components/Toast";
import { hasActiveInput } from "../utils/input.ts";
import { requestNotificationPermission, sendNotification } from "../utils/notifications.ts";

/** Префикс для ключей localStorage */
const STORAGE_PREFIX = "pomodoro";
/** Ключ для хранения состояния */
const STATE_ITEM_KEY = "state";
/** Задержка throttle при сохранении состояния (мс) */
const THROTTLE_DELAY = 1000;
/** ID корневого DOM элемента */
const ROOT_ELEMENT_ID = "root";

/**
 * Инициализирует приложение в корневом элементе
 * Загружает сохраненное состояние, создает контекст и запускает рендер
 * @param {HTMLElement} root - корневой DOM элемент
 */
const initApp = (root: HTMLElement) => {
    const storage = new LocalStorage(STORAGE_PREFIX);
    
    let state: AppState | null = null;
    try {
        state = validateAppState(storage.getItem<unknown>(STATE_ITEM_KEY));
    }
    catch {
        state = null;
    }

    const activeTask = sanitizeActiveTask(state?.activeTask);
    let planTasks = state?.planTasks ?? getInitPlanTasks();
    if (planTasks.tasks.length > 0) {
        planTasks = { ...planTasks, statistics: getPlanTasksStatistics(planTasks.tasks, appConfig) };
    }
    const archiveTasks = state?.archiveTasks ?? getInitArchiveTasks();

    const theme = state?.theme === "dark" ? "dark" : "light";
    applyTheme(theme);

    const initialState: AppState = {
        editingPlanTaskIndex: null,
        activeTask,
        planTasks,
        archiveTasks,
        theme,
    };

    const saveStateThrottle: (s: AppState) => void = throttle((s: AppState) => {
        if (s == null) {
            return;
        }
        storage.setItem<AppState>(STATE_ITEM_KEY, s);
    }, THROTTLE_DELAY);

    const onTickHandler = (s: AppState) => {
        saveStateThrottle(s);
        updateTabTitle(s.activeTask);
    };

    const onPomodoroHandler = (event: PomodoroEvent) => {
        switch (event.type) {
            case "started":
                if (event.taskType === "task") {
                    showToast("Помидор начат!", "info");
                    void requestNotificationPermission();
                } else {
                    showToast(event.taskType === "shortBreak" ? "Короткий перерыв" : "Длинный перерыв", "info");
                }
                break;
            case "completed":
                if (event.taskType === "task") {
                    showToast("Помидор завершён!", "success");
                    if (document.hidden) {
                        sendNotification("Помидор завершён! Время для перерыва.");
                    }
                } else if (event.taskType === "shortBreak") {
                    showToast("Короткий перерыв окончен", "success");
                    if (document.hidden) {
                        sendNotification("Короткий перерыв окончен. Время работать!");
                    }
                } else {
                    showToast("Длинный перерыв окончен", "success");
                    if (document.hidden) {
                        sendNotification("Длинный перерыв окончен. Время работать!");
                    }
                }
                break;
            case "breakStarted":
                showToast(event.taskType === "shortBreak" ? "Короткий перерыв" : "Длинный перерыв", "info");
                break;
        }
    };

    const ctx = createContext(initialState, onTickHandler, onPomodoroHandler);
    registerContext(ctx);

    ctx.store.subscribe(() => {
        const s = ctx.store.getState();
        saveStateThrottle(s);
        updateTabTitle(s.activeTask);
        render(root, App, ctx);
    });

    onLayoutChanged(() => {
        if (hasActiveInput()) {
            return;
        }

        render(root, App, ctx);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            ctx.actions.snapTick();
        }
    });

    updateTabTitle(initialState.activeTask ?? null);
    render(root, App, ctx);
}

window.addEventListener('load', () => {
    const root = findById(ROOT_ELEMENT_ID);
    if (!root) {
        const message = "Элемент с идентификатором root не найден";
        console.error(message);
        const fallback = document.createElement("div");
        fallback.textContent = message;
        fallback.style.cssText = "padding: 1rem; font-family: sans-serif; color: #c00;";
        document.body.appendChild(fallback);
        return;
    }

    initApp(root);
});