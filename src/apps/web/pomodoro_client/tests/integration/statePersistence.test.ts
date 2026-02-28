import { describe, it, expect } from 'vitest';
import { createContext } from '../../src/app/appContext.ts';
import type { AppContext } from '../../src/app/appContext.ts';
import { validateAppState } from '../../src/utils/stateSchema.ts';
import type { AppState } from '../../src/types/context.ts';
import { makeState } from './helpers.ts';

/** Simulate a localStorage round-trip: state → JSON string → plain object. */
function serialize(ctx: AppContext): unknown {
    return JSON.parse(JSON.stringify(ctx.store.getState()));
}

/**
 * Builds a context with a realistic mix of plan and archive tasks:
 *   plan  : [t1 (count=2)]
 *   archive: [t2]
 *   activeTask: t1
 */
function makeCtxWithData(): AppContext {
    const ctx = createContext(makeState(), () => {});
    ctx.actions.addTask({ id: 't1', category: { name: 'Dev' }, description: 'Write tests' });
    ctx.actions.addTask({ id: 't2', category: { name: 'QA' }, description: 'Review PR' });
    ctx.actions.incTask('t1'); // t1.count → 2
    ctx.actions.archiveTask('t2');
    return ctx;
}

// ---------------------------------------------------------------------------

describe('State Persistence — Serialization', () => {
    it('state serializes to a plain JSON-compatible object', () => {
        const ctx = makeCtxWithData();
        const serialized = serialize(ctx);
        expect(typeof serialized).toBe('object');
        expect(serialized).not.toBeNull();
        expect(Array.isArray(serialized)).toBe(false);
    });

    it('plan task id and count survive serialization', () => {
        const ctx = makeCtxWithData();
        const s = serialize(ctx) as AppState;
        expect(s.planTasks.tasks[0].task.id).toBe('t1');
        expect(s.planTasks.tasks[0].count).toBe(2);
    });

    it('archived task id survives serialization', () => {
        const ctx = makeCtxWithData();
        const s = serialize(ctx) as AppState;
        expect(s.archiveTasks.tasks[0].task.id).toBe('t2');
    });

    it('archived task completedAt is a number after serialization', () => {
        const ctx = makeCtxWithData();
        const s = serialize(ctx) as AppState;
        expect(typeof s.archiveTasks.tasks[0].completedAt).toBe('number');
    });

    it('archived task taskTime is a number after serialization', () => {
        const ctx = makeCtxWithData();
        const s = serialize(ctx) as AppState;
        expect(typeof s.archiveTasks.tasks[0].taskTime).toBe('number');
    });

    it('planTasks.statistics.tasksCount survives serialization', () => {
        const ctx = makeCtxWithData();
        const s = serialize(ctx) as AppState;
        expect(s.planTasks.statistics.tasksCount).toBe(2); // t1 has count 2
    });

    it('archiveTasks.statistics.tasksCount survives serialization', () => {
        const ctx = makeCtxWithData();
        const s = serialize(ctx) as AppState;
        expect(s.archiveTasks.statistics.tasksCount).toBe(1);
    });
});

// ---------------------------------------------------------------------------

describe('State Persistence — validateAppState with real context state', () => {
    it('valid serialized state passes validation and returns non-null', () => {
        const ctx = makeCtxWithData();
        const restored = validateAppState(serialize(ctx));
        expect(restored).not.toBeNull();
    });

    it('validateAppState returns the same object reference on success', () => {
        const raw = serialize(makeCtxWithData());
        const restored = validateAppState(raw);
        expect(restored).toBe(raw);
    });

    it('validateAppState returns null for null input', () => {
        expect(validateAppState(null)).toBeNull();
    });

    it('validateAppState returns null when planTasks is missing', () => {
        expect(validateAppState({ archiveTasks: { tasks: [] } })).toBeNull();
    });

    it('validateAppState returns null when archiveTasks is missing', () => {
        expect(validateAppState({ planTasks: { tasks: [] } })).toBeNull();
    });

    it('validateAppState returns null when a plan task has an invalid shape', () => {
        const bad = {
            planTasks: { tasks: [{ bad: true }] },
            archiveTasks: { tasks: [] },
        };
        expect(validateAppState(bad)).toBeNull();
    });
});

// ---------------------------------------------------------------------------

describe('State Persistence — createContext restoration', () => {
    it('restored context has the same plan tasks', () => {
        const ctx = makeCtxWithData();
        const restored = validateAppState(serialize(ctx))!;
        const ctx2 = createContext(restored, () => {});
        const { tasks } = ctx2.store.getState().planTasks;
        expect(tasks[0].task.id).toBe('t1');
        expect(tasks[0].count).toBe(2);
    });

    it('restored context has the same archive tasks', () => {
        const ctx = makeCtxWithData();
        const ctx2 = createContext(validateAppState(serialize(ctx))!, () => {});
        expect(ctx2.store.getState().archiveTasks.tasks[0].task.id).toBe('t2');
    });

    it('restored context planTasks statistics match the original', () => {
        const ctx = makeCtxWithData();
        const ctx2 = createContext(validateAppState(serialize(ctx))!, () => {});
        expect(ctx2.store.getState().planTasks.statistics.tasksCount).toBe(
            ctx.store.getState().planTasks.statistics.tasksCount,
        );
    });

    it('restored context archiveTasks statistics match the original', () => {
        const ctx = makeCtxWithData();
        const ctx2 = createContext(validateAppState(serialize(ctx))!, () => {});
        expect(ctx2.store.getState().archiveTasks.statistics.tasksCount).toBe(
            ctx.store.getState().archiveTasks.statistics.tasksCount,
        );
    });

    it('restored context activeTask matches the first plan task', () => {
        const ctx = makeCtxWithData();
        const ctx2 = createContext(validateAppState(serialize(ctx))!, () => {});
        expect(ctx2.store.getState().activeTask?.task?.id).toBe('t1');
    });

    it('actions still work after restore — incTask increments count', () => {
        const ctx = makeCtxWithData();
        const ctx2 = createContext(validateAppState(serialize(ctx))!, () => {});
        ctx2.actions.incTask('t1');
        expect(ctx2.store.getState().planTasks.tasks[0].count).toBe(3);
    });
});

// ---------------------------------------------------------------------------

describe('State Persistence — theme and ui state', () => {
    it('theme survives the round-trip', () => {
        const ctx = createContext(makeState(), () => {});
        ctx.actions.setTheme('dark');
        const ctx2 = createContext(validateAppState(serialize(ctx))!, () => {});
        expect(ctx2.store.getState().theme).toBe('dark');
    });

    it('editingPlanTaskIndex is preserved after round-trip', () => {
        const ctx = createContext(makeState(), () => {});
        ctx.actions.addTask({ id: 't1', category: { name: 'Dev' }, description: 'Task' });
        ctx.actions.startEditTask(0);
        expect(ctx.store.getState().editingPlanTaskIndex).toBe(0);
        const ctx2 = createContext(validateAppState(serialize(ctx))!, () => {});
        // validateAppState passes all fields through; editingPlanTaskIndex is not reset
        expect(ctx2.store.getState().editingPlanTaskIndex).toBe(0);
    });
});
