import styles from "./ArchiveTasks.module.scss";
import {ArchiveTasksTitle} from "./ArchiveTasksTitle.ts";
import {ArchiveTasksList} from "./ArchiveTasksList.ts";
import {ArchiveTasksStatistics} from "./ArchiveTasksStatistics.ts";
import type {ArchivePomodoroTasksState} from "../../types/context.ts";
import type { PomodoroTask } from "../../types/task.ts";

/**
 * Свойства компонента архива задач
 * @typedef {Object} ArchiveTasksProps
 * @property {boolean} isMobile - мобильное ли представление
 * @property {ArchivePomodoroTasksState} data - состояние архива (задачи и статистика)
 * @property {Object} actions - объект действий
 * @property {Function} actions.deleteArchiveTask - удалить задачу из архива по индексу
 * @property {Function} actions.refreshTask - повторно добавить выполненную задачу
 */
export type ArchiveTasksProps = {
    isMobile: boolean;
    data: ArchivePomodoroTasksState;
    actions: {
        deleteArchiveTask: (index: number) => void;
        refreshTask: (task: PomodoroTask) => void;
    };
}

/**
 * Компонент архива выполненных задач
 * Отображает список выполненных задач со статистикой
 * @param {ArchiveTasksProps} props - свойства компонента
 * @returns {string} HTML-строка компонента
 */
export function ArchiveTasks({ isMobile, data, actions }: ArchiveTasksProps) {
    const { tasks, statistics } = data;
    const { tasksCount, tasksTime } = statistics;

    // Формирование подкомпонентов
    const title = ArchiveTasksTitle({ tasksCount, tasksTime });
    const list = ArchiveTasksList({ isMobile, tasks, actions });
    const stat = ArchiveTasksStatistics({ statistics });

    // Условное добавление мобильных стилей
    const containerClasses = isMobile 
        ? `${styles.archive_tasks} ${styles.archive_tasks_mobile}`
        : styles.archive_tasks;

    return `
        <div class="${containerClasses}">
            ${title}
            ${list}
            ${stat}
        </div>
    `;
}