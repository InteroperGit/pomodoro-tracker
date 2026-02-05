import {ArchiveTask} from "./ArchiveTask.ts";

/**
 * Компонент `ArchiveTasksList` — список завершённых задач Pomodoro‑приложения.
 * Формирует HTML‑разметку в виде маркированного списка (`<ul>`), где каждая задача
 * отображается как элемент `<li>`, созданный через компонент {@link ArchiveTask}.
 *
 * @module ArchiveTasksList
 *
 * @function ArchiveTasksList
 * @param {Object} params - Параметры компонента.
 * @param {Array<Object>} params.tasks - Массив задач для отображения в архивном списке.
 * @param {string} params.tasks[].category - Категория задачи (например, `"Работа"`, `"Учёба"`, `"Дом"`).
 * @param {string} params.tasks[].description - Краткое описание задачи.
 *
 * @description
 * Компонент преобразует массив объектов `tasks` в список элементов `<li>`,
 * внутри которых находятся карточки отдельных задач, созданные с помощью {@link ArchiveTask}.
 *
 * Пример итоговой структуры:
 * ```html
 * <ul class="plan_tasks__list">
 *   <li>
 *     <div class="archive_task">
 *       <div class="archive_task__category">Работа</div>
 *       <div class="archive_task__description">Подготовить отчёт</div>
 *     </div>
 *   </li>
 *   <li> ... </li>
 * </ul>
 * ```
 *
 * @returns {string} HTML‑разметка списка завершённых задач.
 *
 * @example
 * import { ArchiveTasksList } from './ArchiveTasksList.js';
 *
 * const listHTML = ArchiveTasksList({
 *   tasks: [
 *     { category: "Работа", description: "Отправить отчёт" },
 *     { category: "Учёба", description: "Повторить лекцию по JS" }
 *   ]
 * });
 *
 * document.querySelector('.archive_tasks').innerHTML += listHTML;
 */
export function ArchiveTasksList({ tasks }) {
    const taskItems = tasks.map((task) =>
        `
            <li>
                ${ArchiveTask(task)}
            </li>
        `
    ).join("");

    return `
        <ul class="plan_tasks__list">
            ${taskItems}
        </ul>
    `;
}