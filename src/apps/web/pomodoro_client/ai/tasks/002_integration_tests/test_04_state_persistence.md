# Test 04 — State Persistence Round-Trip

**File**: `src/app/statePersistence.integration.test.ts`
**Scope**: `validateAppState` + `createContext` + serialization/deserialization

## What Is Being Tested

The full save-and-restore cycle: a context creates state with real tasks and archives, that state is serialized to JSON (as `localStorage` would), then deserialized and validated through `validateAppState`, and finally fed back into `createContext`. The restored context must have identical tasks, statistics, and active task.

## Setup

```ts
import { createContext } from "../app/appContext.ts";
import { validateAppState } from "../utils/stateSchema.ts";

function serialize(ctx: ReturnType<typeof createContext>): unknown {
    return JSON.parse(JSON.stringify(ctx.store.getState()));
}

function makeCtxWithData() {
    const ctx = createContext(makeState(), () => {});
    ctx.actions.addTask({ id: "t1", category: { name: "Dev" }, description: "Write tests" });
    ctx.actions.addTask({ id: "t2", category: { name: "QA" }, description: "Review PR" });
    ctx.actions.incTask("t1"); // count = 2
    ctx.actions.archiveTask("t2");
    return ctx;
}
```

## Test Cases

### Serialization correctness

- **state serializes to a plain object without functions**
  - Call `serialize(ctx)`.
  - Assert the result is a plain JSON-compatible object (no functions, no class instances).

- **all planTasks survive serialization**
  - Assert `serialized.planTasks.tasks[0].task.id === "t1"`.
  - Assert `serialized.planTasks.tasks[0].count === 2`.

- **archived tasks survive serialization**
  - Assert `serialized.archiveTasks.tasks[0].task.id === "t2"`.
  - Assert `serialized.archiveTasks.tasks[0].completedAt` is a number.
  - Assert `serialized.archiveTasks.tasks[0].taskTime` is a number.

- **statistics survive serialization**
  - Assert `serialized.planTasks.statistics.tasksCount === 2` (t1 has count 2).
  - Assert `serialized.archiveTasks.statistics.tasksCount === 1`.

### validateAppState

- **valid serialized state passes validation and returns AppState**
  - `const restored = validateAppState(serialize(ctx))`.
  - Assert `restored !== null`.

- **null input returns null**
  - Assert `validateAppState(null) === null`.

- **missing planTasks returns null**
  - Assert `validateAppState({ archiveTasks: { tasks: [] } }) === null`.

- **missing archiveTasks returns null**
  - Assert `validateAppState({ planTasks: { tasks: [] } }) === null`.

- **planTasks.tasks with invalid task shape returns null**
  - Assert `validateAppState({ planTasks: { tasks: [{ bad: true }] }, archiveTasks: { tasks: [] } }) === null`.

### createContext restoration

- **restored context has same plan tasks**
  - `const restored = validateAppState(serialize(ctx))!`.
  - `const ctx2 = createContext(restored, () => {})`.
  - Assert `ctx2.store.getState().planTasks.tasks[0].task.id === "t1"`.
  - Assert `ctx2.store.getState().planTasks.tasks[0].count === 2`.

- **restored context has same archive tasks**
  - Assert `ctx2.store.getState().archiveTasks.tasks[0].task.id === "t2"`.

- **restored context has same statistics**
  - Assert `ctx2.store.getState().planTasks.statistics.tasksCount` matches original.
  - Assert `ctx2.store.getState().archiveTasks.statistics.tasksCount` matches original.

- **restored context has activeTask matching the first plan task**
  - Assert `ctx2.store.getState().activeTask?.task?.id === "t1"`.

- **actions still work after restore**
  - Call `ctx2.actions.incTask("t1")`.
  - Assert `planTasks.tasks[0].count === 3` (was 2 before restore).

### Theme and editingPlanTaskIndex preservation

- **theme survives round-trip**
  - Set theme via `actions.setTheme("dark")`, serialize, restore.
  - Assert `ctx2.store.getState().theme === "dark"`.

- **editingPlanTaskIndex is NOT restored (should reset to null)**
  - Manually set `editingPlanTaskIndex: 1` in state, serialize, validate, restore.
  - Assert restored state has `editingPlanTaskIndex === null` or `undefined`.
  - *(This test documents expected behavior — editing state should not persist across sessions.)*

## Files Affected

- `src/app/statePersistence.integration.test.ts` ← new file
