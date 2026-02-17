import type {ArchivePomodoroTask} from "../../types/task";
import styles from "./ArchiveTask.module.scss"
import {toHumanMinutesSecondsTime} from "../../utils/time.ts";

export type ArchiveTaskProps = {
    isMobile: boolean;
    archiveTask: ArchivePomodoroTask;
}

export function ArchiveTask({ isMobile, archiveTask }: ArchiveTaskProps) {
    const { task, taskTime, completedAt } = archiveTask;
    const { category, description } = task;

    const humanTaskTime = toHumanMinutesSecondsTime(taskTime);
    const completeTaskTime = new Date(completedAt)
        .toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

    return isMobile
        ? (`
            <div class="${styles.archive_task_mobile}">
                <div class="${styles.archive_task__task}">
                    <div class="${styles.archive_task__category} ${styles.archive_task__category_mobile}">
                        ${category.name}
                    </div>
                    <div class="${styles.archive_task__description} ${styles.archive_task__description_mobile}">
                        ${description}
                    </div>
                </div>
                <div class="${styles.archive_task__time}">
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
            </div>
        `)
        : (`
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
        `);
}