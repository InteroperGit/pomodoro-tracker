import styles from "./PlanTask.module.scss";
import globalStyles from "../global.module.scss";
import commonStyles from "../Common.module.scss";
import { dropdownMarkup, useDropdown, dropdownStyles } from "../Dropdown";
import type {PlanPomodoroTask, PomodoroTask} from "../../types/task.ts";
import {useEffect} from "../../utils/render.ts";
import {generateId} from "../../utils/idGenerator.ts";
import {escapeHtml} from "../../utils/html.ts";

export type PlanTaskProps = {
    isMobile: boolean;
    planTaskIndex: number;
    planTask: PlanPomodoroTask;
    completingClass?: string;
    actions: {
        getEditingPlanTaskIndex: () => number | null | undefined;
        startEditTask: (index: number) => void;
        completeEditTask: (task: PomodoroTask) => void;
        cancelEditTask: () => void;
        incTask: (id: string) => void;
        decTask: (id: string) => void;
        archiveTask: (id: string) => void;
    }
}

/**
 * Компонент `PlanTask` — отображает запланированную задачу в списке.
 *
 * Поддерживает два состояния: режим просмотра и режим встроенного (inline) редактирования.
 * Включает выпадающее меню для управления количеством "помидоров" (добавить/убавить) 
 * и переноса задачи в архив. Поддерживает анимацию перед удалением/архивацией 
 * и адаптивную разметку (мобильная и десктопная версии).
 *
 * @param {PlanTaskProps} props - Пропсы компонента.
 * @param {boolean} props.isMobile - Флаг мобильной версии для изменения разметки.
 * @param {number} props.planTaskIndex - Индекс задачи в текущем списке.
 * @param {PlanPomodoroTask} props.planTask - Данные задачи (информация о задаче и счетчик "помидоров").
 * @param {string} [props.completingClass] - CSS-класс, применяемый для анимации перед архивацией задачи.
 * @param {Object} props.actions - Объект с функциями-обработчиками действий над задачей.
 * @param {function(): (number|null|undefined)} props.actions.getEditingPlanTaskIndex - Функция для получения индекса текущей редактируемой задачи.
 * @param {function(number): void} props.actions.startEditTask - Включает режим редактирования для данной задачи.
 * @param {function(PomodoroTask): void} props.actions.completeEditTask - Сохраняет изменённые данные задачи.
 * @param {function(): void} props.actions.cancelEditTask - Отменяет режим редактирования без сохранения.
 * @param {function(string): void} props.actions.incTask - Увеличивает количество "помидоров" (оценочное время) задачи.
 * @param {function(string): void} props.actions.decTask - Уменьшает количество "помидоров" задачи.
 * @param {function(string): void} props.actions.archiveTask - Отправляет задачу в архив (помечает как выполненную).
 *
 * @returns {string} HTML-разметка компонента запланированной задачи.
 */
