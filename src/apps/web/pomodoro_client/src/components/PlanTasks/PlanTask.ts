import styles from "./PlanTask.module.scss";
import globalStyles from "../global.module.scss";
import commonStyles from "./PlanTasksCommon.module.scss";
import type {PlanPomodoroTask} from "../../types/task.ts";
import {useEffect} from "../../utils/render.ts";
import {generateId} from "../../utils/idGenerator.ts";
import {useDecTask, useIncTask} from "../../app/appContext.ts";

export function PlanTask({ planTask } : { planTask: PlanPomodoroTask }) {
    const { task, count } = planTask;
    const incButtonId = generateId();
    const decButtonId = generateId();

    useEffect(() => {
        const incButton: HTMLButtonElement | null = document.getElementById(incButtonId) as HTMLButtonElement | null;
        const decButton: HTMLButtonElement | null = document.getElementById(decButtonId) as HTMLButtonElement | null;

        if (!incButton) {
            return;
        }

        if (!decButton) {
            return;
        }

        incButton.addEventListener("click", () => {
            useIncTask(task.id);
        });

        decButton.addEventListener("click", () => {
            useDecTask(task.id);
        })
    });


    return `
          <div class="${styles.plan_task}">
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
    `
}