/** Карта типов событий и их данных */
interface EventPayloadMap {
    [event: string]: unknown;
}

/** Обработчики событий для каждого типа события */
type EventHandlers<T extends EventPayloadMap = Record<string, unknown>> = {
    [K in keyof T]: ((args?: T[K]) => void)[];
};

/**
 * Шина событий для типобезопасной публикации и подписки на события
 * @template T - карта типов событий
 */
export class EventBus<T extends Record<string, unknown> = Record<string, unknown>> {
    private _handlers: EventHandlers<T> = {} as EventHandlers<T>;

    /**
     * Подписать обработчик на событие
     * @template K
     * @param {K} event - название события
     * @param {Function} handler - функция-обработчик
     */
    addEventListener<K extends keyof T>(event: K, handler: (args?: T[K]) => void): void {
        if (!this._handlers[event]) {
            this._handlers[event] = [];
        }
        this._handlers[event]!.push(handler);
    }

    /**
     * Отписать обработчик от события
     * @template K
     * @param {K} event - название события
     * @param {Function} handler - функция-обработчик для отписки
     */
    removeEventListener<K extends keyof T>(
        event: K,
        handler: (args?: T[K]) => void
    ): void {
        const handlers = this._handlers[event];
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Получить всех подписчиков события
     * @template K
     * @param {K} event - название события
     * @returns {Array} массив обработчиков
     */
    getListeners<K extends keyof T>(event: K): ((args?: T[K]) => void)[]  {
        return this._handlers[event] ?? [];
    }

    /**
     * Опубликовать событие всем подписчикам
     * @template K
     * @param {K} event - название события
     * @param {any} [args] - данные события
     */
    emit<K extends keyof T>(event: K, args?: T[K]): void {
        const handlers = this._handlers[event];
        if (handlers) {
            handlers.slice().forEach(handler => handler(args));
        }
    }
}