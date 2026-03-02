# Playwright configuration — pomodoro_client

## Overview

E2e tests live in `src/apps/web/pomodoro_client/tests/e2e/`.
Config: `src/apps/web/pomodoro_client/playwright.config.ts`.

---

## Browsers

| Project | Browser | Notes |
|---------|---------|-------|
| `chromium` | Desktop Chrome | — |
| `firefox` | Desktop Firefox | `workers: 1`, `--no-sandbox` (stability) |
| `edge` | Desktop Edge | requires Edge installed locally |
| `webkit` | Desktop Safari | — |

Run a single browser:

```bash
pnpm test:e2e:chromium
pnpm test:e2e:firefox
pnpm test:e2e:webkit
pnpm test:e2e:edge
```

---

## Dev server

Playwright starts `pnpm dev` automatically (`webServer.command`) and waits for
`http://localhost:5173`. If a dev server is already running it is reused
(`reuseExistingServer: true`).

Host and port are defined in `dev-server.config.ts`:

```ts
export const DEV_SERVER_HOST = 'localhost';
export const DEV_SERVER_PORT = 5173;
```

---

## Timeouts & retries

| Setting | Value |
|---------|-------|
| Test timeout | 30 s |
| Assertion timeout | 8 s |
| Retries | 1 (all browsers) |
| Trace | `on-first-retry` |

---

## Environment variables and timer values

The timer durations are configured via `VITE_*` env variables read in
`src/app/config.ts`. The `.env` file at the project root sets the defaults
used by both the dev server and `pnpm test:e2e`:

```env
# src/apps/web/pomodoro_client/.env
VITE_TASK_TIME_MIN=25
VITE_SHORT_BREAK_TIME_MIN=5
VITE_LONG_BREAK_TIME_MIN=15
VITE_LONG_BREAK_AFTER=4
```

The e2e constants in `tests/e2e/constants.ts` are **hardcoded to match these
default values**:

```ts
export const TIMER_TASK        = '25:00';  // VITE_TASK_TIME_MIN=25
export const TIMER_SHORT_BREAK = '05:00';  // VITE_SHORT_BREAK_TIME_MIN=5
export const TIMER_LONG_BREAK  = '15:00';  // VITE_LONG_BREAK_TIME_MIN=15
```

> **Important**: if you change any `VITE_*` timer value in `.env`, you must
> update the corresponding constants in `tests/e2e/constants.ts` to keep tests
> passing.

---

## Fake time (clock)

Tests that advance the timer use `page.clock.install()` in `beforeEach`. This
freezes real time and lets tests tick the clock programmatically without
waiting 25 real minutes.

Only add `page.clock.install()` to specs that actually need it — it is not
in the global `beforeEach`.

```ts
test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});
```

---

## Reporters

| Environment | Reporter |
|-------------|----------|
| Local | `list` |
| CI (`CI=true`) | `list` + `html` (saved, never auto-opened) |

---

## Running tests

```bash
# all browsers
pnpm test:e2e

# single browser
pnpm test:e2e:chromium

# specific file
pnpm test:e2e --project=chromium tests/e2e/timerControls.spec.ts

# headed (see the browser)
pnpm test:e2e --headed --project=chromium
```
