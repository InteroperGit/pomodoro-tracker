import styles from "./Logo.module.scss";

/**
 * Компонент `Logo` — визуальный элемент логотипа Pomodoro‑приложения.
 * Отображает иконку и текстовую метку с названием приложения.
 *
 * Обычно используется внутри верхней панели {@link Toolbar} или шапки сайта.
 *
 * @module Logo
 *
 * @function Logo
 *
 * @description
 * Компонент формирует статичный блок логотипа, включающий:
 * - SVG‑иконку помидора (файл `assets/icons/pomodoro.svg`);
 * - Текстовую подпись `"Pomodoro"`.
 *
 * Элемент `.logo` предназначен для идентификации бренда и навигационной панели.
 * Предполагается, что логотип остаётся постоянным во всех разделах приложения.
 *
 * Пример итоговой структуры (имена классов через CSS modules):
 * ```html
 * <div class="logo_xxx">
 *   <img class="logo_xxx__icon" src="assets/icons/pomodoro.svg" alt="Pomodoro tracker" />
 *   <span class="logo_xxx__label">Pomodoro</span>
 * </div>
 * ```
 *
 * @returns {string} HTML‑разметка логотипа приложения.
 *
 * @example
 * import { Logo } from './Logo.js';
 *
 * const logoHTML = Logo();
 * document.querySelector('.toolbar').insertAdjacentHTML('afterbegin', logoHTML);
 */
export function Logo() {
    return `
        <div class="${styles.logo}">
            <img class="${styles.logo__icon}" src="assets/icons/pomodoro.svg" alt="Pomodoro tracker" />
            <span class="${styles.logo__label}">Pomodoro Tracker</span>
        </div>
    `;
}