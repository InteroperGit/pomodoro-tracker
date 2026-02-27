import type { AppState } from "../../types/context.ts";
import {
    type ActivePomodoroTask,
    type ArchivePomodoroTask,
    type PomodoroTask,
} from "../../types/task.ts";
import type { Store } from "../../utils/store.ts";
import type { ActiveTaskController } from "../ActiveTaskController.ts";
import {
    getArchiveTasksStatistics,
    getPlanTasksStatistics,
    type PlanStatisticsConfig,
} from "../../utils/statistics.ts";

/** Предпочтение отдавать задачам перед перерывами при активации */
const PREFER_TASK = true;

/**
 * Создает набор действий для управления задачами плана и архива
 * @param {Store<AppState>} store - хранилище состояния
 * @param {ActiveTaskController} taskController - контроллер активной задачи
 * @param {PlanStatisticsConfig} planStatisticsConfig - конфигурация статистики плана
 */
export function createTaskActions(
    store: Store<AppState>,
    taskController: ActiveTaskController,
    planStatisticsConfig: PlanStatisticsConfig
) {
    return {
        addTask(task: PomodoroTask): void {
            const s = store.getState();
            const updatedPlanTasks = [{ task, count: 1 }, ...s.planTasks.tasks];
            const updatedStatistics = getPlanTasksStatistics(updatedPlanTasks, planStatisticsConfig);

            store.setState({
                ...s,
                planTasks: { ...s.planTasks, tasks: updatedPlanTasks, statistics: updatedStatistics }
            });

            const updatedState = store.getState();
            taskController.activateNextTask(updatedState.planTasks.tasks, PREFER_TASK);
            store.setState({ ...updatedState, activeTask: taskController.activeTask });
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

            const updatedTasks = planTasks.map((pt, ptIndex) =>
                ptIndex === index ? { ...pt, count: pt.count + 1 } : pt
            );
            const updatedStatistics = getPlanTasksStatistics(updatedTasks, planStatisticsConfig);

            store.setState({
                ...s,
                planTasks: { ...s.planTasks, tasks: updatedTasks, statistics: updatedStatistics }
            });
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
            const updatedTasks = shouldRemoveTask
                ? planTasks.filter((_, i) => i !== index)
                : planTasks.map((pt, ptIndex) =>
                    ptIndex === index ? { ...pt, count: pt.count - 1 } : pt
                );
            const updatedStatistics = getPlanTasksStatistics(updatedTasks, planStatisticsConfig);

            const shouldActivateNextTask = shouldRemoveTask && index === 0;
            if (shouldActivateNextTask) {
                taskController.activateNextTask(updatedTasks, PREFER_TASK);
            }

            const activeTask = taskController.activeTask;
            store.setState({
                ...s,
                activeTask,
                planTasks: { ...s.planTasks, tasks: updatedTasks, statistics: updatedStatistics }
            });
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

            const updatedPlanTasks = planTasks[index].count > 1
                ? planTasks.map((pt, ptIndex) =>
                    ptIndex === index ? { ...pt, count: pt.count - 1 } : pt
                )
                : planTasks.filter((_, i) => i !== index);

            const updatePlanTasksStatistics = getPlanTasksStatistics(updatedPlanTasks, planStatisticsConfig);

            const updatedArchiveTasks: ArchivePomodoroTask[] = [
                {
                    task: pomodoroTask,
                    completedAt: new Date().getTime(),
                    taskTime: restTime
                        ? planStatisticsConfig.taskTime - restTime
                        : planStatisticsConfig.taskTime,
                },
                ...s.archiveTasks.tasks,
            ];

            if (needsActivateNextTask) {
                taskController.activateNextTask(updatedPlanTasks, PREFER_TASK);
            }

            const activeTask = taskController.activeTask;
            store.setState({
                ...s,
                activeTask,
                planTasks: { ...s.planTasks, tasks: updatedPlanTasks, statistics: updatePlanTasksStatistics },
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
            const updatedPlanTasks = [{ task, count: 1 }, ...s.planTasks.tasks];
            const updatedStatistics = getPlanTasksStatistics(updatedPlanTasks, planStatisticsConfig);
            taskController.activateNextTask(updatedPlanTasks, PREFER_TASK);
            store.setState({
                ...s,
                planTasks: { ...s.planTasks, tasks: updatedPlanTasks, statistics: updatedStatistics },
                activeTask: taskController.activeTask,
            });
        },

        startEditTask(index: number): void {
            if (typeof index !== "number" || index < 0) {
                throw new Error("Failed to edit task. Index is not valid");
            }

            const s = store.getState();
            store.setState({ ...s, editingPlanTaskIndex: index });
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
                planTasks: { ...s.planTasks, tasks: updatedTasks }
            });
        },

        cancelEditTask(): void {
            const s = store.getState();
            if (s.editingPlanTaskIndex == null) {
                return;
            }
            store.setState({ ...s, editingPlanTaskIndex: null });
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

            const s = store.getState();
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
                    : { ...s.activeTask, task: reorderedTasks[0].task };

            if (activeTask) {
                taskController.setActiveTask(activeTask);
            }

            store.setState({
                ...s,
                activeTask,
                planTasks: { ...s.planTasks, tasks: reorderedTasks }
            });
        },
    };
}
