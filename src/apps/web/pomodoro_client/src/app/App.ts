import globalStyles from "../components/global.module.scss";
import styles from "./App.module.scss";
import { Toolbar, TOOLBAR_DROPDOWN_ID, TOOLBAR_MENU_BTN_ID, TOOLBAR_THEME_TOGGLE_ID } from '../components/Toolbar';
import { Timer } from '../components/Timer';
import { Footer } from "../components/Footer";
import {
    type AppContext,
    useActiveTaskTimerTick,
    useCancelEditTask,
    useCompleteTask,
    useGetEditingTaskId,
    usePauseTask,
    useResumeTask,
    useSetTheme,
    useStartTask,
    useStopTask,
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

    const toolbar = Toolbar({ isMobile, theme: state.theme });
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

    useEffect(() => {
        const menuBtn = document.getElementById(TOOLBAR_MENU_BTN_ID) as HTMLButtonElement | null;
        const dropdown = document.getElementById(TOOLBAR_DROPDOWN_ID) as HTMLDivElement | null;
        const themeToggle = document.getElementById(TOOLBAR_THEME_TOGGLE_ID) as HTMLButtonElement | null;
        if (!menuBtn || !dropdown || !themeToggle) return;

        const MARGIN = 8;

        const positionDropdown = () => {
            const rect = menuBtn.getBoundingClientRect();
            dropdown.style.visibility = "hidden";
            dropdown.setAttribute("data-open", "true");
            const dr = dropdown.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let top = rect.bottom + MARGIN;
            if (top + dr.height > vh - MARGIN) top = rect.top - dr.height - MARGIN;
            top = Math.max(MARGIN, Math.min(top, vh - dr.height - MARGIN));
            let left = rect.right - dr.width;
            if (left < MARGIN) left = MARGIN;
            if (left + dr.width > vw - MARGIN) left = vw - dr.width - MARGIN;
            dropdown.style.top = `${top}px`;
            dropdown.style.left = `${left}px`;
            dropdown.style.visibility = "";
        };

        const closeDropdown = () => {
            dropdown.removeAttribute("data-open");
            menuBtn.setAttribute("aria-expanded", "false");
            dropdown.setAttribute("aria-hidden", "true");
        };

        const isOpen = () => dropdown.getAttribute("data-open") === "true";

        const onMenuBtnClick = (e: MouseEvent) => {
            e.stopPropagation();
            if (isOpen()) {
                closeDropdown();
            } else {
                positionDropdown();
                menuBtn.setAttribute("aria-expanded", "true");
                dropdown.setAttribute("aria-hidden", "false");
            }
        };
        const onThemeToggleClick = () => {
            const current = ctx.store.getState().theme;
            useSetTheme(current === "dark" ? "light" : "dark");
            closeDropdown();
        };
        const onDocClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (isOpen() && !dropdown.contains(target) && !menuBtn.contains(target)) closeDropdown();
        };
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen()) closeDropdown();
        };

        menuBtn.addEventListener("click", onMenuBtnClick);
        themeToggle.addEventListener("click", onThemeToggleClick);
        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onEscape);

        return () => {
            menuBtn.removeEventListener("click", onMenuBtnClick);
            themeToggle.removeEventListener("click", onThemeToggleClick);
            document.removeEventListener("click", onDocClick);
            document.removeEventListener("keydown", onEscape);
        };
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