import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { throttle } from './throttle.ts';

describe('throttle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('calls fn immediately on first invocation', () => {
        const fn = vi.fn();
        const throttled = throttle(fn, 1000);
        throttled('a');
        expect(fn).toHaveBeenCalledOnce();
        expect(fn).toHaveBeenCalledWith('a');
    });

    it('does not call fn again within the delay window', () => {
        const fn = vi.fn();
        const throttled = throttle(fn, 1000);
        throttled('a');
        throttled('b');
        throttled('c');
        expect(fn).toHaveBeenCalledOnce();
    });

    it('schedules a trailing call with the last args after the delay', () => {
        const fn = vi.fn();
        const throttled = throttle(fn, 1000);
        throttled('a');
        throttled('b');
        throttled('c');
        vi.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenLastCalledWith('c');
    });

    it('calls fn immediately again once the delay has elapsed', () => {
        const fn = vi.fn();
        const throttled = throttle(fn, 1000);
        throttled('a');
        vi.advanceTimersByTime(1001);
        throttled('b');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenLastCalledWith('b');
    });
});
