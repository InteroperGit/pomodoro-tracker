export type Unsubscribe = () => void;

export function createStore<S>(initial: S) {
    let state = initial;
    const listeners = new Set<(s: S) => void>;

    return {
        getState: () => state,
        setState: (next: S) => {
            state = next;
            listeners.forEach(listener => listener(state));
        },
        subscribe: (listener: (s: S) => void): Unsubscribe => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    }
}