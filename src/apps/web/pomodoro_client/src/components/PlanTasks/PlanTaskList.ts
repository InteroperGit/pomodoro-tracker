import {PlanTask} from "./PlanTask.ts";
import type {PlanPomodoroTask, PomodoroTask} from "../../types/task.ts";
import styles from "./PlanTaskList.module.scss";
import taskStyles from "./PlanTask.module.scss";
import {generateId} from "../../utils/idGenerator.ts";
import {useEffect} from "../../utils/render.ts";

export type PlanTasksListProps = {
    isMobile: boolean;
    tasks: PlanPomodoroTask[];
    actions: {
        getEditingPlanTaskIndex: () => number | null | undefined;
        startEditTask: (index: number) => void;
        completeEditTask: (task: PomodoroTask) => void;
        cancelEditTask: () => void;
        incTask: (id: string) => void;
        decTask: (id: string) => void;
        archiveTask: (id: string) => void;
        reorderTasks: (fromIndex: number, toIndex: number) => void;
    }
};

export function PlanTaskList({ isMobile, tasks, actions }: PlanTasksListProps) {
    const ulId = generateId();

    useEffect(() => {
        const ul = document.getElementById(ulId);

        if (!ul) {
            return;
        }

        let dragFromIndex: number | null = null;
        let draggedElement: HTMLLIElement | null = null;
        let ghostElement: HTMLElement | null = null;
        const overCount = new Map<HTMLLIElement, number>();
        const cleanupFunctions: Array<() => void> = [];

        ul.querySelectorAll("li[data-index]").forEach((li: Element) => {
            const listItem = li as HTMLLIElement;

            listItem.draggable = true;

            const handleDragStart = (e: DragEvent) => {
                const li = (e.target as HTMLElement).closest("li[data-index]") as HTMLLIElement | null;
                if (!li) return;
                const inner = li.firstElementChild as HTMLElement;
                if (!inner) return;

                dragFromIndex = Number(li.dataset.index);
                draggedElement = li;
                li.classList.add(taskStyles.plan_task__dragging);

                const ghost = inner.cloneNode(true) as HTMLElement;
                ghost.classList.add(taskStyles.plan_task__ghost);
                Object.assign(ghost.style, {
                    position: "absolute",
                    top: "-9999px",
                    left: "-9999px",
                    width: `${li.offsetWidth}px`,
                    pointerEvents: "none",
                });
                document.body.appendChild(ghost);
                ghostElement = ghost;

                const rect = li.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;

                const dt = e.dataTransfer;
                if (dt) {
                    dt.setData("text/plain", String(dragFromIndex));
                    dt.effectAllowed = "move";
                    dt.setDragImage(ghost, offsetX, offsetY);
                }
            };

            const handleDragOver = (e: DragEvent) => {
                e.preventDefault(); // обязательно!
                e.dataTransfer!.dropEffect = "move";
            };

            const handleDragEnter = (e: DragEvent) => {
                e.preventDefault();
                const count = (overCount.get(listItem) ?? 0) + 1;
                overCount.set(listItem, count);

                if (count === 1) { // ← добавляем класс ТОЛЬКО при первом входе
                    listItem.classList.add(taskStyles.plan_task__drag_over);
                }
            };

            const handleDragLeave = (e: DragEvent) => {
                e.preventDefault();
                const count = (overCount.get(listItem) ?? 0) - 1;
                overCount.set(listItem, count);

                if (count === 0) { // ← убираем класс ТОЛЬКО при полном выходе
                    listItem.classList.remove(taskStyles.plan_task__drag_over);
                }
            };

            const handleDrop = (e: DragEvent) => {
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
            };

            const handleDragEnd = () => {
                ul.querySelectorAll('li').forEach(li => {
                    li.classList.remove(taskStyles.plan_task__dragging, taskStyles.plan_task__drag_over);
                });
                ghostElement?.remove();
                ghostElement = null;
                dragFromIndex = null;
                draggedElement = null;
            };

            listItem.addEventListener("dragstart", handleDragStart);
            listItem.addEventListener("dragover", handleDragOver);
            listItem.addEventListener("dragenter", handleDragEnter);
            listItem.addEventListener("dragleave", handleDragLeave);
            listItem.addEventListener("drop", handleDrop);
            listItem.addEventListener("dragend", handleDragEnd);

            cleanupFunctions.push(() => {
                listItem.removeEventListener("dragstart", handleDragStart);
                listItem.removeEventListener("dragover", handleDragOver);
                listItem.removeEventListener("dragenter", handleDragEnter);
                listItem.removeEventListener("dragleave", handleDragLeave);
                listItem.removeEventListener("drop", handleDrop);
                listItem.removeEventListener("dragend", handleDragEnd);
            });
        });

        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    });

    if (tasks.length === 0) {
        return `
            <div class="${styles.plan_tasks__empty}">
                Список задач пуст
            </div>
        `;
    }

    const taskItems = tasks.map((planTask, index) => {
        const taskItem = PlanTask({
            isMobile,
            planTaskIndex: index,
            planTask,
            actions,
            completingClass: styles.plan_task_item__completing
        });

        return `
            <li data-index="${index}" class="${styles.plan_task_item}">
                ${taskItem}
            </li>
        `
    }).join("");

    return `
        <ul 
            id="${ulId}"
            class="${styles.plan_tasks__list}"
            role="list">
            ${taskItems}
        </ul>
    `;
}