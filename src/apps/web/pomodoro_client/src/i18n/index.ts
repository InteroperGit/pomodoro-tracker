import type { Locale, Translations } from './types.ts';
import { ru } from './locales/ru.ts';
import { en } from './locales/en.ts';

const locales: Record<Locale, Translations> = { ru, en };
let _locale: Locale = 'ru';

export function setLocale(locale: Locale): void {
    _locale = locale;
}

export function getCurrentLocale(): Locale {
    return _locale;
}

export function t(key: keyof Translations, params?: Record<string, string | number>): string {
    let value = locales[_locale][key];
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            value = value.replaceAll(`{${k}}`, String(v));
        }
    }
    return value;
}
