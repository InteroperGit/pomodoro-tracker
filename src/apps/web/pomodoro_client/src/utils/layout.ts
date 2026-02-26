/** Точка разрыва для мобильного представления (пиксели) */
const MOBILE_STATE = 768;

let resizeTimeout: number | null = null;

/**
 * Проверяет, является ли текущая ширина окна мобильной
 * @param {number} [threshold=768] - максимальная ширина для мобильной версии
 * @returns {boolean} true если ширина <= threshold
 */
export function useIsMobile(threshold: number = MOBILE_STATE): boolean {
    return window.innerWidth <= threshold;
}

/**
 * Подписывает на изменения макета при изменении размера окна
 * @param {Function} callback - функция обратного вызова при изменении макета
 * @param {number} [threshold=768] - точка разрыва для мобильного
 * @returns {Function} функция для отписки от слушателя событий
 */
export function onLayoutChanged(callback: (isMobile: boolean) => void, threshold: number = MOBILE_STATE) {
    let lastIsMobile = useIsMobile(threshold);
    
    const handler = () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }

        resizeTimeout = window.setTimeout(() => {

            const isMobile = useIsMobile(threshold);
            if (isMobile === lastIsMobile) {
                return;
            }

            lastIsMobile = isMobile;
            callback(useIsMobile(threshold));
        }, 100);
    }

    window.addEventListener("resize", handler);
    return () => {
        window.removeEventListener("resize", handler);
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
    }
}