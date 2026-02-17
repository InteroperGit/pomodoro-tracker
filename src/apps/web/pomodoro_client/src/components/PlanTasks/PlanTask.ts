import styles from "./PlanTask.module.scss";
import globalStyles from "../global.module.scss";
import commonStyles from "./PlanTasksCommon.module.scss";
import type {PlanPomodoroTask, PomodoroTask} from "../../types/task.ts";
import {useEffect} from "../../utils/render.ts";
import {generateId} from "../../utils/idGenerator.ts";

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

    useEffect(() => {
        const planTaskDiv: HTMLDivElement | null = document.getElementById(planTaskDivId) as HTMLDivElement | null;
        const taskCountDiv: HTMLDivElement | null = document.getElementById(taskCountId) as HTMLDivElement | null;
        const incButton: HTMLButtonElement | null = document.getElementById(incButtonId) as HTMLButtonElement | null;
        const decButton: HTMLButtonElement | null = document.getElementById(decButtonId) as HTMLButtonElement | null;
        const archiveTaskButton: HTMLButtonElement | null = document.getElementById(archiveTaskButtonId) as HTMLButtonElement | null;

        if (!planTaskDiv || !taskCountDiv || !incButton || !decButton || !archiveTaskButton) {
            return;
        }

        planTaskDiv.addEventListener("click", (e) => {
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
        });

        taskCountDiv.addEventListener("click", () => {
            actions.incTask(task.id);
        });

        incButton.addEventListener("click", () => {
            actions.incTask(task.id);
        });

        decButton.addEventListener("click", () => {
            actions.decTask(task.id);
        });

        archiveTaskButton.addEventListener("click", () => {
            actions.archiveTask(task.id);
        })
    });

    useEffect(() => {
        if (!editingTaskId || task.id !== editingTaskId) {
            return;
        }

        const categoryInput: HTMLInputElement | null = document.getElementById(categoryInputId) as HTMLInputElement | null;
        const descriptionInput: HTMLInputElement | null = document.getElementById(descriptionInputId) as HTMLInputElement | null;
        const addTaskButton = document.getElementById(addTaskButtonId);

        if (!categoryInput || !descriptionInput || !addTaskButton) {
            return;
        }

        const inputKeyDownHandler = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.code === 'Enter') {
                e.preventDefault();
                const editingTask: PomodoroTask = {
                    id: task.id,
                    category: {
                        name: categoryInput.value,
                    },
                    description: descriptionInput.value
                }

                actions.completeEditTask(editingTask);
            }
            else if (e.key === 'Escape' || e.code === 'Escape') {
                e.preventDefault();
                actions.cancelEditTask();
            }
        }

        const addTaskButtonClickHandler = (e: PointerEvent) => {
            e.preventDefault();

            const editingTask: PomodoroTask = {
                id: task.id,
                category: {
                    name: categoryInput.value,
                },
                description: descriptionInput.value
            }

            actions.completeEditTask(editingTask);
        }

        categoryInput.addEventListener('keydown', inputKeyDownHandler);
        descriptionInput.addEventListener('keydown', inputKeyDownHandler);
        addTaskButton.addEventListener('click', addTaskButtonClickHandler);
    });

    const mobileVersion = isMobile && (
        editingTaskId != null && task.id === editingTaskId
        ? `
            <div 
                id="${planTaskDivId}"
                data-planTaskId="${task.id}"
                class="${styles.plan_task}">
                  <div class="${styles.plan_task__category}">
                      <input 
                        id="${categoryInputId}"
                        class="${styles.plan_task_input}"
                        value="${task.category?.name}" 
                      />
                  </div>
                  <div class="${styles.plan_task__description}">
                      <input 
                        id="${descriptionInputId}"
                        class="${styles.plan_task_input}"
                        value="${task.description}" 
                      />
                  </div>
                  <button 
                    id="${addTaskButtonId}"
                    class="${globalStyles.button} ${commonStyles.plan_task__button}">
                    S
                  </button>
              </div>
        `
        : `
            <div 
                id="${planTaskDivId}"
                data-planTaskId="${task.id}"
                class="${styles.plan_task_mobile}">
                <div class="${styles.plan_task__task}">
                    <div class="${styles.plan_task__category} ${styles.plan_task__category_mobile}">
                      ${task.category?.name}
                    </div>
                    <div class="${styles.plan_task__description} ${styles.plan_task__description_mobile}">
                      ${task.description}
                    </div>
                </div>
                <div class="${styles.plan_task__toolbar}">
                    <div 
                    id="${taskCountId}"
                    class="${styles.plan_task__count}">
                      ${count}
                    </div>
                    <button
                    id="${incButtonId}" 
                    class="${globalStyles.button} ${commonStyles.plan_task__button}">
                        +
                    </button>
                    <button 
                    id="${decButtonId}"
                    class="${globalStyles.button} ${commonStyles.plan_task__button}">
                        -
                    </button>
                    <button 
                    id="${archiveTaskButtonId}"
                    class="${globalStyles.button} ${commonStyles.plan_task__button}">
                        C
                    </button>
                </div>
              </div>
        `
    );

    const desktopVersion = !isMobile && (
        editingTaskId != null && task.id === editingTaskId
            ? `
              <div 
                id="${planTaskDivId}"
                data-planTaskId="${task.id}"
                class="${styles.plan_task}">
                  <div class="${styles.plan_task__category}">
                      <input 
                        id="${categoryInputId}"
                        class="${styles.plan_task_input}"
                        value="${task.category?.name}" 
                      />
                  </div>
                  <div class="${styles.plan_task__description}">
                      <input 
                        id="${descriptionInputId}"
                        class="${styles.plan_task_input}"
                        value="${task.description}" 
                      />
                  </div>
                  <button 
                    id="${addTaskButtonId}"
                    class="${globalStyles.button} ${commonStyles.plan_task__button}">
                    S
                  </button>
              </div>
          `
            :
            `
              <div 
                id="${planTaskDivId}"
                data-planTaskId="${task.id}"
                class="${styles.plan_task}">
                  <div class="${styles.plan_task__category}">
                      ${task.category?.name}
                  </div>
                  <div class="${styles.plan_task__description}">
                      ${task.description}
                  </div>
                  <div 
                    id="${taskCountId}"
                    class="${styles.plan_task__count}">
                      ${count}
                  </div>
                  <button
                    id="${incButtonId}" 
                    class="${globalStyles.button} ${commonStyles.plan_task__button}">
                        +
                  </button>
                  <button 
                    id="${decButtonId}"
                    class="${globalStyles.button} ${commonStyles.plan_task__button}">
                        -
                  </button>
                  <button 
                    id="${archiveTaskButtonId}"
                    class="${globalStyles.button} ${commonStyles.plan_task__button}">
                        C
                  </button>
              </div>
          `
    );

    return isMobile ? mobileVersion : desktopVersion;
}