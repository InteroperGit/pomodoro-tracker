/**
 * Компонент `ArchiveTasksStatistics` — блок статистики по категориям завершённых задач
 * в Pomodoro‑приложении. Отображает количество выполненных задач по каждой категории.
 *
 * Используется внутри родительского компонента {@link ArchiveTasks} для вывода
 * аналитической информации внизу секции архива.
 *
 * @module ArchiveTasksStatistics
 *
 * @function ArchiveTasksStatistics
 * @param {Object} params - Параметры компонента.
 * @param {Array<Object>} params.categories - Массив объектов с данными о категориях задач.
 * @param {string} params.categories[].name - Название категории (например, `"Работа"`, `"Учёба"`, `"Дом"`).
 * @param {number} params.categories[].count - Количество завершённых задач в этой категории.
 *
 * @description
 * Компонент преобразует массив `categories` в HTML‑список, где каждая строка имеет вид:
 * `"Название категории – количество"`.
 * Статистика выводится внутри обёртки `.archive_tasks__statistics`, которая содержит
 * заголовок "Категории" и список `<ul>`.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="archive_tasks__statistics">
 *   <div class="archive_tasks__statistics_categories">
 *     <span>Категории</span>
 *     <ul class="archive_tasks__statistics_categories_list">
 *       <li class="archive_tasks__statistics_categories_item">Работа - 3</li>
 *       <li class="archive_tasks__statistics_categories_item">Учёба - 2</li>
 *     </ul>
 *   </div>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка блока статистики архивных задач.
 *
 * @example
 * import { ArchiveTasksStatistics } from './ArchiveTasksStatistics.js';
 *
 * const statisticsHTML = ArchiveTasksStatistics({
 *   categories: [
 *     { name: "Работа", count: 3 },
 *     { name: "Учёба", count: 2 }
 *   ]
 * });
 *
 * document.querySelector('.archive_tasks').innerHTML += statisticsHTML;
 */
export function ArchiveTasksStatistics({ categories }) {
    const stat = categories.map(({ name, count }) =>
    `
        <li class="archive_tasks__statistics_categories_item">
            ${name}-${count}
        </li>
    `)

    return `
        <div class="archive_tasks__statistics">
            <div class="archive_tasks__statistics_categories">
            <span>
                Категории
            </span>
                <ul class="archive_tasks__statistics_categories_list">
                    ${stat}
                </ul>
            </div>
        </div>
    `;
}