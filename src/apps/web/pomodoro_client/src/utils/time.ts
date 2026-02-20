export function toHumanHourMinutesTime(time: number) {
    const timeSec = time / 1000;
    const hours = Math.floor(timeSec / 3600 );
    const minutes = Math.floor((timeSec % 3600) / 60);

    return hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
}

export function toHumanMinutesSecondsTime(time: number) {
    const timeSec = time / 1000;
    const minutes = Math.floor(timeSec / 60 );
    const seconds = Math.floor(timeSec % 60) ;

    return minutes > 0
        ? seconds > 0
            ? `${minutes} мин ${seconds} сек`
            : `${minutes} мин`
        : `${seconds} сек`;
}

/**
 * Форматирует timestamp в читаемое время с учетом даты.
 * Если задача выполнена сегодня - показывает только время.
 * Если задача выполнена в другой день - показывает дату и время.
 * @param completedAt - timestamp в миллисекундах
 * @returns объект с отформатированным временем и ISO строкой для атрибута datetime
 */
export function formatCompletedTime(completedAt: number): { display: string; iso: string } {
    try {
        const completedDate = new Date(completedAt);
        
        // Проверка валидности даты
        if (isNaN(completedDate.getTime())) {
            return { display: '--:--', iso: '' };
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const completedDay = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate());
        
        const isToday = completedDay.getTime() === today.getTime();
        
        if (isToday) {
            // Сегодня - показываем только время
            const timeString = completedDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            return {
                display: timeString,
                iso: completedDate.toISOString()
            };
        } else {
            // Другая дата - показываем дату и время
            const dateTimeString = completedDate.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return {
                display: dateTimeString,
                iso: completedDate.toISOString()
            };
        }
    } catch(error) {
        console.error(error);
        // Обработка ошибок при форматировании
        return { display: '--:--', iso: '' };
    }
}