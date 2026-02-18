import { findById } from "../utils/dom";
import { App } from "./App";
import {
    type AppState,
    type ArchivePomodoroTasksState,
    type PlanPomodoroTasksState
} from "../types/context.ts";
import {createContext, registerContext} from "./appContext.ts";
import {render} from "../utils/render.ts";
import {onLayoutChanged} from "../types/layout.ts";
import {LocalStorage} from "../utils/localStorage.ts";

const STORAGE_KEY = "pomodoro";

const getInitPlanTasks = (): PlanPomodoroTasksState => {
    return {
        tasks: [],
        statistics: {
            tasksCount: 0,
            tasksTime: 0,
            finishTime: 0,
            nextLongBreak: 0,
            categories: []
        }
    };
}

const getInitArchiveTasks = (): ArchivePomodoroTasksState => {
    return {
        tasks: [],
        statistics: {
            tasksCount: 0,
            tasksTime: 0,
            categories: []
        }
    }
}

window.addEventListener('load', () => {
    const root = findById("root");
    if (!root) {
        alert("Элемент с идентификатором root не найден");
        return;
    }

    const storage = new LocalStorage(STORAGE_KEY);
    const state = storage.getItem<AppState>(STORAGE_KEY);
    const activeTask = state?.activeTask;
    const planTasks = state?.planTasks ?? getInitPlanTasks();
    const archiveTasks = state?.archiveTasks ?? getInitArchiveTasks();

    const initialState: AppState = {
        editingTaskId: null,
        activeTask,
        planTasks,
        archiveTasks,
    }

    const onTickHandler = (s: AppState)=> {
        storage.setItem<AppState>(STORAGE_KEY, s);
    }

    const ctx = createContext(initialState, onTickHandler);
    registerContext(ctx);

    ctx.store.subscribe(() => {
        const s = ctx.store.getState();
        storage.setItem<AppState>(STORAGE_KEY, s);
        render(root, App, ctx);
    });

    onLayoutChanged(() => {
        render(root, App, ctx);
    });

    render(root, App, ctx);
});