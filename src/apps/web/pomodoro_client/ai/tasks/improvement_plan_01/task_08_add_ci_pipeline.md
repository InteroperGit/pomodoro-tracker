# Task 08 — Add CI Pipeline

**Category**: Developer Experience
**Priority**: Medium
**Effort**: Small
**Phase**: 3 — Testing & Developer Experience Infrastructure

## Problem

There is no CI configuration in the repository. The `package.json` defines `pnpm build` (which runs `tsc && vite build`), `pnpm typecheck`, and `pnpm lint`, but these are never enforced automatically. A contributor can push code that fails TypeScript compilation or ESLint rules without any feedback until a local `pnpm build` is run.

## Solution

1. Add a GitHub Actions workflow at `.github/workflows/ci.yml`.
2. Trigger on `push` and `pull_request` to `main`.
3. Jobs:
   - `typecheck`: runs `pnpm typecheck`
   - `lint`: runs `pnpm lint`
   - `build`: runs `pnpm build`
   - `test`: runs `pnpm test` (once Vitest is introduced — Task 03)
4. Cache `node_modules` using the pnpm cache action to keep CI fast.

## Example Workflow Structure

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

## Files Likely Affected

- `.github/workflows/ci.yml` — new file

## Expected Benefit

Broken builds caught immediately on push. TypeScript errors introduced by refactoring are surfaced before merging. Provides a public green/red status badge.

## Note

Add the `test` job after Task 03 (Vitest) is completed. The other three jobs can be added independently.
