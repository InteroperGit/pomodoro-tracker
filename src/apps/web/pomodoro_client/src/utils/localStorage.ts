import type {IStorage} from "../types/iStorage.ts";

/**
 * Реализация хранилища на основе browser localStorage с префиксом
 */
export class LocalStorage implements IStorage {
    private prefix: string = "";

    /**
     * @param {string} prefix - префикс для всех ключей в localStorage
     */
    constructor(prefix: string) {
        this.prefix = prefix;
    }

    /**
     * Получить значение из localStorage
     * @template T
     * @param {string} key - ключ
     * @returns {T|null} распарсенное значение или null
     */
    getItem<T>(key: string): T | null {
        const item = localStorage.getItem(this.prefix + key);
        return item ? (JSON.parse(item) as T) : null;
    }

    /**
     * Сохранить значение в localStorage
     * @template T
     * @param {string} key - ключ
     * @param {T} value - значение (будет сериализовано в JSON)
     */
    setItem<T>(key: string, value: T): void {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    /**
     * Удалить значение из localStorage
     * @param {string} key - ключ
     */
    removeItem(key: string): void {
        localStorage.removeItem(this.prefix + key);
    }

    /**
     * Удалить все значения с текущим префиксом
     */
    clear(): void {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * Получить все ключи с текущим префиксом
     * @returns {string[]} массив ключей без префикса
     */
    keys(): string[] {
        return Object.keys(localStorage)
            .filter(k => k.startsWith(this.prefix))
            .map(k => k.slice(this.prefix.length));
    }
}