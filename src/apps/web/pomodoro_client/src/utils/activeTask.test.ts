import { describe, it, expect } from 'vitest';
import { sanitizeActiveTask } from './activeTask.ts';
import { ActivePomodoroTaskStatus, ActivePomodoroTaskType } from '../types/task.ts';

const validTask = {
    type: ActivePomodoroTaskType.Task,
    task: { id: 't1', category: { name: 'test' }, description: 'Task' },
    status: ActivePomodoroTaskStatus.Pending,
    restTime: 10000,
    shortBreakCount: 0,
};

describe('sanitizeActiveTask', () => {
    it('returns null for null input', () => {
        expect(sanitizeActiveTask(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
        expect(sanitizeActiveTask(undefined)).toBeNull();
    });

    it('returns null when type is Undefined', () => {
        expect(sanitizeActiveTask({ ...validTask, type: ActivePomodoroTaskType.Undefined })).toBeNull();
    });

    it('returns null when status is Undefined', () => {
        expect(sanitizeActiveTask({ ...validTask, status: ActivePomodoroTaskStatus.Undefined })).toBeNull();
    });

    it('returns null when restTime is zero', () => {
        expect(sanitizeActiveTask({ ...validTask, restTime: 0 })).toBeNull();
    });

    it('returns null when restTime is negative', () => {
        expect(sanitizeActiveTask({ ...validTask, restTime: -1 })).toBeNull();
    });

    it('returns null when Task type has no task property', () => {
        expect(sanitizeActiveTask({ ...validTask, task: null })).toBeNull();
    });

    it('returns the task when all fields are valid', () => {
        expect(sanitizeActiveTask(validTask)).toBe(validTask);
    });

    it('returns a valid ShortBreak task (no task property required)', () => {
        const breakTask = {
            type: ActivePomodoroTaskType.ShortBreak,
            status: ActivePomodoroTaskStatus.Active,
            restTime: 5000,
            shortBreakCount: 1,
        };
        expect(sanitizeActiveTask(breakTask)).toBe(breakTask);
    });
});
