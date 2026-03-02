# 002 — Deployment Plan: Docker + nginx

## Goal

Package the Pomodoro SPA as a Docker image served by nginx, with a docker-compose
file for production deployment.

---

## File Placement

| File | Location |
|------|----------|
| `Dockerfile` | `pomodoro_client/` |
| `nginx.conf` | `pomodoro_client/` |
| `.dockerignore` | `pomodoro_client/` |
| `docker-compose.yml` | `deploy/pomodoro_client/prod/` |

---

## Dockerfile (multi-stage)

**Stage 1 — builder** (`node:22-alpine`):
1. Enable corepack, pin pnpm@10.7.0.
2. Copy `package.json` + `pnpm-lock.yaml`, run `pnpm install --frozen-lockfile`.
3. Copy source, run `pnpm build` → output in `dist/`.

**Stage 2 — server** (`nginx:1.27-alpine`):
1. Remove default nginx config.
2. Copy `nginx.conf` → `/etc/nginx/conf.d/default.conf`.
3. Copy `dist/` → `/usr/share/nginx/html`.
4. Expose port 80.

---

## nginx.conf

- SPA routing: `try_files $uri $uri/ /index.html`
- Hashed assets (`/assets/`): `Cache-Control: public, max-age=31536000, immutable`
- `index.html`: `Cache-Control: no-cache`
- gzip enabled for text/css/js/json/svg

---

## .dockerignore

Excludes: `node_modules`, `dist`, `.git`, `tests`, `ai`, `playwright-report`,
`test-results`, `*.local`

---

## docker-compose.yml

- Build context: `../../../src/apps/web/pomodoro_client` (relative to compose file)
- Image tag: `pomodoro_client:prod`
- Port: `80:80`
- Restart policy: `unless-stopped`

---

## Build & Deploy

```bash
# From deploy/pomodoro_client/prod/
docker compose build
docker compose up -d

# Or one-liner:
docker compose up -d --build
```

## Notes

- Node 22 LTS is used in the build stage (dev uses Node 25; 22 is the latest LTS).
- pnpm version pinned to 10.7.0 (matches local dev).
- Vite outputs to `dist/` by default (no custom `outDir` in vite.config.ts).
