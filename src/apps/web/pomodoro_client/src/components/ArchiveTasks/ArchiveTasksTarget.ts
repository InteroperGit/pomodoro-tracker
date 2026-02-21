import styles from "./ArchiveTasksTarget.module.scss";

export type ArchiveTasksTargetProps = {
    tasksCount: number;
    goal?: number;
};

/**
 * Строка цели на день: осталось X из goal.
 * Перечёркивается как итоги.
 */
export function ArchiveTasksTarget({ tasksCount, goal = 10 }: ArchiveTasksTargetProps) {
    const achieved = tasksCount >= goal;
    const text = achieved
        ? `Цель достигнута. Выполнено ${tasksCount} из ${goal}`
        : `Цель на день: осталось ${goal - tasksCount} из ${goal}`;
    const targetClass = achieved
        ? `${styles.archive_tasks__target} ${styles.archive_tasks__target_achieved}`
        : styles.archive_tasks__target;
    return `
        <div class="${targetClass}" role="status">
            <span class="${styles.archive_tasks__target_content}">
                <i class="fa-solid fa-star" aria-hidden="true"></i>
                ${text}
            </span>
        </div>
    `;
}
