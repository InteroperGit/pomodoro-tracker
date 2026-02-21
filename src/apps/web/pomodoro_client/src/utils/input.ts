export const hasActiveInput = () => {
    const active = document.activeElement;
    const isInputFocused = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    return isInputFocused;
}