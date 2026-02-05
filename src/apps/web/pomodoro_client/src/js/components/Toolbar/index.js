import { Logo } from "./Logo";
import {Navigation} from "./Navigation";

/**
 * Компонент `Toolbar` — верхняя панель (шапка) Pomodoro‑приложения.
 * Отвечает за отображение логотипа и навигационных элементов интерфейса.
 *
 * Использует составную структуру из двух подкомпонентов:
 * - {@link Logo} — отображает иконку и название приложения;
 * - {@link Navigation} — содержит элементы навигации (например, "Профиль").
 *
 * @module Toolbar
 *
 * @function Toolbar
 *
 * @description
 * Компонент формирует HTML‑разметку для элемента `<header>` с классом `.header`,
 * который объединяет логотип приложения и панель навигации.
 * Является верхней частью пользовательского интерфейса и обычно располагается в корне страницы.
 *
 * Пример итоговой структуры:
 * ```html
 * <header class="header">
 *   <div class="logo">
 *     <img class="logo__icon" src="assets/icons/pomodoro.svg" alt="Pomodoro tracker" />
 *     <span class="logo__label">Pomodoro</span>
 *   </div>
 *   <div class="header__navigation">
 *     <div>Профиль</div>
 *   </div>
 * </header>
 * ```
 *
 * @returns {string} HTML‑разметка шапки приложения.
 *
 * @example
 * import { Toolbar } from './Toolbar/index.js';
 *
 * const toolbarHTML = Toolbar();
 * document.querySelector('.app').insertAdjacentHTML('afterbegin', toolbarHTML);
 */
export function Toolbar() {
    const logo = Logo();
    const navigation = Navigation();

    return `
        <header class="header">
            ${logo}
            
            ${navigation}
        </header>
    `;
}