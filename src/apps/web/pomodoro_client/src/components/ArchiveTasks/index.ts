import styles from "./ArchiveTasks.module.scss";
import {ArchiveTasksTitle} from "./ArchiveTasksTitle.ts";
import {ArchiveTasksList} from "./ArchiveTasksList.ts";
import {ArchiveTasksStatistics} from "./ArchiveTasksStatistics.ts";
import type {ArchivePomodoroTasksState} from "../../types/context.ts";

export type ArchiveTasksProps = {
    isMobile: boolean;
    data: ArchivePomodoroTasksState;
}

export function ArchiveTasks({ isMobile, data }: ArchiveTasksProps) {
    const { tasks, statistics } = data;
    const { tasksCount, tasksTime } = statistics;

    const title = ArchiveTasksTitle({ tasksCount, tasksTime });
    const list = ArchiveTasksList({ isMobile, tasks });
    const stat = ArchiveTasksStatistics({ statistics });

    const addingStyles = isMobile ? styles.archive_tasks_mobile : "";

    return `
        <div class="${styles.archive_tasks} ${addingStyles}">
            ${title}
            ${list}
            ${stat}
        </div>
    `;
}