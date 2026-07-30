# Refactoring Plan: Supabase Local Cleanup

**Status**: COMPLETE
**Created**: 2026-07-25

## Steps

1. Update Supabase runtime config tests from `54331` to `54321`.
   - Technique: Replace literal with current canonical local URL.
   - Verification: `rg "54331" tests` returns no active test references.
   - Status: complete.

2. Remove superseded `bonsai-tracker-local` workflow artifact.
   - Technique: Delete obsolete documentation generated during the wrong local selection.
   - Verification: remaining 2026-07-25 Supabase docs point to the final default `supabase` setup.
   - Status: complete.

3. Verify behavior.
   - Run `npm test`.
   - Run `npm run typecheck`.
   - Status: complete.

## Rollback

Restore the deleted workflow artifact and revert the test literals if the local target changes back to `bonsai-tracker-local`.

## Verification Summary

- `npm test`: passed, 64 tests.
- `npm run typecheck`: passed.
- Active config checks: `tests`, `.env.example`, and `supabase/config.toml` contain no `54331`/`bonsai-tracker-local` references.
