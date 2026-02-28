import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getPlanTasksStatistics, getArchiveTasksStatistics } from './statistics.ts';
import type { PlanPomodoroTask, ArchivePomodoroTask } from '../types/task.ts';

const config = {
    taskTime: 25 * 60 * 1000,
    shortBreakTime: 5 * 60 * 1000,
    longBreakTime: 15 * 60 * 1000,
    longBreakAfter: 4,
};

function makePlanTask(id: string, count = 1): PlanPomodoroTask {
    return { task: { id, category: { name: 'cat' }, description: 'T' }, count };
}

function makeArchiveTask(id: string, taskTime: number): ArchivePomodoroTask {
    return { task: { id, category: { name: 'cat' }, description: 'T' }, taskTime, completedAt: 0 };
}

describe('getPlanTasksStatistics', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns zero statistics for empty task list', () => {
        const stats = getPlanTasksStatistics([], config);
        expect(stats.tasksCount).toBe(0);
        expect(stats.tasksTime).toBe(0);
        expect(stats.finishTime).toBe(0);
        expect(stats.nextLongBreak).toBe(0);
        expect(stats.categories).toHaveLength(0);
    });

    it('counts tasks across multiple plan entries', () => {
        const stats = getPlanTasksStatistics([makePlanTask('a', 3), makePlanTask('b', 2)], config);
        expect(stats.tasksCount).toBe(5);
    });

    it('computes tasksTime as count × taskTime', () => {
        const stats = getPlanTasksStatistics([makePlanTask('a', 2)], config);
        expect(stats.tasksTime).toBe(2 * config.taskTime);
    });

    it('finishTime equals Date.now() + total duration', () => {
        const TIMER_DIFF = 1000;
        vi.setSystemTime(TIMER_DIFF);
        const tasks = [makePlanTask('a', 1)];
        const stats = getPlanTasksStatistics(tasks, config);
        // 1 task = taskTime, 0 breaks
        expect(stats.finishTime).toBe(TIMER_DIFF + config.taskTime);
    });

    it('sets nextLongBreak to 0 when fewer tasks than longBreakAfter', () => {
        const stats = getPlanTasksStatistics([makePlanTask('a', 1)], config);
        expect(stats.nextLongBreak).toBe(0);
    });

    it('sets nextLongBreak > 0 when tasksCount >= longBreakAfter', () => {
        const stats = getPlanTasksStatistics([makePlanTask('a', 4)], config);
        expect(stats.nextLongBreak).toBeGreaterThan(0);
    });

    it('groups categories correctly', () => {
        const tasks: PlanPomodoroTask[] = [
            { task: { id: '1', category: { name: 'Work' }, description: 'T' }, count: 4 },
            { task: { id: '2', category: { name: 'Work' }, description: 'T' }, count: 1 },
            { task: { id: '3', category: { name: 'Home' }, description: 'T' }, count: 3 },
        ];
        const stats = getPlanTasksStatistics(tasks, config);
        const work = stats.categories.find(c => c.category.name === 'Work');
        const home = stats.categories.find(c => c.category.name === 'Home');
        expect(work?.count).toBe(5);
        expect(home?.count).toBe(3);
    });
});

describe('getArchiveTasksStatistics', () => {
    it('returns zero statistics for empty archive', () => {
        const stats = getArchiveTasksStatistics([]);
        expect(stats.tasksCount).toBe(0);
        expect(stats.tasksTime).toBe(0);
        expect(stats.categories).toHaveLength(0);
    });

    it('counts archived tasks', () => {
        const stats = getArchiveTasksStatistics([
            makeArchiveTask('a', 1000),
            makeArchiveTask('b', 2000),
        ]);
        expect(stats.tasksCount).toBe(2);
    });

    it('sums task times', () => {
        const stats = getArchiveTasksStatistics([
            makeArchiveTask('a', 1000),
            makeArchiveTask('b', 2000),
        ]);
        expect(stats.tasksTime).toBe(3000);
    });
});
