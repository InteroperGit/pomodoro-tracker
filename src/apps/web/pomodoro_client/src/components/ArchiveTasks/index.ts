import {ArchiveTasksTitle} from "./ArchiveTasksTitle.ts";
import {ArchiveTasksList} from "./ArchiveTasksList.ts";
import {ArchiveTasksStatistics} from "./ArchiveTasksStatistics.ts";
import type {PomodoroTask} from "../../types/task.ts";
import type {ArchivePomodoroTasksStatistics} from "../../types/statistics.ts";

export type ArchiveTasksProps = {
    tasksCount: number;
    tasksTime: string;
    tasks: PomodoroTask[];
    statistics: ArchivePomodoroTasksStatistics;
}

export function ArchiveTasks(props: ArchiveTasksProps) {
    const { tasksCount, tasksTime, tasks, statistics } = props;

    const title = ArchiveTasksTitle({ tasksCount, tasksTime });
    const list = ArchiveTasksList({ tasks });
    const stat = ArchiveTasksStatistics({ statistics });

    return `
        <div class="archive_tasks">
            ${title}
            
            <div class="archive_tasks__header">
                <span class="archive_tasks__header_category">
                    КАТЕГОРИЯ
                </span>
                    <span class="archive_tasks__header_description">
                    ОПИСАНИЕ
                </span>
            </div>
            
            ${list}
            
            ${stat}
        </div>
    `;
}