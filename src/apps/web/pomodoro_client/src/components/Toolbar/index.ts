import styles from "./Toolbar.module.scss";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";

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
    return `
        <div class="${styles.menu_wrap}">
            <button
                id="${TOOLBAR_MENU_BTN_ID}"
                type="button"
                class="${styles.menu_button}"
                aria-label="Настройки"
                aria-haspopup="true"
                aria-expanded="false">
                <i class="fa-solid fa-gear" aria-hidden="true"></i>
                <span class="${styles.menu_button_label}">Настройки</span>
            </button>
            <div
                id="${TOOLBAR_DROPDOWN_ID}"
                class="${styles.dropdown}"
                role="menu"
                aria-hidden="true">
                <button type="button" id="${TOOLBAR_THEME_TOGGLE_ID}" class="${styles.dropdown_item}" role="menuitem">
                    Тёмная тема ${isDark ? "✓" : ""}
                </button>
            </div>
        </div>
    `;
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