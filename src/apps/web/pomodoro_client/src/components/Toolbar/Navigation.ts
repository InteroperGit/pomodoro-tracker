import styles from "./Navigation.module.scss";

/**
 * Компонент навигационного блока для панели инструментов
 * Может быть расширен для добавления пунктов меню
 * @returns {string} HTML-строка компонента навигации
 */
export function Navigation() {
    return `
        <nav class="${styles.navigation}" aria-label="Основное меню">
        </nav>
    `;
}