import styles from "./ArchiveTasks.module.scss";
import {ArchiveTasksTitle} from "./ArchiveTasksTitle.ts";
import {ArchiveTasksList} from "./ArchiveTasksList.ts";
import {ArchiveTasksStatistics} from "./ArchiveTasksStatistics.ts";
import type {ArchiveTasksState} from "../../types/context.ts";

export type ArchiveTasksProps = {
    data: ArchiveTasksState;
}

export function ArchiveTasks({ data }: ArchiveTasksProps) {
    const { tasksCount, tasksTime, tasks, statistics } = data;

    const title = ArchiveTasksTitle({ tasksCount, tasksTime });
    const list = ArchiveTasksList({ tasks });
    const stat = ArchiveTasksStatistics({ statistics });

    return `
        <div class="${styles.archive_tasks}">
            ${title}
            
            <div class="${styles.archive_tasks__header}">
                <span class="${styles.archive_tasks__header_category}">
                    КАТЕГОРИЯ
                </span>
                    <span class="${styles.archive_tasks__header_description}">
                    ОПИСАНИЕ
                </span>
            </div>
            
            ${list}
            
            ${stat}
        </div>
    `;
}