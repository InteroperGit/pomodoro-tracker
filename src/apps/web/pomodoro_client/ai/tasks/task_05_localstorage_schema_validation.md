# Task 05 — Add Runtime State Schema Validation on localStorage Restore

**Category**: Architecture / Security
**Priority**: Medium
**Effort**: Small
**Phase**: 2 — Reliability & Correctness

## Problem

In `src/app/main.ts`, persisted state is loaded with:

```typescript
state = storage.getItem<AppState>(STATE_ITEM_KEY);
```

`LocalStorage.getItem` in `src/utils/localStorage.ts` does `JSON.parse(item) as T` — a TypeScript type assertion with no runtime check. If the user's persisted state was written by an older version of the app with a different `AppState` shape (e.g., a missing field, a renamed enum value, or a changed statistics structure), the `as AppState` cast succeeds silently and the app proceeds with a structurally invalid object. This results in `Cannot read properties of undefined` errors at any downstream point.

The existing `sanitizeActiveTask` guard in `src/utils/activeTask.ts` covers only the `activeTask` field.

## Solution

1. Write `validateAppState(raw: unknown): AppState | null` in `src/utils/stateSchema.ts` with explicit structural checks:
   - Verify required top-level keys exist
   - Check `planTasks.tasks` is an array
   - Check each task has `id`, `category`, `description` of the correct types
   - Check `theme` is `"light"` or `"dark"`
2. Call `validateAppState` in `main.ts` instead of the unchecked cast.
3. On validation failure, fall back to `getInitPlanTasks()` / `getInitArchiveTasks()`.
4. Optionally: store a `schemaVersion` field and migrate old shapes before validation.

## Files Likely Affected

- `src/utils/stateSchema.ts` — new file with `validateAppState`
- `src/app/main.ts` — replace unchecked cast with `validateAppState` call
- `src/utils/localStorage.ts` — optionally keep generic for other uses

## Expected Benefit

Eliminates a class of runtime crashes from stale or corrupted persisted state. Makes future schema changes safe to deploy without wiping user data.
