# Task 09 — Align CSS Custom Properties Across Themes

**Category**: Code Quality / UX
**Priority**: Low
**Effort**: Small
**Phase**: 5 — Polish

## Problem

`src/css/default_theme.css` defines 7 CSS custom properties. `src/css/dark_theme.css` defines 9 — it adds `--text-primary` and `--text-secondary` that have no counterpart in the light theme.

Any component that uses `var(--text-primary)` will get the browser's default (`unset` / inherited) in light mode and `#ffffff` in dark mode, creating a potential invisible-text bug in light mode depending on the component's background color.

The `dark_theme.css` also lacks documentation for what each variable controls, making it difficult to add a third theme without reading all SCSS files to understand coverage.

## Solution

1. Audit all `.module.scss` files for `var(--*)` usage and build a complete list of required custom properties.
2. Add all missing variables to `default_theme.css` with their correct light-mode values.
3. Ensure `dark_theme.css` overrides every variable defined in `default_theme.css` — a future theme simply needs to override the same set.
4. Add a brief comment above each variable group explaining its semantic role (e.g., `/* Typography */`, `/* Surfaces */`, `/* Brand */`).

## Files Likely Affected

- `src/css/default_theme.css` — add missing variables
- `src/css/dark_theme.css` — ensure full coverage and add comments

## Expected Benefit

No light-mode component can accidentally use an undefined CSS variable. Adding a third theme (e.g., sepia, high-contrast) requires only one CSS file with the known set of variables. The theming contract is explicit and self-documenting.
