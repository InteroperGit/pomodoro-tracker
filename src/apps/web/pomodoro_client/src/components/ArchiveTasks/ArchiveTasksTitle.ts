import styles from "./ArchiveTasksTitle.module.scss";
import {toHumanHourMinutesSecondsTime} from "../../utils/time.ts";
import { t } from '../../i18n';

/**
 * Свойства заголовка архива задач
 * @typedef {Object} ArchiveTasksTitleProps
 * @property {number} tasksCount - количество выполненных задач
 * @property {number} tasksTime - общее время выполнения (мс)
 */
export type ArchiveTasksTitleProps = {
    tasksCount: number;
    tasksTime: number;
}

/**
 * Компонент заголовка архива с статистикой выполненных задач
 * @param {ArchiveTasksTitleProps} props - свойства компонента
 * @returns {string} HTML-строка компонента
 */
export function ArchiveTasksTitle({ tasksCount, tasksTime }: ArchiveTasksTitleProps) {
    const humanTime = toHumanHourMinutesSecondsTime(tasksTime);

    return `
        <div class="${styles.archive_tasks__title}">
            <div class="${styles.archive_tasks__title_desc}">
                ${t('archive.title')}
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