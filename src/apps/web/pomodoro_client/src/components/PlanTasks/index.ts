import styles from "./PlanTasks.module.scss";
import {PlanTasksTitle} from "./PlanTasksTitle";
import {PlanTasksAdd} from "./PlanTasksAdd";
import {PlanTasksStatistics} from "./PlanTasksStatistics";
import {PlanTaskList} from "./PlanTaskList.ts";
import type {PlanPomodoroTasksStatistics} from "../../types/statistics.ts";
import type {PlanPomodoroTask} from "../../types/task.ts";

export type PlanTasksProps = {
    tasksCount: number;
    tasksTime: string;
    planTasks: PlanPomodoroTask[];
    statistics: PlanPomodoroTasksStatistics;
}

export function PlanTasks(props: PlanTasksProps) {
    const { tasksCount, tasksTime, planTasks, statistics } = props;

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