import styles from "./ArchiveTasks.module.scss";
import {ArchiveTasksTitle} from "./ArchiveTasksTitle.ts";
import {ArchiveTasksList} from "./ArchiveTasksList.ts";
import {ArchiveTasksStatistics} from "./ArchiveTasksStatistics.ts";
import type {ArchivePomodoroTasksState} from "../../types/context.ts";

/**
 * Компонент `ArchiveTasks` — главный компонент раздела архивных задач.
 * 
 * Объединяет заголовок со статистикой, список выполненных задач и детальную статистику.
 * Поддерживает мобильную и десктопную версии с адаптивной разметкой.
 * 
 * @module ArchiveTasks
 * 
 * @param {ArchiveTasksProps} props - Пропсы компонента
 * @param {boolean} props.isMobile - Флаг мобильной версии
 * @param {ArchivePomodoroTasksState} props.data - Состояние архивных задач (задачи и статистика)
 * 
 * @returns {string} HTML-разметка раздела архивных задач
 * 
 * @example
 * ```ts
 * const archiveTasks = ArchiveTasks({
 *     isMobile: false,
 *     data: {
 *         tasks: [...],
 *         statistics: { tasksCount: 10, tasksTime: 3600000, categories: [...] }
 *     }
 * });
 * ```
 */
export type ArchiveTasksProps = {
    isMobile: boolean;
    data: ArchivePomodoroTasksState;
}

export function ArchiveTasks({ isMobile, data }: ArchiveTasksProps) {
    const { tasks, statistics } = data;
    const { tasksCount, tasksTime } = statistics;

    // Формирование подкомпонентов
    const title = ArchiveTasksTitle({ tasksCount, tasksTime });
    const list = ArchiveTasksList({ isMobile, tasks });
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