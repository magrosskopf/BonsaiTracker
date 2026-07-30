# External Supabase Project Implementation Plan

Status: COMPLETE
Last modified: 2026-07-26

## Overview

Move the Supabase schema source out of the Bonsai repository into the existing external Supabase project and teach the Bonsai repository scripts/tests where to find it.

## Reference

Spec: `dev/features/2026-07-26_external-supabase-project/spec.md`

Key acceptance criteria:
- External Supabase project contains migrations, seed, and tests.
- Local `supabase/` directory is removed.
- CLI scripts use `--workdir`.
- Tests and typecheck pass.

## File Structure

Create:
- `scripts/supabase-project.ts`
- `dev/features/2026-07-26_external-supabase-project/spec.md`
- `dev/features/2026-07-26_external-supabase-project/implementation.md`

Modify:
- `scripts/run-supabase-cli.js`
- `scripts/generate-supabase-types.ts`
- `scripts/check-supabase-types.ts`
- `tests/bonsai-contracts.test.ts`
- `tests/supabase-runtime-docs.test.ts`
- `README.md`
- `docs/IMPLEMENTATION_NOTES.md`

Delete:
- `supabase/`

External transfer:
- Copy Bonsai migrations, seed, and DB tests to `/Users/maius/Projekte/supabase/supabase`.
- Add Bonsai-specific local config settings to `/Users/maius/Projekte/supabase/supabase/config.toml`.

## Implementation Steps

1. Copy current `supabase/migrations`, `supabase/tests`, and `supabase/seed.sql` to the external Supabase project.
2. Update external `config.toml` with Bonsai callback, storage, schema, and signup hook settings.
3. Add a shared TS helper for locating the external Supabase project.
4. Update CLI wrappers and type-generation scripts to pass `--workdir`.
5. Update tests and documentation to reference the external schema source.
6. Delete the local `supabase/` files.
7. Verify with `npm test` and `npm run typecheck`.

## Code Architecture

The app runtime still uses environment variables for Supabase Auth/Data API. Only local Supabase CLI project files move to the external project root. Scripts locate that root through `BONSAI_SUPABASE_PROJECT_ROOT` or default to `../supabase`.

## Technical Decisions

Use `--workdir` instead of changing process cwd, so scripts keep writing generated app artifacts such as `types/supabase.ts` into the Bonsai repository while Supabase CLI reads config/migrations from the external project.

## Integration Points

- Supabase CLI wrapper: `scripts/run-supabase-cli.js`.
- Type generation/check scripts: `scripts/generate-supabase-types.ts`, `scripts/check-supabase-types.ts`.
- Static tests that inspect migration contents.

## Test Strategy

- `npm test` verifies unit/static tests.
- `npm run typecheck` verifies TS helper and script imports.
- File-system checks verify external Supabase files exist and local `supabase/` was removed.

## Edge Cases & Error Handling

- Missing external config throws a clear error with `BONSAI_SUPABASE_PROJECT_ROOT` guidance.
- Existing external Supabase DB data is not reset.
- Docker volumes are not deleted.

## Validation Checklist

- [x] External files transferred.
- [x] Scripts use external project root.
- [x] Local `supabase/` files removed.
- [x] Tests pass.
- [x] Typecheck passes.
