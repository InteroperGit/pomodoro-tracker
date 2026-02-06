import type {PlanPomodoroTasksStatistics} from "../../types/statistics.ts";

export type PlanTasksStatisticsProps = {
    statistics: PlanPomodoroTasksStatistics;
};

export function PlanTasksStatistics({ statistics }: PlanTasksStatisticsProps) {
    const { nextLongBreak, finishTime, categories  } = statistics;

    const categoriesItems = categories.map(({category, count}) =>
        `
            <li class="plan_tasks__statistics_categories_item">
                ${category.name}-${count}
            </li>
        `
    ).join("");

    return `
        <div class="plan_tasks__statistics">
            <div class="plan_tasks__statistics_title">
                <div>Следующий длинный перерыв</div>
                <div class="plan_tasks__statistics_title_time">${nextLongBreak}</div>
                <div>Время окончания</div>
                <div class="plan_tasks__statistics_title_time">${finishTime}</div>
            </div>
            
            <div class="plan_tasks__statistics_categories">
                <span>
                    Категории
                </span>
                
                <ul class="plan_tasks__statistics_categories_list">
                    ${categoriesItems}
                </ul>
            </div>
        </div>
    `;
}