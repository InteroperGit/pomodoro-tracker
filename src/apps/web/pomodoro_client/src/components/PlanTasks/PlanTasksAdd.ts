import globalStyles from "../global.module.scss";
import commonStyles from "./PlanTasksCommon.module.scss";
import styles from "./PlanTasksAdd.module.scss";
import {useEffect} from "../../utils/render.ts";
import type {PomodoroTask} from "../../types/task.ts";
import {generateId} from "../../utils/idGenerator.ts";
import {useAddTask} from "../../app/appContext.ts";

/**
 * Компонент `PlanTasksAdd` — панель добавления новых задач в разделе планируемых задач Pomodoro‑приложения.
 * Отображает поля для ввода категории и описания задачи, а также кнопку для её добавления.
 *
 * Используется внутри родительского компонента {@link PlanTasks} над списком текущих задач.
 *
 * @module PlanTasksAdd
 *
 * @function PlanTasksAdd
 *
 * @description
 * Компонент формирует интерфейс для ввода данных о новой задаче:
 * - Поле ввода категории (`.plan_tasks__add_category`);
 * - Поле ввода описания (`.plan_tasks__add_description`);
 * - Кнопка `"+"` для подтверждения добавления задачи.
 *
 * Разметка компонента контейнеризована в блок `.plan_tasks__add`
 * и предназначена для последующего связывания с логикой обработки событий (например, `onClick` на кнопке или `input`‑событиях).
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="plan_tasks__add">
 *   <input class="plan_tasks__add_category" placeholder="Категория" aria-label="категория">
 *   <input class="plan_tasks__add_description" placeholder="Описание" aria-label="описание">
 *   <button class="button plan_tasks__button">+</button>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка панели добавления новой задачи.
 *
 * @example
 * import { PlanTasksAdd } from './PlanTasksAdd.js';
 *
 * // Вставка панели в раздел задач
 * document.querySelector('.plan_tasks').insertAdjacentHTML('afterbegin', PlanTasksAdd());
 *
 * // Позднее можно добавить обработчик:
 * // document.querySelector('.plan_tasks__button').addEventListener('click', handleAddTask);
 */
export function  PlanTasksAdd(): string {
    const buttonId = generateId();
    const categoryInputId = generateId();
    const descriptionInputId = generateId();

    useEffect(() => {
        const button: HTMLButtonElement | null = document.getElementById(buttonId) as HTMLButtonElement | null;
        const categoryInput: HTMLInputElement | null = document.getElementById(categoryInputId) as HTMLInputElement | null;
        const descriptionInput: HTMLInputElement | null = document.getElementById(descriptionInputId) as HTMLInputElement | null;

        if (!button) {
            return;
        }

        if (!categoryInput) {
            return;
        }

        if (!descriptionInput) {
            return;
        }

        button.addEventListener("click", () => {
            const task: PomodoroTask = {
                id: generateId(),
                category: {
                    name: categoryInput.value
                },
                description: descriptionInput.value,
            }

            useAddTask(task);
        });
    });

    return `
         <div class="${styles.plan_tasks__add}">
            <input 
                id="${categoryInputId}"
                class="${styles.plan_tasks__add_category}" 
                placeholder="Категория" 
                aria-label="категория" 
            />
            
            <input 
                id="${descriptionInputId}"
                class="${styles.plan_tasks__add_description}" 
                placeholder="Описание" 
                aria-label="описание" 
            />
            
            <button 
                id="${buttonId}"
                class="${globalStyles.button} ${commonStyles.plan_task__button}"
            >
                +
            </button>
         </div>
    `;
}