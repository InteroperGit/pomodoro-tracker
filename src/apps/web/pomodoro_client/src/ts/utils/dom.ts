/**
 * Ищет элемент в DOM по id.
 * @param {string} id
 * @returns {Element|null}
 */
export function findById(id: string): HTMLElement | null {
    if (typeof id !== 'string' || id.length === 0) {
        return null;
    }

    return document.getElementById(id);
}