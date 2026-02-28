import styles from "./ArchiveTasksTarget.module.scss";
import { t } from '../../i18n';

export type ArchiveTasksTargetProps = {
    tasksCount: number;
    goal?: number;
};

/**
 * Компонент `ArchiveTasksTarget` — отображает прогресс выполнения дневной цели по задачам.
 *
 * Показывает, сколько задач осталось до выполнения цели или сообщает об её достижении.
 * Если цель достигнута, меняет текст и применяет специальный класс для стилизации.
 *
 * @param {ArchiveTasksTargetProps} props - Пропсы компонента.
 * @param {number} props.tasksCount - Текущее количество выполненных (архивных) задач.
 * @param {number} [props.goal=10] - Дневная цель по количеству задач (по умолчанию 10).
 *
 * @returns {string} HTML-разметка статуса выполнения цели.
 */
export function ArchiveTasksTarget({ tasksCount, goal = 10 }: ArchiveTasksTargetProps) {
    const achieved = tasksCount >= goal;
    const text = achieved
        ? t('archive.target.achieved', { count: tasksCount, goal })
        : t('archive.target.remaining', { remaining: goal - tasksCount, goal });
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
