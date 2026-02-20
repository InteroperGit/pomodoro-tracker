/**
 * Экранирует HTML-символы для безопасного отображения пользовательского контента
 * Защищает от XSS-атак
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
