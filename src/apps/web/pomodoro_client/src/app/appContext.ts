import {type AppActions, type AppState, type PomodoroEvent, type ThemeId} from "../types/context.ts";

/** CSS класс для темной темы */
const THEME_CLASS_DARK = "theme-dark";
/** Предпочтение отдавать задачам перед перерывами при активации */
const PREFER_TASK = true;

/**
 * Применяет тему оформления к документу
 * @param {ThemeId} theme - идентификатор темы ("light" или "dark")
 */
export function applyTheme(theme: ThemeId) {
    if (theme === "dark") {
        document.documentElement.classList.add(THEME_CLASS_DARK);
    } else {
        document.documentElement.classList.remove(THEME_CLASS_DARK);
    }
}
import {createStore} from "../utils/store.ts";
import {
    type ActivePomodoroTask,
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
    type ArchivePomodoroTask,
    type PomodoroTask
} from "../types/task.ts";
import {
    getArchiveTasksStatistics,
    getPlanTasksStatistics,
} from "../utils/statistics.ts";
import {ActiveTaskController, type ActiveTaskControllerConfiguration} from "./ActiveTaskController.ts";

const POMODORO_TASK_TIME = 25 * 60 * 1000;
const POMODORO_SHORT_BREAK_TIME = 5 * 60 * 1000;
const POMODORO_LONG_BREAK_TIME = 15 * 60 * 1000;
const LONG_BREAK_AFTER = 4;

const planStatisticsConfig = {
    taskTime: POMODORO_TASK_TIME,
    shortBreakTime: POMODORO_SHORT_BREAK_TIME,
    longBreakTime: POMODORO_LONG_BREAK_TIME,
    longBreakAfter: LONG_BREAK_AFTER,
};

let context: AppContext;

/**
 * Создает контекст приложения с управлением состоянием и действиями
 * @param {AppState} initialState - начальное состояние приложения
 * @param {Function} onTickCallback - callback при каждом тике таймера
 * @param {Function} [onPomodoroCallback] - callback при событиях помидора
 * @returns {AppContext} контекст приложения со store и actions
 */
