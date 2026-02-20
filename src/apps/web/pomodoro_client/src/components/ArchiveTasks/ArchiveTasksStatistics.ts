import type {ArchivePomodoroTasksStatistics} from "../../types/statistics.ts";
import styles from "./ArchiveTasksStatistics.module.scss";
import {escapeHtml} from "../../utils/html.ts";
import {toHumanHourMinutesSecondsTime} from "../../utils/time.ts";

/**
 * Компонент `ArchiveTasksStatistics` — статистика по архивным задачам.
 *
 * Отображает количество выполненных помидоров, общее время и распределение по категориям.
 *
 * @module ArchiveTasksStatistics
 *
 * @param {ArchiveTasksStatisticsProps} props - Пропсы компонента
 * @param {ArchivePomodoroTasksStatistics} props.statistics - Статистика архивных задач
 *
 * @returns {string} HTML-разметка статистики
 */
export type ArchiveTasksStatisticsProps = {
    statistics: ArchivePomodoroTasksStatistics;
};

export function ArchiveTasksStatistics({ statistics }: ArchiveTasksStatisticsProps) {
    const { tasksCount, tasksTime, categories } = statistics;
    const tasksTimeText = toHumanHourMinutesSecondsTime(tasksTime);

    const categoriesBlock =
        !categories || categories.length === 0
            ? `
            <div class="${styles.archive_tasks__statistics_categories}">
                <span>Категории</span>
                <div role="status" aria-live="polite">Нет данных</div>
            </div>
        `
            : `
            <div class="${styles.archive_tasks__statistics_categories}">
                <span>Категории</span>
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
                <div class="${styles.archive_tasks__statistics_summary_label}">
                    <i class="fa-solid fa-trophy" aria-hidden="true"></i>
                    <span>Выполнено помидоров</span>
                </div>
                <div class="${styles.archive_tasks__statistics_summary_value}">${tasksCount}</div>
                <div class="${styles.archive_tasks__statistics_summary_label}">
                    <i class="fa-solid fa-clock" aria-hidden="true"></i>
                    <span>Общее время</span>
                </div>
                <div class="${styles.archive_tasks__statistics_summary_value}">${tasksTimeText}</div>
            </div>
            ${categoriesBlock}
        </div>
    `;
}