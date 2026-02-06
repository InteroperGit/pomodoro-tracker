import type {ArchivePomodoroTasksStatistics} from "../../types/statistics.ts";
import styles from "./ArchiveTasksStatistics.module.scss";

export type ArchiveTasksStatisticsProps = {
    statistics: ArchivePomodoroTasksStatistics
}

export function ArchiveTasksStatistics({ statistics }: ArchiveTasksStatisticsProps) {
    const stat = statistics.categories.map(({ category, count }) =>
    `
        <li class="${styles.archive_tasks__statistics_categories_item}">
            ${category.name}-${count}
        </li>
    `).join("");

    return `
        <div class="${styles.archive_tasks__statistics}">
            <div class="${styles.archive_tasks__statistics_categories}">
                <span>
                    Категории
                </span>
                <ul class="${styles.archive_tasks__statistics_categories_list}">
                    ${stat}
                </ul>
            </div>
        </div>
    `;
}