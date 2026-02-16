import styles from "./PlanTasks.module.scss";
import {PlanTasksTitle} from "./PlanTasksTitle";
import {PlanTasksAdd} from "./PlanTasksAdd";
import {PlanTasksStatistics} from "./PlanTasksStatistics";
import {PlanTaskList} from "./PlanTaskList.ts";
import type {PlanPomodoroTasksState} from "../../types/context.ts";
import {
    useAddTask, useArchiveTask,
    useCancelEditTask,
    useCompleteEditTask,
    useDecTask,
    useGetEditingTaskId,
    useIncTask,
    useReorderTasks,
    useStartEditTask
} from "../../app/appContext.ts";

export type PlanTasksProps = {
    data: PlanPomodoroTasksState;
}

export function PlanTasks({ data }: PlanTasksProps) {
    const { tasks, statistics } = data;
    const { tasksCount, tasksTime } = statistics;

    const title = PlanTasksTitle({ tasksCount, tasksTime });
    const add = PlanTasksAdd({
        actions: {
            addTask: useAddTask,
        }
    });
    const list = PlanTaskList(
        {
            tasks,
            actions: {
                getEditingTaskId: useGetEditingTaskId,
                startEditTask: useStartEditTask,
                completeEditTask: useCompleteEditTask,
                cancelEditTask: useCancelEditTask,
                incTask: useIncTask,
                decTask: useDecTask,
                archiveTask: useArchiveTask,
                reorderTasks: useReorderTasks
            }

        });
    const stats = tasks.length > 0 ? PlanTasksStatistics({ statistics }) : "";

    return `
        <div class="${styles.plan_tasks}">
            ${title}
            ${add}
            ${list}
            ${stats}
        </div>
    `;
}