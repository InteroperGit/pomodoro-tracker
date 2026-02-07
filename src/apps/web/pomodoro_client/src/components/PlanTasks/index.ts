import styles from "./PlanTasks.module.scss";
import {PlanTasksTitle} from "./PlanTasksTitle";
import {PlanTasksAdd} from "./PlanTasksAdd";
import {PlanTasksStatistics} from "./PlanTasksStatistics";
import {PlanTaskList} from "./PlanTaskList.ts";
import type {PlanTasksState} from "../../types/context.ts";

export type PlanTasksProps = {
    data: PlanTasksState;
}

export function PlanTasks({ data }: PlanTasksProps) {
    const { tasksCount, tasksTime, planTasks, statistics } = data;

    const title = PlanTasksTitle({ tasksCount, tasksTime });
    const add = PlanTasksAdd();
    const list = PlanTaskList({ planTasks });
    const stats = PlanTasksStatistics({ statistics });

    return `
        <div class="${styles.plan_tasks}">
            ${title}
            ${add}
            ${list}
            ${stats}
        </div>
    `;
}