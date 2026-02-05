import {PlanTasksTitle} from "./PlanTasksTitle";
import {PlanTasksAdd} from "./PlanTasksAdd";
import {PlanTasksList} from "./PlanTasksList";
import {PlanTasksStatistics} from "./PlanTasksStatistics";

/**
 * Компонент `PlanTasks` — основная секция активных (планируемых) задач Pomodoro‑приложения.
 * Отвечает за отображение списка текущих задач, возможность добавления новых и показ статистики.
 *
 * Использует несколько подкомпонентов:
 * - {@link PlanTasksTitle} — выводит заголовок и сводную информацию: количество и общее время задач.
 * - {@link PlanTasksAdd} — кнопка или форма для добавления новых задач в список.
 * - {@link PlanTasksList} — отображает текущие (невыполненные) задачи.
 * - {@link PlanTasksStatistics} — блок статистики, показывающий категории и время выполнения.
 *
 * @module PlanTasks
 *
 * @function PlanTasks
 * @param {Object} props - Параметры для отображения и статистики задач.
 * @param {number} props.tasksCount - Общее число активных задач.
 * @param {string} props.tasksTime - Суммарное планируемое время выполнения всех задач (например, `"2ч 5мин"`).
 * @param {Array<Object>} props.tasks - Массив объектов с данными о задачах.
 * @param {string} props.tasks[].category - Категория задачи (например, `"Работа"`, `"Учёба"`).
 * @param {string} props.tasks[].description - Текстовое описание задачи.
 * @param {number} [props.tasks[].count] - Количество выполнений (если применимо).
 * @param {Object} props.statistics - Объект статистики для планируемых задач.
 * @param {string} props.statistics.nextLongBreak - Время следующего длинного перерыва.
 * @param {string} props.statistics.finishTime - Ожидаемое время завершения всех задач.
 * @param {Array<Object>} props.statistics.categories - Список категорий для статистики по плану.
 * @param {string} props.statistics.categories[].name - Название категории.
 * @param {number} props.statistics.categories[].count - Количество задач в данной категории.
 *
 * @throws {Error} Если `props` не переданы (значение `undefined`), выбрасывается исключение о невозможности рендеринга.
 *
 * @description
 * Компонент формирует целостный блок планируемых задач (`.plan_tasks`), включая интерфейс
 * для добавления, просмотра и анализа текущих задач.
 * Используется в главном компоненте приложения (`App`) как центральная зона рабочего процесса.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="plan_tasks">
 *   <!-- Заголовок -->
 *   <div class="plan_tasks__title"> ... </div>
 *
 *   <!-- Кнопка/форма добавления -->
 *   <button class="plan_tasks__add">Добавить задачу</button>
 *
 *   <!-- Список задач -->
 *   <ul class="plan_tasks__list"> ... </ul>
 *
 *   <!-- Статистика -->
 *   <div class="plan_tasks__statistics"> ... </div>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка блока планируемых задач.
 *
 * @example
 * import { PlanTasks } from './PlanTasks/index.js';
 *
 * const planHTML = PlanTasks({
 *   tasksCount: 5,
 *   tasksTime: "2ч 10мин",
 *   tasks: [
 *     { category: "Работа", description: "Написать отчёт", count: 1 },
 *     { category: "Учёба", description: "Прочитать главу по JS", count: 1 }
 *   ],
 *   statistics: {
 *     nextLongBreak: "12:00",
 *     finishTime: "18:00",
 *     categories: [
 *       { name: "Работа", count: 3 },
 *       { name: "Учёба", count: 2 }
 *     ]
 *   }
 * });
 *
 * document.querySelector('.main').innerHTML += planHTML;
 */
export function PlanTasks(props) {
    if (!props) {
        throw new Error("Failed to render PlanTasks. Props is undefined");
    }

    const { tasksCount, tasksTime, tasks, statistics } = props;

    const title = PlanTasksTitle({ tasksCount, tasksTime });
    const add = PlanTasksAdd();
    const list = PlanTasksList({ tasks });
    const stats = PlanTasksStatistics(statistics);

    return `
        <div class="plan_tasks">
            ${title}
            
            ${add}
            
            ${list}
            
            ${stats}
        </div>
    `;
}