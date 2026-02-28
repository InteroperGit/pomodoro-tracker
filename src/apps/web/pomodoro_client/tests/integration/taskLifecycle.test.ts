import { describe, it, expect } from 'vitest';
import { appConfig } from '../../src/app/config.ts';
import { makeTask, makeCtx } from './helpers.ts';

describe('Task Lifecycle — addTask', () => {
    it('adds task to the front of planTasks.tasks', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        const { tasks } = store.getState().planTasks;
        expect(tasks).toHaveLength(1);
        expect(tasks[0].task.id).toBe('t1');
        expect(tasks[0].count).toBe(1);
    });

    it('second addTask goes to front', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.addTask(makeTask('t2'));
        const { tasks } = store.getState().planTasks;
        expect(tasks[0].task.id).toBe('t2');
        expect(tasks[1].task.id).toBe('t1');
    });

    it('activeTask is set to the added task', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        expect(store.getState().activeTask?.task?.id).toBe('t1');
    });

    it('planTasks.statistics.tasksCount updates', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.addTask(makeTask('t2'));
        expect(store.getState().planTasks.statistics.tasksCount).toBe(2);
    });
});

// ---------------------------------------------------------------------------

describe('Task Lifecycle — incTask / decTask', () => {
    it('incTask increments count', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.incTask('t1');
        const state = store.getState();
        expect(state.planTasks.tasks[0].count).toBe(2);
        expect(state.planTasks.statistics.tasksCount).toBe(2);
    });

    it('decTask decrements count', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.incTask('t1');
        actions.decTask('t1');
        expect(store.getState().planTasks.tasks[0].count).toBe(1);
    });

    it('decTask on count=1 removes the task from plan', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.decTask('t1');
        expect(store.getState().planTasks.tasks).toHaveLength(0);
    });

    it('decTask on first task activates next', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t2'));
        actions.addTask(makeTask('t1'));
        actions.decTask('t1');
        expect(store.getState().activeTask?.task?.id).toBe('t2');
    });

    it('incTask with unknown id throws', () => {
        const { actions } = makeCtx();
        expect(() => actions.incTask('unknown')).toThrow(/not found/i);
    });
});

// ---------------------------------------------------------------------------

describe('Task Lifecycle — archiveTask', () => {
    it('archiveTask moves task from plan to archive', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.archiveTask('t1');
        const state = store.getState();
        expect(state.planTasks.tasks).toHaveLength(0);
        expect(state.archiveTasks.tasks).toHaveLength(1);
        expect(state.archiveTasks.tasks[0].task.id).toBe('t1');
    });

    it('archiveTask with count > 1 only decrements count', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.incTask('t1');
        actions.archiveTask('t1');
        const state = store.getState();
        expect(state.planTasks.tasks[0].count).toBe(1);
        expect(state.archiveTasks.tasks).toHaveLength(1);
    });

    it('archiveTask on first task activates next', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t2'));
        actions.addTask(makeTask('t1'));
        actions.archiveTask('t1');
        expect(store.getState().activeTask?.task?.id).toBe('t2');
    });

    it('archiveTask records completedAt timestamp', () => {
        const { store, actions } = makeCtx();
        const before = Date.now();
        actions.addTask(makeTask('t1'));
        actions.archiveTask('t1');
        const { completedAt } = store.getState().archiveTasks.tasks[0];
        expect(completedAt).toBeGreaterThanOrEqual(before);
        expect(completedAt).toBeLessThanOrEqual(Date.now() + 1000);
    });

    it('archiveTask records taskTime equal to appConfig.taskTime when no restTime given', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.archiveTask('t1');
        expect(store.getState().archiveTasks.tasks[0].taskTime).toBe(appConfig.taskTime);
    });

    it('archiveTask statistics update on both sides', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.addTask(makeTask('t2'));
        actions.archiveTask('t1');
        const state = store.getState();
        expect(state.planTasks.statistics.tasksCount).toBe(1);
        expect(state.archiveTasks.statistics.tasksCount).toBe(1);
    });
});

// ---------------------------------------------------------------------------

describe('Task Lifecycle — deleteArchiveTask', () => {
    it('removes task from archive by index', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.archiveTask('t1');
        actions.deleteArchiveTask(0);
        const state = store.getState();
        expect(state.archiveTasks.tasks).toHaveLength(0);
        expect(state.archiveTasks.statistics.tasksCount).toBe(0);
    });

    it('throws on negative index', () => {
        const { actions } = makeCtx();
        expect(() => actions.deleteArchiveTask(-1)).toThrow();
    });
});

// ---------------------------------------------------------------------------

describe('Task Lifecycle — refreshTask', () => {
    it('moves task from archive back to plan front', () => {
        const { store, actions } = makeCtx();
        const task = makeTask('t1');
        actions.addTask(task);
        actions.archiveTask('t1');
        actions.refreshTask(task);
        const { tasks } = store.getState().planTasks;
        expect(tasks[0].task.id).toBe('t1');
        expect(tasks[0].count).toBe(1);
    });

    it('activeTask updates after refresh into empty plan', () => {
        const { store, actions } = makeCtx();
        const task = makeTask('t1');
        actions.addTask(task);
        actions.archiveTask('t1');
        actions.refreshTask(task);
        expect(store.getState().activeTask?.task?.id).toBe('t1');
    });
});

// ---------------------------------------------------------------------------

describe('Task Lifecycle — startEditTask / completeEditTask / cancelEditTask', () => {
    it('startEditTask sets editingPlanTaskIndex', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.startEditTask(0);
        expect(store.getState().editingPlanTaskIndex).toBe(0);
    });

    it('completeEditTask updates task description and clears index', () => {
        const { store, actions } = makeCtx();
        const task = makeTask('t1');
        actions.addTask(task);
        actions.startEditTask(0);
        actions.completeEditTask({ ...task, description: 'Updated' });
        const state = store.getState();
        expect(state.planTasks.tasks[0].task.description).toBe('Updated');
        expect(state.editingPlanTaskIndex).toBeNull();
    });

    it('cancelEditTask clears editingPlanTaskIndex', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.startEditTask(0);
        actions.cancelEditTask();
        expect(store.getState().editingPlanTaskIndex).toBeNull();
    });
});

// ---------------------------------------------------------------------------

describe('Task Lifecycle — reorderTasks', () => {
    it('moves task from fromIndex to toIndex', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t3'));
        actions.addTask(makeTask('t2'));
        actions.addTask(makeTask('t1'));
        // order in store: t1(0), t2(1), t3(2)
        actions.reorderTasks(0, 2);
        const ids = store.getState().planTasks.tasks.map(pt => pt.task.id);
        expect(ids).toEqual(['t2', 't3', 't1']);
    });

    it('activeTask updates when first task changes', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t3'));
        actions.addTask(makeTask('t2'));
        actions.addTask(makeTask('t1'));
        actions.reorderTasks(0, 2);
        expect(store.getState().activeTask?.task?.id).toBe('t2');
    });

    it('reorderTasks with equal indices is a no-op', () => {
        const { store, actions } = makeCtx();
        actions.addTask(makeTask('t1'));
        actions.addTask(makeTask('t2'));
        actions.reorderTasks(0, 0);
        const ids = store.getState().planTasks.tasks.map(pt => pt.task.id);
        expect(ids).toEqual(['t2', 't1']);
    });
});
