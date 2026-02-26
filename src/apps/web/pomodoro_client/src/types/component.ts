/** Тип свойств компонента */
export type Props = Record<string, unknown>;

/**
 * Функция-компонент, возвращает HTML-строку
 * @typedef {Function} Component
 * @param {Props} [props] - свойства компонента
 * @returns {string} HTML-строка компонента
 */
export type Component = (props?: Props) => string;