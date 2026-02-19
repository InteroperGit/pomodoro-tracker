import {
    type ActivePomodoroTask,
    ActivePomodoroTaskStatus,
    ActivePomodoroTaskType,
    type PlanPomodoroTask
} from "../types/task.ts";
import {generateId} from "../utils/idGenerator.ts";
import {EventBus} from "../utils/eventBus.ts";

const TICK_PERIOD = 1000;
const SHORT_BREAK_TITLE = "Короткий перерыв";
const LONG_BREAK_TITLE = "Длинный перерыв";

export type ActiveTaskControllerPayloads = {
    tick: number;
    completed: void;
}

export type ActiveTaskControllerEvents = keyof ActiveTaskControllerPayloads;

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
    private _eventBus: EventBus<ActiveTaskControllerPayloads>;

    constructor(configuration: ActiveTaskControllerConfiguration) {
        if (!configuration) {
            throw new Error("No configuration found.");
        }

        this._configuration = configuration;
        this._eventBus = new EventBus<ActiveTaskControllerPayloads>();
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

                this._eventBus.emit("tick", this._activeTask.restTime);

                if (this._activeTask.restTime <= 0) {
                    this._stopTimer();
                    this._activeTask.status = ActivePomodoroTaskStatus.Completed;
                    this._eventBus.emit("completed");
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

    activateTask(activeTask: ActivePomodoroTask) {
        if (!activeTask) {
            throw new Error("Failed to activate task. Active task is not defined");
        }

        this._activeTask = activeTask;

        if (this._activeTask.status === ActivePomodoroTaskStatus.Active) {
            this._startTimer();
        }
    }

    activateNextTask(planTasks: PlanPomodoroTask[]): void {
        const shouldNextTask = !this.activeTask
            || this._activeTask.type === ActivePomodoroTaskType.Undefined
            || this._activeTask.type === ActivePomodoroTaskType.ShortBreak
            || this._activeTask.type === ActivePomodoroTaskType.LongBreak;
        const shouldNextShortBreak = this._activeTask
            && this._activeTask.type === ActivePomodoroTaskType.Task
            && this._activeTask.shortBreakCount < this._configuration.maxShortBreaksSerie;
        const shouldNextLongBreak = this._activeTask
            && this._activeTask.type === ActivePomodoroTaskType.Task
            && this._activeTask.shortBreakCount >= this._configuration.maxShortBreaksSerie;

        if (shouldNextTask) {
            if (planTasks.length === 0) {
                throw new Error("Failed to activate task. Plan tasks list is empty");
            }

            this._activeTask = {
                task: planTasks[0].task,
                type: ActivePomodoroTaskType.Task,
                status: ActivePomodoroTaskStatus.Pending,
                restTime: this._configuration.taskTime,
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
                  description: SHORT_BREAK_TITLE
                },
                restTime: this._configuration.shortBreakTime,
                shortBreakCount: this._activeTask.shortBreakCount + 1,
            }

            this._startTimer();
        }
        else if (shouldNextLongBreak) {
            this._activeTask = {
                type: ActivePomodoroTaskType.LongBreak,
                status: ActivePomodoroTaskStatus.Active,
                task: {
                    id: generateId(),
                    category: {
                        name: ""
                    },
                    description: LONG_BREAK_TITLE
                },
                restTime: this._configuration.longBreakTime,
                shortBreakCount: 0,
            }

            this._startTimer();
        }
    }

    setActiveTask(activeTask: ActivePomodoroTask): void {
        if (!activeTask) {
            throw new Error("Active task is not defined");
        }

        if (activeTask.type !== ActivePomodoroTaskType.Task) {
            throw new Error("Active task's type is not Task");
        }

        if (this._activeTask?.task?.id === activeTask.task?.id) {
            return;
        }

        this._activeTask = activeTask;
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
        this._eventBus.emit("completed");
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

    addEventListener<T extends ActiveTaskControllerEvents>(
        event: T, 
        handler: (args?: ActiveTaskControllerPayloads[T]) => void
    ): void  {
        this._eventBus.addEventListener(event, handler);
    }
}
