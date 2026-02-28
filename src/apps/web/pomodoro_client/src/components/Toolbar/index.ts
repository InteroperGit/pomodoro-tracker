import styles from "./Toolbar.module.scss";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { dropdownMarkup } from "../Dropdown";
import { t } from '../../i18n';

/** ID кнопки меню настроек */
const TOOLBAR_MENU_BTN_ID = "toolbar-menu-btn";
/** ID выпадающего меню */
const TOOLBAR_DROPDOWN_ID = "toolbar-dropdown";
/** ID переключателя темы */
const TOOLBAR_THEME_TOGGLE_ID = "toolbar-theme-toggle";
/** ID переключателя языка */
const TOOLBAR_LOCALE_TOGGLE_ID = "toolbar-locale-toggle";

/**
 * Свойства компонента Toolbar
 * @typedef {Object} ToolbarProps
 * @property {boolean} isMobile - мобильное ли представление
 * @property {"light"|"dark"} theme - текущая тема
 */
export type ToolbarProps = {
    isMobile: boolean;
    theme: "light" | "dark";
};

/**
 * Создает HTML меню с кнопкой и выпадающим списком для переключателя темы
 * @param {"light"|"dark"} theme - текущая тема
 * @returns {string} HTML-строка меню
 */
function toolbarMenuMarkup(theme: "light" | "dark") {
    const isDark = theme === "dark";
    const buttonContent = `
        <i class="fa-solid fa-gear" aria-hidden="true"></i>
        <span class="${styles.menu_button_label}">${t('toolbar.settings')}</span>
    `;
    return dropdownMarkup({
        wrapClass: styles.menu_wrap,
        buttonId: TOOLBAR_MENU_BTN_ID,
        buttonClass: styles.menu_button,
        buttonContent,
        buttonAriaLabel: t('toolbar.settings'),
        dropdownId: TOOLBAR_DROPDOWN_ID,
        items: [
            { id: TOOLBAR_THEME_TOGGLE_ID, content: `${t('toolbar.darkTheme')} ${isDark ? "✓" : ""}` },
            { id: TOOLBAR_LOCALE_TOGGLE_ID, content: t('toolbar.switchLocale') },
        ],
    });
}

/**
 * Компонент панели навигации с логотипом и меню
 * На мобильных устройствах скрывает навигацию
 * @param {ToolbarProps} props - свойства компонента
 * @returns {string} HTML-строка компонента
 */
export function Toolbar({ isMobile, theme }: ToolbarProps) {
    const logo = Logo();
    const navigation = Navigation();
    const menu = toolbarMenuMarkup(theme);

    return isMobile
        ? `
            <header class="${styles.header}">
                ${logo}
                ${menu}
            </header>
        `
        : `
            <header class="${styles.header}">
                ${logo}
                ${navigation}
                ${menu}
            </header>
        `;
}

export { TOOLBAR_MENU_BTN_ID, TOOLBAR_DROPDOWN_ID, TOOLBAR_THEME_TOGGLE_ID, TOOLBAR_LOCALE_TOGGLE_ID };