# Load Next Env For Scripts Implementation Plan

Status: COMPLETE
Last modified: 2026-07-21

## Overview

Add a shared script helper that loads Next.js-compatible environment files from the repository root for direct Node/TSX scripts. Wire the helper into scripts that either read Supabase runtime variables directly or spawn validation/test commands that need the same environment.

## Reference

Spec: `dev/features/2026-07-21_load-next-env-for-scripts/spec.md`

Key acceptance criteria:
- Direct scripts can see `NEXT_PUBLIC_SUPABASE_URL` from `.env.local` or `.env`.
- Spawned validation/integration commands inherit the loaded env.
- No local env files or secrets are modified.
- `npm test` and `npm run typecheck` pass.

## File Structure

Create:
- `scripts/load-next-env.ts`

Modify:
- `scripts/approve-waitlist.js`
- `scripts/update-signup-settings.js`
- `scripts/run-local-supabase-validation.ts`
- `scripts/run-supabase-integration-tests.ts`
- `tests/supabase-runtime-docs.test.ts`
- `dev/features/2026-07-21_load-next-env-for-scripts/spec.md`

## Implementation Steps

1. Create `scripts/load-next-env.ts`.
   - Import `loadEnvConfig` from `@next/env`.
   - Export `loadProjectEnv(projectDir = process.cwd())`.
   - Call `loadEnvConfig(projectDir)` inside that function.

2. Wire JS scripts.
   - In `approve-waitlist.js`, require `@next/env` directly and call `loadEnvConfig(process.cwd())` before reading env.
   - In `update-signup-settings.js`, do the same.
   - JS scripts cannot require a TS helper without a runtime transpiler, so they use the same `@next/env` API directly.

3. Wire TS validation runners.
   - In `run-local-supabase-validation.ts`, import and call `loadProjectEnv()` before spawning commands.
   - In `run-supabase-integration-tests.ts`, import and call `loadProjectEnv()` before spawning `tsx --test`.

4. Add focused coverage.
   - Extend `tests/supabase-runtime-docs.test.ts` to assert that direct Supabase operation scripts load Next env before creating Supabase clients.
   - Assert TS validation runners call the shared helper before spawning child processes.

5. Verify.
   - Run `npm test`.
   - Run `npm run typecheck`.
   - Run a non-mutating local env smoke command that proves `@next/env` can populate `NEXT_PUBLIC_SUPABASE_URL` from current files without printing its value.

## Code Architecture

- Next application runtime continues using Next's built-in env behavior.
- Script runtime gains explicit env loading at process startup.
- Spawned validation steps inherit `process.env`, which now includes variables loaded from `.env.local` and `.env`.

## Technical Decisions

- Use `@next/env` because it is bundled through `next` and matches Next's env-file load order.
- Keep fail-fast env validation unchanged.
- Avoid adding `@next/env` as a direct dependency unless package policy later requires explicit direct deps; it is already available through Next.

## Integration Points

- `scripts/approve-waitlist.js` and `scripts/update-signup-settings.js` create Supabase service clients.
- `scripts/run-local-supabase-validation.ts` spawns validation lifecycle commands.
- `scripts/run-supabase-integration-tests.ts` spawns integration tests.

## Test Strategy

- Static tests verify entrypoints load env before Supabase use or process spawning.
- Existing runtime config unit tests continue to cover fail-fast validation.
- `npm test` covers regression suite.
- `npm run typecheck` verifies TS helper and TS runners.

## Edge Cases & Error Handling

- Missing or empty vars still throw existing `Missing required environment variable` errors.
- Invalid URLs or wrong key classes still throw existing validation errors.
- Existing shell-provided values retain `@next/env` behavior and are not overwritten unexpectedly.

## Validation Checklist

- [x] Helper created.
- [x] Direct JS Supabase scripts load Next env.
- [x] TS validation runners load Next env before spawning.
- [x] Tests updated.
- [x] `npm test` passes.
- [x] `npm run typecheck` passes.
- [x] Spec and implementation statuses updated.
