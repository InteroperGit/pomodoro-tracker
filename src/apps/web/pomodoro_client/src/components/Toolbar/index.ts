import styles from "./Toolbar.module.scss";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { dropdownMarkup } from "../Dropdown";

const TOOLBAR_MENU_BTN_ID = "toolbar-menu-btn";
const TOOLBAR_DROPDOWN_ID = "toolbar-dropdown";
const TOOLBAR_THEME_TOGGLE_ID = "toolbar-theme-toggle";

export type ToolbarProps = {
    isMobile: boolean;
    theme: "light" | "dark";
};

/** Кнопка меню и выпадающее меню (переключатель темы). */
function toolbarMenuMarkup(theme: "light" | "dark") {
    const isDark = theme === "dark";
    const buttonContent = `
        <i class="fa-solid fa-gear" aria-hidden="true"></i>
        <span class="${styles.menu_button_label}">Настройки</span>
    `;
    return dropdownMarkup({
        wrapClass: styles.menu_wrap,
        buttonId: TOOLBAR_MENU_BTN_ID,
        buttonClass: styles.menu_button,
        buttonContent,
        buttonAriaLabel: "Настройки",
        dropdownId: TOOLBAR_DROPDOWN_ID,
        items: [
            { id: TOOLBAR_THEME_TOGGLE_ID, content: `Тёмная тема ${isDark ? "✓" : ""}` },
        ],
    });
}

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

export { TOOLBAR_MENU_BTN_ID, TOOLBAR_DROPDOWN_ID, TOOLBAR_THEME_TOGGLE_ID };