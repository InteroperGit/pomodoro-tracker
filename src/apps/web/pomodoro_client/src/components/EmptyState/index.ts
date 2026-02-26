import styles from "./EmptyState.module.scss";
import { ICON_CLIPBOARD, ICON_ARCHIVE, ICON_TIMER } from "./icons.ts";

/**
 * Варианты пустого состояния
 * @enum {string}
 */
export type EmptyStateVariant = "plan" | "archive" | "timer_no_plan" | "timer_no_active";

/**
 * Свойства компонента пустого состояния
 * @typedef {Object} EmptyStateProps
 * @property {EmptyStateVariant} variant - вариант пустого состояния
 * @property {string} title - заголовок
 * @property {string} [subtitle] - подзаголовок
 * @property {string} [className] - дополнительный CSS класс
 */
export type EmptyStateProps = {
  variant: EmptyStateVariant;
  title: string;
  subtitle?: string;
  className?: string;
};

/**
 * Маппинг вариантов к их иконкам
 * @type {Record<EmptyStateVariant, string>}
 */
const ICONS: Record<EmptyStateVariant, string> = {
  plan: ICON_CLIPBOARD,
  archive: ICON_ARCHIVE,
  timer_no_plan: ICON_TIMER,
  timer_no_active: ICON_TIMER,
};

/**
 * Компонент пустого состояния с иконкой и текстом
 * @param {EmptyStateProps} props - свойства компонента
 * @returns {string} HTML-строка компонента
 */
export function EmptyState({ variant, title, subtitle, className = "" }: EmptyStateProps): string {
  const icon = ICONS[variant];
  return `
    <div class="${styles.empty_state} ${className}" role="status" aria-live="polite">
      <div class="${styles.empty_state_icon}">${icon}</div>
      <div class="${styles.empty_state_title}">${title}</div>
      ${subtitle ? `<div class="${styles.empty_state_subtitle}">${subtitle}</div>` : ""}
    </div>
  `;
}
