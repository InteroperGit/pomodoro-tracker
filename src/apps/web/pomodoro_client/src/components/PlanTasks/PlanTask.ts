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
    const menuButtonId = generateId();
    const dropdownId = generateId();
    const menuIncId = generateId();
    const menuDecId = generateId();
    const menuArchiveId = generateId();
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
        const planTaskDiv = document.getElementById(planTaskDivId) as HTMLDivElement | null;
        const taskCountDiv = document.getElementById(taskCountId) as HTMLDivElement | null;
        const menuButton = document.getElementById(menuButtonId) as HTMLButtonElement | null;
        const dropdown = document.getElementById(dropdownId) as HTMLDivElement | null;
        const menuInc = document.getElementById(menuIncId) as HTMLButtonElement | null;
        const menuDec = document.getElementById(menuDecId) as HTMLButtonElement | null;
        const menuArchive = document.getElementById(menuArchiveId) as HTMLButtonElement | null;

        if (!planTaskDiv || !taskCountDiv || !menuButton || !dropdown || !menuInc || !menuDec || !menuArchive) {
            return;
        }

        const openClass = styles.plan_task__dropdown_open;
        const MARGIN = 8;

        const positionDropdown = () => {
            const rect = menuButton.getBoundingClientRect();
            dropdown.style.visibility = "hidden";
            dropdown.classList.add(openClass);
            const dr = dropdown.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let top: number;
            const canOpenBelow = rect.bottom + dr.height + MARGIN <= vh;
            const canOpenAbove = rect.top - dr.height - MARGIN >= 0;
            const fallbackTop = Math.max(MARGIN, Math.min(rect.bottom, vh - dr.height - MARGIN));

            if (canOpenBelow) {
                top = rect.bottom + MARGIN;
            } else if (canOpenAbove) {
                top = rect.top - dr.height - MARGIN;
            } else {
                top = fallbackTop;
            }

            let left = rect.left;
            if (left + dr.width > vw - MARGIN)  {
                left = vw - dr.width - MARGIN;
            }

            if (left < MARGIN) {
                left = MARGIN;
            }

            dropdown.style.top = `${top}px`;
            dropdown.style.left = `${left}px`;
            dropdown.style.visibility = "";
        };

        const closeDropdown = () => {
            dropdown.classList.remove(openClass);
            dropdown.setAttribute("aria-hidden", "true");
            menuButton.setAttribute("aria-expanded", "false");
        };

        const isOpen = () => dropdown.classList.contains(openClass);

        const handlePlanTaskClick = (e: MouseEvent) => {
            if (task.id === editingTaskId) {
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
            actions.startEditTask(task.id);
        };

        const handleTaskCountClick = () => {
            actions.incTask(task.id);
        };

        const handleMenuButtonClick = (e: MouseEvent) => {
            e.stopPropagation();
            if (isOpen()) {
                closeDropdown();
            } else {
                positionDropdown();
                dropdown.setAttribute("aria-hidden", "false");
                menuButton.setAttribute("aria-expanded", "true");
            }
        };

        const handleMenuInc = () => {
            actions.incTask(task.id);
        };
        const handleMenuDec = () => {
            actions.decTask(task.id);
        };
        const handleMenuArchive = () => {
            actions.archiveTask(task.id);
        };

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (isOpen() && !dropdown.contains(target) && !menuButton.contains(target)) {
                closeDropdown();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen()) {
                closeDropdown();
            }
        };

        planTaskDiv.addEventListener("click", handlePlanTaskClick);
        taskCountDiv.addEventListener("click", handleTaskCountClick);
        menuButton.addEventListener("click", handleMenuButtonClick);
        menuInc.addEventListener("click", handleMenuInc);
        menuDec.addEventListener("click", handleMenuDec);
        menuArchive.addEventListener("click", handleMenuArchive);
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            planTaskDiv.removeEventListener("click", handlePlanTaskClick);
            taskCountDiv.removeEventListener("click", handleTaskCountClick);
            menuButton.removeEventListener("click", handleMenuButtonClick);
            menuInc.removeEventListener("click", handleMenuInc);
            menuDec.removeEventListener("click", handleMenuDec);
            menuArchive.removeEventListener("click", handleMenuArchive);
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
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
                <div class="${styles.plan_task__menu_wrap}">
                    <button
                        id="${menuButtonId}"
                        type="button"
                        class="${globalStyles.button} ${commonStyles.plan_task__button} ${styles.plan_task__menu_button}"
                        aria-label="Действия с задачей"
                        aria-haspopup="true"
                        aria-expanded="false">
                        …
                    </button>
                    <div
                        id="${dropdownId}"
                        class="${styles.plan_task__dropdown}"
                        role="menu"
                        aria-hidden="true">
                        <button type="button" id="${menuIncId}" class="${styles.plan_task__dropdown_item}" role="menuitem">+ помидор</button>
                        <button type="button" id="${menuDecId}" class="${styles.plan_task__dropdown_item}" role="menuitem">− помидор</button>
                        <button type="button" id="${menuArchiveId}" class="${styles.plan_task__dropdown_item}" role="menuitem">В архив</button>
                    </div>
                </div>
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
            <div class="${styles.plan_task__menu_wrap}">
                <button
                    id="${menuButtonId}"
                    type="button"
                    class="${globalStyles.button} ${commonStyles.plan_task__button} ${styles.plan_task__menu_button}"
                    aria-label="Действия с задачей"
                    aria-haspopup="true"
                    aria-expanded="false">
                    …
                </button>
                <div
                    id="${dropdownId}"
                    class="${styles.plan_task__dropdown}"
                    role="menu"
                    aria-hidden="true">
                    <button type="button" id="${menuIncId}" class="${styles.plan_task__dropdown_item}" role="menuitem">+ помидор</button>
                    <button type="button" id="${menuDecId}" class="${styles.plan_task__dropdown_item}" role="menuitem">− помидор</button>
                    <button type="button" id="${menuArchiveId}" class="${styles.plan_task__dropdown_item}" role="menuitem">В архив</button>
                </div>
            </div>
        </div>
    `;

    if (isEditing) {
        return editModeMarkup;
    }

    return isMobile ? mobileViewMarkup : desktopViewMarkup;
}