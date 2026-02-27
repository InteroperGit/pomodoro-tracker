import type { ThemeId } from "../types/context.ts";

/** CSS класс для темной темы */
const THEME_CLASS_DARK = "theme-dark";

/**
 * Применяет тему оформления к документу
 * @param {ThemeId} theme - идентификатор темы ("light" или "dark")
 */
export function applyTheme(theme: ThemeId) {
    if (theme === "dark") {
        document.documentElement.classList.add(THEME_CLASS_DARK);
    } else {
        document.documentElement.classList.remove(THEME_CLASS_DARK);
    }
}
