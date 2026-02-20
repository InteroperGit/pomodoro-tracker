import type {ArchivePomodoroTask} from "../../types/task";
import styles from "./ArchiveTask.module.scss";
import globalStyles from "../global.module.scss";
import commonStyles from "../Common.module.scss";
import {toHumanMinutesSecondsTime, formatDateTime} from "../../utils/time.ts";
import {escapeHtml} from "../../utils/html.ts";
import {useEffect} from "../../utils/render.ts";
import {generateId} from "../../utils/idGenerator.ts";

/**
 * Компонент `ArchiveTask` — отображает одну архивную задачу в списке выполненных задач.
 *
 * Показывает категорию, описание, время выполнения задачи и время завершения.
 * Поддерживает подменю с кнопкой «Удалить» для удаления задачи из архива.
 * Поддерживает мобильную и десктопную версии с разной разметкой.
 *
 * @module ArchiveTask
 *
 * @param {ArchiveTaskProps} props - Пропсы компонента
 * @param {boolean} props.isMobile - Флаг мобильной версии
 * @param {ArchivePomodoroTask} props.archiveTask - Данные архивной задачи
 * @param {ArchiveTaskActions} props.actions - Действия (удаление из архива)
 *
 * @returns {string} HTML-разметка архивной задачи
 */
export type ArchiveTaskProps = {
    isMobile: boolean;
    archiveTask: ArchivePomodoroTask;
    actions: {
        deleteArchiveTask: (id: string) => void;
    };
};

export function ArchiveTask({ isMobile, archiveTask, actions }: ArchiveTaskProps) {
    const { task, taskTime, completedAt } = archiveTask;
    const { category, description } = task;

    const archiveTaskDivId = generateId();
    const menuButtonId = generateId();
    const dropdownId = generateId();
    const menuDeleteId = generateId();

    // Форматирование времени выполнения задачи
    const humanTaskTime = toHumanMinutesSecondsTime(taskTime);

    // Форматирование времени завершения с учетом даты
    const completedTime = formatDateTime(completedAt);

    // Экранирование пользовательского контента для защиты от XSS
    const escapedCategory = escapeHtml(category?.name ?? '');
    const escapedDescription = escapeHtml(description ?? '');

    // Общая разметка времени выполнения и завершения
    const timeMarkup = `
        <div class="${styles.archive_task__task_time}" role="text" aria-label="Время выполнения задачи">
            ${humanTaskTime}
        </div>
        <div class="${styles.archive_task__divider}" aria-hidden="true">
            /
        </div>
        <time 
            class="${styles.archive_task__task_time}" 
            datetime="${completedTime.iso}"
            role="text"
            aria-label="Время завершения задачи">
            ${completedTime.display}
        </time>
    `;

    const menuBlock = `
        <div class="${styles.archive_task__menu_wrap}">
            <button
                id="${menuButtonId}"
                type="button"
                class="${globalStyles.button} ${commonStyles.outline_button} ${styles.archive_task__menu_button}"
                aria-label="Действия с задачей"
                aria-haspopup="true"
                aria-expanded="false">
                …
            </button>
            <div
                id="${dropdownId}"
                class="${styles.archive_task__dropdown}"
                role="menu"
                aria-hidden="true">
                <button type="button" id="${menuDeleteId}" class="${styles.archive_task__dropdown_item}" role="menuitem">Удалить</button>
            </div>
        </div>
    `;

    useEffect(() => {
        const archiveTaskDiv = document.getElementById(archiveTaskDivId) as HTMLDivElement | null;
        const menuButton = document.getElementById(menuButtonId) as HTMLButtonElement | null;
        const dropdown = document.getElementById(dropdownId) as HTMLDivElement | null;
        const menuDelete = document.getElementById(menuDeleteId) as HTMLButtonElement | null;

        if (!archiveTaskDiv || !menuButton || !dropdown || !menuDelete) {
            return;
        }

        const openClass = styles.archive_task__dropdown_open;
        const MARGIN = 8;
        const menuWrap = menuButton.parentElement;

        const positionDropdown = () => {
            if (menuWrap && dropdown.parentElement !== document.body) {
                document.body.appendChild(dropdown);
            }
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
            if (left + dr.width > vw - MARGIN) {
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
            if (menuWrap && dropdown.parentElement === document.body) {
                menuWrap.insertBefore(dropdown, menuButton.nextSibling);
            }
        };

        const isOpen = () => dropdown.classList.contains(openClass);

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

        const handleMenuDelete = () => {
            actions.deleteArchiveTask(task.id);
            closeDropdown();
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

        menuButton.addEventListener("click", handleMenuButtonClick);
        menuDelete.addEventListener("click", handleMenuDelete);
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            if (dropdown.parentElement === document.body) {
                document.body.removeChild(dropdown);
            }
            menuButton.removeEventListener("click", handleMenuButtonClick);
            menuDelete.removeEventListener("click", handleMenuDelete);
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    });

    // Мобильная версия
    if (isMobile) {
        return `
            <div id="${archiveTaskDivId}" class="${styles.archive_task_mobile}">
                <div class="${styles.archive_task__task}">
                    <div class="${styles.archive_task__category} ${styles.archive_task__category_mobile}">
                        ${escapedCategory}
                    </div>
                    <div class="${styles.archive_task__description} ${styles.archive_task__description_mobile}">
                        ${escapedDescription}
                    </div>
                </div>
                <div class="${styles.archive_task__time}">
                    ${timeMarkup}
                    ${menuBlock}
                </div>
            </div>
        `;
    }

    // Десктопная версия
    return `
        <div id="${archiveTaskDivId}" class="${styles.archive_task}">
            <div class="${styles.archive_task__category}">
                ${escapedCategory}
            </div>
            <div class="${styles.archive_task__description}">
                ${escapedDescription}
            </div>
            ${timeMarkup}
            ${menuBlock}
        </div>
    `;
}
