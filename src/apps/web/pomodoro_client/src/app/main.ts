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
import { type ActivePomodoroTask, ActivePomodoroTaskType, ActivePomodoroTaskStatus } from "../types/task.ts";
import { throttle } from "../utils/throttle.ts";

const STORAGE_KEY = "pomodoro";
const THROTTLE_DELAY = 1000;

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

const getActiveTask = (activeTask: ActivePomodoroTask | null | undefined): ActivePomodoroTask | null => {
    if (!activeTask) {
        return null;
    }

    if (activeTask.type === ActivePomodoroTaskType.Undefined 
        || activeTask.status === ActivePomodoroTaskStatus.Undefined) {
        return null;
    }

    if (activeTask.restTime <= 0) {
        return null;
    }

    if (activeTask.type === ActivePomodoroTaskType.Task && !activeTask.task) {
        return null;
    }

    return activeTask;
}

window.addEventListener('load', () => {
    const root = findById("root");
    if (!root) {
        alert("Элемент с идентификатором root не найден");
        return;
    }

    const storage = new LocalStorage(STORAGE_KEY);
    const state = storage.getItem<AppState>(STORAGE_KEY);
    const activeTask = getActiveTask(state?.activeTask);
    const planTasks = state?.planTasks ?? getInitPlanTasks();
    const archiveTasks = state?.archiveTasks ?? getInitArchiveTasks();

    const initialState: AppState = {
        editingTaskId: null,
        activeTask,
        planTasks,
        archiveTasks,
    }

    const saveStateThrottle = throttle((s: AppState) => {
        storage.setItem<AppState>(STORAGE_KEY, s);
    }, THROTTLE_DELAY);

    const onTickHandler = (s: AppState)=> {
        saveStateThrottle(s);
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