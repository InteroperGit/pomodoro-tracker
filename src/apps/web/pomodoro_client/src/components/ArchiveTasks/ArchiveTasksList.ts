import {ArchiveTask} from "./ArchiveTask.ts";
import type {ArchivePomodoroTask} from "../../types/task.ts";
import styles from "./ArchiveTasksList.module.scss";

/**
 * Компонент `ArchiveTasksList` — отображает список архивных задач.
 * 
 * Включает заголовок с названиями колонок и список выполненных задач.
 * Поддерживает мобильную и десктопную версии с разной разметкой заголовка.
 * 
 * @module ArchiveTasksList
 * 
 * @param {ArchiveTasksListProps} props - Пропсы компонента
 * @param {boolean} props.isMobile - Флаг мобильной версии
 * @param {ArchivePomodoroTask[]} props.tasks - Массив архивных задач
 * 
 * @returns {string} HTML-разметка списка архивных задач
 */
export type ArchiveTasksListProps = {
    isMobile: boolean;
    tasks: ArchivePomodoroTask[];
    actions: {
        deleteArchiveTask: (index: number) => void;
    };
}

export function ArchiveTasksList({ isMobile, tasks, actions }: ArchiveTasksListProps) {
    // Общий заголовок для обеих версий
    const headerClasses = isMobile
        ? `${styles.archive_tasks__header} ${styles.archive_tasks__header_mobile}`
        : styles.archive_tasks__header;

    const header = `
        <div class="${headerClasses}" role="rowheader">
            <span class="${styles.archive_tasks__header_category}">
                КАТЕГОРИЯ
            </span>
            <span class="${styles.archive_tasks__header_description}">
                ОПИСАНИЕ
            </span>
        </div>
    `;

    // Обработка пустого списка
    if (tasks.length === 0) {
        return `
            <div class="${styles.archive_tasks__list_container}">
                ${header}
                <div class="${styles.archive_tasks__empty}" role="status" aria-live="polite">
                    Архив пуст
                </div>
            </div>
        `;
    }

    // Формирование списка задач
    const taskItems = tasks.map((archiveTask, index) =>
        `
            <li role="listitem">
                ${ArchiveTask({ isMobile, archiveTask, index, actions })}
            </li>
        `
    ).join("");

    return `
        <div class="${styles.archive_tasks__list_container}">
            ${header}
            <ul class="${styles.archive_tasks__list}" role="list">
                ${taskItems}
            </ul>
        </div>
    `;
}