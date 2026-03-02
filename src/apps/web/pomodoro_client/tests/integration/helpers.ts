import { createContext } from '../../src/app/appContext.ts';
import { getInitPlanTasks, getInitArchiveTasks } from '../../src/constants/initialState.ts';
import type { AppState, PomodoroEvent } from '../../src/types/context.ts';
import type { PomodoroTask } from '../../src/types/task.ts';

export function makeTask(id: string, description = 'Test task'): PomodoroTask {
    return { id, category: { name: 'Work' }, description };
}

export function makeState(overrides: Partial<AppState> = {}): AppState {
    return {
        isMobile: false,
        theme: 'light',
        locale: 'ru',
        baseUrl: '/',
        activeTask: null,
        editingPlanTaskIndex: null,
        planTasks: getInitPlanTasks(),
        archiveTasks: getInitArchiveTasks(),
        ...overrides,
    };
}

export function makeCtx(state: AppState = makeState()) {
    return createContext(state, () => {});
}

export function makeCtxWithTask(pomodoroCallback?: (event: PomodoroEvent) => void) {
    const ctx = createContext(makeState(), () => {}, pomodoroCallback);
    ctx.actions.addTask(makeTask('t1'));
    return ctx;
}
