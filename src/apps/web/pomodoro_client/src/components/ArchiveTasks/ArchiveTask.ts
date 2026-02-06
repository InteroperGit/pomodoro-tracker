import type {PomodoroTask} from "../../types/task";
import styles from "./ArchiveTask.module.scss"

export type ArchiveTaskProps = {
    archiveTask: PomodoroTask;
}

export function ArchiveTask({ archiveTask }: ArchiveTaskProps) {
    const { category, description } = archiveTask;

    return `
        <div class="${styles.archive_task}">
            <div class="${styles.archive_task__category}">
                ${category.name}
            </div>
            <div class="${styles.archive_task__description}">
                ${description}
            </div>
        </div>
    `;
}