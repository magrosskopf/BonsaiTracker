Status: APPROVED
Last Modified: 2026-07-03

# Plan: community-api test clarity

## Goal

Improve readability and maintainability of the `community-api` test fixture without changing behavior.

## Steps

1. Extract the repeated user fields into a dedicated helper object typed from `ProfileRecord`.
2. Reuse that object for the root profile shape and nested post author shape.
3. Run `npm test` and `npm run typecheck` to confirm behavior is unchanged.

## Safety

- Scope stays limited to one test file.
- Assertions remain unchanged.
- No runtime code or API behavior is modified.

## Expected Improvement

- Less duplication
- Clearer fixture intent
- Lower maintenance cost when shared user fields evolve
