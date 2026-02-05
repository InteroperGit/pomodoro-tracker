/**
 * Компонент `Timer` — основной Pomodoro‑таймер приложения.
 * Отображает текущее оставшееся время, описание активной задачи и кнопки управления таймером.
 *
 * Используется в центральной части интерфейса приложения (в составе {@link App}).
 *
 * @module Timer
 *
 * @function Timer
 *
 * @description
 * Компонент формирует визуальный блок таймера с фиксированным шаблоном времени (`25:00` по умолчанию),
 * описанием текущей задачи и двумя кнопками управления:
 *
 * - `"СТАРТ"` — для запуска/приостановки таймера;
 * - `"ВЫПОЛНЕНО"` — для завершения текущего Pomodoro‑цикла.
 *
 * Реализация функциональной логики (запуск, пауза, обновление времени и т.п.) предполагается
 * на уровне внешнего JavaScript‑кода, подключённого к этим элементам через слушатели событий.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="timer_area">
 *   <div class="timer_area__timer">25:00</div>
 *   <div class="timer_area__description">Тестовая задача</div>
 *   <div class="timer_area__buttons">
 *     <button class="button timer_button">СТАРТ</button>
 *     <button class="button timer_button">ВЫПОЛНЕНО</button>
 *   </div>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка Pomodoro‑таймера.
 *
 * @example
 * import { Timer } from './Timer/index.ts';
 *
 * const timerHTML = Timer();
 * document.querySelector('.main').innerHTML += timerHTML;
 *
 * // Пример привязки логики:
 * // document.querySelector('.timer_button').addEventListener('click', handleTimerStart);
 */
export function Timer() {
    return `
        <div class="timer_area">
            <div class="timer_area__timer">
                25:00
            </div>

            <div class="timer_area__description">
                Тестовая задача
            </div>

            <div class="timer_area__buttons">
                <button class="button timer_button">
                    СТАРТ
                </button>
                <button class="button timer_button">
                    ВЫПОЛНЕНО
                </button>
            </div>
        </div>
    `;
}