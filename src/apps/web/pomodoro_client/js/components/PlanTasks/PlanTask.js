/**
 * Компонент `PlanTask` — элемент списка активных (планируемых) задач Pomodoro‑приложения.
 * Отображает одну задачу с её категорией, описанием, количеством и кнопками управления.
 *
 * Используется внутри родительского компонента {@link PlanTasksList} для формирования общего списка задач.
 *
 * @module PlanTask
 *
 * @function PlanTask
 * @param {Object} params - Параметры компонента.
 * @param {Object} params.task - Объект, описывающий задачу.
 * @param {string} params.task.category - Категория задачи (например, `"Работа"`, `"Учёба"`, `"Дом"`).
 * @param {string} params.task.description - Текстовое описание задачи.
 * @param {number} params.task.count - Количество оставшихся или запланированных повторений (Pomodoro‑циклов).
 *
 * @description
 * Компонент возвращает HTML‑разметку одной задачи.
 * Кроме текстовой информации (категория, описание, количество), содержит две управляющие кнопки:
 *
 * - Кнопка `"+"` для увеличения счётчика (`count`);
 * - Кнопка `"-"` для уменьшения счётчика.
 *
 * Разметка задачи формируется в виде блока `.plan_task`, каждая часть которого имеет свой CSS‑класс для стилизации.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="plan_task">
 *   <div class="plan_task__category">Работа</div>
 *   <div class="plan_task__description">Подготовить отчёт</div>
 *   <div class="plan_task__count">2</div>
 *   <button class="button plan_task__button">+</button>
 *   <button class="button plan_task__button">-</button>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка отдельного элемента списка задач.
 *
 * @example
 * import { PlanTask } from './PlanTask.js';
 *
 * const itemHTML = PlanTask({
 *   task: {
 *     category: "Работа",
 *     description: "Написать статью о Pomodoro",
 *     count: 3
 *   }
 * });
 *
 * document.querySelector('.plan_tasks__list').insertAdjacentHTML('beforeend', itemHTML);
 */
export function PlanTask({ task }) {
    return `
          <div class="plan_task">
              <div class="plan_task__category">
                  ${task.category}
              </div>
              <div class="plan_task__description">
                  ${task.description}
              </div>
              <div class="plan_task__count">
                  ${task.count}
              </div>
              <button class="button plan_task__button">+</button>
              <button class="button plan_task__button">-</button>
          </div>  
    `
}