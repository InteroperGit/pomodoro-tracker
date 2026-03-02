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

---

## 2. Create the GitHub Actions workflow

Create the file `.github/workflows/deploy-gh-pages.yml` in the repository root:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.7.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: src/apps/web/pomodoro_client/pnpm-lock.yaml

      - name: Install dependencies
        working-directory: src/apps/web/pomodoro_client
        run: pnpm install --frozen-lockfile

      - name: Build
        working-directory: src/apps/web/pomodoro_client
        run: pnpm build:gh-pages

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: src/apps/web/pomodoro_client/dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 3. Pass environment variables (optional)

If your build needs `VITE_*` variables, store them in GitHub first:

**Settings → Secrets and variables → Actions**

| Type | Use for |
|------|---------|
| **Secret** | Sensitive values (API keys, tokens) — masked in logs |
| **Variable** | Non-sensitive config (URLs, feature flags) |

Then add an `env:` block to the Build step:

```yaml
      - name: Build
        working-directory: src/apps/web/pomodoro_client
        run: pnpm build:gh-pages
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}
          VITE_ANALYTICS_ID: ${{ secrets.VITE_ANALYTICS_ID }}
```

Access them in code via `import.meta.env.VITE_*`:

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

> Only variables prefixed with `VITE_` are included in the browser bundle.
> Never put private keys or passwords in `VITE_*` — they become public.

For local development create `src/apps/web/pomodoro_client/.env.local` (gitignored):

```env
VITE_API_URL=http://localhost:3000
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
