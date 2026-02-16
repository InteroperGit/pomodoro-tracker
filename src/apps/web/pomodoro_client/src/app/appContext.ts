import {type AppActions, type AppState} from "../types/context.ts";
import {createStore} from "../utils/store.ts";
import {
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
    type ArchivePomodoroTask,
    type PlanPomodoroTask,
    type PomodoroTask
} from "../types/task.ts";
import type {PlanPomodoroTasksStatistics} from "../types/statistics.ts";
import {ActiveTaskController, type ActiveTaskControllerConfiguration} from "./ActiveTaskController.ts";

const POMODORO_TASK_TIME = 25 * 60 * 1000;

const POMODORO_SHORT_BREAK_TIME = 5 * 60 * 1000;

const POMODORO_LONG_BREAK_TIME = 15 * 60 * 1000;

const LONG_BREAK_AFTER = 4;

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
    const configuration: ActiveTaskControllerConfiguration = {
        taskTime: POMODORO_TASK_TIME,
        shortBreakTime: POMODORO_SHORT_BREAK_TIME,
        longBreakTime: POMODORO_LONG_BREAK_TIME,
        maxShortBreaksSerie: LONG_BREAK_AFTER,
    };

    const taskController = new ActiveTaskController(configuration);
    taskController.activateNextTask(initialState.planTasks.tasks, initialState.activeTask?.restTime);

    if (!initialState.activeTask) {
        initialState.activeTask = taskController.activeTask;
    }

    const store = createStore<AppState>(initialState);

    taskController.onCompleted = () => {
        let s = store.getState();

        if (!s.activeTask) {
            return;
        }

        if (s.activeTask.type === ActivePomodoroTaskType.Task && s.activeTask.task) {
            actions.archiveTask(s.activeTask.task.id, s.activeTask.restTime);
        }

        if (s.planTasks.tasks.length <= 0) {
            return;
        }

        taskController.activateNextTask(s.planTasks.tasks);
        s = store.getState();

        store.setState({
            ...s,
             activeTask: taskController.activeTask,
        });
    }

    const actions: AppActions = {
        addTask(task: PomodoroTask): void {
            const s = store.getState();
            const updatedPlanTasks = [
                {
                    task,
                    count: 1
                },
                ...s.planTasks.tasks,
            ];

            const updatedStatistics = getPlanTasksStatistics(updatedPlanTasks);
            const shortBreakCount = s.activeTask?.shortBreakCount ?? 0;
            const restTime = s.activeTask?.restTime ?? POMODORO_SHORT_BREAK_TIME;

            store.setState(
                {
                    ...s,
                    activeTask: s.activeTask
                        ? {
                            ...s.activeTask,
                            task,
                        }
                        : {
                            type: ActivePomodoroTaskType.Task,
                            status: ActivePomodoroTaskStatus.Pending,
                            task,
                            shortBreakCount,
                            restTime,
                        },
                    planTasks:
                    {
                        ...s.planTasks,
                        tasks: updatedPlanTasks,
                        statistics: updatedStatistics
                    }
                });
        },
        incTask(id: string): void {
            if (!id) {
                throw new Error("Failed to inc task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasks.tasks;
            const index = planTasks.findIndex(pt => pt.task.id === id);

            if (index < 0) {
                throw new Error(`Failed to inc task. Task with Id = [${id}] is not found`);
            }

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
        decTask(id: string): void {
            if (!id) {
                throw new Error("Failed to dec task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasks.tasks;
            const index = planTasks.findIndex(pt => pt.task.id === id);

            if (index < 0) {
                throw new Error(`Failed to dec task. Task with Id = [${id}] is not found`);
            }

            const updatedTasks =
                planTasks[index].count > 1
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
        archiveTask(id: string, restTime?: number): void {
            if (!id) {
                throw new Error("Failed to dec task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasks.tasks;
            const index = planTasks.findIndex(pt => pt.task.id === id);

            if (index < 0) {
                throw new Error(`Failed to archive task. Task with Id = [${id}] is not found`);
            }

            const pomodoroTask = planTasks[index].task;
            const updatedPlanTasks =
                planTasks[index].count > 1
                    ? planTasks.map((pt, ptIndex) => {
                        return ptIndex === index
                            ? { ...pt, count: pt.count - 1 }
                            : pt
                    })
                    : planTasks.filter(pt => pt.task.id !== id);

            const updatePlanTasksStatistics = getPlanTasksStatistics(updatedPlanTasks);

            const updatedArchiveTasks: ArchivePomodoroTask[] = [
                {
                    task: pomodoroTask,
                    completedAt: new Date().getTime(),
                    taskTime: restTime ? POMODORO_TASK_TIME - restTime : POMODORO_TASK_TIME,
                },
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
        startEditTask(id: string): void {
            if (!id) {
                throw new Error("Failed to edit task. Id is not initialized");
            }

            const s = store.getState();
            store.setState({
                ...s,
                editingTaskId: id
            });
        },
        completeEditTask(task: PomodoroTask): void {
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
        cancelEditTask(): void {
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
        },
        startTask(): void {
            const s = store.getState();

            if (!s.activeTask) {
                throw new Error("Failed to start task. Active task is not initialized");
            }

            if (s.activeTask.status !== ActivePomodoroTaskStatus.Pending) {
                throw new Error("Failed to start task. Active task is not pending");
            }

            taskController.start();

            store.setState({
                ...s,
                activeTask: {
                    ...s.activeTask,
                    restTime: taskController.restTime,
                    status: taskController.status
                }
            });
        },
        stopTask(): void {
            const s = store.getState();

            if (!s.activeTask) {
                throw new Error("Failed to stop task. Active task is not initialized");
            }

            if (s.activeTask.status !== ActivePomodoroTaskStatus.Active) {
                throw new Error("Failed to stop task. Active task is not active");
            }

            taskController.stop();

            store.setState({
                ...s,
                activeTask: {
                    ...s.activeTask,
                    restTime: taskController.restTime,
                    status: taskController.status
                }
            });
        },
        pauseTask(): void {
            const s = store.getState();

            if (!s.activeTask) {
                throw new Error("Failed to pause task. Active task is not initialized");
            }

            if (s.activeTask.status !== ActivePomodoroTaskStatus.Active) {
                throw new Error("Failed to paise task. Active task is not active");
            }

            taskController.pause();

            store.setState({
                ...s,
                activeTask: {
                    ...s.activeTask,
                    restTime: taskController.restTime,
                    status: taskController.status
                }
            });
        },
        resumeTask(): void {
            const s = store.getState();

            if (!s.activeTask) {
                throw new Error("Failed to resume task. Active task is not initialized");
            }

            if (s.activeTask.status !== ActivePomodoroTaskStatus.Paused) {
                throw new Error("Failed to resume task. Active task is not paused");
            }

            taskController.resume();

            store.setState({
                ...s,
                activeTask: {
                    ...s.activeTask,
                    restTime: taskController.restTime,
                    status: taskController.status
                }
            });
        },
        completeTask(): void {
            const s = store.getState();

            if (!s.activeTask) {
                throw new Error("Failed to complete task. Active task is not initialized");
            }

            if (s.activeTask.status !== ActivePomodoroTaskStatus.Active
                    && s.activeTask.status !== ActivePomodoroTaskStatus.Paused) {
                throw new Error("Failed to complete task. Active task is not active or paused");
            }

            taskController.complete();
        },
        registerTimerTickEventListener(handler: (restTime: number) => void): void {
            if (!handler) {
                throw new Error("Handler is not initialized");
            }

            taskController.onTick = handler;
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

export function useGetActiveTask() {
    return context.store.getState().activeTask;
}

export function useStartTask() {
    return context.actions.startTask();
}

export function useStopTask() {
    return context.actions.stopTask();
}

export function usePauseTask() {
    return context.actions.pauseTask();
}

export function useResumeTask() {
    return context.actions.resumeTask();
}

export function useCompleteTask() {
    return context.actions.completeTask();
}

export function useActiveTaskTimerTick(handler: (restTime: number) => void) {
    context.actions.registerTimerTickEventListener(handler);
}

export type AppContext = ReturnType<typeof createContext>;