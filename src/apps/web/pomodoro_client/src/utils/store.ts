/** Функция отписки от изменений состояния */
export type Unsubscribe = () => void;

/** Тип хранилища состояния */
export type Store<S> = ReturnType<typeof createStore<S>>;

/**
 * Создает простое реактивное хранилище состояния
 * @template S - тип состояния
 * @param {S} initial - начальное состояние
 * @returns {Object} объект хранилища с методами get/set/subscribe
 */
export function createStore<S>(initial: S) {
    let state = initial;
    const listeners = new Set<(s: S) => void>;

    return {
        /**
         * Получить текущее состояние
         * @returns {S} текущее состояние
         */
        getState: () => state,
        /**
         * Обновить состояние и уведомить всех подписчиков
         * @param {S} next - новое состояние
         */
        setState: (next: S) => {
            state = next;
            listeners.forEach(listener => listener(state));
        },
        /**
         * Подписать функцию на изменения состояния
         * @param {Function} listener - функция обратного вызова
         * @returns {Unsubscribe} функция отписки
         */
        subscribe: (listener: (s: S) => void): Unsubscribe => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    }
}