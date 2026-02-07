import globalStyles from "../components/global.module.scss";
import styles from "./App.module.scss";
import { Toolbar } from '../components/Toolbar';
import { Timer } from '../components/Timer';
import {PlanTasks} from "../components/PlanTasks";
import {ArchiveTasks} from "../components/ArchiveTasks";
import {Footer} from "../components/Footer";
import type {AppContext} from "./appContext.ts";

export function App(ctx: AppContext) {
    const state = ctx.store.getState();

    const toolbar = Toolbar();
    const timer = Timer();
    const planTasks = PlanTasks({ data: state.planTasksState });
    const archiveTasks = ArchiveTasks({ data: state.archiveState });
    const footer = Footer();

    return `
        <div class="${styles.app}">
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