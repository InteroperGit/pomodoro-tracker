import {PlanTask} from "./PlanTask.ts";
import type {PlanPomodoroTask, PomodoroTask} from "../../types/task.ts";
import styles from "./PlanTaskList.module.scss";
import taskStyles from "./PlanTask.module.scss";
import {generateId} from "../../utils/idGenerator.ts";
import {useEffect} from "../../utils/render.ts";

export type PlanTasksListProps = {
    tasks: PlanPomodoroTask[];
    actions: {
        getEditingTaskId: () => string | null | undefined;
        startEditTask: (id: string) => void;
        completeEditTask: (task: PomodoroTask) => void;
        cancelEditTask: () => void;
        incTask: (id: string) => void;
        decTask: (id: string) => void;
        reorderTasks: (fromIndex: number, toIndex: number) => void;
    }
};

export function PlanTaskList({ tasks, actions }: PlanTasksListProps) {
    const ulId = generateId();

    useEffect(() => {
        const ul = document.getElementById(ulId);

        if (!ul) {
            return;
        }

        let dragFromIndex: number | null = null;
        let draggedElement: HTMLLIElement | null = null;
        const overCount = new Map<HTMLLIElement, number>();

        ul.querySelectorAll("li[data-index]").forEach((li: Element) => {
            const listItem = li as HTMLLIElement;

            listItem.draggable = true;

            listItem.addEventListener("dragstart", (e) => {
                const li = e.target as HTMLLIElement;
                dragFromIndex  = Number(li.dataset.index);
                draggedElement = li;
                li.classList.add(taskStyles.plan_task__dragging);
                // Firefox требует
                e.dataTransfer?.setData("text/plain", String(dragFromIndex));
            });
            listItem.addEventListener("dragover", (e) => {
                e.preventDefault(); // обязательно!
                e.dataTransfer!.dropEffect = "move";
            });
            listItem.addEventListener("dragenter", (e) => {
                e.preventDefault();
                const count = (overCount.get(listItem) ?? 0) + 1;
                overCount.set(listItem, count);

                if (count === 1) { // ← добавляем класс ТОЛЬКО при первом входе
                    listItem.classList.add(taskStyles.plan_task__drag_over);
                }
            });
            listItem.addEventListener("dragleave", (e) => {
                e.preventDefault();
                const count = (overCount.get(listItem) ?? 0) - 1;
                overCount.set(listItem, count);

                if (count === 0) { // ← убираем класс ТОЛЬКО при полном выходе
                    listItem.classList.remove(taskStyles.plan_task__drag_over);
                }
            });
            listItem.addEventListener("drop", (e) => {
                e.preventDefault();

                const li = e.currentTarget as HTMLLIElement;
                li.classList.remove(taskStyles.plan_task__drag_over);

                const toIndex = Number(li.dataset.index);
                const fromIndex = dragFromIndex ?? Number(e.dataTransfer?.getData("text/plain"));

                if (!Number.isNaN(fromIndex) && !Number.isNaN(toIndex) && fromIndex !== toIndex) {
                    actions.reorderTasks(fromIndex, toIndex);
                }

                if (draggedElement) {
                    draggedElement.classList.remove(taskStyles.plan_task__dragging,
                        taskStyles.plan_task__drag_over);
                    draggedElement = null;
                }

                dragFromIndex = null;
            });
            listItem.addEventListener("dragend", () => {
                // убираем все классы
                ul.querySelectorAll('li').forEach(li => {
                    li.classList.remove(taskStyles.plan_task__dragging, taskStyles.plan_task__drag_over);
                });
                dragFromIndex = null;
                draggedElement = null;
            });
        });
    });

    const taskItems = tasks.map((planTask, index) => {
        const taskItem = PlanTask({ planTask, actions });

        return `
            <li data-index="${index}">
                ${taskItem}
            </li>
        `
    }).join("");

    return `
        <ul 
            id="${ulId}"
            class="${styles.plan_tasks__list}">
            ${taskItems}
        </ul>
    `;
}