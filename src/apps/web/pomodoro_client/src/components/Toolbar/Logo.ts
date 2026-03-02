import styles from "./Logo.module.scss";

/**
 * Компонент `Logo` — визуальный элемент логотипа Pomodoro‑приложения.
 * Отображает иконку и текстовую метку с названием приложения.
 *
 * Обычно используется внутри верхней панели {@link Toolbar} или шапки сайта.
 *
 * Пример итоговой структуры (имена классов через CSS modules):
 * ```html
 * <div class="logo_xxx">
 *   <a href="/">
 *     <img class="logo_xxx__icon" src="assets/icons/pomodoro.svg" alt="Pomodoro tracker" />
 *     <span class="logo_xxx__label">Pomodoro Tracker</span>
 *   </a>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка логотипа приложения
 *
 * @example
 * import { Logo } from './Logo.ts';
 *
 * const logoHTML = Logo();
 * document.querySelector('.toolbar').insertAdjacentHTML('afterbegin', logoHTML);
 */
export function Logo() {
    return `
        <div class="${styles.logo}">
            <a href="/">
                <img class="${styles.logo__icon}" src="assets/icons/pomodoro.svg" alt="Pomodoro tracker" />
                <span class="${styles.logo__label}">Pomodoro Tracker</span>
            </a>
        </div>
    `;
}