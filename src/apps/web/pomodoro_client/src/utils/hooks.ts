/**
 * Получить CSS селектор для управления плановыми задачами
 * @returns {string} CSS селектор
 */
export function useGetPlanTaskControlSelector(): keyof HTMLElementTagNameMap {
    return '[data-planTaskId]' as keyof HTMLElementTagNameMap;
}