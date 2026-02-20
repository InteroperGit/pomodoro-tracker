import type {ArchivePomodoroTask} from "../../types/task";
import styles from "./ArchiveTask.module.scss"
import {toHumanMinutesSecondsTime, formatDateTime} from "../../utils/time.ts";
import {escapeHtml} from "../../utils/html.ts";

/**
 * Компонент `ArchiveTask` — отображает одну архивную задачу в списке выполненных задач.
 * 
 * Показывает категорию, описание, время выполнения задачи и время завершения.
 * Поддерживает мобильную и десктопную версии с разной разметкой.
 * 
 * @module ArchiveTask
 * 
 * @param {ArchiveTaskProps} props - Пропсы компонента
 * @param {boolean} props.isMobile - Флаг мобильной версии
 * @param {ArchivePomodoroTask} props.archiveTask - Данные архивной задачи
 * 
 * @returns {string} HTML-разметка архивной задачи
 */
export type ArchiveTaskProps = {
    isMobile: boolean;
    archiveTask: ArchivePomodoroTask;
}

export function ArchiveTask({ isMobile, archiveTask }: ArchiveTaskProps) {
    const { task, taskTime, completedAt } = archiveTask;
    const { category, description } = task;

    // Форматирование времени выполнения задачи
    const humanTaskTime = toHumanMinutesSecondsTime(taskTime);
    
    // Форматирование времени завершения с учетом даты
    const completedTime = formatDateTime(completedAt);
    
    // Экранирование пользовательского контента для защиты от XSS
    const escapedCategory = escapeHtml(category?.name ?? '');
    const escapedDescription = escapeHtml(description ?? '');

    // Общая разметка времени выполнения и завершения
    const timeMarkup = `
        <div class="${styles.archive_task__task_time}" role="text" aria-label="Время выполнения задачи">
            ${humanTaskTime}
        </div>
        <div class="${styles.archive_task__divider}" aria-hidden="true">
            /
        </div>
        <time 
            class="${styles.archive_task__task_time}" 
            datetime="${completedTime.iso}"
            role="text"
            aria-label="Время завершения задачи">
            ${completedTime.display}
        </time>
    `;

    // Мобильная версия
    if (isMobile) {
        return `
            <div class="${styles.archive_task_mobile}">
                <div class="${styles.archive_task__task}">
                    <div class="${styles.archive_task__category} ${styles.archive_task__category_mobile}">
                        ${escapedCategory}
                    </div>
                    <div class="${styles.archive_task__description} ${styles.archive_task__description_mobile}">
                        ${escapedDescription}
                    </div>
                </div>
                <div class="${styles.archive_task__time}">
                    ${timeMarkup}
                </div>
            </div>
        `;
    }

    // Десктопная версия
    return `
        <div class="${styles.archive_task}">
            <div class="${styles.archive_task__category}">
                ${escapedCategory}
            </div>
            <div class="${styles.archive_task__description}">
                ${escapedDescription}
            </div>
            ${timeMarkup}
        </div>
    `;
}