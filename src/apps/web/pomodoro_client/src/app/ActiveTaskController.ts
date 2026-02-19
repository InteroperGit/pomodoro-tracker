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

type NextPhase =
    | { type: "task"; task: PlanPomodoroTask }
    | { type: "shortBreak" }
    | { type: "longBreak" }
    | { type: "idle" }

export type ActiveTaskControllerPayloads = {
    tick: number;
    completed: void;
    idle: void;
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

    private _startTimer() {
        // Защита от повторного запуска: если таймер уже запущен, не запускаем снова
        if (this._currentTimer !== 0) {
            console.warn("Timer is already running. Stopping previous timer before starting a new one.");
            this._stopTimer();
        }

        this._lastTime = performance.now();

        this._currentTimer = setInterval(() => {
            const now = performance.now();
            const delta = now - this._lastTime;

            if (delta >= TICK_PERIOD) {
                const tickPeriodCount = Math.floor(delta / TICK_PERIOD);

                // Компенсация пропущенных тиков
                const timeToSubtract = tickPeriodCount * TICK_PERIOD;
                this._activeTask.restTime -= timeToSubtract;

                // Корректное обновление _lastTime: учитываем точное время вычитания
                // Вместо просто now, вычитаем остаток от деления, чтобы не терять точность
                this._lastTime = now - (delta % TICK_PERIOD);

                this._eventBus.emit("tick", this._activeTask.restTime);

                if (this._activeTask.restTime <= 0) {
                    this._stopTimer();
                    this._activeTask.status = ActivePomodoroTaskStatus.Completed;
                    this._eventBus.emit("completed");
                }
            }

        }, TICK_PERIOD);
    }

    private _stopTimer() {
        if (this._currentTimer !== 0) {
            clearInterval(this._currentTimer);
            this._currentTimer = 0; // Явно сбрасываем в 0 для проверки в _startTimer
        }
    }

    private _assertStatus(
        expectedStatuses: readonly ActivePomodoroTaskStatus[],
        message: string
    ): void {
        if (!expectedStatuses.includes(this._activeTask.status)) {
            throw new Error(message);
        }
    }

    private _assertActive(message: string): void {
        if (!this.isActive) {
            throw new Error(message);
        }
    }

    private _assertNotActive(message: string): void {
        if (this.isActive) {
            throw new Error(message);
        }
    }

    private _resetRestTime() {
        this._activeTask.restTime = this._activeTask.type === ActivePomodoroTaskType.Task
            ? this._configuration.taskTime
            : this._activeTask.type === ActivePomodoroTaskType.ShortBreak
                ? this._configuration.shortBreakTime
                : this._activeTask.type === ActivePomodoroTaskType.LongBreak
                    ? this._configuration.longBreakTime
                    : 0;
    }

    private _determineNextPhase(planTasks: PlanPomodoroTask[]): NextPhase {
        // Если нет активной задачи или это перерыв/undefined → следующая задача
        const isBreakOrUndefined =
            !this._activeTask
            || this._activeTask.type === ActivePomodoroTaskType.Undefined
            || this._activeTask.type === ActivePomodoroTaskType.ShortBreak
            || this._activeTask.type === ActivePomodoroTaskType.LongBreak;
            
        if (isBreakOrUndefined) {
            return planTasks.length === 0
                ? { type: "idle" }
                : { type: "task", task: planTasks[0] };
        }

        if (this._activeTask.type === ActivePomodoroTaskType.Task) {
            // Если в плане больше нет задач → idle, а не перерыв
            if (planTasks.length === 0) {
                return { type: "idle" };
            }

            const needsLongBreak = this._activeTask.shortBreakCount >= this._configuration.maxShortBreaksSerie;

            if (needsLongBreak) {
                return { type: "longBreak" }
            }
            else {
                return { type: "shortBreak" }
            }
        }

        return { type: "idle" }
    }

    private _getTaskFromPlan(task: PlanPomodoroTask): ActivePomodoroTask {
        return {
            type: ActivePomodoroTaskType.Task,
            task: task.task,
            status: ActivePomodoroTaskStatus.Pending,
            restTime: this._configuration.taskTime,
            shortBreakCount: this._activeTask?.shortBreakCount ?? 0
        }
    }

    private _getShortBreakTask(): ActivePomodoroTask {
        return {
            type: ActivePomodoroTaskType.ShortBreak,
            status: ActivePomodoroTaskStatus.Active,
            task: {
                id: generateId(),
                category: { name: "" },
                description: SHORT_BREAK_TITLE
            },
            restTime: this._configuration.shortBreakTime,
            shortBreakCount: (this._activeTask?.shortBreakCount ?? 0) + 1,
        }
    }

    private _getLongBreakTask(): ActivePomodoroTask {
        return {
            type: ActivePomodoroTaskType.LongBreak,
            status: ActivePomodoroTaskStatus.Active,
            task: {
                id: generateId(),
                category: { name: "" },
                description: LONG_BREAK_TITLE,
            },
            restTime: this._configuration.longBreakTime,
            shortBreakCount: 0
        }
    }

    private _getIdleTask(): ActivePomodoroTask {
        return {
            type: ActivePomodoroTaskType.Undefined,
            status: ActivePomodoroTaskStatus.Undefined,
            restTime: 0,
            shortBreakCount: 0,
        }
    }

    activateNextTask(planTasks: PlanPomodoroTask[]): void {
        const nextPhase = this._determineNextPhase(planTasks);

        switch (nextPhase.type) {
            case "task":
                this._activeTask = this._getTaskFromPlan(nextPhase.task);
                break;
            case "shortBreak":
                this._activeTask = this._getShortBreakTask();
                this._startTimer();
                break;
            case "longBreak":
                this._activeTask = this._getLongBreakTask();
                this._startTimer();
                break;
            case "idle":
                this._activeTask = this._getIdleTask();
                this._eventBus.emit("idle");
                break;
        }
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
        this._assertNotActive("Task is already active");
        this._assertStatus(
            [ActivePomodoroTaskStatus.Pending],
            "Failed to start. Task status should be pending."
        );


        this._activeTask.status = ActivePomodoroTaskStatus.Active;
        this._startTimer();
    }

    stop() {
        this._assertActive("No active task was stopped.");
        this._assertStatus(
            [ActivePomodoroTaskStatus.Active],
            "Failed to stop active task. Status should be active."
        );

        this._stopTimer();
        this._activeTask.status = ActivePomodoroTaskStatus.Pending;
        this._resetRestTime();
    }

    complete() {
        this._assertActive("No active task was completed.");
        this._assertStatus(
            [ActivePomodoroTaskStatus.Active, ActivePomodoroTaskStatus.Paused],
            "Failed to complete task. Status should be active or paused."
        );

        this._stopTimer();
        this._activeTask.status = ActivePomodoroTaskStatus.Completed;
        this._eventBus.emit("completed");
    }

    pause() {
        this._assertActive("No active task was paused.");
        this._assertStatus(
            [ActivePomodoroTaskStatus.Active],
            "Failed to pause task. Status should be active."
        );

        this._activeTask.status = ActivePomodoroTaskStatus.Paused;
        this._stopTimer();
    }

    resume() {
        this._assertActive("No active task was resumed.");
        this._assertStatus(
            [ActivePomodoroTaskStatus.Paused],
            "Failed to resume task. Status should be paused."
        );

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
