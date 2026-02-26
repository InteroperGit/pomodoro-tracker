import globalStyles from "../global.module.scss";
import commonStyles from "../Common.module.scss";
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
 * Компонент `PlanTasksAdd` — форма для создания и добавления новых задач.
 *
 * Отображает поля ввода для категории и описания задачи, а также кнопку добавления.
 * Включает встроенную логику: обрабатывает клик по кнопке и нажатие клавиши `Enter` 
 * в полях ввода, валидирует данные (хотя бы одно поле должно быть заполнено), 
 * генерирует уникальный ID для новой задачи и автоматически очищает форму 
 * после успешного добавления.
 *
 * @param {PlanTaskAddProps} props - Пропсы компонента.
 * @param {Object} props.actions - Объект с функциями-обработчиками.
 * @param {function(PomodoroTask): void} props.actions.addTask - Функция, вызываемая для добавления созданной задачи в общий список.
 *
 * @returns {string} HTML-разметка формы добавления задачи.
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
                class="${globalStyles.button} ${commonStyles.outline_button}"
                aria-label="Добавить задачу"
            >
                +
            </button>
         </div>
    `;
}