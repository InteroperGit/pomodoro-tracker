type Effect = () => void | (() => void);

let componentMountQueue: Array<Effect> = [];
let componentCleanupQueue: Array<() => void> = [];

export function render<Context>(root: HTMLElement, app: (ctx: Context) => string, ctx: Context) {
    componentCleanupQueue.forEach((fn) => fn());
    componentCleanupQueue = [];

    componentMountQueue = [];
    
    root.innerHTML = app(ctx);

    componentMountQueue.forEach((effect) => {
        const cleanup = effect();

        if (typeof cleanup === 'function') {
            componentCleanupQueue.push(cleanup);
        }
    });
}

export function useEffect(effect: () => void) {
    componentMountQueue.push(effect);
}