declare global {
    var componentMountQueue: Array<() => void>;
}

if (!globalThis.componentMountQueue) {
    globalThis.componentMountQueue = [];
}

export function render<Context>(root: HTMLElement, app: (ctx: Context) => string, ctx: Context) {
    root.innerHTML = app(ctx);
    globalThis.componentMountQueue.forEach((effect) => {
        effect();
    })
}

export function useEffect(effect: () => void) {
    globalThis.componentMountQueue.push(effect);
}