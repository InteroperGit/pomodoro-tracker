import globalStyles from "../components/global.module.scss";
import styles from "./App.module.scss";
import { Toolbar } from '../components/Toolbar';
import { Timer } from '../components/Timer';
import {PlanTasks} from "../components/PlanTasks";
import {ArchiveTasks} from "../components/ArchiveTasks";
import {Footer} from "../components/Footer";
import {type AppContext, useCancelEditTask, useGetEditingTaskId} from "./appContext.ts";
import {generateId} from "../utils/idGenerator.ts";
import {useEffect} from "../utils/render.ts";

export function App(ctx: AppContext) {
    const appDivId = generateId();

    const state = ctx.store.getState();

    const toolbar = Toolbar();
    const timer = Timer();
    const planTasks = PlanTasks({ data: state.planTasksState });
    const archiveTasks = ArchiveTasks({ data: state.archiveState });
    const footer = Footer();

    //Cancel edit task, if click out of PlanTask control
    useEffect(() => {
        const appDiv: HTMLDivElement | null = document.getElementById(appDivId) as HTMLDivElement | null;
        if (!appDiv) {
            return;
        }

        const editingTaskId = useGetEditingTaskId();
        if (!editingTaskId) {
            return;
        }

        const planTaskDiv: HTMLDivElement | null = document.querySelector(`[data-planTaskId="${editingTaskId}"]`) as HTMLDivElement | null;

        if (!planTaskDiv) {
            return;
        }

        appDiv.addEventListener("click", (e) => {
           if (!planTaskDiv.contains(e.target as Node)) {
               useCancelEditTask();
           }
        });
    });

    return `
        <div 
            id="${appDivId}"
            class="${styles.app}">
            ${toolbar}
            
            <main class="${styles.main}">
                <div class="${globalStyles.container}">
                    ${timer}
                    ${planTasks}
                    ${archiveTasks}
                </div>
            </main>
            
            ${footer}
        </div>
    `;
}