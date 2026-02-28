# Test 02 — Timer State Machine

**File**: `src/app/appContext.integration.test.ts` (separate `describe` block)
**Scope**: `createContext` + `timerActions` + `store` + `ActiveTaskController`

## What Is Being Tested

The timer control flow: start → pause → resume → stop, and completeTask. Each action must update `activeTask.status` in the store correctly and fire the appropriate `PomodoroEvent` callback.

## Setup

```ts
import { createContext } from "../app/appContext.ts";
import { ActivePomodoroTaskStatus } from "../types/task.ts";
import type { PomodoroEvent } from "../types/context.ts";

function makeCtxWithTask() {
    const task = { id: "t1", category: { name: "Work" }, description: "Task" };
    const ctx = createContext(makeState(), () => {});
    ctx.actions.addTask(task);
    return ctx;
}
```

All tests call `makeCtxWithTask()` to get a context with one Pending task ready.

## Test Cases

### startTask

- **status changes to Active**
  - Call `actions.startTask()`.
  - Assert `store.getState().activeTask?.status === ActivePomodoroTaskStatus.Active`.

- **fires PomodoroEvent { type: "started", taskType: "task" }**
  - Create context with a `pomodoroCallback` spy.
  - Call `startTask()`.
  - Assert callback was called with `{ type: "started", taskType: "task" }`.

- **startTask on already Active task throws**
  - `startTask()`, then `startTask()` again.
  - Assert throws.

- **startTask with no activeTask throws**
  - Create context with empty plan (no tasks).
  - Assert `startTask()` throws.

### pauseTask

- **status changes to Paused**
  - `startTask()`, then `actions.pauseTask()`.
  - Assert `activeTask?.status === ActivePomodoroTaskStatus.Paused`.

- **pauseTask on Pending task throws**
  - Do NOT call `startTask()`.
  - Assert `pauseTask()` throws.

- **restTime is preserved across pause/resume**
  - `startTask()`.
  - Record `restTime = activeTask.restTime`.
  - `pauseTask()`.
  - Assert `activeTask.restTime === restTime` (no time lost during pause).

### resumeTask

- **status changes back to Active**
  - `startTask()`, `pauseTask()`, `actions.resumeTask()`.
  - Assert `activeTask?.status === ActivePomodoroTaskStatus.Active`.

- **resumeTask on Active task throws**
  - `startTask()`, then `resumeTask()` without pausing.
  - Assert throws.

- **resumeTask on Pending task throws**
  - Do NOT start, call `resumeTask()`.
  - Assert throws.

### stopTask

- **status returns to Pending**
  - `startTask()`, then `actions.stopTask()`.
  - Assert `activeTask?.status === ActivePomodoroTaskStatus.Pending`.

- **stopTask on Paused task throws**
  - `startTask()`, `pauseTask()`, `stopTask()`.
  - Assert throws (stopTask requires Active status).

- **stopTask on Pending task throws**
  - Call `stopTask()` without starting.
  - Assert throws.

### completeTask

- **completeTask on Active task triggers completed event**
  - `startTask()`, `actions.completeTask()`.
  - Assert `PomodoroEvent { type: "completed", taskType: "task" }` was fired.

- **completeTask on Paused task is allowed**
  - `startTask()`, `pauseTask()`, `completeTask()`.
  - Assert no throw; completed event fired.

- **completeTask on Pending task throws**
  - Do NOT call `startTask()`, call `completeTask()`.
  - Assert throws.

### PomodoroEvent callbacks — startTask on break

- **fires { type: "started", taskType: "shortBreak" } when starting a short break**
  - Manually activate a short break task in the controller (or trigger via completed cycle).
  - Call `startTask()`.
  - Assert callback called with `{ type: "started", taskType: "shortBreak" }`.

## Files Affected

- `src/app/appContext.integration.test.ts` ← `describe('Timer state machine', ...)` block
