import type {ArchivePomodoroTask} from "../../types/task";
import styles from "./ArchiveTask.module.scss"
import {toHumanMinutesSecondsTime} from "../../utils/time.ts";

export type ArchiveTaskProps = {
    archiveTask: ArchivePomodoroTask;
}

export function ArchiveTask({ archiveTask }: ArchiveTaskProps) {
    const { task, taskTime, completedAt } = archiveTask;
    const { category, description } = task;

    const humanTaskTime = toHumanMinutesSecondsTime(taskTime);
    const completeTaskTime = new Date(completedAt)
        .toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

    return `
        <div class="${styles.archive_task}">
            <div class="${styles.archive_task__category}">
                ${category.name}
            </div>
            <div class="${styles.archive_task__description}">
                ${description}
            </div>
            <div class="${styles.archive_task__task_time}">
                ${humanTaskTime }
            </div>
            <div class="${styles.archive_task__divider}">
                /
            </div>
            <div class="${styles.archive_task__task_time}">
                ${completeTaskTime}
            </div>
        </div>
    `;
}