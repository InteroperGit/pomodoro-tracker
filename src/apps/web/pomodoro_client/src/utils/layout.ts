const MOBILE_STATE = 768;

let resizeTimeout: number | null = null;

export function useIsMobile(threshold: number = MOBILE_STATE): boolean {
    return window.innerWidth <= threshold;
}

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