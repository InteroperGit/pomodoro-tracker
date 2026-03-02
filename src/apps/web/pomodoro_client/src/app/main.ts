import "@fortawesome/fontawesome-free/css/all.min.css";
import { findById } from "../utils/dom";
import { App } from "./App";
import { type AppState, type PomodoroEvent } from "../types/context.ts";
import {createContext, registerContext} from "./appContext.ts";
import {appConfig} from "./config.ts";
import {applyTheme} from "../utils/theme.ts";
import { setLocale, t } from '../i18n';
import type { Locale } from '../i18n/types.ts';
import {getPlanTasksStatistics} from "../utils/statistics.ts";
import {render} from "../utils/render.ts";
import {onLayoutChanged, useIsMobile} from "../utils/layout.ts";
import {LocalStorage} from "../utils/localStorage.ts";
import { throttle } from "../utils/throttle.ts";
import { getInitArchiveTasks, getInitPlanTasks } from "../constants/initialState.ts";
import { sanitizeActiveTask } from "../utils/activeTask.ts";
import { updateTabTitle } from "../utils/updateTabTitle.ts";
import { validateAppState } from "../utils/stateSchema.ts";
import { showToast } from "../components/Toast";
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

    const locale: Locale = state?.locale === 'en' ? 'en' : 'ru';
    setLocale(locale);

    const initialState: AppState = {
        editingPlanTaskIndex: null,
        activeTask,
        planTasks,
        archiveTasks,
        theme,
        locale,
        isMobile: useIsMobile(),
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
                    showToast(t('toast.taskStarted'), "info");
                    void requestNotificationPermission();
                } else if (event.taskType === "shortBreak") {
                    showToast(t('toast.shortBreakStarted'), "info");
                } else {
                    showToast(t('toast.longBreakStarted'), "info");
                }
                break;
            case "completed":
                if (event.taskType === "task") {
                    showToast(t('toast.taskCompleted'), "success");
                    if (document.hidden) {
                        sendNotification(t('notification.taskCompleted'));
                    }
                } else if (event.taskType === "shortBreak") {
                    showToast(t('toast.shortBreakEnded'), "success");
                    if (document.hidden) {
                        sendNotification(t('notification.shortBreakEnded'));
                    }
                } else {
                    showToast(t('toast.longBreakEnded'), "success");
                    if (document.hidden) {
                        sendNotification(t('notification.longBreakEnded'));
                    }
                }
                break;
            case "breakStarted":
                if (event.taskType === "shortBreak") {
                    showToast(t('toast.shortBreakStarted'), "info");
                } else {
                    showToast(t('toast.longBreakStarted'), "info");
                }
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

    onLayoutChanged((isMobile: boolean) => {
        ctx.store.setState({ ...ctx.store.getState(), isMobile });
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