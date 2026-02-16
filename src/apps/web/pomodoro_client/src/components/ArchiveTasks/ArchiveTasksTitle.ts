import styles from "./ArchiveTasksTitle.module.scss";
import {toHumanHourMinutesTime} from "../../utils/time.ts";

export type ArchiveTasksTitleProps = {
    tasksCount: number;
    tasksTime: number;
}

export function ArchiveTasksTitle({ tasksCount, tasksTime }: ArchiveTasksTitleProps) {
    const humanTime = toHumanHourMinutesTime(tasksTime);

    return `
        <div class="${styles.archive_tasks__title}">
            <div class="${styles.archive_tasks__title_desc}">
                СДЕЛАНО
            </div>

            <div class="${styles.archive_tasks__title_tasks_count}">
                ${tasksCount}
            </div>

            <div class="${styles.archive_tasks__title_tasks_divider}">
                /
            </div>

            <div class="${styles.archive_tasks__title_tasks_time}">
                ${humanTime}
            </div>
        </div>
    `;
}