import { findById } from "../utils/dom";
import { App } from "./App";
import type {AppState, ArchiveTasksState, PlanTasksState} from "../types/context.ts";
import {createContext, registerContext} from "./appContext.ts";
import {render} from "../utils/render.ts";

const getPlanTasks = (): PlanTasksState => {
    return {
        tasks: [{
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
            tasksCount: 5,
            tasksTime: "2ч 5мин",
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
            tasksCount: 5,
            tasksTime: "3ч 15мин",
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
        editingTaskId: null,
        planTasks: planTasksData,
        archiveTasks: archiveTasksData,
    }

    const ctx = createContext(initialState);
    registerContext(ctx);

    ctx.store.subscribe(() => {
        render(root, App, ctx);
    });

    render(root, App, ctx);
});