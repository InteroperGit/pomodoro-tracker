import {ArchiveTasksTitle} from "./ArchiveTasksTitle.js";
import {ArchiveTasksList} from "./ArchiveTasksList.js";
import {ArchiveTasksStatistics} from "./ArchiveTasksStatistics.js";

/**
 * Компонент `ArchiveTasks` — секция приложения Pomodoro‑таймера,
 * предназначенная для отображения списка завершённых (архивных) задач и статистики по ним.
 *
 * Состоит из трёх вложенных подкомпонентов:
 * - `ArchiveTasksTitle` — отображает заголовок блока и сводную информацию (количество и время задач).
 * - `ArchiveTasksList` — список архивных задач с категориями и описанием.
 * - `ArchiveTasksStatistics` — сообщает статистические сведения по категориям выполненных задач.
 *
 * @module ArchiveTasks
 *
 * @function ArchiveTasks
 * @param {Object} props - Параметры для отображения архивных задач.
 * @param {number} props.tasksCount - Общее количество задач в архиве.
 * @param {string} props.tasksTime - Совокупное время, затраченное на выполнение всех задач (например, `"3ч 15мин"`).
 * @param {Array<Object>} props.tasks - Массив объектов, описывающих отдельные задачи.
 * @param {string} props.tasks[].category - Категория задачи (например, `"Работа"` или `"Учёба"`).
 * @param {string} props.tasks[].description - Краткое описание задачи.
 * @param {Object} props.statistics - Статистические данные по категориям задач.
 * @param {Array<Object>} props.statistics.categories - Массив объектов для подсчёта задач по категориям.
 * @param {string} props.statistics.categories[].name - Имя категории.
 * @param {number} props.statistics.categories[].count - Количество задач в категории.
 *
 * @throws {Error} Если `props` не переданы (значение `undefined`), выбрасывается исключение о невозможности рендеринга компонента.
 *
 * @description
 * Компонент формирует разметку блока `.archive_tasks`, включающую заголовок, шапку таблицы,
 * список задач и сводную статистику. Используется после завершения одного или нескольких Pomodoro‑циклов.
 *
 * @returns {string} HTML‑разметка блока архива завершённых задач.
 *
 * @example
 * import { ArchiveTasks } from './ArchiveTasks/index.js';
 *
 * const archiveHTML = ArchiveTasks({
 *   tasksCount: 5,
 *   tasksTime: "3ч 15мин",
 *   tasks: [
 *     { category: "Работа", description: "Отправить отчёт" },
 *     { category: "Учёба", description: "Повторить материал по JS" },
 *   ],
 *   statistics: {
 *     categories: [
 *       { name: "Работа", count: 3 },
 *       { name: "Учёба", count: 2 }
 *     ]
 *   }
 * });
 *
 * document.querySelector('.main').innerHTML += archiveHTML;
 */
export function ArchiveTasks(props) {
    if (!props) {
        throw new Error("Failed to render ArchiveTasks. Props is undefined");
    }

    const { tasksCount, tasksTime, tasks, statistics } = props;

    const title = ArchiveTasksTitle({ tasksCount, tasksTime });
    const list = ArchiveTasksList({ tasks });
    const stat = ArchiveTasksStatistics(statistics);

    return `
        <div class="archive_tasks">
            ${title}
            
            <div class="archive_tasks__header">
                <span class="archive_tasks__header_category">
                    КАТЕГОРИЯ
                </span>
                    <span class="archive_tasks__header_description">
                    ОПИСАНИЕ
                </span>
            </div>
            
            ${list}
            
            ${stat}
        </div>
    `;
}