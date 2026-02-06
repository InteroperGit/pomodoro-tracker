import {PlanTaskControl} from "./PlanTaskControl.ts";
import type {PlanPomodoroTask} from "../../types/task.ts";

export function PlanTaskControlsList({ planTasks }: { planTasks: PlanPomodoroTask[] }) {
    const taskItems = planTasks.map((planTask) => {
        const taskItem = PlanTaskControl({ planTask });

        return `
            <li>
                ${taskItem}
            </li>
        `
    }).join("");

    return `
        <ul class="plan_tasks__list">
            ${taskItems}
        </ul>
    `;
}