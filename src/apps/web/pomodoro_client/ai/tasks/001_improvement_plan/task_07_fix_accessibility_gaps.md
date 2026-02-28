# Task 07 — Fix Accessibility Gaps

**Category**: UX / Accessibility (a11y)
**Priority**: Medium
**Effort**: Small
**Phase**: 2 — Reliability & Correctness

## Problem

Several accessibility issues are present across the codebase:

### 1. Wrong `lang` attribute
`index.html` has `lang="en"` but all UI text, aria-labels, toast messages, and error strings are in Russian. Screen readers use the `lang` attribute to select the correct pronunciation engine. A Russian speaker using a screen reader will hear English phoneme rules applied to Russian text.

### 2. `user-scalable=0` in viewport meta
The viewport meta tag disables browser zoom. WCAG 2.1 Success Criterion 1.4.4 (Resize Text, Level AA) requires that text can be resized up to 200% without loss of functionality. Disabling user scaling directly violates this criterion.

### 3. Excessive `aria-live` announcements
The timer countdown has `aria-live="polite"` and is updated every second via direct DOM manipulation. For a 25-minute session, this results in ~1500 screen reader announcements — one per tick.

### 4. Aria-label typo
`aria-label="Количество помодоро"` (in `PlanTask.ts` and mobile view) should be `"Количество помидоро"`.

## Solution

1. Change `<html lang="en">` to `<html lang="ru">` in `index.html`.
2. Remove `user-scalable=0` (and `user-scalable=no` if present) from the viewport meta tag. Fix any layout issues caused by zoom in CSS instead.
3. Change the `timer__countdown` element to `aria-live="off"`. Add a visually-hidden `<span aria-live="polite">` that is updated only at key moments: timer started, paused, every 5 minutes, and on completion.
4. Fix the typo in all aria-labels across all affected component files.

## Files Likely Affected

- `index.html` — fix `lang` and viewport meta
- `src/components/Timer/index.ts` — fix `aria-live` handling
- `src/components/PlanTask/index.ts` — fix aria-label typo
- Any other component with the same aria-label

## Expected Benefit

Correct screen reader pronunciation for Russian users. WCAG 1.4.4 compliance. Elimination of 1500 screen reader announcements per session. Correct semantic labeling.
