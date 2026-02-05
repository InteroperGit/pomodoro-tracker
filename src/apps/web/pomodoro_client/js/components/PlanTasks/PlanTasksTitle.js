/**
 * Компонент `PlanTasksTitle` — заголовок секции планируемых задач в Pomodoro‑приложении.
 * Отображает количество запланированных задач и их общее предполагаемое время выполнения.
 *
 * Используется внутри родительского компонента {@link PlanTasks} в верхней части блока.
 *
 * @module PlanTasksTitle
 *
 * @function PlanTasksTitle
 * @param {Object} params - Параметры компонента.
 * @param {number} params.tasksCount - Количество запланированных задач.
 * @param {string} params.tasksTime - Суммарное время на выполнение всех задач (например, `"2ч 5мин"`).
 *
 * @description
 * Компонент выводит слово `"ЗАПЛАНИРОВАНО"`, количество задач и общее время,
 * разделяя числовые значения символом `"/"`.
 * Если одно из значений не передано, компонент отображает дефис (`"-"`) вместо него.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="plan_tasks__title">
 *   <div class="plan_tasks__title_desc">ЗАПЛАНИРОВАНО</div>
 *   <div class="plan_tasks__title_tasks_count">5</div>
 *   <div class="plan_tasks__title_tasks_divider">/</div>
 *   <div class="plan_tasks__title_tasks_time">2ч 5мин</div>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка заголовка секции планируемых задач.
 *
 * @example
 * import { PlanTasksTitle } from './PlanTasksTitle.js';
 *
 * const titleHTML = PlanTasksTitle({
 *   tasksCount: 5,
 *   tasksTime: "2ч 5мин"
 * });
 *
 * document.querySelector('.plan_tasks').insertAdjacentHTML('afterbegin', titleHTML);
 */
export function PlanTasksTitle({ tasksCount, tasksTime }) {
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