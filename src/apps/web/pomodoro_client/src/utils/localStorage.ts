import type {IStorage} from "../types/iStorage.ts";

export class LocalStorage implements IStorage {
    private prefix: string = "";

    constructor(prefix: string) {
        this.prefix = prefix;
    }

    getItem<T>(key: string): T | null {
        const item = localStorage.getItem(this.prefix + key);
        return item ? (JSON.parse(item) as T) : null;
    }

    setItem<T>(key: string, value: T): void {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    removeItem(key: string): void {
        localStorage.removeItem(this.prefix + key);
    }

    clear(): void {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    keys(): string[] {
        return Object.keys(localStorage)
            .filter(k => k.startsWith(this.prefix))
            .map(k => k.slice(this.prefix.length));
    }
}