import { describe, it, expect } from "vitest";
import { validateAppState } from "./stateSchema.ts";

const validTask = {
    task: {
        id: "abc",
        description: "Write tests",
        category: { name: "Work" },
    },
};

const validPlanTask = { ...validTask, count: 2 };

const validArchiveTask = { ...validTask, taskTime: 1500000, completedAt: 1700000000000 };

const minimalState = {
    planTasks: { tasks: [], statistics: {} },
    archiveTasks: { tasks: [], statistics: {} },
    theme: "light",
};

describe("validateAppState", () => {
    it("returns null for null", () => {
        expect(validateAppState(null)).toBeNull();
    });

    it("returns null for a string", () => {
        expect(validateAppState("hello")).toBeNull();
    });

    it("returns null for a number", () => {
        expect(validateAppState(42)).toBeNull();
    });

    it("returns null for an array", () => {
        expect(validateAppState([])).toBeNull();
    });

    it("returns null when planTasks is missing", () => {
        expect(validateAppState({ archiveTasks: { tasks: [] } })).toBeNull();
    });

    it("returns null when planTasks is not an object", () => {
        expect(validateAppState({ planTasks: "bad", archiveTasks: { tasks: [] } })).toBeNull();
    });

    it("returns null when planTasks.tasks is not an array", () => {
        expect(validateAppState({ planTasks: { tasks: "bad" }, archiveTasks: { tasks: [] } })).toBeNull();
    });

    it("returns null when archiveTasks is missing", () => {
        expect(validateAppState({ planTasks: { tasks: [] } })).toBeNull();
    });

    it("returns null when archiveTasks is not an object", () => {
        expect(validateAppState({ planTasks: { tasks: [] }, archiveTasks: 123 })).toBeNull();
    });

    it("returns null when archiveTasks.tasks is not an array", () => {
        expect(validateAppState({ planTasks: { tasks: [] }, archiveTasks: { tasks: null } })).toBeNull();
    });

    it("accepts empty tasks arrays", () => {
        expect(validateAppState(minimalState)).not.toBeNull();
    });

    it("returns the same object reference on success", () => {
        expect(validateAppState(minimalState)).toBe(minimalState);
    });

    it("accepts valid plan tasks", () => {
        const state = {
            ...minimalState,
            planTasks: { tasks: [validPlanTask], statistics: {} },
        };
        expect(validateAppState(state)).not.toBeNull();
    });

    it("accepts valid archive tasks", () => {
        const state = {
            ...minimalState,
            archiveTasks: { tasks: [validArchiveTask], statistics: {} },
        };
        expect(validateAppState(state)).not.toBeNull();
    });

    // Plan task validation
    it("returns null when a plan task is missing count", () => {
        const bad = { ...validTask }; // no count
        const state = { ...minimalState, planTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when a plan task count is not a number", () => {
        const bad = { ...validTask, count: "2" };
        const state = { ...minimalState, planTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when a plan task is not an object", () => {
        const state = { ...minimalState, planTasks: { tasks: ["bad"], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when a plan task.task is missing", () => {
        const bad = { count: 1 }; // no task
        const state = { ...minimalState, planTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when plan task.task.id is not a string", () => {
        const bad = { count: 1, task: { id: 42, description: "x", category: { name: "x" } } };
        const state = { ...minimalState, planTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when plan task.task.description is not a string", () => {
        const bad = { count: 1, task: { id: "1", description: 99, category: { name: "x" } } };
        const state = { ...minimalState, planTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when plan task.task.category is not an object", () => {
        const bad = { count: 1, task: { id: "1", description: "x", category: "Work" } };
        const state = { ...minimalState, planTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when plan task.task.category.name is not a string", () => {
        const bad = { count: 1, task: { id: "1", description: "x", category: { name: 5 } } };
        const state = { ...minimalState, planTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    // Archive task validation
    it("returns null when an archive task is missing taskTime", () => {
        const bad = { ...validTask, completedAt: 1000 }; // no taskTime
        const state = { ...minimalState, archiveTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when an archive task taskTime is not a number", () => {
        const bad = { ...validTask, taskTime: "1500000", completedAt: 1000 };
        const state = { ...minimalState, archiveTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when an archive task is missing completedAt", () => {
        const bad = { ...validTask, taskTime: 1500000 }; // no completedAt
        const state = { ...minimalState, archiveTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("returns null when an archive task completedAt is not a number", () => {
        const bad = { ...validTask, taskTime: 1500000, completedAt: "now" };
        const state = { ...minimalState, archiveTasks: { tasks: [bad], statistics: {} } };
        expect(validateAppState(state)).toBeNull();
    });

    it("accepts multiple valid plan and archive tasks", () => {
        const state = {
            ...minimalState,
            planTasks: { tasks: [validPlanTask, { ...validPlanTask, task: { ...validPlanTask.task, id: "def" } }], statistics: {} },
            archiveTasks: { tasks: [validArchiveTask], statistics: {} },
        };
        expect(validateAppState(state)).not.toBeNull();
    });
});
