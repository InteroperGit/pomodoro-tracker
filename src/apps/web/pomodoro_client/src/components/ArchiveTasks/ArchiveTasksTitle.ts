import styles from "./ArchiveTasksTitle.module.scss";
import {toHumanHourMinutesSecondsTime} from "../../utils/time.ts";

/**
 * Компонент `ArchiveTasksTitle` — заголовок раздела архивных задач.
 * 
 * Отображает общую статистику выполненных задач: количество задач и общее время.
 * 
 * @module ArchiveTasksTitle
 * 
 * @param {ArchiveTasksTitleProps} props - Пропсы компонента
 * @param {number} props.tasksCount - Количество выполненных задач
 * @param {number} props.tasksTime - Общее время выполнения всех задач в миллисекундах
 * 
 * @returns {string} HTML-разметка заголовка с статистикой
 */
export type ArchiveTasksTitleProps = {
    tasksCount: number;
    tasksTime: number;
}

export function ArchiveTasksTitle({ tasksCount, tasksTime }: ArchiveTasksTitleProps) {
    const humanTime = toHumanHourMinutesSecondsTime(tasksTime);

    return `
        <div class="${styles.archive_tasks__title}">
            <div class="${styles.archive_tasks__title_desc}">
                СДЕЛАНО
            </div>

            <div class="${styles.archive_tasks__title_tasks_count}" role="text" aria-label="Количество выполненных задач">
                ${tasksCount}
            </div>

            <div class="${styles.archive_tasks__title_tasks_divider}" aria-hidden="true">
                /
            </div>

            <div class="${styles.archive_tasks__title_tasks_time}" role="text" aria-label="Общее время выполнения">
                ${humanTime}
            </div>
        </div>
    `;
}