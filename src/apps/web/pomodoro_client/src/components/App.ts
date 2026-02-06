import globalStyles from "./global.module.scss";
import styles from "./App.module.scss";
import { Toolbar } from './Toolbar';
import { Timer } from './Timer';
import {PlanTasks, type PlanTasksProps} from "./PlanTasks";
import {ArchiveTasks, type ArchiveTasksProps} from "./ArchiveTasks";
import {Footer} from "./Footer";

const getPlanTasks = () => {
    return {
        tasksCount: 5,
        tasksTime: "2ч 5мин",
        planTasks: [{
            task: {
                category: { name: "test" },
                description: "Test task 1",
            },
            count: 1
        }, {
            task: {
                category: { name: "test2" },
                description: "Test task 2",
            },
            count: 1
        }],
        statistics: {
            nextLongBreak: "12:00",
            finishTime: "18:00",
            categories: [
                {
                    category: { name: "test" },
                    count: 1,
                },
                {
                    category: { name: "test2" },
                    count: 1,
                },
            ],
        }
    };
}

const getArchiveTasks = () => {
    return {
        tasksCount: 5,
        tasksTime: "3ч 15мин",
        tasks: [
            { category: { name: 'test' }, description: "Test task 1" },
            { category: { name: "test" }, description: "Test task 2" },
        ],
        statistics: {
            categories: [
                { category: { name: "test" }, count: 1 },
                { category: { name: "test2" }, count: 1 }
            ]
        }
    }
}

export function App() {
    const planTasksProps: PlanTasksProps = getPlanTasks();
    const archiveTasksProps: ArchiveTasksProps = getArchiveTasks();

    const toolbar = Toolbar();
    const timer = Timer();
    const planTasks = PlanTasks(planTasksProps);
    const archiveTasks = ArchiveTasks(archiveTasksProps);
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