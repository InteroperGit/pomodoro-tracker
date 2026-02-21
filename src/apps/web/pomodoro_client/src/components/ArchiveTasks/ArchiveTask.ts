import type {ArchivePomodoroTask, PomodoroTask} from "../../types/task";
import styles from "./ArchiveTask.module.scss";
import globalStyles from "../global.module.scss";
import commonStyles from "../Common.module.scss";
import { dropdownMarkup, useDropdown, dropdownStyles } from "../Dropdown";
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
    index: number;
    actions: {
        deleteArchiveTask: (index: number) => void;
        refreshTask: (task: PomodoroTask) => void;
    };
};

export function ArchiveTask({ isMobile, archiveTask, index, actions }: ArchiveTaskProps) {
    const { task, taskTime, completedAt } = archiveTask;
    const { category, description } = task;

    const archiveTaskDivId = generateId();
    const refreshButtonId = generateId();
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

    const menuBlock = dropdownMarkup({
        wrapClass: styles.archive_task__menu_wrap,
        buttonId: menuButtonId,
        buttonClass: `${globalStyles.button} ${commonStyles.outline_button} ${styles.archive_task__menu_button}`,
        buttonContent: "…",
        buttonAriaLabel: "Действия с задачей",
        dropdownId,
        items: [{ id: menuDeleteId, content: "Удалить" }],
    });

    const refreshButtonMarkup = `
        <button id="${refreshButtonId}" 
                class="${globalStyles.button} ${commonStyles.outline_button} ${styles.archive_task__refresh_button}"
                aria-label="Обновить задачу">
            <i class="fa-solid fa-arrow-rotate-left ${styles.archive_task__refresh_icon}" aria-hidden="true"></i>
        </button>
    `;

    useEffect(() => {
        const unsubscribeDropdown = useDropdown({
            buttonId: menuButtonId,
            dropdownId,
            openClass: dropdownStyles.dropdown_open,
            itemHandlers: {
                [menuDeleteId]: () => actions.deleteArchiveTask(index),
            },
        });

        const refreshButton = document.getElementById(refreshButtonId);
        if (refreshButton) {
            const handleRefreshClick = () => {
                actions.refreshTask(task);
            };
            refreshButton.addEventListener('click', handleRefreshClick);
            return () => {
                refreshButton.removeEventListener('click', handleRefreshClick);
                unsubscribeDropdown();
            };
        }
        return unsubscribeDropdown;
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
                    ${refreshButtonMarkup}
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
            ${refreshButtonMarkup}
            ${menuBlock}
        </div>
    `;
}
