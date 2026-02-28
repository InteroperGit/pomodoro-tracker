import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ActiveTaskController } from './ActiveTaskController.ts';
import { ActivePomodoroTaskStatus, ActivePomodoroTaskType, type PlanPomodoroTask } from '../types/task.ts';

const config = {
    taskTime: 25 * 60 * 1000,
    shortBreakTime: 5 * 60 * 1000,
    longBreakTime: 15 * 60 * 1000,
    maxShortBreaksSerie: 4,
};

function makeTask(id: string): PlanPomodoroTask {
    return { task: { id, category: { name: 'test' }, description: 'Task ' + id }, count: 1 };
}

describe('ActiveTaskController — phase transitions', () => {
    it('activateNextTask with empty plan → idle (Undefined)', () => {
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([]);
        expect(ctrl.activeTask.type).toBe(ActivePomodoroTaskType.Undefined);
        expect(ctrl.activeTask.status).toBe(ActivePomodoroTaskStatus.Undefined);
    });

    it('activateNextTask with tasks → Pending task', () => {
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        expect(ctrl.activeTask.type).toBe(ActivePomodoroTaskType.Task);
        expect(ctrl.activeTask.status).toBe(ActivePomodoroTaskStatus.Pending);
        expect(ctrl.activeTask.restTime).toBe(config.taskTime);
    });

    it('from Task state → ShortBreak with auto-start', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.activateNextTask([makeTask('t1')]);
        expect(ctrl.activeTask.type).toBe(ActivePomodoroTaskType.ShortBreak);
        expect(ctrl.activeTask.status).toBe(ActivePomodoroTaskStatus.Active);
        expect(ctrl.activeTask.shortBreakCount).toBe(1);
        vi.useRealTimers();
    });

    it('from ShortBreak state → next Task preserving shortBreakCount', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]); // Task sc=0
        ctrl.activateNextTask([makeTask('t1')]); // ShortBreak sc=1
        ctrl.activateNextTask([makeTask('t1')]); // Task sc=1
        expect(ctrl.activeTask.type).toBe(ActivePomodoroTaskType.Task);
        expect(ctrl.activeTask.shortBreakCount).toBe(1);
        vi.useRealTimers();
    });

    it('triggers LongBreak after maxShortBreaksSerie short breaks', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        const task = makeTask('t1');
        // Cycle: Task → ShortBreak → Task → ShortBreak → ... until sc reaches maxShortBreaksSerie
        ctrl.activateNextTask([task]); // Task sc=0
        for (let i = 0; i < config.maxShortBreaksSerie; i++) {
            ctrl.activateNextTask([task]); // ShortBreak sc=i+1
            ctrl.activateNextTask([task]); // Task sc=i+1
        }
        // Now shortBreakCount === maxShortBreaksSerie → next should be LongBreak
        ctrl.activateNextTask([task]);
        expect(ctrl.activeTask.type).toBe(ActivePomodoroTaskType.LongBreak);
        expect(ctrl.activeTask.shortBreakCount).toBe(0);
        vi.useRealTimers();
    });

    it('from LongBreak state → next Task resets shortBreakCount', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        const task = makeTask('t1');
        ctrl.activateNextTask([task]);
        for (let i = 0; i < config.maxShortBreaksSerie; i++) {
            ctrl.activateNextTask([task]);
            ctrl.activateNextTask([task]);
        }
        ctrl.activateNextTask([task]); // LongBreak
        ctrl.activateNextTask([task]); // Task (from LongBreak → isBreakOrUndefined)
        expect(ctrl.activeTask.type).toBe(ActivePomodoroTaskType.Task);
        expect(ctrl.activeTask.shortBreakCount).toBe(0);
        vi.useRealTimers();
    });

    it('activateNextTask with empty plan from Task state → idle', () => {
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.activateNextTask([]);
        expect(ctrl.activeTask.type).toBe(ActivePomodoroTaskType.Undefined);
    });
});

