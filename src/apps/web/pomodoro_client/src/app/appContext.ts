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
                        tasksCount: s.planTasksState.tasksCount + 1,
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
        incTask(id: string) {
            if (!id) {
                throw new Error("Failed to inc task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasksState.planTasks;
            const planTask = planTasks.find(pt => pt.task.id === id);
            if (!planTask) {
                return;
            }

            const index = planTasks.findIndex(pt => pt.task.id === id);
            const updatedTasks = planTasks.map((pt, ptIndex) => {
                return ptIndex === index
                    ? { ...pt, count: pt.count + 1 }
                    : pt
            });

            store.setState({
                ...s,
                planTasksState: {
                    ...s.planTasksState,
                    tasksCount: s.planTasksState.tasksCount + 1,
                    planTasks: [
                        ...updatedTasks,
                    ]
                }
            })
        },
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        decTask(id: string) {
            if (!id) {
                throw new Error("Failed to dec task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasksState.planTasks;
            const planTask = planTasks.find(pt => pt.task.id === id);
            if (!planTask) {
                return;
            }

            const index = planTasks.findIndex(pt => pt.task.id === id);
            const updatedTasks =
                planTask.count > 1
                    ? planTasks.map((pt, ptIndex) => {
                            return ptIndex === index
                                ? { ...pt, count: pt.count - 1 }
                                : pt
                        })
                    : planTasks.filter(pt => pt.task.id !== id);

            store.setState({
                ...s,
                planTasksState: {
                    ...s.planTasksState,
                    tasksCount: s.planTasksState.tasksCount - 1,
                    planTasks: [
                        ...updatedTasks,
                    ]
                }
            })
        },
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        archiveTask(id: string) {
        },
        startEditTask(id: string) {
            if (!id) {
                throw new Error("Failed to edit task. Id is not initialized");
            }

            const s = store.getState();
            store.setState({
                ...s,
                editingTaskId: id
            });
        },
        completeEditTask(task: PomodoroTask) {
            if (!task) {
                throw new Error("Failed to edit task. Task is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasksState.planTasks;
            const index = planTasks.findIndex(pt => pt.task.id === task.id);
            const updatedTasks = planTasks.map((pt, ptIndex) => {
                return ptIndex === index
                    ? { ...pt, task: task }
                    : pt
            });

            store.setState({
                ...s,
                editingTaskId: null,
                planTasksState: {
                    ...s.planTasksState,
                    planTasks: updatedTasks
                }
            });
        },
        cancelEditTask() {
            const s = store.getState();
            store.setState({
                ...s,
                editingTaskId: null,
            });
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

export function useAddTask(task: PomodoroTask) {
    if (!task) {
        throw new Error("Failed to add task. Task is not initialized");
    }

    context.actions.addTask(task);
}

export function useIncTask(id: string) {
    if (!id) {
        throw new Error("Failed to inc task. Id is not initialized");
    }

    context.actions.incTask(id);
}

export function useDecTask(id: string) {
    if (!id) {
        throw new Error("Failed to dec task. Id is not initialized");
    }

    context.actions.decTask(id);
}

export function useStartEditTask(id: string) {
    if (!id) {
        throw new Error("Failed to edit task. Id is not initialized");
    }

    context.actions.startEditTask(id);
}

export function useCompleteEditTask(task: PomodoroTask) {
    if (!task) {
        throw new Error("Failed to complete task. Task is not initialized");
    }

    context.actions.completeEditTask(task);
}

export function useCancelEditTask() {
    context.actions.cancelEditTask();
}

export function useGetEditingTaskId(): string | null | undefined {
    return context.store.getState().editingTaskId;
}

export type AppContext = ReturnType<typeof createContext>;