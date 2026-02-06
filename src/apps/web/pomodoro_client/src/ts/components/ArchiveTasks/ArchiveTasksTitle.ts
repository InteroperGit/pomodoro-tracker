export type ArchiveTasksTitleProps = {
    tasksCount: number;

    tasksTime: string
}

export function ArchiveTasksTitle({ tasksCount, tasksTime }: ArchiveTasksTitleProps) {
    return `
        <div class="archive_tasks__title">
            <div class="archive_tasks__title_desc">
                СДЕЛАНО
            </div>

            <div class="archive_tasks__title_tasks_count">
                ${tasksCount}
            </div>

            <div class="archive_tasks__title_tasks_divider">
                /
            </div>

            <div class="archive_tasks__title_tasks_time">
                ${tasksTime}
            </div>
        </div>
    `;
}