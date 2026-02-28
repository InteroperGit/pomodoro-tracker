import { describe, it, expect, vi } from 'vitest';
import { createStore } from './store.ts';

describe('createStore', () => {
    it('getState returns the initial state', () => {
        const store = createStore({ count: 0 });
        expect(store.getState()).toEqual({ count: 0 });
    });

    it('setState updates the state', () => {
        const store = createStore({ count: 0 });
        store.setState({ count: 5 });
        expect(store.getState()).toEqual({ count: 5 });
    });

    it('subscribe listener is called on setState', () => {
        const store = createStore({ count: 0 });
        const listener = vi.fn();
        store.subscribe(listener);
        store.setState({ count: 1 });
        expect(listener).toHaveBeenCalledOnce();
        expect(listener).toHaveBeenCalledWith({ count: 1 });
    });

    it('unsubscribe stops the listener from being called', () => {
        const store = createStore({ count: 0 });
        const listener = vi.fn();
        const unsubscribe = store.subscribe(listener);
        unsubscribe();
        store.setState({ count: 1 });
        expect(listener).not.toHaveBeenCalled();
    });

    it('multiple subscribers are all notified', () => {
        const store = createStore({ value: 'a' });
        const l1 = vi.fn();
        const l2 = vi.fn();
        store.subscribe(l1);
        store.subscribe(l2);
        store.setState({ value: 'b' });
        expect(l1).toHaveBeenCalledOnce();
        expect(l2).toHaveBeenCalledOnce();
    });
});
