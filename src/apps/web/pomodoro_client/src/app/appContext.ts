import type {AppActions, AppState} from "../types/context.ts";
import {createStore} from "../utils/store.ts";
import type {ArchivePomodoroTask, PlanPomodoroTask, PomodoroTask} from "../types/task.ts";
import type {PlanPomodoroTasksStatistics} from "../types/statistics.ts";

const POMODORO_TASK_TIME = 25 * 60 * 1000;

//const LONG_BREAK_AFTER = 4;

let context: AppContext;

const getCategories = (tasks: PlanPomodoroTask[]) => {
    const map = new Map<string, number>();

    tasks.forEach(({task, count}) => {
        const key = task.category.name;
        map.set(key, (map.get(key) ?? 0) + count)
    });

    return Array.from(map.entries(), ([name, count]) => ({
        category: { name },
        count
    }));
}

const getPlanTasksStatistics = (tasks: PlanPomodoroTask[]): PlanPomodoroTasksStatistics => {
    const tasksCount = tasks.reduce((sum,  task) => sum + task.count, 0);

    return {
        tasksCount,
        tasksTime: tasksCount * POMODORO_TASK_TIME,
        nextLongBreak: 0,
        finishTime: 0,
        categories: getCategories(tasks)
    }
}

export function createContext(initialState: AppState) {
    const store = createStore<AppState>(initialState);

    const s = store.getState();

    store.setState({
        ...s,
        planTasks: {
            ...s.planTasks,
            statistics: getPlanTasksStatistics(s.planTasks.tasks)
        }
    });

    const actions: AppActions = {
        addTask(task: PomodoroTask) {
            const s = store.getState();
            const updatedPlanTasks = [
                ...s.planTasks.tasks,
                {
                    task,
                    count: 1
                }
            ];
            const updatedStatistics = getPlanTasksStatistics(updatedPlanTasks);

            store.setState(
                {
                    ...s,
                    planTasks:
                    {
                        ...s.planTasks,
                        tasks: updatedPlanTasks,
                        statistics: updatedStatistics
                    }
                });
        },
        incTask(id: string) {
            if (!id) {
                throw new Error("Failed to inc task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasks.tasks;
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
            const updatedStatistics = getPlanTasksStatistics(updatedTasks);

            store.setState({
                ...s,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedTasks,
                    statistics: updatedStatistics
                }
            })
        },
        decTask(id: string) {
            if (!id) {
                throw new Error("Failed to dec task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasks.tasks;
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
            const updatedStatistics = getPlanTasksStatistics(updatedTasks);

            store.setState({
                ...s,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedTasks,
                    statistics: updatedStatistics
                }
            })
        },
        archiveTask(id: string) {
            if (!id) {
                throw new Error("Failed to dec task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasks.tasks;
            const planTask = planTasks.find(pt => pt.task.id === id);
            const planTaskIndex = planTasks.findIndex(pt => pt.task.id === id);

            if (!planTask) {
                throw new Error(`Failed to archive task. Plan task with id [${id}] is not found`);
            }

            const updatedPlanTasks: PlanPomodoroTask[] = planTask.count > 1
                ? [
                    ...planTasks.filter((_, index) => index < planTaskIndex),
                    { task: planTask.task, count: planTask.count - 1},
                    ...planTasks.filter((_, index) => index > planTaskIndex),
                  ]
                : planTasks.filter(pt => pt.task.id !== id);

            const updatePlanTasksStatistics = getPlanTasksStatistics(updatedPlanTasks);

            const updatedArchiveTasks: ArchivePomodoroTask[] = [
                { task: planTask.task, completedAt: new Date().getTime(), taskTime: POMODORO_TASK_TIME },
                ...s.archiveTasks.tasks,
            ];

            store.setState({
                ...s,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedPlanTasks,
                    statistics: updatePlanTasksStatistics
                },
                archiveTasks: {
                    ...s.archiveTasks,
                    tasks: updatedArchiveTasks
                }
            });
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
            const planTasks = s.planTasks.tasks;
            const index = planTasks.findIndex(pt => pt.task.id === task.id);
            const updatedTasks = planTasks.map((pt, ptIndex) => {
                return ptIndex === index
                    ? { ...pt, task: task }
                    : pt
            });

            store.setState({
                ...s,
                editingTaskId: null,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedTasks
                }
            });
        },
        cancelEditTask() {
            const s = store.getState();

            if (!s.editingTaskId) {
                return;
            }

            store.setState({
                ...s,
                editingTaskId: null,
            });
        },
        reorderTasks(fromIndex: number, toIndex: number): void {
            if (Number.isNaN(fromIndex)) {
                throw new Error("FromIndex is not a number");
            }

            if (Number.isNaN(toIndex)) {
                throw new Error("ToIndex is not a number");
            }

            const s = store.getState();
            const reorderedTasks = [...s.planTasks.tasks];
            const [grabbingTask] = reorderedTasks.splice(fromIndex, 1);
            reorderedTasks.splice(toIndex, 0, grabbingTask);

            store.setState({
               ...s,
               planTasks: {
                   ...s.planTasks,
                   tasks: reorderedTasks
               }
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

export function useReorderTasks(fromIndex: number, toIndex: number) {
    return context.actions.reorderTasks(fromIndex, toIndex);
}

export function useArchiveTask(id: string) {
    return context.actions.archiveTask(id);
}

export type AppContext = ReturnType<typeof createContext>;