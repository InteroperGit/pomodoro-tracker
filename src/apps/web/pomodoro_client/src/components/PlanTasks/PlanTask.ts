import styles from "./PlanTask.module.scss";
import globalStyles from "../global.module.scss";
import commonStyles from "./PlanTasksCommon.module.scss";
import type {PlanPomodoroTask, PomodoroTask} from "../../types/task.ts";
import {useEffect} from "../../utils/render.ts";
import {generateId} from "../../utils/idGenerator.ts";
import {
    useCancelEditTask,
    useCompleteEditTask,
    useDecTask,
    useEditTask,
    useGetEditingTaskId,
    useIncTask
} from "../../app/appContext.ts";

export function PlanTask({ planTask } : { planTask: PlanPomodoroTask }) {
    const { task, count } = planTask;
    const planTaskDivId = generateId();
    const incButtonId = generateId();
    const decButtonId = generateId();
    const categoryInputId = generateId();
    const descriptionInputId = generateId();

    const editingTaskId = useGetEditingTaskId();

    useEffect(() => {
        const planTaskDiv: HTMLDivElement | null = document.getElementById(planTaskDivId) as HTMLDivElement | null;
        const incButton: HTMLButtonElement | null = document.getElementById(incButtonId) as HTMLButtonElement | null;
        const decButton: HTMLButtonElement | null = document.getElementById(decButtonId) as HTMLButtonElement | null;

        if (!planTaskDiv) {
            return;
        }

        if (!incButton) {
            return;
        }

        if (!decButton) {
            return;
        }

        planTaskDiv.addEventListener("click", () => {
            if (task.id === editingTaskId) {
                return;
            }
            useEditTask(task.id);
        });

        incButton.addEventListener("click", () => {
            useIncTask(task.id);
        });

        decButton.addEventListener("click", () => {
            useDecTask(task.id);
        });
    });

    useEffect(() => {
        if (!editingTaskId || task.id !== editingTaskId) {
            return;
        }

        const categoryInput: HTMLInputElement | null = document.getElementById(categoryInputId) as HTMLInputElement | null;
        const descriptionInput: HTMLInputElement | null = document.getElementById(descriptionInputId) as HTMLInputElement | null;

        if (!categoryInput || !descriptionInput) {
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

                useCompleteEditTask(editingTask);
            }
            else if (e.key === 'Escape' || e.code === 'Escape') {
                useCancelEditTask();
            }
        }

        categoryInput.addEventListener('keydown', inputKeyDownHandler);
        descriptionInput.addEventListener('keydown', inputKeyDownHandler);
    });

    return editingTaskId != null && task.id === editingTaskId
        ? `
              <div 
                id="${planTaskDivId}"
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
              </div>
          `
        :
          `
              <div 
                id="${planTaskDivId}"
                class="${styles.plan_task}">
                  <div class="${styles.plan_task__category}">
                      ${task.category?.name}
                  </div>
                  <div class="${styles.plan_task__description}">
                      ${task.description}
                  </div>
                  <div class="${styles.plan_task__count}">
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
              </div>
          `;
}