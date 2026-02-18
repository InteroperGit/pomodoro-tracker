interface EventPayloadMap {
    [event: string]: unknown;  // T для каждого события
}

type EventHandlers<T extends EventPayloadMap = Record<string, unknown>> = {
    [K in keyof T]: ((args?: T[K]) => void)[];
};

export class EventBus<T extends Record<string, unknown> = Record<string, unknown>> {
    private _handlers: EventHandlers<T> = {} as EventHandlers<T>;

    addEventListener<K extends keyof T>(event: K, handler: (args?: T[K]) => void): void {
        if (!this._handlers[event]) {
            this._handlers[event] = [];
        }
        this._handlers[event]!.push(handler);
    }

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

    getListeners<K extends keyof T>(event: K): ((args?: T[K]) => void)[]  {
        return this._handlers[event] ?? [];
    }

    /**
     * Вызывает всех обработчиков для заданного события
     */
    emit<K extends keyof T>(event: K, args?: T[K]): void {
        const handlers = this._handlers[event];
        if (handlers) {
            // Создаем копию массива для избежания проблем при добавлении/удалении обработчиков
            handlers.slice().forEach(handler => handler(args));
        }
    }
}