import {ArchiveTask} from "./ArchiveTask.ts";
import type {PomodoroTask} from "../../types/task.ts";

export type ArchiveTasksListProps = {
    tasks: PomodoroTask[];
}

export function ArchiveTasksList({ tasks }: ArchiveTasksListProps) {
    const taskItems = tasks.map((archiveTask) =>
        `
            <li>
                ${ArchiveTask({ archiveTask })}
            </li>
        `
    ).join("");

    return `
        <ul class="plan_tasks__list">
            ${taskItems}
        </ul>
    `;
}