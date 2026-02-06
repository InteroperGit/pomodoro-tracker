import type {PomodoroTask} from "../../types/task";

export type ArchiveTaskProps = {
    archiveTask: PomodoroTask;
}

export function ArchiveTask({ archiveTask }: ArchiveTaskProps) {
    const { category, description } = archiveTask;

    return `
        <div class="archive_task">
            <div class="archive_task__category">
                ${category}
            </div>
            <div class="archive_task__description">
                ${description}
            </div>
        </div>
    `;
}