import type { AppState, PomodoroEvent } from "../../types/context.ts";
import { ActivePomodoroTaskStatus, ActivePomodoroTaskType } from "../../types/task.ts";
import type { Store } from "../../utils/store.ts";
import type { ActiveTaskController } from "../ActiveTaskController.ts";

/**
 * Создает набор действий для управления таймером Pomodoro
 * @param {Store<AppState>} store - хранилище состояния
 * @param {ActiveTaskController} taskController - контроллер активной задачи
 * @param {Function} [onPomodoroCallback] - callback при событиях помидора
 */
export function createTimerActions(
    store: Store<AppState>,
    taskController: ActiveTaskController,
    onPomodoroCallback?: (event: PomodoroEvent) => void
) {
    return {
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

        snapTick(): void {
            taskController.snapTick();
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
        },
    };
}
