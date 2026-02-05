/**
 * Компонент `ArchiveTask` — элемент списка архивных задач Pomodoro‑приложения.
 * Отображает информацию об одной завершённой задаче: её категорию и описание.
 *
 * Используется внутри родительского компонента {@link ArchiveTasksList},
 * который формирует общий список архивных задач.
 *
 * @module ArchiveTask
 *
 * @function ArchiveTask
 * @param {Object} params - Объект с параметрами задачи.
 * @param {string} params.category - Категория задачи (например, `"Работа"`, `"Учёба"`, `"Дом"`).
 * @param {string} params.description - Краткое описание завершённой задачи.
 *
 * @description
 * Компонент возвращает фрагмент HTML‑разметки с классом `.archive_task`,
 * состоящий из двух ячеек — категории и описания задачи.
 * Встраивается в общий список архивных задач.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="archive_task">
 *   <div class="archive_task__category">Работа</div>
 *   <div class="archive_task__description">Написать отчёт</div>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка одного элемента списка архивных задач.
 *
 * @example
 * import { ArchiveTask } from './ArchiveTask.js';
 *
 * const itemHTML = ArchiveTask({
 *   category: "Работа",
 *   description: "Подготовить презентацию"
 * });
 *
 * document.querySelector('.archive_tasks__list').insertAdjacentHTML('beforeend', itemHTML);
 */
export function ArchiveTask({ category, description }) {
    return `
        <div class="archive_task">
            <div class="archive_task__category">
                ${category}
            </div>
            <div class="archive_task__description">
                ${description}
            </div>
        </div>
    `;
}