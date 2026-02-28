import { describe, it, expect, vi } from 'vitest';
import { createContext } from '../../src/app/appContext.ts';
import type { AppContext } from '../../src/app/appContext.ts';
import { ActivePomodoroTaskStatus, ActivePomodoroTaskType } from '../../src/types/task.ts';
import type { PomodoroEvent } from '../../src/types/context.ts';
import { makeTask, makeState } from './helpers.ts';

/**
 * Creates a context with `count` tasks ordered t1…tN in the plan.
 * Adds in reverse (tN first) so that addTask(front-push) yields [t1, t2, …, tN].
 */
function makeCtxWithTasks(count: number): AppContext {
    const ctx = createContext(makeState(), () => {});
    for (let i = count; i >= 1; i--) {
        ctx.actions.addTask(makeTask(`t${i}`));
    }
    return ctx;
}

/**
 * Completes one full Pomodoro cycle: starts the current pending task,
 * marks it complete (→ short break auto-starts), then completes the break
 * (→ next task becomes pending).
 */
function completePomodoro(ctx: AppContext): void {
    ctx.actions.startTask();
    ctx.actions.completeTask(); // task done → short break auto-starts (Active)
    ctx.actions.completeTask(); // break done → next task is Pending
}

// ---------------------------------------------------------------------------

describe('Automatic Pomodoro Cycle — Task → Short Break', () => {
    it('activeTask type changes to ShortBreak after task completes', () => {
        const ctx = makeCtxWithTasks(2);
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(ctx.store.getState().activeTask?.type).toBe(ActivePomodoroTaskType.ShortBreak);
    });

    it('short break auto-starts as Active (no startTask needed)', () => {
        const ctx = makeCtxWithTasks(2);
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(ctx.store.getState().activeTask?.status).toBe(ActivePomodoroTaskStatus.Active);
    });

    it('completed task is moved to archiveTasks', () => {
        const ctx = makeCtxWithTasks(2);
        ctx.actions.startTask();
        ctx.actions.completeTask();
        const state = ctx.store.getState();
        expect(state.archiveTasks.tasks).toHaveLength(1);
        expect(state.archiveTasks.tasks[0].task.id).toBe('t1');
    });

    it('completed task is removed from planTasks', () => {
        const ctx = makeCtxWithTasks(2);
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(ctx.store.getState().planTasks.tasks).toHaveLength(1);
    });

    it('fires PomodoroEvent { type: "completed", taskType: "task" }', () => {
        const spy = vi.fn<(event: PomodoroEvent) => void>();
        const ctx = createContext(makeState(), () => {}, spy);
        ctx.actions.addTask(makeTask('t2'));
        ctx.actions.addTask(makeTask('t1'));
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(spy).toHaveBeenCalledWith({ type: 'completed', taskType: 'task' });
    });

    it('fires PomodoroEvent { type: "breakStarted", taskType: "shortBreak" }', () => {
        const spy = vi.fn<(event: PomodoroEvent) => void>();
        const ctx = createContext(makeState(), () => {}, spy);
        ctx.actions.addTask(makeTask('t2'));
        ctx.actions.addTask(makeTask('t1'));
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(spy).toHaveBeenCalledWith({ type: 'breakStarted', taskType: 'shortBreak' });
    });
});

// ---------------------------------------------------------------------------

