import styles from "./Toolbar.module.scss";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";

/**
 * Пропсы компонента верхней панели приложения.
 * @typedef {Object} ToolbarProps
 * @property {boolean} isMobile - признак мобильного вида (на мобильном навигация скрыта).
 */
export type ToolbarProps = {
    isMobile: boolean;
};

/**
 * Компонент `Toolbar` — верхняя панель (шапка) Pomodoro‑приложения.
 * Содержит логотип и, на десктопе, блок навигации.
 *
 * @param {ToolbarProps} props - пропсы компонента.
 * @param {boolean} props.isMobile - если `true`, отображается только логотип; иначе логотип и навигация.
 * @returns {string} HTML‑разметка элемента `<header>` с логотипом и опционально навигацией.
 *
 * @example
 * import { Toolbar } from './Toolbar';
 *
 * const html = Toolbar({ isMobile: false });
 */
export function Toolbar({ isMobile }: ToolbarProps) {
    const logo = Logo();
    const navigation = Navigation();

    return isMobile
        ? `
            <header class="${styles.header}">
                ${logo}
            </header>
        `
        : `
            <header class="${styles.header}">
                ${logo}
                ${navigation}
            </header>
        `;
}