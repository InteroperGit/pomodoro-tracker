import {ArchiveTask} from "./ArchiveTask.ts";
import {ArchiveTasksTarget} from "./ArchiveTasksTarget.ts";
import type {ArchivePomodoroTask, PomodoroTask} from "../../types/task.ts";
import styles from "./ArchiveTasksList.module.scss";
import {EmptyState} from "../EmptyState/index.ts";

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
        refreshTask: (task: PomodoroTask) => void;
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

    const target = ArchiveTasksTarget({ tasksCount: tasks.length });

    // Обработка пустого списка
    if (tasks.length === 0) {
        return `
            <div class="${styles.archive_tasks__list_container}">
                ${header}
                ${target}
                ${EmptyState({
                    variant: "archive",
                    title: "Архив пуст",
                    subtitle: "Выполненные задачи появятся здесь",
                    className: styles.archive_tasks__empty,
                })}
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
            ${target}
            <ul class="${styles.archive_tasks__list}" role="list">
                ${taskItems}
            </ul>
        </div>
    `;
}