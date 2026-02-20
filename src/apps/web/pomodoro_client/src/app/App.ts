import globalStyles from "../components/global.module.scss";
import styles from "./App.module.scss";
import { Toolbar } from '../components/Toolbar';
import { Timer } from '../components/Timer';
import {Footer} from "../components/Footer";
import {
    type AppContext,
    useActiveTaskTimerTick,
    useCancelEditTask, useCompleteTask,
    useGetEditingTaskId, usePauseTask, useResumeTask,
    useStartTask, useStopTask
} from "./appContext.ts";
import {useEffect} from "../utils/render.ts";
import {useGetPlanTaskControlSelector} from "../utils/hooks.ts";
import {useIsMobile} from "../types/layout.ts";
import {PlanTasks} from "../components/PlanTasks";
import {ArchiveTasks} from "../components/ArchiveTasks";

const APP_CONTAINER_ID = "pomodoro-app";

export function App(ctx: AppContext) {
    const state = ctx.store.getState();
    const isMobile = useIsMobile();

    const toolbar = Toolbar({ isMobile });
    const timer = Timer({
        isMobile,
        activeTask: state.activeTask,
        planTasks: state.planTasks.tasks,
        actions: {
            startTask: useStartTask,
            stopTask: useStopTask,
            pauseTask: usePauseTask,
            resumeTask: useResumeTask,
            completeTask: useCompleteTask,
            registerActiveTaskTimerTick: useActiveTaskTimerTick
        }
    });
    const planTasks = PlanTasks({
        isMobile,
        data: state.planTasks
    });
    const archiveTasks = ArchiveTasks({ isMobile, data: state.archiveTasks });
    const footer = Footer();

    //Cancel edit when clicking outside PlanTask control
    useEffect(() => {
        const appDiv: HTMLDivElement | null = document.getElementById(APP_CONTAINER_ID) as HTMLDivElement | null;
        if (!appDiv) {
            return;
        }

        const editingTaskId = useGetEditingTaskId();
        if (!editingTaskId) {
            return;
        }

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const selector = useGetPlanTaskControlSelector();

            if (target.closest(selector)) {
                return;
            }
            
            useCancelEditTask();
        }

        appDiv.addEventListener("click", handleClick);

        return () => {
            appDiv.removeEventListener("click", handleClick);
        }
    });

    return `
        <div 
            id="${APP_CONTAINER_ID}"
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
    `
}