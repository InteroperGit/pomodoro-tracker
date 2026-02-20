import styles from "./PlanTask.module.scss";
import globalStyles from "../global.module.scss";
import commonStyles from "./PlanTasksCommon.module.scss";
import type {PlanPomodoroTask, PomodoroTask} from "../../types/task.ts";
import {useEffect} from "../../utils/render.ts";
import {generateId} from "../../utils/idGenerator.ts";
import {escapeHtml} from "../../utils/html.ts";

export type PlanTaskProps = {
    isMobile: boolean;
    planTask: PlanPomodoroTask;
    actions: {
        getEditingTaskId: () => string | null | undefined;
        startEditTask: (id: string) => void;
        completeEditTask: (task: PomodoroTask) => void;
        cancelEditTask: () => void;
        incTask: (id: string) => void;
        decTask: (id: string) => void;
        archiveTask: (id: string) => void;
    }
}

export function PlanTask({ isMobile, planTask, actions } : PlanTaskProps) {
    const { task, count } = planTask;
    const planTaskDivId = generateId();
    const taskCountId = generateId();
    const incButtonId = generateId();
    const decButtonId = generateId();
    const archiveTaskButtonId = generateId();
    const categoryInputId = generateId();
    const descriptionInputId = generateId();
    const addTaskButtonId = generateId();

    const editingTaskId = actions.getEditingTaskId();

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
        const planTaskDiv: HTMLDivElement | null = document.getElementById(planTaskDivId) as HTMLDivElement | null;
        const taskCountDiv: HTMLDivElement | null = document.getElementById(taskCountId) as HTMLDivElement | null;
        const incButton: HTMLButtonElement | null = document.getElementById(incButtonId) as HTMLButtonElement | null;
        const decButton: HTMLButtonElement | null = document.getElementById(decButtonId) as HTMLButtonElement | null;
        const archiveTaskButton: HTMLButtonElement | null = document.getElementById(archiveTaskButtonId) as HTMLButtonElement | null;

        if (!planTaskDiv || !taskCountDiv || !incButton || !decButton || !archiveTaskButton) {
            return;
        }

        const handlePlanTaskClick = (e: MouseEvent) => {
            if (task.id === editingTaskId) {
                return;
            }

            const node = e.target as Node;

            if (taskCountDiv.contains(node)
                || incButton.contains(node)
                || decButton.contains(node)
                || archiveTaskButton.contains(node)) {
                return;
            }

            actions.startEditTask(task.id);
        };

        const handleTaskCountClick = () => {
            actions.incTask(task.id);
        };

        const handleIncClick = () => {
            actions.incTask(task.id);
        };

        const handleDecClick = () => {
            actions.decTask(task.id);
        };

        const handleArchiveClick = () => {
            actions.archiveTask(task.id);
        };

        planTaskDiv.addEventListener("click", handlePlanTaskClick);
        taskCountDiv.addEventListener("click", handleTaskCountClick);
        incButton.addEventListener("click", handleIncClick);
        decButton.addEventListener("click", handleDecClick);
        archiveTaskButton.addEventListener("click", handleArchiveClick);

        return () => {
            planTaskDiv.removeEventListener("click", handlePlanTaskClick);
            taskCountDiv.removeEventListener("click", handleTaskCountClick);
            incButton.removeEventListener("click", handleIncClick);
            decButton.removeEventListener("click", handleDecClick);
            archiveTaskButton.removeEventListener("click", handleArchiveClick);
        };
    });

    useEffect(() => {
        if (!editingTaskId || task.id !== editingTaskId) {
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

    const isEditing = editingTaskId != null && task.id === editingTaskId;
    const escapedCategory = escapeHtml(task.category?.name);
    const escapedDescription = escapeHtml(task.description);

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
                class="${globalStyles.button} ${commonStyles.plan_task__button}"
                aria-label="Сохранить изменения">
                S
            </button>
        </div>
    `;

    // Разметка для мобильной версии (режим просмотра)
    const mobileViewMarkup = `
        <div 
            id="${planTaskDivId}"
            data-planTaskId="${task.id}"
            class="${styles.plan_task_mobile}">
            <div class="${styles.plan_task__task}">
                <div class="${styles.plan_task__category} ${styles.plan_task__category_mobile}">
                    ${escapedCategory}
                </div>
                <div class="${styles.plan_task__description} ${styles.plan_task__description_mobile}">
                    ${escapedDescription}
                </div>
            </div>
            <div class="${styles.plan_task__toolbar}">
                <div 
                    id="${taskCountId}"
                    class="${styles.plan_task__count}"
                    role="status"
                    aria-label="Количество помодоро">
                    ${count}
                </div>
                <button
                    id="${incButtonId}" 
                    class="${globalStyles.button} ${commonStyles.plan_task__button}"
                    aria-label="Увеличить количество помодоро">
                    +
                </button>
                <button 
                    id="${decButtonId}"
                    class="${globalStyles.button} ${commonStyles.plan_task__button}"
                    aria-label="Уменьшить количество помодоро">
                    -
                </button>
                <button 
                    id="${archiveTaskButtonId}"
                    class="${globalStyles.button} ${commonStyles.plan_task__button}"
                    aria-label="Архивировать задачу">
                    C
                </button>
            </div>
        </div>
    `;

    // Разметка для десктопной версии (режим просмотра)
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
            <div 
                id="${taskCountId}"
                class="${styles.plan_task__count}"
                role="status"
                aria-label="Количество помодоро">
                ${count}
            </div>
            <button
                id="${incButtonId}" 
                class="${globalStyles.button} ${commonStyles.plan_task__button}"
                aria-label="Увеличить количество помодоро">
                +
            </button>
            <button 
                id="${decButtonId}"
                class="${globalStyles.button} ${commonStyles.plan_task__button}"
                aria-label="Уменьшить количество помодоро">
                -
            </button>
            <button 
                id="${archiveTaskButtonId}"
                class="${globalStyles.button} ${commonStyles.plan_task__button}"
                aria-label="Архивировать задачу">
                C
            </button>
        </div>
    `;

    if (isEditing) {
        return editModeMarkup;
    }

    return isMobile ? mobileViewMarkup : desktopViewMarkup;
}