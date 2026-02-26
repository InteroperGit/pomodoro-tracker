/**
 * Экранирует HTML-символы для безопасного отображения
 * Защищает от XSS-атак при выводе пользовательского контента
 * @param {string|null|undefined} text - текст для экранирования
 * @returns {string} экранированный текст
 */
export function escapeHtml(text: string | null | undefined): string {
    if (text == null) {
        return '';
    }

    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };

    return String(text).replace(/[&<>"']/g, (char) => map[char]);
}
