const notificationsSupported = "Notification" in window;

/**
 * Запрашивает разрешение на показ уведомлений.
 * Вызывается один раз при первом старте помидора.
 * Если разрешение уже выдано или отклонено — ничего не делает.
 */
export async function requestNotificationPermission(): Promise<void> {
    if (!notificationsSupported || Notification.permission !== "default") {
        return;
    }
    await Notification.requestPermission();
}

/**
 * Показывает системное уведомление, если разрешение выдано.
 * @param {string} title - заголовок уведомления
 */
export function sendNotification(title: string): void {
    if (!notificationsSupported || Notification.permission !== "granted") {
        return;
    }
    new Notification(title);
}
