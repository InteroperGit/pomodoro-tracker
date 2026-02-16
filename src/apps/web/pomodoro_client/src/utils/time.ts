export function toHumanHourMinTime(time: number) {
    const timeSec = time / 1000;
    const hours = Math.floor(timeSec / 3600 );
    const minutes = Math.floor((timeSec % 3600) / 60);

    return hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
}