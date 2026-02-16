import styles from "./PlanTasksTitle.module.scss";
import {toHumanHourMinutesTime} from "../../utils/time.ts";

export type PlanTasksTitleProps = {
    tasksCount: number;
    tasksTime: number;
}

export function PlanTasksTitle({ tasksCount, tasksTime }: PlanTasksTitleProps) {
    const humanTime = toHumanHourMinutesTime(tasksTime);

    return `
        <div class="${styles.plan_tasks__title}">
            <div class="${styles.plan_tasks__title_desc}">
                ЗАПЛАНИРОВАНО
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