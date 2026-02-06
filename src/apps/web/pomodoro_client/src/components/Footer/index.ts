import styles from "./Footer.module.scss";

/**
 * Компонент `Footer` — нижний элемент интерфейса приложения Pomodoro‑таймера.
 * Отображает подвал страницы, содержащий название или краткую информацию о приложении.
 *
 * @module Footer
 *
 * @function Footer
 *
 * @description
 * Простая функция‑компонент, возвращающая статическую HTML‑разметку для подвала.
 * Обычно располагается внизу корневого контейнера приложения и используется во всех страницах.
 *
 * Структура разметки:
 * ```html
 * <footer class="footer">
 *     Pomodoro timer
 * </footer>
 * ```
 *
 * @returns {string} HTML‑разметка подвала (`<footer>` элемент).
 *
 * @example
 * import { Footer } from './Footer/index.ts';
 *
 * // Встраивание подвала на страницу
 * document.querySelector('.app').insertAdjacentHTML('beforeend', Footer());
 */
export function Footer() {
    return  `
        <footer class="${styles.footer}">
            Pomodoro timer
        </footer>
    `;
}