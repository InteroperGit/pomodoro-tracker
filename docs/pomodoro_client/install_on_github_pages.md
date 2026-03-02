# Deploy pomodoro_client to GitHub Pages

## Prerequisites

- Repository hosted on GitHub
- `pnpm` installed locally (v10.7.0)
- Node.js 22 LTS installed locally

---

## 1. Set the correct base path

The app must know the sub-path it will be served from.
GitHub Pages serves project repos at `https://<username>.github.io/<repo-name>/`.

Open `src/apps/web/pomodoro_client/package.json` and update the `build:gh-pages` script
to match your repository name:

```json
"build:gh-pages": "tsc && vite build --base=/<repo-name>/"
```

Example — if your repo is `pomodoro-tracker`:

```json
"build:gh-pages": "tsc && vite build --base=/pomodoro-tracker/"
```

> If you deploy to a **user/org page** (`<username>.github.io` with no sub-path),
> use `--base=/` or simply use the regular `build` script instead.


## 3. Pass environment variables (optional)

If your build needs `VITE_*` variables, store them in GitHub first:

**Settings → Secrets and variables → Actions**

| Type | Use for |
|------|---------|
| **Secret** | Sensitive values (API keys, tokens) — masked in logs |
| **Variable** | Non-sensitive config (URLs, feature flags) |

> Only variables prefixed with `VITE_` are included in the browser bundle.
> Never put private keys or passwords in `VITE_*` — they become public.

```env
VITE_TASK_TIME_MIN=25
VITE_SHORT_BREAK_TIME_MIN=5
VITE_LONG_BREAK_TIME_MIN=15
VITE_LONG_BREAK_AFTER=4
```

---

## 4. Enable GitHub Pages in repository settings

1. Go to **Settings → Pages**
2. Under **Source** select **GitHub Actions**
3. Save

---

## 5. Push and verify

```bash
git add .github/workflows/deploy-gh-pages.yml
git commit -m "[Chore] Add GitHub Pages deployment workflow"
git push origin main
```

Open **Actions** tab in GitHub to watch the workflow run.
When it finishes, the app is live at:

```
https://<username>.github.io/<repo-name>/
```

---

## Local test before pushing

Build and preview locally with the same base path:

```bash
cd src/apps/web/pomodoro_client
pnpm build:gh-pages
pnpm preview --base=/<repo-name>/
```

Open `http://localhost:4173/<repo-name>/` to verify assets load correctly.
