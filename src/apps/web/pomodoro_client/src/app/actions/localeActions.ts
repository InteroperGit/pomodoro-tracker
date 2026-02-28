import type { AppState } from '../../types/context.ts';
import type { Store } from '../../utils/store.ts';
import type { Locale } from '../../i18n/types.ts';
import { setLocale as i18nSetLocale } from '../../i18n/index.ts';

export function createLocaleActions(store: Store<AppState>) {
    return {
        setLocale(locale: Locale): void {
            i18nSetLocale(locale);
            store.setState({ ...store.getState(), locale });
        },
    };
}
