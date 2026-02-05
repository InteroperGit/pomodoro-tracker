/**
 * Компонент `PlanTasksStatistics` — блок статистики для раздела планируемых задач Pomodoro‑приложения.
 * Отображает информацию о времени следующего длинного перерыва, времени завершения работы и количестве задач по категориям.
 *
 * Используется внутри родительского компонента {@link PlanTasks}.
 *
 * @module PlanTasksStatistics
 *
 * @function PlanTasksStatistics
 * @param {Object} params - Параметры статистики.
 * @param {string} params.nextLongBreak - Время следующего длинного перерыва (например, `"12:00"`).
 * @param {string} params.finishTime - Расчётное время завершения всех задач (например, `"18:00"`).
 * @param {Array<Object>} params.categories - Список категорий с количеством задач.
 * @param {string} params.categories[].name - Название категории (например, `"Работа"`, `"Учёба"`).
 * @param {number} params.categories[].count - Количество задач в этой категории.
 *
 * @description
 * Компонент формирует два блока:
 * 1. `.plan_tasks__statistics_title` — отображает ключевые временные показатели: время следующего длинного перерыва и окончания всех задач.
 * 2. `.plan_tasks__statistics_categories` — содержит список категорий и количество задач в каждой из них.
 *
 * Используется для быстрого обзора текущего состояния планируемых циклов Pomodoro.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="plan_tasks__statistics">
 *   <div class="plan_tasks__statistics_title">
 *     <div>Следующий длинный перерыв</div>
 *     <div class="plan_tasks__statistics_title_time">12:00</div>
 *     <div>Время окончания</div>
 *     <div class="plan_tasks__statistics_title_time">18:00</div>
 *   </div>
 *   <div class="plan_tasks__statistics_categories">
 *     <span>Категории</span>
 *     <ul class="plan_tasks__statistics_categories_list">
 *       <li class="plan_tasks__statistics_categories_item">Работа-3</li>
 *       <li class="plan_tasks__statistics_categories_item">Учёба-2</li>
 *     </ul>
 *   </div>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка блока статистики планируемых задач.
 *
 * @example
 * import { PlanTasksStatistics } from './PlanTasksStatistics.js';
 *
 * const statsHTML = PlanTasksStatistics({
 *   nextLongBreak: "12:00",
 *   finishTime: "18:00",
 *   categories: [
 *     { name: "Работа", count: 3 },
 *     { name: "Учёба", count: 2 }
 *   ]
 * });
 *
 * document.querySelector('.plan_tasks').innerHTML += statsHTML;
 */
export function PlanTasksStatistics({ nextLongBreak, finishTime, categories }) {
    const categoriesItems = categories.map(({name, count}) =>
        `
            <li class="plan_tasks__statistics_categories_item">
                ${name}-${count}
            </li>
        `
    ).join("");

    return `
        <div class="plan_tasks__statistics">
            <div class="plan_tasks__statistics_title">
                <div>Следующий длинный перерыв</div>
                <div class="plan_tasks__statistics_title_time">${nextLongBreak}</div>
                <div>Время окончания</div>
                <div class="plan_tasks__statistics_title_time">${finishTime}</div>
            </div>
            
            <div class="plan_tasks__statistics_categories">
                <span>
                    Категории
                </span>
                
                <ul class="plan_tasks__statistics_categories_list">
                    ${categoriesItems}
                </ul>
            </div>
        </div>
    `;
}