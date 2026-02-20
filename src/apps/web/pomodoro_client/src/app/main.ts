import "@fortawesome/fontawesome-free/css/all.min.css";
import { findById } from "../utils/dom";
import { App } from "./App";
import {
    type AppState,
} from "../types/context.ts";
import {applyTheme, createContext, registerContext} from "./appContext.ts";
import {getArchiveTasksStatistics} from "../utils/statistics.ts";
import {render} from "../utils/render.ts";
import {onLayoutChanged} from "../types/layout.ts";
import {LocalStorage} from "../utils/localStorage.ts";
import { throttle } from "../utils/throttle.ts";
import { getInitArchiveTasks, getInitPlanTasks } from "../constants/initialState.ts";
import { sanitizeActiveTask } from "../utils/activeTask.ts";

const STORAGE_PREFIX = "pomodoro";
const STATE_ITEM_KEY = "state";
const THROTTLE_DELAY = 1000;
const ROOT_ELEMENT_ID = "root";


const initApp = (root: HTMLElement) => {
    const storage = new LocalStorage(STORAGE_PREFIX);
    
    let state: AppState | null = null;
    try {
        state = storage.getItem<AppState>(STATE_ITEM_KEY);
    } 
    catch {
        state = null;
    }

    const activeTask = sanitizeActiveTask(state?.activeTask);
    const planTasks = state?.planTasks ?? getInitPlanTasks();
    let archiveTasks = state?.archiveTasks ?? getInitArchiveTasks();
    if (archiveTasks.tasks.length > 0) {
        archiveTasks = { ...archiveTasks, statistics: getArchiveTasksStatistics(archiveTasks.tasks) };
    }

    const theme = state?.theme === "dark" ? "dark" : "light";
    applyTheme(theme);

    const initialState: AppState = {
        editingTaskId: null,
        activeTask,
        planTasks,
        archiveTasks,
        theme,
    };

    const saveStateThrottle: (s: AppState) => void = throttle((s: AppState) => {
        if (s == null) return;
        storage.setItem<AppState>(STATE_ITEM_KEY, s);
    }, THROTTLE_DELAY);

    const onTickHandler = (s: AppState)=> {
        saveStateThrottle(s);
    }

    const ctx = createContext(initialState, onTickHandler);
    registerContext(ctx);

    ctx.store.subscribe(() => {
        const s = ctx.store.getState();
        saveStateThrottle(s);
        render(root, App, ctx);
    });

    onLayoutChanged(() => {
        render(root, App, ctx);
    });

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