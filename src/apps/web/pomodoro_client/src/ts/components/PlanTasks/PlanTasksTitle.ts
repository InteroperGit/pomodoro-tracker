export type PlanTasksTitleProps = {
    tasksCount: number;

    tasksTime: string
}

export function PlanTasksTitle({ tasksCount, tasksTime }: PlanTasksTitleProps) {
    return `
        <div class="plan_tasks__title">
            <div class="plan_tasks__title_desc">
                ЗАПЛАНИРОВАНО
            </div>
        
            <div class="plan_tasks__title_tasks_count">
                ${tasksCount ? tasksCount : '-'}
            </div>
        
            <div class="plan_tasks__title_tasks_divider">
                /
            </div>
        
            <div class="plan_tasks__title_tasks_time">
                ${tasksTime ? tasksTime : '-'}
            </div>
        </div>
    `;
}