import type {ArchivePomodoroTasksStatistics} from "../../types/statistics.ts";
import styles from "./ArchiveTasksStatistics.module.scss";
import {escapeHtml} from "../../utils/html.ts";
import {toHumanHourMinutesSecondsTime} from "../../utils/time.ts";
import { t } from '../../i18n';

/**
 * Свойства компонента статистики архива
 * @typedef {Object} ArchiveTasksStatisticsProps
 * @property {ArchivePomodoroTasksStatistics} statistics - статистика архивных задач
 */
export type ArchiveTasksStatisticsProps = {
    statistics: ArchivePomodoroTasksStatistics;
};

/**
 * Компонент статистики архива с информацией о выполненных задачах и категориях
 * @param {ArchiveTasksStatisticsProps} props - свойства компонента
 * @returns {string} HTML-строка компонента
 */
export function ArchiveTasksStatistics({ statistics }: ArchiveTasksStatisticsProps) {
    const { tasksCount, tasksTime, categories } = statistics;
    const tasksTimeText = toHumanHourMinutesSecondsTime(tasksTime);

    const categoriesBlock =
        !categories || categories.length === 0
            ? `
            <div class="${styles.archive_tasks__statistics_categories}">
                <span>${t('archive.stats.categories')}</span>
                <div role="status" aria-live="polite">${t('archive.stats.noData')}</div>
            </div>
        `
            : `
            <div class="${styles.archive_tasks__statistics_categories}">
                <span>${t('archive.stats.categories')}</span>
                <ul class="${styles.archive_tasks__statistics_categories_list}" role="list">
                    ${categories
                        .map(
                            ({ category, count }) => `
                        <li class="${styles.archive_tasks__statistics_categories_item}" role="listitem">
                            ${escapeHtml(category.name)}-${count}
                        </li>
                    `
                        )
                        .join("")}
                </ul>
            </div>
        `;

    return `
        <div class="${styles.archive_tasks__statistics}">
            <div class="${styles.archive_tasks__statistics_summary}">
                <div class="${styles.archive_tasks__statistics_summary_row}">
                    <div class="${styles.archive_tasks__statistics_summary_label}">
                        <i class="fa-solid fa-trophy" aria-hidden="true"></i>
                        <span>${t('archive.stats.completed')}</span>
                    </div>
                    <div class="${styles.archive_tasks__statistics_summary_value}">${tasksCount}</div>
                </div>
                <div class="${styles.archive_tasks__statistics_summary_row}">
                    <div class="${styles.archive_tasks__statistics_summary_label}">
                        <i class="fa-solid fa-clock" aria-hidden="true"></i>
                        <span>${t('archive.stats.totalTime')}</span>
                    </div>
                    <div class="${styles.archive_tasks__statistics_summary_value}">${tasksTimeText}</div>
                </div>
            </div>
            ${categoriesBlock}
        </div>
    `;
}