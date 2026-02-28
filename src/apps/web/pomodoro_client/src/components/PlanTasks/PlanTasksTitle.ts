import styles from "./PlanTasksTitle.module.scss";
import {toHumanHourMinutesTime} from "../../utils/time.ts";
import { t } from '../../i18n';

/**
 * Свойства заголовка плановых задач
 * @typedef {Object} PlanTasksTitleProps
 * @property {number} tasksCount - количество плановых помидоров
 * @property {number} tasksTime - общее время всех задач (мс)
 */
export type PlanTasksTitleProps = {
    tasksCount: number;
    tasksTime: number;
}

/**
 * Компонент заголовка с статистикой плановых задач
 * @param {PlanTasksTitleProps} props - свойства компонента
 * @returns {string} HTML-строка компонента
 */
export function PlanTasksTitle({ tasksCount, tasksTime }: PlanTasksTitleProps) {
    const humanTime = toHumanHourMinutesTime(tasksTime);

    return `
        <div class="${styles.plan_tasks__title}">
            <div class="${styles.plan_tasks__title_desc}">
                ${t('plan.title')}
            </div>
        
            <div class="${styles.plan_tasks__title_tasks_count}">
                ${tasksCount ? tasksCount : '-'}
            </div>
        
            <div class="${styles.plan_tasks__title_tasks_divider}">
                /
            </div>
        
            <div class="${styles.plan_tasks__title_tasks_time}">
                ${humanTime}
            </div>
        </div>
    `;
}