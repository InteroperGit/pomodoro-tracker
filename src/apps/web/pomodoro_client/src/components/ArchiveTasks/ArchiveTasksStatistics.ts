import type {ArchivePomodoroTasksStatistics} from "../../types/statistics.ts";

export type ArchiveTasksStatisticsProps = {
    statistics: ArchivePomodoroTasksStatistics
}

export function ArchiveTasksStatistics({ statistics }: ArchiveTasksStatisticsProps) {
    const stat = statistics.categories.map(({ category, count }) =>
    `
        <li class="archive_tasks__statistics_categories_item">
            ${category.name}-${count}
        </li>
    `)

    return `
        <div class="archive_tasks__statistics">
            <div class="archive_tasks__statistics_categories">
            <span>
                Категории
            </span>
                <ul class="archive_tasks__statistics_categories_list">
                    ${stat}
                </ul>
            </div>
        </div>
    `;
}