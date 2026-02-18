export interface IStorage {
    setItem<T>(key: string, value: T): void;
    getItem<T>(key: string): T | null;
    removeItem(key: string): void;
    clear(): void;
    keys(): string[];
}