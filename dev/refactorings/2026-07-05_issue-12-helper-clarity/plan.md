Status: APPROVED

# Plan

## Goal

Improve readability and maintainability of the shared bonsai display and timeline helpers without changing behavior.

## Steps

1. Extract formatter and timestamp/sort helpers in the tested utility modules.
   - Technique: Extract Variable / Extract Function
   - Safety: keep exported APIs unchanged and verify with the existing test suite.
   - Clean Code focus: make formatting and ordering intent explicit.

2. Strengthen helper tests around timeline ordering.
   - Technique: Improve test naming and coverage of existing behavior
   - Safety: add assertions only for already intended behavior, especially the `createdAt` tie-breaker.
   - Clean Code focus: document behavior closer to the business rule.

3. Verify and commit.
   - Safety: run `npm test`, `npm run typecheck`, and `npm run build`.
   - Rollback strategy: revert only the helper/test refactoring commit if verification fails.

## Constraints

- No behavior changes.
- No broad page-component refactors because branch-specific page rendering changes are not directly covered by tests.
- No edits in `workflows/`.
