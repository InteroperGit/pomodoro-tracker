import {PlanTask} from "./PlanTask";

/**
 * Компонент `PlanTasksList` — список активных (планируемых) задач Pomodoro‑приложения.
 * Формирует коллекцию элементов `<li>`, каждый из которых представляет задачу через компонент {@link PlanTask}.
 *
 * Используется внутри родительского блока {@link PlanTasks}.
 *
 * @module PlanTasksList
 *
 * @function PlanTasksList
 * @param {Object} params - Параметры компонента.
 * @param {Array<Object>} params.tasks - Массив объектов с информацией о задачах.
 * @param {string} params.tasks[].category - Категория задачи (например, `"Работа"`, `"Учёба"`, `"Дом"`).
 * @param {string} params.tasks[].description - Описание задачи.
 * @param {number} params.tasks[].count - Количество повторов (Pomodoro‑циклов) для задачи.
 *
 * @description
 * Компонент перебирает массив `tasks`, оборачивая каждую задачу в элемент списка `<li>` с помощью
 * подкомпонента {@link PlanTask}. В результате создаётся элемент `<ul>` с классом `.plan_tasks__list`,
 * содержащий структуру всех текущих задач.
 *
 * Пример итоговой структуры:
 * ```html
 * <ul class="plan_tasks__list">
 *   <li>
 *     <div class="plan_task">
 *       <div class="plan_task__category">Работа</div>
 *       <div class="plan_task__description">Подготовить отчёт</div>
 *       <div class="plan_task__count">2</div>
 *       <button class="button plan_task__button">+</button>
 *       <button class="button plan_task__button">-</button>
 *     </div>
 *   </li>
 *   <li> ... </li>
 * </ul>
 * ```
 *
 * @returns {string} HTML‑разметка списка планируемых задач.
 *
 * @example
 * import { PlanTasksList } from './PlanTasksList.js';
 *
 * const listHTML = PlanTasksList({
 *   tasks: [
 *     { category: "Работа", description: "Написать отчёт", count: 2 },
 *     { category: "Учёба", description: "Повторить лекцию по JS", count: 1 }
 *   ]
 * });
 *
 * document.querySelector('.plan_tasks').innerHTML += listHTML;
 */
export function PlanTasksList({ tasks }) {
    const taskItems = tasks.map((task) => {
        const taskItem = PlanTask({ task });

        return `
            <li>
                ${taskItem}
            </li>
        `
    }).join("");

    return `
        <ul class="plan_tasks__list">
            ${taskItems}
        </ul>
    `;
}