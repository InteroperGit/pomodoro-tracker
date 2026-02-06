import styles from "./PlanTask.module.scss";
import globalStyles from "../global.module.scss";
import commonStyles from "./PlanTasksCommon.module.scss";
import type {PlanPomodoroTask} from "../../types/task.ts";

export function PlanTask({ planTask } : { planTask: PlanPomodoroTask }) {
    const { task, count } = planTask;

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
              <button class="${globalStyles.button} ${commonStyles.plan_task__button}">+</button>
              <button class="${globalStyles.button} ${commonStyles.plan_task__button}">-</button>
          </div>  
    `
}