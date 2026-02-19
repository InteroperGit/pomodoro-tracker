export function throttle<F extends unknown[]>(
    fn: (...args: F) => void, 
    delay: number): (...args: F) => void {

    let lastCall = 0;
    let timeoutId: number | null = null;
    let lastArgs: F | null = null;

    return (...args: F) => {
        const now = Date.now();
        const remaining = delay - (now - lastCall);

        lastArgs = args;

        if (remaining <= 0) {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            lastCall = now;
            fn(...args);
        }
        else if (timeoutId === null) {
            timeoutId = window.setTimeout(() => {
                lastCall = Date.now();
                timeoutId = null;
                if (lastArgs) {
                    fn(...lastArgs);
                }
            }, remaining);
        }
    };
}