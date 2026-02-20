import styles from "./PlanTasksStatistics.module.scss";
import type {PlanPomodoroTasksStatistics} from "../../types/statistics.ts";
import {escapeHtml} from "../../utils/html.ts";

export type PlanTasksStatisticsProps = {
    statistics: PlanPomodoroTasksStatistics;
};

export function PlanTasksStatistics({ statistics }: PlanTasksStatisticsProps) {
    const { nextLongBreak, finishTime, categories  } = statistics;

    const categoriesItems = categories.map(({category, count}) =>
        `
            <li class="${styles.plan_tasks__statistics_categories_item}">
                ${escapeHtml(category.name)}-${count}
            </li>
        `
    ).join("");

    return `
        <div class="${styles.plan_tasks__statistics}">
            <div class="${styles.plan_tasks__statistics_title}">
                <div>Следующий длинный перерыв</div>
                <div class="${styles.plan_tasks__statistics_title_time}">${nextLongBreak}</div>
                <div>Время окончания</div>
                <div class="${styles.plan_tasks__statistics_title_time}">${finishTime}</div>
            </div>
            
            <div class="${styles.plan_tasks__statistics_categories}">
                <span>
                    Категории
                </span>
                
                <ul class="${styles.plan_tasks__statistics_categories_list}">
                    ${categoriesItems}
                </ul>
            </div>
        </div>
    `;
}