import globalStyles from "../global.module.scss";
import commonStyles from "./PlanTasksCommon.module.scss";
import styles from "./PlanTasksAdd.module.scss";
import {useEffect} from "../../utils/render.ts";
import type {PomodoroTask} from "../../types/task.ts";
import {generateId} from "../../utils/idGenerator.ts";

export type PlanTaskAddProps = {
    actions: {
        addTask: (task: PomodoroTask) => void;
    }
}

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
export function  PlanTasksAdd(props: PlanTaskAddProps): string {
    const { actions } = props;
    const buttonId = generateId();
    const categoryInputId = generateId();
    const descriptionInputId = generateId();

    useEffect(() => {
        const button: HTMLButtonElement | null = document.getElementById(buttonId) as HTMLButtonElement | null;
        const categoryInput: HTMLInputElement | null = document.getElementById(categoryInputId) as HTMLInputElement | null;
        const descriptionInput: HTMLInputElement | null = document.getElementById(descriptionInputId) as HTMLInputElement | null;

        if (!button || !categoryInput || !descriptionInput) {
            return;
        }

        const createTask = (): PomodoroTask => {
            return {
                id: generateId(),
                category: {
                    name: categoryInput.value.trim(),
                },
                description: descriptionInput.value.trim(),
            } as PomodoroTask;
        };

        const isValidTask = (task: PomodoroTask): boolean => {
            return task.category.name.length > 0 || task.description.length > 0;
        };

        const clearInputs = () => {
            categoryInput.value = '';
            descriptionInput.value = '';
            categoryInput.focus();
        };

        const handleAddTask = () => {
            const newTask = createTask();
            if (isValidTask(newTask)) {
                actions.addTask(newTask);
                clearInputs();
            }
        };

        const inputKeyDownHandler = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.code === 'Enter') {
                e.preventDefault();
                handleAddTask();
            }
        };

        const buttonClickHandler = () => {
            handleAddTask();
        };

        button.addEventListener("click", buttonClickHandler);
        categoryInput.addEventListener("keydown", inputKeyDownHandler);
        descriptionInput.addEventListener("keydown", inputKeyDownHandler);

        return () => {
            button.removeEventListener("click", buttonClickHandler);
            categoryInput.removeEventListener("keydown", inputKeyDownHandler);
            descriptionInput.removeEventListener("keydown", inputKeyDownHandler);
        };
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
                aria-label="Добавить задачу"
            >
                +
            </button>
         </div>
    `;
}