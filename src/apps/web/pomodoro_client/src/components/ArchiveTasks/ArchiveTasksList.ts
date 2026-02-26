import {ArchiveTask} from "./ArchiveTask.ts";
import {ArchiveTasksTarget} from "./ArchiveTasksTarget.ts";
import type {ArchivePomodoroTask, PomodoroTask} from "../../types/task.ts";
import styles from "./ArchiveTasksList.module.scss";
import {EmptyState} from "../EmptyState/index.ts";

export type ArchiveTasksListProps = {
    isMobile: boolean;
    tasks: ArchivePomodoroTask[];
    actions: {
        deleteArchiveTask: (index: number) => void;
        refreshTask: (task: PomodoroTask) => void;
    };
}

/**
 * Компонент `ArchiveTasksList` — отображает список архивных (выполненных) задач.
 *
 * Включает заголовок таблицы, компонент с количеством задач и сам список.
 * Если массив задач пуст, отображает состояние-заглушку (EmptyState).
 * Поддерживает адаптивность для мобильных и десктопных устройств.
 *
 * @param {ArchiveTasksListProps} props - Пропсы компонента.
 * @param {boolean} props.isMobile - Флаг мобильной версии для изменения разметки.
 * @param {ArchivePomodoroTask[]} props.tasks - Массив архивных задач для отображения.
 * @param {Object} props.actions - Действия, передаваемые в каждую задачу списка.
 * @param {function(number): void} props.actions.deleteArchiveTask - Функция для удаления задачи из архива по её индексу.
 * @param {function(PomodoroTask): void} props.actions.refreshTask - Функция для восстановления или повторного запуска задачи.
 *
 * @returns {string} HTML-разметка компонента списка архивных задач.
 */
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