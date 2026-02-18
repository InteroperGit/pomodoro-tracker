const MOBILE_STATE = 768;

let resizeTimeout: number | null = null;

export function useIsMobile(threshold: number = MOBILE_STATE): boolean {
    return window.innerWidth <= threshold;
}

export function onLayoutChanged(callback: (isMobile: boolean) => void, threshold: number = MOBILE_STATE) {
    const handler = () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }

        resizeTimeout = window.setTimeout(() => {
            callback(useIsMobile(threshold));
        }, 100);
    }

    window.addEventListener("resized", handler);
    return () => {
        window.removeEventListener("resize", handler);
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
    }
}