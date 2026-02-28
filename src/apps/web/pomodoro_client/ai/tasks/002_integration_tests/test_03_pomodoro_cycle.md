# Test 03 — Automatic Pomodoro Cycle

**File**: `src/app/appContext.integration.test.ts` (separate `describe` block)
**Scope**: `createContext` `"completed"` event handler + `taskController` + `store`

## What Is Being Tested

The automatic phase transitions that happen inside `createContext`'s `"completed"` event listener — the part that runs when `ActiveTaskController` emits `"completed"`. This logic is not currently covered by any unit test.

The key transitions:
- Task finishes → auto-archived → short break activates in store
- Short break finishes → next task activates
- After 4 pomodoros → long break activates instead of short break
- Last task finishes (no more tasks) → idle

## Setup

```ts
import { createContext } from "../app/appContext.ts";
import { ActivePomodoroTaskType, ActivePomodoroTaskStatus } from "../types/task.ts";
import type { PomodoroEvent } from "../types/context.ts";

function makeCtxWithTasks(count: number) {
    const ctx = createContext(makeState(), () => {});
    for (let i = count; i >= 1; i--) {
        ctx.actions.addTask({ id: `t${i}`, category: { name: "Work" }, description: `Task ${i}` });
    }
    return ctx;
}

// Helper: completeTask triggers the "completed" flow without needing real timer
function triggerComplete(ctx: ReturnType<typeof makeCtxWithTasks>) {
    ctx.actions.startTask();
    ctx.actions.completeTask();
}
```

`completeTask()` calls `taskController.complete()` which fires `"completed"` synchronously — no fake timers needed.

## Test Cases

### Task → Short Break transition

- **activeTask type changes to ShortBreak after task completion**
  - Create ctx with 1 task.
  - `startTask()`, `completeTask()`.
  - Assert `store.getState().activeTask?.type === ActivePomodoroTaskType.ShortBreak`.

- **completed task is auto-archived**
  - Create ctx with 1 task.
  - `startTask()`, `completeTask()`.
  - Assert `archiveTasks.tasks` has length 1.
  - Assert `archiveTasks.tasks[0].task.id === "t1"`.

- **plan task is removed from planTasks after auto-archive**
  - Assert `planTasks.tasks` is empty after completion.

- **fires PomodoroEvent { type: "completed", taskType: "task" }**
  - Spy on `pomodoroCallback`.
  - `startTask()`, `completeTask()`.
  - Assert spy called with `{ type: "completed", taskType: "task" }`.

- **fires PomodoroEvent { type: "breakStarted", taskType: "shortBreak" }**
  - Assert spy also called with `{ type: "breakStarted", taskType: "shortBreak" }`.

### Short Break → Next Task transition

- **after short break completes, next task becomes active**
  - Create ctx with 2 tasks (t1, t2).
  - Complete t1 (short break activates).
  - `startTask()`, `completeTask()` (complete the break).
  - Assert `activeTask?.type === ActivePomodoroTaskType.Task`.
  - Assert `activeTask?.task?.id === "t2"`.

- **fires PomodoroEvent { type: "completed", taskType: "shortBreak" }**
  - Assert spy called with `{ type: "completed", taskType: "shortBreak" }`.

### Long Break after 4 pomodoros

- **4th task completion activates long break**
  - Create ctx with 4 tasks.
  - Complete tasks 1–4 (each time: `startTask`, `completeTask`, start break, `completeTask` to finish break).
  - After the 4th task is completed, assert `activeTask?.type === ActivePomodoroTaskType.LongBreak`.

- **fires PomodoroEvent { type: "breakStarted", taskType: "longBreak" }**
  - Assert spy called with `{ type: "breakStarted", taskType: "longBreak" }` after the 4th task.

### Idle — no more tasks

- **idle event fires when last task completes and plan is empty**
  - Create ctx with 1 task.
  - `startTask()`, `completeTask()` (task archived, short break activates).
  - Start break, `completeTask()`.
  - Assert `activeTask` is null or has type Undefined (no more work).

## Files Affected

- `src/app/appContext.integration.test.ts` ← `describe('Automatic Pomodoro cycle', ...)` block
