# Test 01 — Task Lifecycle

**File**: `src/app/appContext.integration.test.ts`
**Scope**: `createContext` + `taskActions` + `store` + `ActiveTaskController`

## What Is Being Tested

The full path of a task through the plan: add → edit → inc/dec count → archive → appear in archive → delete from archive → refresh back to plan. Each action must correctly mutate store state and keep statistics consistent.

## Setup

```ts
import { createContext } from "../app/appContext.ts";
import { getInitPlanTasks, getInitArchiveTasks } from "../constants/initialState.ts";
import type { AppState } from "../types/context.ts";

function makeTask(id: string, description = "Test task") {
    return { id, category: { name: "Work" }, description };
}

function makeState(overrides: Partial<AppState> = {}): AppState {
    return {
        isMobile: false,
        theme: "light",
        activeTask: null,
        editingPlanTaskIndex: null,
        planTasks: getInitPlanTasks(),
        archiveTasks: getInitArchiveTasks(),
        ...overrides,
    };
}

function makeCtx(state: AppState = makeState()) {
    return createContext(state, () => {});
}
```

## Test Cases

### addTask

- **adds task to the front of planTasks.tasks**
  - Call `actions.addTask(makeTask("t1"))`.
  - Assert `store.getState().planTasks.tasks` has length 1.
  - Assert `tasks[0].task.id === "t1"`.
  - Assert `tasks[0].count === 1`.

- **second addTask goes to front**
  - Add `"t1"`, then `"t2"`.
  - Assert `tasks[0].task.id === "t2"`, `tasks[1].task.id === "t1"`.

- **activeTask is set to the added task**
  - Add `"t1"`.
  - Assert `store.getState().activeTask?.task?.id === "t1"`.

- **planTasks.statistics.tasksCount updates**
  - Add two tasks each with `count === 1`.
  - Assert `statistics.tasksCount === 2`.

### incTask / decTask

- **incTask increments count**
  - Add `"t1"`, call `actions.incTask("t1")`.
  - Assert `tasks[0].count === 2`.
  - Assert `statistics.tasksCount === 2`.

- **decTask decrements count**
  - Add `"t1"` with count=1, `incTask`, then `decTask`.
  - Assert `tasks[0].count === 1`.

- **decTask on count=1 removes the task from plan**
  - Add `"t1"` (count=1), call `actions.decTask("t1")`.
  - Assert `planTasks.tasks` is empty.

- **decTask on first task activates next**
  - Add `"t2"`, then `"t1"` (t1 is at index 0).
  - `decTask("t1")` removes t1.
  - Assert `activeTask?.task?.id === "t2"`.

- **incTask with unknown id throws**
  - Call `actions.incTask("unknown")`.
  - Assert throws with message containing `"not found"`.

### archiveTask

- **archiveTask moves task from plan to archive**
  - Add `"t1"`, call `actions.archiveTask("t1")`.
  - Assert `planTasks.tasks` is empty.
  - Assert `archiveTasks.tasks` has length 1.
  - Assert `archiveTasks.tasks[0].task.id === "t1"`.

- **archiveTask with count > 1 only decrements count**
  - Add `"t1"`, `incTask("t1")` (count=2), `archiveTask("t1")`.
  - Assert `planTasks.tasks[0].count === 1`.
  - Assert `archiveTasks.tasks` has length 1.

- **archiveTask on first task activates next**
  - Add `"t2"`, then `"t1"`.
  - `archiveTask("t1")`.
  - Assert `activeTask?.task?.id === "t2"`.

- **archiveTask records completedAt timestamp**
  - Add `"t1"`, call `actions.archiveTask("t1")`.
  - Assert `archiveTasks.tasks[0].completedAt` is close to `Date.now()` (within 1000 ms).

- **archiveTask records taskTime**
  - Add `"t1"`, call `actions.archiveTask("t1")` without restTime.
  - Assert `archiveTasks.tasks[0].taskTime` equals `appConfig.taskTime`.

- **archiveTask statistics update on both sides**
  - After archiving, assert `planTasks.statistics.tasksCount` decreased and `archiveTasks.statistics.tasksCount` increased.

### deleteArchiveTask

- **removes task from archive by index**
  - Archive `"t1"`, then call `actions.deleteArchiveTask(0)`.
  - Assert `archiveTasks.tasks` is empty.
  - Assert `archiveTasks.statistics.tasksCount === 0`.

- **throws on negative index**
  - Call `actions.deleteArchiveTask(-1)`.
  - Assert throws.

### refreshTask

- **moves task from archive back to plan (front)**
  - Archive `"t1"`, call `actions.refreshTask(task)`.
  - Assert `planTasks.tasks[0].task.id === "t1"`.
  - Assert `planTasks.tasks[0].count === 1`.

- **activeTask updates after refresh into empty plan**
  - Start with empty plan, archive a task, then refresh it.
  - Assert `activeTask?.task?.id` matches refreshed task.

### startEditTask / completeEditTask / cancelEditTask

- **startEditTask sets editingPlanTaskIndex**
  - Add `"t1"`, call `actions.startEditTask(0)`.
  - Assert `store.getState().editingPlanTaskIndex === 0`.

- **completeEditTask updates task and clears index**
  - Add `"t1"`, `startEditTask(0)`, `completeEditTask({ ...task, description: "Updated" })`.
  - Assert `planTasks.tasks[0].task.description === "Updated"`.
  - Assert `editingPlanTaskIndex === null`.

- **cancelEditTask clears editingPlanTaskIndex**
  - Add `"t1"`, `startEditTask(0)`, `cancelEditTask()`.
  - Assert `editingPlanTaskIndex === null`.

### reorderTasks

- **moves task from fromIndex to toIndex**
  - Add `"t3"`, `"t2"`, `"t1"` (order in store: t1, t2, t3).
  - Call `actions.reorderTasks(0, 2)`.
  - Assert order is `["t2", "t3", "t1"]`.

- **activeTask updates when first task changes**
  - Same setup. After `reorderTasks(0, 2)` the new first task is `"t2"`.
  - Assert `activeTask?.task?.id === "t2"`.

- **reorderTasks with equal indices is a no-op**
  - Add `"t1"`, `"t2"`.
  - `reorderTasks(0, 0)`.
  - Assert order unchanged.

## Files Affected

- `src/app/appContext.integration.test.ts` ← new file