export function PlanTask({ isMobile, planTaskIndex, planTask, completingClass, actions } : PlanTaskProps) {
    const { task, count } = planTask;
    const planTaskDivId = generateId();
    const taskCountId = generateId();
    const menuButtonId = generateId();
    const dropdownId = generateId();
    const menuIncId = generateId();
    const menuDecId = generateId();
    const menuArchiveId = generateId();
    const categoryInputId = generateId();
    const descriptionInputId = generateId();
    const addTaskButtonId = generateId();

    const editingPlanTaskIndex = actions.getEditingPlanTaskIndex();

    // Создание задачи для редактирования
    const createEditingTask = (categoryInput: HTMLInputElement, descriptionInput: HTMLInputElement): PomodoroTask => {
        return {
            id: task.id,
            category: {
                name: categoryInput.value.trim(),
            },
            description: descriptionInput.value.trim()
        };
    };

    // Валидация задачи
    const isValidTask = (task: PomodoroTask): boolean => {
        return task.category.name.length > 0 || task.description.length > 0;
    };

    useEffect(() => {
        const planTaskDiv = document.getElementById(planTaskDivId) as HTMLDivElement | null;
        const taskCountDiv = document.getElementById(taskCountId) as HTMLDivElement | null;
        const menuButton = document.getElementById(menuButtonId) as HTMLButtonElement | null;
        const dropdown = document.getElementById(dropdownId) as HTMLDivElement | null;

        if (!planTaskDiv || !taskCountDiv || !menuButton || !dropdown) {
            return;
        }

        const cleanupDropdown = useDropdown({
            buttonId: menuButtonId,
            dropdownId,
            openClass: dropdownStyles.dropdown_open,
            itemHandlers: {
                [menuIncId]: () => actions.incTask(task.id),
                [menuDecId]: () => actions.decTask(task.id),
                [menuArchiveId]: () => {
                    const willRemove = count === 1;
                    const li = planTaskDiv.closest("li[data-index]") as HTMLLIElement | null;
                    if (willRemove && li && completingClass) {
                        li.classList.add(completingClass);
                        let done = false;
                        const doArchive = () => {
                            if (done) return;
                            done = true;
                            li.removeEventListener("transitionend", onEnd);
                            actions.archiveTask(task.id);
                        };
                        const onEnd = () => doArchive();
                        li.addEventListener("transitionend", onEnd);
                        setTimeout(doArchive, 1100);
                    } else {
                        actions.archiveTask(task.id);
                    }
                },
            },
        });

        const handlePlanTaskClick = (e: MouseEvent) => {
            if (planTaskIndex === editingPlanTaskIndex) {
                return;
            }
            const node = e.target as Node;
            if (
                taskCountDiv.contains(node) ||
                menuButton.contains(node) ||
                dropdown.contains(node)
            ) {
                return;
            }
            actions.startEditTask(planTaskIndex);
        };

        const handleTaskCountClick = () => {
            actions.incTask(task.id);
        };

        planTaskDiv.addEventListener("click", handlePlanTaskClick);
        taskCountDiv.addEventListener("click", handleTaskCountClick);

        return () => {
            cleanupDropdown();
            planTaskDiv.removeEventListener("click", handlePlanTaskClick);
            taskCountDiv.removeEventListener("click", handleTaskCountClick);
        };
    });

    useEffect(() => {
        if (editingPlanTaskIndex == null || planTaskIndex !== editingPlanTaskIndex) {
            return;
        }

        const categoryInput: HTMLInputElement | null = document.getElementById(categoryInputId) as HTMLInputElement | null;
        const descriptionInput: HTMLInputElement | null = document.getElementById(descriptionInputId) as HTMLInputElement | null;
        const addTaskButton: HTMLButtonElement | null = document.getElementById(addTaskButtonId) as HTMLButtonElement | null;

        if (!categoryInput || !descriptionInput || !addTaskButton) {
            return;
        }

        // Автофокус на первое поле при редактировании
        categoryInput.focus();
        categoryInput.select();

        const handleSave = () => {
            const editingTask = createEditingTask(categoryInput, descriptionInput);
            if (isValidTask(editingTask)) {
                actions.completeEditTask(editingTask);
            }
        };

        const inputKeyDownHandler = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.code === 'Enter') {
                e.preventDefault();
                handleSave();
            }
            else if (e.key === 'Escape' || e.code === 'Escape') {
                e.preventDefault();
                actions.cancelEditTask();
            }
        };

        const addTaskButtonClickHandler = (e: PointerEvent) => {
            e.preventDefault();
            handleSave();
        };

        categoryInput.addEventListener('keydown', inputKeyDownHandler);
        descriptionInput.addEventListener('keydown', inputKeyDownHandler);
        addTaskButton.addEventListener('click', addTaskButtonClickHandler);

        return () => {
            categoryInput.removeEventListener('keydown', inputKeyDownHandler);
            descriptionInput.removeEventListener('keydown', inputKeyDownHandler);
            addTaskButton.removeEventListener('click', addTaskButtonClickHandler);
        };
    });

    const isEditing = editingPlanTaskIndex != null && planTaskIndex === editingPlanTaskIndex;
    const escapedCategory = escapeHtml(task.category?.name);
    const escapedDescription = escapeHtml(task.description);

    const planTaskMenuMarkup = dropdownMarkup({
        wrapClass: styles.plan_task__menu_wrap,
        buttonId: menuButtonId,
        buttonClass: `${globalStyles.button} ${commonStyles.outline_button} ${styles.plan_task__menu_button}`,
        buttonContent: "…",
        buttonAriaLabel: "Действия с задачей",
        dropdownId,
        items: [
            { id: menuIncId, content: "+ помидор" },
            { id: menuDecId, content: "− помидор" },
            { id: menuArchiveId, content: "В архив" },
        ],
    });

    // Общая разметка для режима редактирования
    const editModeMarkup = `
        <div 
            id="${planTaskDivId}"
            data-planTaskId="${task.id}"
            class="${styles.plan_task}">
            <div class="${styles.plan_task__category}">
                <input 
                    id="${categoryInputId}"
                    class="${styles.plan_task_input}"
                    value="${escapedCategory}" 
                    aria-label="Категория задачи"
                />
            </div>
            <div class="${styles.plan_task__description}">
                <input 
                    id="${descriptionInputId}"
                    class="${styles.plan_task_input}"
                    value="${escapedDescription}" 
                    aria-label="Описание задачи"
                />
            </div>
            <button 
                id="${addTaskButtonId}"
                class="${globalStyles.button} ${commonStyles.outline_button}"
                aria-label="Сохранить изменения">
                S
            </button>
        </div>
    `;

    const mobileViewMarkup = `
        <div 
            id="${planTaskDivId}"
            data-planTaskId="${task.id}"
            class="${styles.plan_task} ${styles.plan_task_mobile}">
            <div class="${styles.plan_task__category} ${styles.plan_task__category_mobile}">
                ${escapedCategory}
            </div>
            <div class="${styles.plan_task__description} ${styles.plan_task__description_mobile}">
                ${escapedDescription}
            </div>
            <div class="${styles.plan_task__actions}">
                <div 
                    id="${taskCountId}"
                    class="${styles.plan_task__count} ${styles.plan_task__count_mobile}"
                    role="status"
                    aria-label="Количество помидоро">
                    ${count}
                </div>
                ${planTaskMenuMarkup}
            </div>
        </div>
    `;

    const desktopViewMarkup = `
        <div 
            id="${planTaskDivId}"
            data-planTaskId="${task.id}"
            class="${styles.plan_task}">
            <div class="${styles.plan_task__category}">
                ${escapedCategory}
            </div>
            <div class="${styles.plan_task__description}">
                ${escapedDescription}
            </div>
            <div class="${styles.plan_task__actions}">
                <div 
                    id="${taskCountId}"
                    class="${styles.plan_task__count}"
                    role="status"
                    aria-label="Количество помидоро">
                    ${count}
                </div>
                ${planTaskMenuMarkup}
            </div>
        </div>
    `;

    if (isEditing) {
        return editModeMarkup;
    }

    return isMobile ? mobileViewMarkup : desktopViewMarkup;
}