/**
 * Компонент `ArchiveTasksTitle` — заголовок секции завершённых задач Pomodoro‑приложения.
 * Отображает сводную информацию о количестве выполненных задач и общем затраченном времени.
 *
 * Используется в составе основного блока {@link ArchiveTasks}, располагаясь в верхней его части.
 *
 * @module ArchiveTasksTitle
 *
 * @function ArchiveTasksTitle
 * @param {Object} params - Параметры компонента.
 * @param {number} params.tasksCount - Общее количество завершённых задач.
 * @param {string} params.tasksTime - Суммарное время выполнения всех задач (например, `"3ч 15мин"`).
 *
 * @description
 * Компонент формирует заголовок блока архива, состоящий из текста `"СДЕЛАНО"`, числа задач и времени.
 * Данные визуально разделяются символом `'/'` для компактного представления статистики.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="archive_tasks__title">
 *   <div class="archive_tasks__title_desc">СДЕЛАНО</div>
 *   <div class="archive_tasks__title_tasks_count">5</div>
 *   <div class="archive_tasks__title_tasks_divider">/</div>
 *   <div class="archive_tasks__title_tasks_time">3ч 15мин</div>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка заголовка секции архивных задач.
 *
 * @example
 * import { ArchiveTasksTitle } from './ArchiveTasksTitle.js';
 *
 * const titleHTML = ArchiveTasksTitle({
 *   tasksCount: 5,
 *   tasksTime: "3ч 15мин"
 * });
 *
 * document.querySelector('.archive_tasks').innerHTML = titleHTML;
 */
export function ArchiveTasksTitle({ tasksCount, tasksTime }) {
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