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