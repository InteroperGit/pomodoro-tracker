import styles from "./Navigation.module.scss";

/**
 * Компонент `Navigation` — блок навигации в шапке Pomodoro‑приложения.
 * Отвечает за отображение пользовательского навигационного меню или ссылок разделов.
 *
 * В текущей реализации содержит только пункт `"Профиль"`, но может быть расширен
 * для добавления других элементов управления (настройки, статистика, история и т.п.).
 *
 * Используется внутри верхнего блока {@link Toolbar}.
 *
 * @module Navigation
 *
 * @function Navigation
 *
 * @description
 * Компонент возвращает HTML‑разметку контейнера навигации (элемент `<nav>`),
 * который служит местом для навигационных элементов пользовательского интерфейса.
 * Может использоваться для размещения ссылок, кнопок и интерактивных ссылок верхнего меню.
 *
 * Пример итоговой структуры (имена классов через CSS modules):
 * ```html
 * <nav class="navigation_xxx" aria-label="Основное меню">
 *   <div class="navigation_xxx__item">Профиль</div>
 * </nav>
 * ```
 *
 * @returns {string} HTML‑разметка навигационного блока.
 *
 * @example
 * import { Navigation } from './Navigation.js';
 *
 * const navHTML = Navigation();
 * document.querySelector('.toolbar').insertAdjacentHTML('beforeend', navHTML);
 */
export function Navigation() {
    return `
        <nav class="${styles.navigation}" aria-label="Основное меню">
            <div class="${styles.navigation__item}">Профиль</div>
        </nav>
    `;
}