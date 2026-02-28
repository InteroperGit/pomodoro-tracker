import { describe, it, expect, vi } from 'vitest';
import { render, useEffect } from './render.ts';

describe('render', () => {
    it('sets root innerHTML from the app function', () => {
        const root = document.createElement('div');
        render(root, () => '<p>hello</p>', {});
        expect(root.innerHTML).toBe('<p>hello</p>');
    });

    it('runs useEffect callbacks after rendering', () => {
        const effect = vi.fn();
        const root = document.createElement('div');
        render(root, () => {
            useEffect(effect);
            return '';
        }, {});
        expect(effect).toHaveBeenCalledOnce();
    });

    it('calls cleanup returned by useEffect before next render', () => {
        const cleanup = vi.fn();
        const root = document.createElement('div');

        render(root, () => {
            useEffect(() => cleanup);
            return '';
        }, {});

        expect(cleanup).not.toHaveBeenCalled();

        render(root, () => '', {});

        expect(cleanup).toHaveBeenCalledOnce();
    });

    it('does not call cleanup if effect returns nothing', () => {
        const root = document.createElement('div');
        render(root, () => {
            useEffect(() => { /* no return */ });
            return '';
        }, {});
        // Second render should not throw
        expect(() => render(root, () => '', {})).not.toThrow();
    });

    it('runs multiple effects in registration order', () => {
        const calls: number[] = [];
        const root = document.createElement('div');
        render(root, () => {
            useEffect(() => { calls.push(1); });
            useEffect(() => { calls.push(2); });
            return '';
        }, {});
        expect(calls).toEqual([1, 2]);
    });

    it('passes context to the app function', () => {
        const root = document.createElement('div');
        const ctx = { label: 'world' };
        render(root, (c: { label: string }) => `<span>${c.label}</span>`, ctx);
        expect(root.innerHTML).toBe('<span>world</span>');
    });
});
