import {ArchiveTask} from "./ArchiveTask.ts";
import type {ArchivePomodoroTask} from "../../types/task.ts";
import styles from "./ArchiveTasksList.module.scss";

export type ArchiveTasksListProps = {
    isMobile: boolean;
    tasks: ArchivePomodoroTask[];
}

export function ArchiveTasksList({ isMobile, tasks }: ArchiveTasksListProps) {
    const header = isMobile
        ? `<div class="${styles.archive_tasks__header} ${styles.archive_tasks__header_mobile}">
                <span class="${styles.archive_tasks__header_category}">
                    КАТЕГОРИЯ
                </span>
                    <span class="${styles.archive_tasks__header_description}">
                    ОПИСАНИЕ
                </span>
            </div>`
        : `<div class="${styles.archive_tasks__header}">
                <span class="${styles.archive_tasks__header_category}">
                    КАТЕГОРИЯ
                </span>
                    <span class="${styles.archive_tasks__header_description}">
                    ОПИСАНИЕ
                </span>
            </div>`;

    const taskItems = tasks.map((archiveTask) =>
        `
            <li>
                ${ArchiveTask({ isMobile, archiveTask })}
            </li>
        `
    ).join("");

    return `
        <div class="${styles.archive_tasks__list_container}">
            ${header}
            <ul class="${styles.archive_tasks__list}">
                ${taskItems}
            </ul>
        </div>
    `;
}