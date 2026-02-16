import {
    type ActivePomodoroTask,
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
    type PlanPomodoroTask
} from "../types/task.ts";
import {generateId} from "../utils/idGenerator.ts";

const TICK_PERIOD = 1000;

export type ActiveTaskControllerConfiguration = {
    taskTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    maxShortBreaksSerie: number;
}

export class ActiveTaskController {
    private _configuration: ActiveTaskControllerConfiguration;
    private _activeTask: ActivePomodoroTask = {
        type: ActivePomodoroTaskType.Undefined,
        status: ActivePomodoroTaskStatus.Undefined,
        shortBreakCount: 0,
        restTime: 0,
    };
    private _currentTimer: number = 0;
    private _lastTime: number = 0;

    constructor(configuration: ActiveTaskControllerConfiguration) {
        if (!configuration) {
            throw new Error("No configuration found.");
        }

        this._configuration = configuration;
    }

    get activeTask(): ActivePomodoroTask {
        return this._activeTask;
    }

    get isActive(): boolean {
        return this._activeTask.status === ActivePomodoroTaskStatus.Active
            || this._activeTask.status === ActivePomodoroTaskStatus.Paused;
    }

    get status() {
        return this._activeTask.status;
    }

    get restTime() {
        return this._activeTask.restTime;
    }

    _startTimer() {
        this._lastTime = performance.now();

        this._currentTimer = setInterval(() => {
            const now = performance.now();
            const delta = now - this._lastTime;

            if (delta >= TICK_PERIOD) {
                const tickPeriodCount = Math.floor(delta / TICK_PERIOD);
                this._activeTask.restTime -= tickPeriodCount * TICK_PERIOD;
                this._lastTime = now;

                this.onTick?.(this._activeTask.restTime)

                if (this._activeTask.restTime <= 0) {
                    this._stopTimer();
                    this._activeTask.status = ActivePomodoroTaskStatus.Completed;
                    this.onCompleted?.();
                }
            }

        }, TICK_PERIOD);
    }

    _stopTimer() {
        clearInterval(this._currentTimer);
    }

    _resetRestTime() {
        this._activeTask.restTime = this._activeTask.type === ActivePomodoroTaskType.Task
            ? this._configuration.taskTime
            : this._activeTask.type === ActivePomodoroTaskType.ShortBreak
                ? this._configuration.shortBreakTime
                : this._activeTask.type === ActivePomodoroTaskType.LongBreak
                    ? this._configuration.longBreakTime
                    : 0;
    }

    activateNextTask(planTasks: PlanPomodoroTask[], restTime?: number): void {
        const shouldNextTask = this._activeTask.type === ActivePomodoroTaskType.Undefined
            || this._activeTask.type === ActivePomodoroTaskType.ShortBreak
            || this._activeTask.type === ActivePomodoroTaskType.LongBreak;
        const shouldNextShortBreak = this._activeTask
            && this._activeTask.type === ActivePomodoroTaskType.Task
            && this._activeTask.shortBreakCount < this._configuration.maxShortBreaksSerie;

        if (shouldNextTask) {
            if (planTasks.length === 0) {
                return;
            }

            this._activeTask = {
                task: planTasks[0].task,
                type: ActivePomodoroTaskType.Task,
                status: ActivePomodoroTaskStatus.Pending,
                restTime: restTime ?? this._configuration.taskTime,
                shortBreakCount: this._activeTask.shortBreakCount,
            }
        }
        else if (shouldNextShortBreak) {
            this._activeTask = {
                type: ActivePomodoroTaskType.ShortBreak,
                status: ActivePomodoroTaskStatus.Active,
                task: {
                  id: generateId(),
                  category: {
                      name: ""
                  },
                  description: "Короткий перерыв"
                },
                restTime: this._configuration.shortBreakTime,
                shortBreakCount: this._activeTask.shortBreakCount + 1,
            }

            this._startTimer();
        }
        else {
            this._activeTask = {
                type: ActivePomodoroTaskType.LongBreak,
                status: ActivePomodoroTaskStatus.Active,
                task: {
                    id: generateId(),
                    category: {
                        name: ""
                    },
                    description: "Длинный перерыв"
                },
                restTime: this._configuration.longBreakTime,
                shortBreakCount: 0,
            }

            this._startTimer();
        }
    }

    start() {
        if (this.isActive) {
            throw new Error("Task is already active");
        }

        if (this._activeTask.status !== ActivePomodoroTaskStatus.Pending) {
            throw new Error("Failed to start. Task status should be pending.");
        }

        this._activeTask.status = ActivePomodoroTaskStatus.Active;
        this._startTimer();
    }

    stop() {
        if (!this.isActive) {
            throw new Error("No active task was stopped.");
        }

        if (this._activeTask.status !== ActivePomodoroTaskStatus.Active) {
            throw new Error("Failed to stop active task. Status should be active ");
        }

        this._stopTimer();
        this._activeTask.status = ActivePomodoroTaskStatus.Pending;
        this._resetRestTime();
    }

    complete() {
        if (!this.isActive) {
            throw new Error("No active task was completed.");
        }

        if (this._activeTask.status !== ActivePomodoroTaskStatus.Active
                && this._activeTask.status !== ActivePomodoroTaskStatus.Paused) {
            throw new Error("Failed to complete task. Status should be active or paused.");
        }

        this._stopTimer();
        this._activeTask.status = ActivePomodoroTaskStatus.Completed;
        this.onCompleted?.();
    }

    pause() {
        if (!this.isActive) {
            throw new Error("No active task was paused.");
        }

        if (this._activeTask.status !== ActivePomodoroTaskStatus.Active) {
            throw new Error("Failed to pause task. Status should be active ");
        }

        this._activeTask.status = ActivePomodoroTaskStatus.Paused;
        this._stopTimer();
    }

    resume() {
        if (!this.isActive) {
            throw new Error("No active task was resumed.");
        }

        if (this._activeTask.status !== ActivePomodoroTaskStatus.Paused) {
            throw new Error("Failed to stop active task. Status should be paused ");
        }

        this._activeTask.status = ActivePomodoroTaskStatus.Active;
        this._startTimer();
    }

    onTick?: (restTime: number) => void;

    onCompleted?: () => void;
}
