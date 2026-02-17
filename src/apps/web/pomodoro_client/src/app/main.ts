import { findById } from "../utils/dom";
import { App } from "./App";
import {
    type AppState,
    type ArchivePomodoroTasksState,
    type PlanPomodoroTasksState
} from "../types/context.ts";
import {createContext, registerContext} from "./appContext.ts";
import {render} from "../utils/render.ts";
import {onMobileChanged} from "../types/layout.ts";

const getPlanTasks = (): PlanPomodoroTasksState => {
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
            tasksCount: 2,
            tasksTime: 50 * 60 * 1000,
            nextLongBreak: 0,
            finishTime: 0,
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

const getArchiveTasks = (): ArchivePomodoroTasksState => {
    return {
        tasks: [
            {
                task: {
                    id: "3",
                    category: { name: 'test' },
                    description: "Test task 1"
                },
                taskTime: 25 * 60 * 1000,
                completedAt: new Date().getTime(),

            },
            {
                task: {
                    id: "4",
                    category: { name: "test" },
                    description: "Test task 2"
                },
                taskTime: 25 * 60 * 1000,
                completedAt: new Date().getTime(),
            }
        ],
        statistics: {
            tasksCount: 2,
            tasksTime: 50 * 60 * 1000,
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

    //const activeTask = getActiveTask();
    const planTasks: PlanPomodoroTasksState = getPlanTasks();
    const archiveTasks: ArchivePomodoroTasksState = getArchiveTasks();

    const initialState: AppState = {
        editingTaskId: null,
        planTasks,
        archiveTasks,
    }

    const ctx = createContext(initialState);
    registerContext(ctx);

    ctx.store.subscribe(() => {
        render(root, App, ctx);
    });

    onMobileChanged(() => {
        render(root, App, ctx);
    });

    render(root, App, ctx);
});