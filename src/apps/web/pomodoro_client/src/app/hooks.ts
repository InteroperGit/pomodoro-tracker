import type { PomodoroTask } from "../types/task.ts";
import type { ThemeId } from "../types/context.ts";
import { useContext } from "./appContext.ts";

/**
 * Добавить новую задачу в план
 * @param {PomodoroTask} task - задача для добавления
 */
export function useAddTask(task: PomodoroTask) {
    if (!task) {
        throw new Error("Failed to add task. Task is not initialized");
    }

    useContext().actions.addTask(task);
}

/**
 * Увеличить количество помидоров для задачи
 * @param {string} id - ID задачи
 */
export function useIncTask(id: string) {
    if (!id) {
        throw new Error("Failed to inc task. Id is not initialized");
    }

    useContext().actions.incTask(id);
}

/**
 * Уменьшить количество помидоров для задачи
 * @param {string} id - ID задачи
 */
export function useDecTask(id: string) {
    if (!id) {
        throw new Error("Failed to dec task. Id is not initialized");
    }

    useContext().actions.decTask(id);
}

/**
 * Начать редактирование задачи
 * @param {number} index - индекс задачи в плане
 */
export function useStartEditTask(index: number) {
    if (typeof index !== "number" || index < 0) {
        throw new Error("Failed to edit task. Index is not valid");
    }

    useContext().actions.startEditTask(index);
}

/**
 * Завершить редактирование и сохранить задачу
 * @param {PomodoroTask} task - отредактированная задача
 */
export function useCompleteEditTask(task: PomodoroTask) {
    if (!task) {
        throw new Error("Failed to complete task. Task is not initialized");
    }

    useContext().actions.completeEditTask(task);
}

/**
 * Отменить редактирование задачи
 */
export function useCancelEditTask() {
    useContext().actions.cancelEditTask();
}

/**
 * Получить индекс редактируемой задачи
 * @returns {number|null|undefined} индекс или null
 */
export function useGetEditingPlanTaskIndex(): number | null | undefined {
    return useContext().store.getState().editingPlanTaskIndex;
}

/**
 * Изменить порядок задач в плане
 * @param {number} fromIndex - начальный индекс
 * @param {number} toIndex - конечный индекс
 */
export function useReorderTasks(fromIndex: number, toIndex: number) {
    return useContext().actions.reorderTasks(fromIndex, toIndex);
}

/**
 * Переместить задачу в архив
 * @param {string} id - ID задачи
 */
export function useArchiveTask(id: string) {
    return useContext().actions.archiveTask(id);
}

/**
 * Получить функцию удаления задачи из архива
 * @returns {Function} функция удаления по индексу
 */
export function useDeleteArchiveTask() {
    return (index: number) => useContext().actions.deleteArchiveTask(index);
}

/**
 * Получить функцию повторного добавления выполненной задачи
 * @returns {Function} функция добавления по задаче
 */
export function useRefreshTask() {
    return (task: PomodoroTask) => useContext().actions.refreshTask(task);
}

/**
 * Получить текущую активную задачу
 * @returns {ActivePomodoroTask|null|undefined} активная задача
 */
export function useGetActiveTask() {
    return useContext().store.getState().activeTask;
}

/**
 * Запустить текущую активную задачу
 */
export function useStartTask() {
    return useContext().actions.startTask();
}

/**
 * Остановить таймер активной задачи
 */
export function useStopTask() {
    return useContext().actions.stopTask();
}

/**
 * Поставить активную задачу на паузу
 */
export function usePauseTask() {
    return useContext().actions.pauseTask();
}

/**
 * Возобновить активную задачу с паузы
 */
export function useResumeTask() {
    return useContext().actions.resumeTask();
}

/**
 * Завершить текущую активную задачу
 */
export function useCompleteTask() {
    return useContext().actions.completeTask();
}

/**
 * Подписать на события тика таймера
 * @param {Function} handler - обработчик с оставшимся временем
 */
export function useActiveTaskTimerTick(handler: (restTime: number) => void): () => void {
    return useContext().actions.registerTimerTickEventListener(handler);
}

/**
 * Изменить тему приложения
 * @param {ThemeId} theme - идентификатор темы
 */
export function useSetTheme(theme: ThemeId) {
    useContext().actions.setTheme(theme);
}
