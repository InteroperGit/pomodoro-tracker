import { Toolbar } from './Toolbar';
import { Timer } from './Timer';
import { PlanTasks } from "./PlanTasks";
import {ArchiveTasks} from "./ArchiveTasks";
import {Footer} from "./Footer";



/**
 * Компонент `App` — корневой компонент приложения Pomodoro‑планировщика.
 * Отвечает за сборку и отображение основных частей интерфейса:
 * панели инструментов, таймера, секций планируемых и архивных задач, а также подвала.
 *
 * Использует модульную архитектуру: каждый визуальный блок импортируется как отдельный компонент
 * и вызывается как функция, возвращающая разметку в виде строки HTML.
 *
 * @module App
 *
 * @function App
 * @param {Object} [props={}] - Дополнительные параметры для настройки приложения.
 *                             В данный момент не используются, но предусмотрены для расширяемости.
 *
 * @description
 * Внутри компонента формируются два набора тестовых данных:
 * - `planTasksProps` — данные для секции активных (планируемых) задач, включая количество, общее время,
 *   список задач и статистику по категориям.
 * - `archiveTasksProps` — данные для секции завершённых задач.
 *
 * Далее компонент создаёт экземпляры:
 * - `Toolbar` — верхняя панель с элементами управления.
 * - `Timer` — основной Pomodoro‑таймер.
 * - `PlanTasks` — список текущих задач с прогнозом времени и статистикой.
 * - `ArchiveTasks` — архив выполненных задач.
 * - `Footer` — нижний блок с информацией или ссылками.
 *
 * Возвращаемое значение представляет собой HTML‑шаблон основного контейнера приложения,
 * включающий все перечисленные блоки.
 *
 * @returns {string} HTML‑разметка приложения (корневой контейнер `.app`).
 *
 * @example
 * import { App } from './App.js';
 *
 * // Создание основной страницы приложения
 * const appHTML = App();
 * document.body.innerHTML = appHTML;
 *
 * // Пример расширения:
 * const appHTMLWithProps = App({ userName: "Alex" });
 * document.body.innerHTML = appHTMLWithProps;
 */
export function App() {
    const planTasksProps = {
        tasksCount: 5,
        tasksTime: "2ч 5мин",
        tasks: [{
            category: "test",
            description: "Test task 1",
            count: 1
        }, {
            category: "test",
            description: "Test task 2",
            count: 1
        }],
        statistics: {
            nextLongBreak: "12:00",
            finishTime: "18:00",
            categories: [
                { name: "test", count: 1 },
                { name: "test2", count: 1 }
            ],
        }
    };

    const archiveTasksProps = {
        tasksCount: 5,
        tasksTime: "3ч 15мин",
        tasks: [
            { category: 'test', description: "Test task 1" },
            { category: "test", description: "Test task 2" },
        ],
        statistics: {
            categories: [
                { name: "test", count: 1 },
                { name: "test2", count: 1 }
            ]
        }
    }

    const toolbar = Toolbar();
    const timer = Timer();
    const planTasks = PlanTasks(planTasksProps);
    const archiveTasks = ArchiveTasks(archiveTasksProps);
    const footer = Footer();

    return `
        <div class="app">
            ${toolbar}
            
            <main class="main">
                <div class="container">
                    ${timer}
                    
                    ${planTasks}
                    
                    ${archiveTasks}
                </div>
            </main>
            
            ${footer}
        </div>
    `;
}