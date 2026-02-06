import {PlanTask} from "./PlanTask.ts";
import type {PlanPomodoroTask} from "../../types/task.ts";
import styles from "./PlanTaskList.module.scss";

export function PlanTaskList({ planTasks }: { planTasks: PlanPomodoroTask[] }) {
    const taskItems = planTasks.map((planTask) => {
        const taskItem = PlanTask({ planTask });

        return `
            <li>
                ${taskItem}
            </li>
        `
    }).join("");

    return `
        <ul class="${styles.plan_tasks__list}">
            ${taskItems}
        </ul>
    `;
}