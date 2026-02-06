import type {PlanPomodoroTask} from "../../types/task.ts";

export function PlanTaskControl({ planTask } : { planTask: PlanPomodoroTask }) {
    const { task, count } = planTask;

    return `
          <div class="plan_task">
              <div class="plan_task__category">
                  ${task.category}
              </div>
              <div class="plan_task__description">
                  ${task.description}
              </div>
              <div class="plan_task__count">
                  ${count}
              </div>
              <button class="button plan_task__button">+</button>
              <button class="button plan_task__button">-</button>
          </div>  
    `
}