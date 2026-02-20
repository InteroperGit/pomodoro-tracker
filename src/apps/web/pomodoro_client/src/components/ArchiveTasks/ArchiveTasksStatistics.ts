import type {ArchivePomodoroTasksStatistics} from "../../types/statistics.ts";
import styles from "./ArchiveTasksStatistics.module.scss";
import {escapeHtml} from "../../utils/html.ts";

/**
 * Компонент `ArchiveTasksStatistics` — статистика по архивным задачам.
 * 
 * Отображает распределение выполненных задач по категориям с указанием
 * количества задач в каждой категории.
 * 
 * @module ArchiveTasksStatistics
 * 
 * @param {ArchiveTasksStatisticsProps} props - Пропсы компонента
 * @param {ArchivePomodoroTasksStatistics} props.statistics - Статистика архивных задач
 * 
 * @returns {string} HTML-разметка статистики по категориям
 */
export type ArchiveTasksStatisticsProps = {
    statistics: ArchivePomodoroTasksStatistics
}

export function ArchiveTasksStatistics({ statistics }: ArchiveTasksStatisticsProps) {
    // Обработка пустого списка категорий
    if (!statistics.categories || statistics.categories.length === 0) {
        return `
            <div class="${styles.archive_tasks__statistics}">
                <div class="${styles.archive_tasks__statistics_categories}">
                    <span>Категории</span>
                    <div role="status" aria-live="polite">Нет данных</div>
                </div>
            </div>
        `;
    }

    // Формирование списка категорий с экранированием для защиты от XSS
    const stat = statistics.categories.map(({ category, count }) =>
        `
            <li class="${styles.archive_tasks__statistics_categories_item}" role="listitem">
                ${escapeHtml(category.name)}-${count}
            </li>
        `
    ).join("");

    return `
        <div class="${styles.archive_tasks__statistics}">
            <div class="${styles.archive_tasks__statistics_categories}">
                <span>Категории</span>
                <ul class="${styles.archive_tasks__statistics_categories_list}" role="list">
                    ${stat}
                </ul>
            </div>
        </div>
    `;
}