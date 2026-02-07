import type {AppActions, AppState} from "../types/context.ts";
import {createStore} from "../utils/store.ts";
import type {PomodoroTask} from "../types/task.ts";

let context: AppContext;

export function createContext(initialState: AppState) {
    const store = createStore<AppState>(initialState);

    const actions: AppActions = {
        addTask(task: PomodoroTask) {
            const s = store.getState();
            store.setState(
                {
                    ...s,
                    planTasksState:
                    {
                        ...s.planTasksState,
                        planTasks: [
                            ...s.planTasksState.planTasks,
                            {
                                task,
                                count: 1
                            }
                        ]
                    }
                });
        },
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        incTask(id: string) {
        },
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        decTask(id: string) {
        },
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        archiveTask(id: string) {
        }
    }

    return { store, actions };
}

export function registerContext(ctx: AppContext) {
    if (!ctx) {
        throw new Error("Failed to register uninitialized context.");
    }

    context = ctx;
}

export function useContext() {
    if (!context) {
        throw new Error("Failed to use a context. Context is not initialized");
    }

    return context;
}

export type AppContext = ReturnType<typeof createContext>;