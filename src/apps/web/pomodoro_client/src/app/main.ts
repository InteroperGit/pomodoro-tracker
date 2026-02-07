import { findById } from "../utils/dom";
import { App } from "./App";
import type {AppState, ArchiveTasksState, PlanTasksState} from "../types/context.ts";
import {type AppContext, createContext, registerContext} from "./appContext.ts";

const getPlanTasks = (): PlanTasksState => {
    return {
        tasksCount: 5,
        tasksTime: "2ч 5мин",
        planTasks: [{
            task: {
                id: "1",
                category: { name: "test" },
                description: "Test task 1",
            },
            count: 1
        }, {
            task: {
                id: "2",
                category: { name: "test2" },
                description: "Test task 2",
            },
            count: 1
        }],
        statistics: {
            nextLongBreak: "12:00",
            finishTime: "18:00",
            categories: [
                {
                    category: { name: "test" },
                    count: 1,
                },
                {
                    category: { name: "test2" },
                    count: 1,
                },
            ],
        }
    };
}

const getArchiveTasks = (): ArchiveTasksState => {
    return {
        tasksCount: 5,
        tasksTime: "3ч 15мин",
        tasks: [
            {
                id: "3",
                category: { name: 'test' },
                description: "Test task 1"
            },
            {
                id: "4",
                category: { name: "test" },
                description: "Test task 2"
            },
        ],
        statistics: {
            categories: [
                {
                    category: { name: "test" },
                    count: 1
                },
                {
                    category: { name: "test2" },
                    count: 1
                }
            ]
        }
    }
}

const render = (root: HTMLElement, app: (ctx: AppContext) => string, ctx: AppContext) => {
    root.innerHTML = app(ctx);
};

window.addEventListener('load', () => {
    const root = findById("root");
    if (!root) {
        alert("Элемент с идентификатором root не найден");
        return;
    }

    const planTasksData: PlanTasksState = getPlanTasks();
    const archiveTasksData: ArchiveTasksState = getArchiveTasks();

    const initialState: AppState = {
        activeTaskId: null,
        planTasksState: planTasksData,
        archiveState: archiveTasksData,
    }

    const ctx = createContext(initialState);
    registerContext(ctx);

    ctx.store.subscribe(() => {
        render(root, App, ctx);
    });

    render(root, App, ctx);
});