export function createContext(
    initialState: AppState,
    onTickCallback: (state: AppState) => void,
    onPomodoroCallback?: (event: PomodoroEvent) => void
) {
    const configuration: ActiveTaskControllerConfiguration = {
        taskTime: POMODORO_TASK_TIME,
        shortBreakTime: POMODORO_SHORT_BREAK_TIME,
        longBreakTime: POMODORO_LONG_BREAK_TIME,
        maxShortBreaksSerie: LONG_BREAK_AFTER,
    };

    if (initialState.activeTask
        && (initialState.activeTask.type === ActivePomodoroTaskType.Undefined
            || initialState.activeTask.status === ActivePomodoroTaskType.Undefined)) {
        initialState.activeTask = null;
    }

    const taskController = new ActiveTaskController(configuration);

    if (initialState.activeTask) {
        taskController.activateTask(initialState.activeTask);
    }
    else {
        taskController.activateNextTask(initialState.planTasks.tasks, PREFER_TASK);
    }

    initialState.activeTask = taskController.activeTask;

    const store = createStore<AppState>(initialState);

    taskController.addEventListener("tick", (restTime?: number) => {
       const s = store.getState();
       if (s.activeTask && restTime) {
           s.activeTask.restTime = restTime;
           onTickCallback(s);
       }
    });

    taskController.addEventListener("completed", () => {
        let s = store.getState();

        if (!s.activeTask) {
            return;
        }

        const completedType = s.activeTask.type;
        if (s.activeTask.type === ActivePomodoroTaskType.Task && s.activeTask.task) {
            actions.archiveTask(s.activeTask.task.id, s.activeTask.restTime);
        }

        s = store.getState();

        taskController.activateNextTask(s.planTasks.tasks);

        const nextTask = taskController.activeTask;

        if (completedType === ActivePomodoroTaskType.Task) {
            onPomodoroCallback?.({ type: "completed", taskType: "task" });
        } else if (completedType === ActivePomodoroTaskType.ShortBreak) {
            onPomodoroCallback?.({ type: "completed", taskType: "shortBreak" });
        } else if (completedType === ActivePomodoroTaskType.LongBreak) {
            onPomodoroCallback?.({ type: "completed", taskType: "longBreak" });
        }

        if (nextTask.type === ActivePomodoroTaskType.ShortBreak) {
            onPomodoroCallback?.({ type: "breakStarted", taskType: "shortBreak" });
        } else if (nextTask.type === ActivePomodoroTaskType.LongBreak) {
            onPomodoroCallback?.({ type: "breakStarted", taskType: "longBreak" });
        }

        store.setState({
            ...s,
            activeTask: nextTask,
        });
    });

    taskController.addEventListener("idle", () => {
        console.log("Все задачи успешно выполнены");
    });

    const actions: AppActions = {
        setTheme(theme: ThemeId): void {
            applyTheme(theme);
            store.setState({ ...store.getState(), theme });
        },
        addTask(task: PomodoroTask): void {
            const s = store.getState();
            const updatedPlanTasks = [
                {
                    task,
                    count: 1
                },
                ...s.planTasks.tasks,
            ];

            const updatedStatistics = getPlanTasksStatistics(updatedPlanTasks, planStatisticsConfig);

            // Обновляем план задач в сторе
            store.setState({
                ...s,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedPlanTasks,
                    statistics: updatedStatistics
                }
            });

            // Используем контроллер для определения следующей фазы
            // Если activeTask в idle или отсутствует, контроллер активирует новую задачу
            const updatedState = store.getState();
            taskController.activateNextTask(updatedState.planTasks.tasks, PREFER_TASK);

            // Обновляем activeTask из контроллера
            store.setState({
                ...updatedState,
                activeTask: taskController.activeTask,
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
            const updatedStatistics = getPlanTasksStatistics(updatedTasks, planStatisticsConfig);

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

            const shouldRemoveTask = planTasks[index].count <= 1;

            const updatedTasks =
                shouldRemoveTask
                    ? planTasks.filter((_, i) => i !== index)
                    : planTasks.map((pt, ptIndex) => {
                            return ptIndex === index
                                ? { ...pt, count: pt.count - 1 }
                                : pt
                      });
            const updatedStatistics = getPlanTasksStatistics(updatedTasks, planStatisticsConfig);

            const shouldActivateNextTask = shouldRemoveTask && index === 0;
            if (shouldActivateNextTask) {
                taskController.activateNextTask(updatedTasks, PREFER_TASK);
            }

            const activeTask = taskController.activeTask;

            store.setState({
                ...s,
                activeTask,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedTasks,
                    statistics: updatedStatistics
                }
            })
        },
        archiveTask(id: string, restTime?: number): void {
            if (!id) {
                throw new Error("Failed to archive task. Id is not initialized");
            }

            const s = store.getState();
            const planTasks = s.planTasks.tasks;
            const index = planTasks.findIndex(pt => pt.task.id === id);

            if (index < 0) {
                throw new Error(`Failed to archive task. Task with Id = [${id}] is not found`);
            }

            const pomodoroTask = planTasks[index].task;
            const needsActivateNextTask = index === 0 && planTasks[index].count === 1;
            
            const updatedPlanTasks =
                planTasks[index].count > 1
                    ? planTasks.map((pt, ptIndex) => {
                        return ptIndex === index
                            ? { ...pt, count: pt.count - 1 }
                            : pt
                    })
                    : planTasks.filter((_, i) => i !== index);

            const updatePlanTasksStatistics = getPlanTasksStatistics(updatedPlanTasks, planStatisticsConfig);

            const updatedArchiveTasks: ArchivePomodoroTask[] = [
                {
                    task: pomodoroTask,
                    completedAt: new Date().getTime(),
                    taskTime: restTime ? POMODORO_TASK_TIME - restTime : POMODORO_TASK_TIME,
                },
                ...s.archiveTasks.tasks,
            ];


            if (needsActivateNextTask) {
                taskController.activateNextTask(updatedPlanTasks, PREFER_TASK);
            }

            const activeTask = taskController.activeTask

            store.setState({
                ...s,
                activeTask,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedPlanTasks,
                    statistics: updatePlanTasksStatistics
                },
                archiveTasks: {
                    ...s.archiveTasks,
                    tasks: updatedArchiveTasks,
                    statistics: getArchiveTasksStatistics(updatedArchiveTasks)
                }
            });
        },
        deleteArchiveTask(index: number): void {
            if (typeof index !== "number" || index < 0) {
                throw new Error("Failed to delete archive task. Index is not valid");
            }
            const s = store.getState();
            const updatedArchiveTasks = s.archiveTasks.tasks.filter((_, i) => i !== index);
            store.setState({
                ...s,
                archiveTasks: {
                    ...s.archiveTasks,
                    tasks: updatedArchiveTasks,
                    statistics: getArchiveTasksStatistics(updatedArchiveTasks)
                }
            });
        },
        refreshTask(task: PomodoroTask): void {
            if (!task) {
                throw new Error("Failed to refresh task. Task is not initialized");
            }
            const s = store.getState();
            const addedPlanTask = { task, count: 1 };
            const updatedPlanTasks = [addedPlanTask, ...s.planTasks.tasks];
            const updatedStatistics = getPlanTasksStatistics(updatedPlanTasks, planStatisticsConfig);
            taskController.activateNextTask(updatedPlanTasks, PREFER_TASK);
            store.setState({
                ...s,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedPlanTasks,
                    statistics: updatedStatistics
                },
                activeTask: taskController.activeTask,
            });
        },
        startEditTask(index: number): void {
            if (typeof index !== "number" || index < 0) {
                throw new Error("Failed to edit task. Index is not valid");
            }

            const s = store.getState();
            store.setState({
                ...s,
                editingPlanTaskIndex: index
            });
        },
        completeEditTask(task: PomodoroTask): void {
            if (!task) {
                throw new Error("Failed to edit task. Task is not initialized");
            }

            const s = store.getState();
            const index = s.editingPlanTaskIndex;
            if (index == null || index < 0 || index >= s.planTasks.tasks.length) {
                return;
            }
            const updatedTasks = s.planTasks.tasks.map((pt, ptIndex) =>
                ptIndex === index ? { ...pt, task } : pt
            );

            store.setState({
                ...s,
                editingPlanTaskIndex: null,
                planTasks: {
                    ...s.planTasks,
                    tasks: updatedTasks
                }
            });
        },
        cancelEditTask(): void {
            const s = store.getState();

            if (s.editingPlanTaskIndex == null) {
                return;
            }

            store.setState({
                ...s,
                editingPlanTaskIndex: null,
            });
        },
        reorderTasks(fromIndex: number, toIndex: number): void {
            if (Number.isNaN(fromIndex)) {
                throw new Error("FromIndex is not a number");
            }

            if (Number.isNaN(toIndex)) {
                throw new Error("ToIndex is not a number");
            }

            if (fromIndex === toIndex) {
                return;
            }

            const s = store.getState()

            if (s.planTasks.tasks.length === 0) {
                return;
            }

            const reorderedTasks = [...s.planTasks.tasks];
            const [grabbingTask] = reorderedTasks.splice(fromIndex, 1);
            reorderedTasks.splice(toIndex, 0, grabbingTask);

            const activeTask: ActivePomodoroTask | null | undefined =
                !s.activeTask
                || reorderedTasks.findIndex(pt => pt.task.id === s.activeTask?.task?.id) === 0
                    ? s.activeTask
                    : {
                        ...s.activeTask,
                        task: reorderedTasks[0].task,
                    };

            if (activeTask) {
                taskController.setActiveTask(activeTask);
            }

            store.setState({
                ...s,
                activeTask,
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

            if (s.activeTask.type === ActivePomodoroTaskType.Task) {
                onPomodoroCallback?.({ type: "started", taskType: "task" });
            } else if (s.activeTask.type === ActivePomodoroTaskType.ShortBreak) {
                onPomodoroCallback?.({ type: "started", taskType: "shortBreak" });
            } else if (s.activeTask.type === ActivePomodoroTaskType.LongBreak) {
                onPomodoroCallback?.({ type: "started", taskType: "longBreak" });
            }

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
        registerTimerTickEventListener(handler: (restTime: number) => void): () => void {
            if (!handler) {
                throw new Error("Handler is not initialized");
            }

            const wrappedHandler = (args?: number) => {
                if (args !== undefined && args !== null) {
                    handler(args);
                }
            };

            return taskController.addEventListener("tick", wrappedHandler);
        }
    }

    return { store, actions };
}

/**
 * Регистрирует глобальный контекст приложения
 * @param {AppContext} ctx - контекст для регистрации
 */
export function registerContext(ctx: AppContext) {
    if (!ctx) {
        throw new Error("Failed to register uninitialized context.");
    }

    context = ctx;
}

/**
 * Получает зарегистрированный контекст приложения
 * @returns {AppContext} контекст приложения
 */
export function useContext() {
    if (!context) {
        throw new Error("Failed to use a context. Context is not initialized");
    }

    return context;
}

/**
 * Добавить новую задачу в план
 * @param {PomodoroTask} task - задача для добавления
 */
export function useAddTask(task: PomodoroTask) {
    if (!task) {
        throw new Error("Failed to add task. Task is not initialized");
    }

    context.actions.addTask(task);
}

/**
 * Увеличить количество помидоров для задачи
 * @param {string} id - ID задачи
 */
export function useIncTask(id: string) {
    if (!id) {
        throw new Error("Failed to inc task. Id is not initialized");
    }

    context.actions.incTask(id);
}

/**
 * Уменьшить количество помидоров для задачи
 * @param {string} id - ID задачи
 */
export function useDecTask(id: string) {
    if (!id) {
        throw new Error("Failed to dec task. Id is not initialized");
    }

    context.actions.decTask(id);
}

/**
 * Начать редактирование задачи
 * @param {number} index - индекс задачи в плане
 */
export function useStartEditTask(index: number) {
    if (typeof index !== "number" || index < 0) {
        throw new Error("Failed to edit task. Index is not valid");
    }

    context.actions.startEditTask(index);
}

/**
 * Завершить редактирование и сохранить задачу
 * @param {PomodoroTask} task - отредактированная задача
 */
export function useCompleteEditTask(task: PomodoroTask) {
    if (!task) {
        throw new Error("Failed to complete task. Task is not initialized");
    }

    context.actions.completeEditTask(task);
}

/**
 * Отменить редактирование задачи
 */
export function useCancelEditTask() {
    context.actions.cancelEditTask();
}

/**
 * Получить индекс редактируемой задачи
 * @returns {number|null|undefined} индекс или null
 */
export function useGetEditingPlanTaskIndex(): number | null | undefined {
    return context.store.getState().editingPlanTaskIndex;
}

/**
 * Изменить порядок задач в плане
 * @param {number} fromIndex - начальный индекс
 * @param {number} toIndex - конечный индекс
 */
export function useReorderTasks(fromIndex: number, toIndex: number) {
    return context.actions.reorderTasks(fromIndex, toIndex);
}

/**
 * Переместить задачу в архив
 * @param {string} id - ID задачи
 */
export function useArchiveTask(id: string) {
    return context.actions.archiveTask(id);
}

/**
 * Получить функцию удаления задачи из архива
 * @returns {Function} функция удаления по индексу
 */
export function useDeleteArchiveTask() {
    return (index: number) => context.actions.deleteArchiveTask(index);
}

/**
 * Получить функцию повторного добавления выполненной задачи
 * @returns {Function} функция добавления по задаче
 */
export function useRefreshTask() {
    return (task: PomodoroTask) => context.actions.refreshTask(task);
}

/**
 * Получить текущую активную задачу
 * @returns {ActivePomodoroTask|null|undefined} активная задача
 */
export function useGetActiveTask() {
    return context.store.getState().activeTask;
}

/**
 * Запустить текущую активную задачу
 */
export function useStartTask() {
    return context.actions.startTask();
}

/**
 * Остановить таймер активной задачи
 */
export function useStopTask() {
    return context.actions.stopTask();
}

/**
 * Поставить активную задачу на паузу
 */
export function usePauseTask() {
    return context.actions.pauseTask();
}

/**
 * Возобновить активную задачу с паузы
 */
export function useResumeTask() {
    return context.actions.resumeTask();
}

/**
 * Завершить текущую активную задачу
 */
export function useCompleteTask() {
    return context.actions.completeTask();
}

/**
 * Подписать на события тика таймера
 * @param {Function} handler - обработчик с оставшимся временем
 */
export function useActiveTaskTimerTick(handler: (restTime: number) => void): () => void {
    return context.actions.registerTimerTickEventListener(handler);
}

/**
 * Изменить тему приложения
 * @param {ThemeId} theme - идентификатор темы
 */
export function useSetTheme(theme: ThemeId) {
    context.actions.setTheme(theme);
}

export type AppContext = ReturnType<typeof createContext>;