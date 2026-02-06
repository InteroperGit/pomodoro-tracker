import {PlanTasksTitle} from "./PlanTasksTitle";
import {PlanTasksAdd} from "./PlanTasksAdd";
import {PlanTasksStatistics} from "./PlanTasksStatistics";
import {PlanTaskControlsList} from "./PlanTaskControlsList.ts";
import type {PlanPomodoroTasksStatistics} from "../../types/statistics.ts";
import type {PlanPomodoroTask} from "../../types/task.ts";

export type PlanTasksProps = {
    tasksCount: number;
    tasksTime: string;
    planTasks: PlanPomodoroTask[];
    statistics: PlanPomodoroTasksStatistics;
}

export function PlanTasks(props: PlanTasksProps) {
    if (!props) {
        throw new Error("Failed to render PlanTasks. Props is undefined");
    }

    const { tasksCount, tasksTime, planTasks, statistics } = props;

    const title = PlanTasksTitle({ tasksCount, tasksTime });
    const add = PlanTasksAdd();
    const list = PlanTaskControlsList({ planTasks });
    const stats = PlanTasksStatistics({ statistics });

    return `
        <div class="plan_tasks">
            ${title}
            ${add}
            ${list}
            ${stats}
        </div>
    `;
}