describe('ActiveTaskController — state machine', () => {
    let ctrl: ActiveTaskController;

    beforeEach(() => {
        vi.useFakeTimers();
        ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('start() changes status to Active', () => {
        ctrl.start();
        expect(ctrl.status).toBe(ActivePomodoroTaskStatus.Active);
    });

    it('pause() after start changes status to Paused', () => {
        ctrl.start();
        ctrl.pause();
        expect(ctrl.status).toBe(ActivePomodoroTaskStatus.Paused);
    });

    it('resume() after pause changes status to Active', () => {
        ctrl.start();
        ctrl.pause();
        ctrl.resume();
        expect(ctrl.status).toBe(ActivePomodoroTaskStatus.Active);
    });

    it('stop() resets status to Pending and restores restTime', () => {
        ctrl.start();
        vi.advanceTimersByTime(5000);
        ctrl.stop();
        expect(ctrl.status).toBe(ActivePomodoroTaskStatus.Pending);
        expect(ctrl.restTime).toBe(config.taskTime);
    });

    it('complete() changes status to Completed', () => {
        ctrl.start();
        ctrl.complete();
        expect(ctrl.status).toBe(ActivePomodoroTaskStatus.Completed);
    });

    it('start() on already Active task throws', () => {
        ctrl.start();
        expect(() => ctrl.start()).toThrow();
    });

    it('pause() on Pending task throws', () => {
        expect(() => ctrl.pause()).toThrow();
    });

    it('resume() on Active task throws', () => {
        ctrl.start();
        expect(() => ctrl.resume()).toThrow();
    });

    it('stop() on Paused task throws', () => {
        ctrl.start();
        ctrl.pause();
        expect(() => ctrl.stop()).toThrow();
    });
});

describe('ActiveTaskController — timer events', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('emits tick with decremented restTime after 1 second', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.start();

        const ticks: number[] = [];
        ctrl.addEventListener('tick', (restTime) => {
            if (restTime !== undefined) {
                ticks.push(restTime);
            }
        });

        vi.advanceTimersByTime(1000);

        expect(ticks).toHaveLength(1);
        expect(ticks[0]).toBe(config.taskTime - 1000);
    });

    it('emits completed when restTime reaches zero', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.start();

        const completed = vi.fn();
        ctrl.addEventListener('completed', completed);

        vi.advanceTimersByTime(config.taskTime);

        expect(completed).toHaveBeenCalledOnce();
        expect(ctrl.status).toBe(ActivePomodoroTaskStatus.Completed);
    });

    it('emits idle when activateNextTask called with empty plan', () => {
        const ctrl = new ActiveTaskController(config);
        const idle = vi.fn();
        ctrl.addEventListener('idle', idle);
        ctrl.activateNextTask([]);
        expect(idle).toHaveBeenCalledOnce();
    });

    it('unsubscribe from tick stops handler from firing', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.start();

        const handler = vi.fn();
        const unsubscribe = ctrl.addEventListener('tick', handler);
        unsubscribe();

        vi.advanceTimersByTime(1000);

        expect(handler).not.toHaveBeenCalled();
    });
});

describe('ActiveTaskController — snapTick', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('does nothing when task is Pending', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        // status is Pending, not Active

        const handler = vi.fn();
        ctrl.addEventListener('tick', handler);
        ctrl.snapTick();

        expect(handler).not.toHaveBeenCalled();
    });

    it('does nothing when task is Paused', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.start();
        ctrl.pause();

        const handler = vi.fn();
        ctrl.addEventListener('tick', handler);
        ctrl.snapTick();

        expect(handler).not.toHaveBeenCalled();
    });

    it('emits tick with current restTime when less than 1 s has elapsed', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.start(); // _lastTime = performance.now() = 0

        // Simulate 500 ms elapsed without the interval firing
        vi.spyOn(performance, 'now').mockReturnValue(500);

        const ticks: number[] = [];
        ctrl.addEventListener('tick', r => {
            if (r !== undefined) {
                ticks.push(r);
            }
        });
        ctrl.snapTick();

        expect(ticks).toHaveLength(1);
        expect(ticks[0]).toBe(config.taskTime); // restTime unchanged, < 1 full tick
    });

    it('processes multiple elapsed ticks when tab was throttled', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.start(); // _lastTime = 0

        // Simulate 3.5 s elapsed (3 full ticks) without interval firing
        vi.spyOn(performance, 'now').mockReturnValue(3500);

        const ticks: number[] = [];
        ctrl.addEventListener('tick', r => {
            if (r !== undefined) {
                ticks.push(r);
            }
        });
        ctrl.snapTick();

        expect(ticks).toHaveLength(1);
        expect(ticks[0]).toBe(config.taskTime - 3000);
    });

    it('emits completed if timer expired while tab was hidden', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateNextTask([makeTask('t1')]);
        ctrl.start(); // _lastTime = 0

        vi.spyOn(performance, 'now').mockReturnValue(config.taskTime + 1000);

        const completed = vi.fn();
        ctrl.addEventListener('completed', completed);
        ctrl.snapTick();

        expect(completed).toHaveBeenCalledOnce();
        expect(ctrl.status).toBe(ActivePomodoroTaskStatus.Completed);
    });
});

describe('ActiveTaskController — activateTask (restore from state)', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('restores Pending task without starting timer', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateTask({
            type: ActivePomodoroTaskType.Task,
            task: { id: 't1', category: { name: '' }, description: 'Task' },
            status: ActivePomodoroTaskStatus.Pending,
            restTime: 10000,
            shortBreakCount: 0,
        });

        const ticks: number[] = [];
        ctrl.addEventListener('tick', (r) => {
            if (r !== undefined) {
                ticks.push(r);
            }
        });

        vi.advanceTimersByTime(2000);
        expect(ticks).toHaveLength(0);
    });

    it('restores Active task and starts the timer automatically', () => {
        vi.useFakeTimers();
        const ctrl = new ActiveTaskController(config);
        ctrl.activateTask({
            type: ActivePomodoroTaskType.Task,
            task: { id: 't1', category: { name: '' }, description: 'Task' },
            status: ActivePomodoroTaskStatus.Active,
            restTime: 10000,
            shortBreakCount: 0,
        });

        const ticks: number[] = [];
        ctrl.addEventListener('tick', (r) => {
            if (r !== undefined) {
                ticks.push(r);
            }
        });

        vi.advanceTimersByTime(1000);
        expect(ticks).toHaveLength(1);
    });
});
