import { describe, it, expect, vi } from 'vitest';
import { createContext } from '../../src/app/appContext.ts';
import { ActivePomodoroTaskStatus, ActivePomodoroTaskType } from '../../src/types/task.ts';
import type { PomodoroEvent } from '../../src/types/context.ts';
import { makeTask, makeState, makeCtx, makeCtxWithTask } from './helpers.ts';

describe('Timer State Machine — startTask', () => {
    it('status changes to Active', () => {
        const { store, actions } = makeCtxWithTask();
        actions.startTask();
        expect(store.getState().activeTask?.status).toBe(ActivePomodoroTaskStatus.Active);
    });

    it('fires PomodoroEvent { type: "started", taskType: "task" }', () => {
        const spy = vi.fn<(event: PomodoroEvent) => void>();
        const { actions } = makeCtxWithTask(spy);
        actions.startTask();
        expect(spy).toHaveBeenCalledWith({ type: 'started', taskType: 'task' });
    });

    it('startTask on already Active task throws', () => {
        const { actions } = makeCtxWithTask();
        actions.startTask();
        expect(() => actions.startTask()).toThrow();
    });

    it('startTask with no activeTask throws', () => {
        const { actions } = makeCtx();
        expect(() => actions.startTask()).toThrow();
    });
});

// ---------------------------------------------------------------------------

describe('Timer State Machine — pauseTask', () => {
    it('status changes to Paused', () => {
        const { store, actions } = makeCtxWithTask();
        actions.startTask();
        actions.pauseTask();
        expect(store.getState().activeTask?.status).toBe(ActivePomodoroTaskStatus.Paused);
    });

    it('pauseTask on Pending task throws', () => {
        const { actions } = makeCtxWithTask();
        expect(() => actions.pauseTask()).toThrow();
    });

    it('restTime is preserved after pause', () => {
        const { store, actions } = makeCtxWithTask();
        actions.startTask();
        const restTimeBefore = store.getState().activeTask!.restTime;
        actions.pauseTask();
        expect(store.getState().activeTask?.restTime).toBe(restTimeBefore);
    });
});

// ---------------------------------------------------------------------------

describe('Timer State Machine — resumeTask', () => {
    it('status changes back to Active', () => {
        const { store, actions } = makeCtxWithTask();
        actions.startTask();
        actions.pauseTask();
        actions.resumeTask();
        expect(store.getState().activeTask?.status).toBe(ActivePomodoroTaskStatus.Active);
    });

    it('resumeTask on Active task throws', () => {
        const { actions } = makeCtxWithTask();
        actions.startTask();
        expect(() => actions.resumeTask()).toThrow();
    });

    it('resumeTask on Pending task throws', () => {
        const { actions } = makeCtxWithTask();
        expect(() => actions.resumeTask()).toThrow();
    });
});

// ---------------------------------------------------------------------------

describe('Timer State Machine — stopTask', () => {
    it('status returns to Pending', () => {
        const { store, actions } = makeCtxWithTask();
        actions.startTask();
        actions.stopTask();
        expect(store.getState().activeTask?.status).toBe(ActivePomodoroTaskStatus.Pending);
    });

    it('stopTask on Paused task throws', () => {
        const { actions } = makeCtxWithTask();
        actions.startTask();
        actions.pauseTask();
        expect(() => actions.stopTask()).toThrow();
    });

    it('stopTask on Pending task throws', () => {
        const { actions } = makeCtxWithTask();
        expect(() => actions.stopTask()).toThrow();
    });
});

// ---------------------------------------------------------------------------

describe('Timer State Machine — completeTask', () => {
    it('completeTask on Active task fires PomodoroEvent { type: "completed", taskType: "task" }', () => {
        const spy = vi.fn<(event: PomodoroEvent) => void>();
        const { actions } = makeCtxWithTask(spy);
        actions.startTask();
        actions.completeTask();
        expect(spy).toHaveBeenCalledWith({ type: 'completed', taskType: 'task' });
    });

    it('completeTask on Paused task is allowed and fires completed event', () => {
        const spy = vi.fn<(event: PomodoroEvent) => void>();
        const { actions } = makeCtxWithTask(spy);
        actions.startTask();
        actions.pauseTask();
        expect(() => actions.completeTask()).not.toThrow();
        expect(spy).toHaveBeenCalledWith({ type: 'completed', taskType: 'task' });
    });

    it('completeTask on Pending task throws', () => {
        const { actions } = makeCtxWithTask();
        expect(() => actions.completeTask()).toThrow();
    });
});

// ---------------------------------------------------------------------------

describe('Timer State Machine — PomodoroEvent callbacks', () => {
    // Breaks auto-start as Active (no startTask() call needed).
    // The observable event is "breakStarted", fired in the "completed" handler.
    it('fires { type: "breakStarted", taskType: "shortBreak" } when a task completes and a break activates', () => {
        const spy = vi.fn<(event: PomodoroEvent) => void>();
        // Need 2 tasks: after first completes the plan is non-empty so a short break activates
        const ctx = createContext(makeState(), () => {}, spy);
        ctx.actions.addTask(makeTask('t2'));
        ctx.actions.addTask(makeTask('t1'));
        ctx.actions.startTask();
        ctx.actions.completeTask();
        expect(spy).toHaveBeenCalledWith({ type: 'breakStarted', taskType: 'shortBreak' });
    });

    it('short break activates as Active immediately (no startTask needed)', () => {
        const ctx = createContext(makeState(), () => {});
        ctx.actions.addTask(makeTask('t2'));
        ctx.actions.addTask(makeTask('t1'));
        ctx.actions.startTask();
        ctx.actions.completeTask();
        const { activeTask } = ctx.store.getState();
        expect(activeTask?.type).toBe(ActivePomodoroTaskType.ShortBreak);
        expect(activeTask?.status).toBe(ActivePomodoroTaskStatus.Active);
    });
});