describe('Automatic Pomodoro Cycle — Short Break → Next Task', () => {
    it('after short break completes, next task is Pending', () => {
        const ctx = makeCtxWithTasks(2);
        ctx.actions.startTask();
        ctx.actions.completeTask(); // task → short break
        ctx.actions.completeTask(); // break → next task
        const { activeTask } = ctx.store.getState();
        expect(activeTask?.type).toBe(ActivePomodoroTaskType.Task);
        expect(activeTask?.status).toBe(ActivePomodoroTaskStatus.Pending);
    });

    it('next task id matches the second plan task', () => {
        const ctx = makeCtxWithTasks(2);
        ctx.actions.startTask();
        ctx.actions.completeTask();
        ctx.actions.completeTask();
        expect(ctx.store.getState().activeTask?.task?.id).toBe('t2');
    });

    it('fires PomodoroEvent { type: "completed", taskType: "shortBreak" }', () => {
        const spy = vi.fn<(event: PomodoroEvent) => void>();
        const ctx = createContext(makeState(), () => {}, spy);
        ctx.actions.addTask(makeTask('t2'));
        ctx.actions.addTask(makeTask('t1'));
        ctx.actions.startTask();
        ctx.actions.completeTask(); // task done
        ctx.actions.completeTask(); // break done
        expect(spy).toHaveBeenCalledWith({ type: 'completed', taskType: 'shortBreak' });
    });
});

// ---------------------------------------------------------------------------

describe('Automatic Pomodoro Cycle — Long Break after 4 short breaks', () => {
    // Long break fires when shortBreakCount >= maxShortBreaksSerie (4).
    // The count increments once per short break taken. After 4 full pomodoros
    // (task + break each), the 5th task has shortBreakCount=4.
    // Completing it (plan still has t6) triggers the long break.
    // Total tasks needed: 6 — five cycled through plus one to keep plan non-empty.

    it('5th task completion triggers long break', () => {
        const ctx = makeCtxWithTasks(6);
        for (let i = 0; i < 4; i++) {
            completePomodoro(ctx);
        }
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(ctx.store.getState().activeTask?.type).toBe(ActivePomodoroTaskType.LongBreak);
    });

    it('long break auto-starts as Active', () => {
        const ctx = makeCtxWithTasks(6);
        for (let i = 0; i < 4; i++) {
            completePomodoro(ctx);
        }
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(ctx.store.getState().activeTask?.status).toBe(ActivePomodoroTaskStatus.Active);
    });

    it('long break resets shortBreakCount to 0', () => {
        const ctx = makeCtxWithTasks(6);
        for (let i = 0; i < 4; i++) {
            completePomodoro(ctx);
        }
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(ctx.store.getState().activeTask?.shortBreakCount).toBe(0);
    });

    it('fires PomodoroEvent { type: "breakStarted", taskType: "longBreak" }', () => {
        const spy = vi.fn<(event: PomodoroEvent) => void>();
        const ctx = createContext(makeState(), () => {}, spy);
        for (let i = 6; i >= 1; i--) {
            ctx.actions.addTask(makeTask(`t${i}`));
        }
        for (let i = 0; i < 4; i++) {
            completePomodoro(ctx);
        }
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(spy).toHaveBeenCalledWith({ type: 'breakStarted', taskType: 'longBreak' });
    });

    it('task after long break has shortBreakCount reset to 0', () => {
        const ctx = makeCtxWithTasks(6);
        for (let i = 0; i < 4; i++) {
            completePomodoro(ctx);
        }
        ctx.actions.startTask();
        ctx.actions.completeTask(); // task 5 → long break
        ctx.actions.completeTask(); // long break → task 6 (sc reset)
        expect(ctx.store.getState().activeTask?.shortBreakCount).toBe(0);
    });
});

// ---------------------------------------------------------------------------

describe('Automatic Pomodoro Cycle — Idle', () => {
    // When the last task is archived and plan is empty, activateNextTask([])
    // returns idle (Undefined) directly — no break is started.

    it('last task completion goes directly to idle when plan is empty', () => {
        const ctx = makeCtxWithTasks(1);
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(ctx.store.getState().activeTask?.type).toBe(ActivePomodoroTaskType.Undefined);
    });

    it('idle after completing all tasks in a two-task plan', () => {
        const ctx = makeCtxWithTasks(2);
        completePomodoro(ctx); // t1 + break → t2 pending
        ctx.actions.startTask();
        ctx.actions.completeTask(); // t2 archived, plan empty → idle
        expect(ctx.store.getState().activeTask?.type).toBe(ActivePomodoroTaskType.Undefined);
    });
});
