/** Функция-эффект для выполнения побочных эффектов при монтировании */
type Effect = () => void | (() => void);

let componentMountQueue: Array<Effect> = [];
let componentCleanupQueue: Array<() => void> = [];

/**
 * Рендерит приложение в корневой элемент и выполняет эффекты
 * @template Context
 * @param {HTMLElement} root - корневой DOM элемент
 * @param {Function} app - функция приложения, возвращающая HTML-строку
 * @param {Context} ctx - контекст для приложения
 */
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

/**
 * Зарегистрировать эффект для выполнения после рендеринга
 * @param {Function} effect - функция побочного эффекта
 */
export function useEffect(effect: () => void) {
    componentMountQueue.push(effect);
}