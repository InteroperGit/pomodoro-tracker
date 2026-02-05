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
 * Компонент возвращает HTML‑разметку контейнера `.header__navigation`,
 * который служит местом для навигационных элементов пользовательского интерфейса.
 * Может использоваться для размещения ссылок, кнопок и интерактивных ссылок верхнего меню.
 *
 * Пример итоговой структуры:
 * ```html
 * <div class="header__navigation">
 *   <div>Профиль</div>
 * </div>
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
        <div class="header__navigation">
            <div>
                Профиль
            </div>
        </div>
    `;
}