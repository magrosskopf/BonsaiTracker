Status: COMPLETE

Last Modified: 2026-07-06

# Plan

## Goal

Improve clarity and consistency of the issue-13 post metadata helpers without changing output or behavior.

## Steps

1. Remove the redundant display-normalization wrapper and keep the exported name aligned with the domain concept.
   - Technique: Inline Function / Rename to domain-facing export
   - Safety: preserve the normalization logic and verify through existing display helper tests.
   - Clean Code focus: reduce indirection and make the helper easier to read.
   - Ergebnis: erledigt

2. Convert the post snapshot metadata helper to return the final display string and update page consumers.
   - Technique: Encapsulate Presentation Logic
   - Safety: preserve the same separator and fallback/date formatting by reusing existing helpers.
   - Clean Code focus: keep one presentation concern in one place and simplify callers.
   - Ergebnis: erledigt

3. Verify and commit.
   - Safety: run `npm test`, `npm run typecheck`, and `npm run build`.
   - Rollback strategy: revert only the refactoring commit if any verification step fails.
   - Ergebnis: erledigt

## Constraints

- No behavior changes.
- No changes to snapshot persistence or API shapes.
- No unrelated page or workflow edits.

## Verification Summary

- `npm test` erfolgreich am 2026-07-06
- `npm run typecheck` erfolgreich am 2026-07-06
- `npm run build` erfolgreich am 2026-07-06
