import styles from "./Footer.module.scss";

/**
 * Компонент `Footer` — нижний элемент интерфейса приложения Pomodoro-таймера.
 *
 * Отображает статичный подвал страницы, содержащий название приложения ("Pomodoro tracker").
 * Обычно располагается внизу корневого контейнера и используется на всех страницах.
 * Возвращает простую HTML-разметку с использованием CSS-модулей.
 *
 * @returns {string} HTML-разметка подвала (элемент `<footer>`).
 *
 * @example
 * import { Footer } from './Footer/index.ts';
 *
 * // Встраивание подвала на страницу
 * document.querySelector('.app').insertAdjacentHTML('beforeend', Footer());
 */
export function Footer() {
    return `
        <footer class="${styles.footer}">
            <span class="${styles.footer__label}">Pomodoro tracker</span>
        </footer>
    `;
}