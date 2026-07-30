# Refactoring: Supabase Local Cleanup

**Status**: COMPLETE
**Created**: 2026-07-25
**Developer**: Codex

## Motivation

Local Supabase configuration was temporarily pointed at `bonsai-tracker-local` during diagnosis. The selected target is now the existing default local Supabase instance `supabase`, so repository artifacts should not keep stale `54331` assumptions in active tests or misleading workflow notes.

**Clean Code Goals:**
- Make configuration intent clearer by using one local Supabase target in tests and examples.
- Make maintenance easier by removing superseded local-selection documentation that contradicts the chosen setup.
- Preserve behavior: the app continues targeting `http://127.0.0.1:54321`.

## Current State

### Code Location

- Primary files: `tests/upload-storage.test.ts`
- Supporting files: `dev/features/2026-07-25_local-supabase-selection/*`
- Test files: `tests/upload-storage.test.ts`, broader `npm test`

### Current Issues

1. **Stale test port**: `tests/upload-storage.test.ts` still uses `54331`.
   - Impact: future readers see a different local Supabase port than `.env.example` and `supabase/config.toml`.
   - Evidence: `rg "54331" tests` returns the storage runtime config test.

2. **Misleading workflow artifact**: `dev/features/2026-07-25_local-supabase-selection` documents a superseded move to `bonsai-tracker-local`.
   - Impact: it contradicts the user-selected target and can cause future confusion.
   - Evidence: the files explicitly reference `bonsai-tracker-local` and `54331`.

## Test Coverage

- `tests/upload-storage.test.ts` directly covers Supabase runtime config reading.
- `tests/supabase-runtime-docs.test.ts` covers presence and canonical runtime variable documentation.
- This cleanup changes test fixtures and documentation only; no application behavior is refactored.

## Success Criteria

- No active test fixture references `54331`.
- Superseded `bonsai-tracker-local` workflow artifact is removed.
- `.env.example` and `supabase/config.toml` remain aligned with `54321`.
- `npm test` and `npm run typecheck` pass.
