/**
 * Проверяет, сфокусировано ли какое-либо поле ввода
 * @returns {boolean} true если INPUT или TEXTAREA в фокусе
 */
export const hasActiveInput = () => {
    const active = document.activeElement;
    const isInputFocused = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    return isInputFocused;
}