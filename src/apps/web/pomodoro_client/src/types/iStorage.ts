/**
 * Интерфейс хранилища (localStorage, sessionStorage и т.д.)
 */
export interface IStorage {
    /**
     * Сохранить значение в хранилище
     * @template T
     * @param {string} key - ключ
     * @param {T} value - значение
     */
    setItem<T>(key: string, value: T): void;
    /**
     * Получить значение из хранилища
     * @template T
     * @param {string} key - ключ
     * @returns {T|null} значение или null если не найдено
     */
    getItem<T>(key: string): T | null;
    /**
     * Удалить значение из хранилища
     * @param {string} key - ключ
     */
    removeItem(key: string): void;
    /**
     * Очистить все хранилище
     */
    clear(): void;
    /**
     * Получить все ключи из хранилища
     * @returns {string[]} массив ключей
     */
    keys(): string[];
}