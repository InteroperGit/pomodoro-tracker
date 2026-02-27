import type { AppState, ThemeId } from "../../types/context.ts";
import type { Store } from "../../utils/store.ts";
import { applyTheme } from "../../utils/theme.ts";

/**
 * Создает набор действий для управления темой оформления
 * @param {Store<AppState>} store - хранилище состояния
 */
export function createThemeActions(store: Store<AppState>) {
    return {
        setTheme(theme: ThemeId): void {
            applyTheme(theme);
            store.setState({ ...store.getState(), theme });
        },
    };
}
