Status: APPROVED
Last Modified: 2026-07-03

# Plan: issue-2 docs test clarity

## Goal

Improve readability and maintainability of the new documentation regression test without changing what it verifies.

## Steps

1. Extract a small helper for reading repository files by relative path.
2. Move the database URL patterns and required migration-doc assertions into named constants.
3. Keep the same assertions and rerun `npm test` and `npm run typecheck`.

## Safety

- Scope stays limited to one test file.
- The same files, regexes, and required statements remain under test.
- No runtime code, docs content, or configuration behavior is changed.

## Expected Improvement

- Less repetition
- Clearer intent in each test
- Easier maintenance if the guarded documentation requirements evolve
