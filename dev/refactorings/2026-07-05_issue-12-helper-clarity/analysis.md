Status: DRAFT

# Analysis

## Scope

- `lib/bonsai-display.ts`
- `lib/bonsai-images.ts`
- `tests/bonsai-display.test.ts`

## What needs improvement

- `lib/bonsai-display.ts` contains repeated formatting setup inline inside `formatBonsaiDate`, which makes the formatting concern harder to scan.
- `lib/bonsai-images.ts` mixes collection, normalization, and sort details in one return expression, so the intent of the timeline ordering is less explicit than it could be.
- The existing tests verify the main helper behavior, but they do not document the secondary sort key explicitly.

## Why it needs improvement

- The affected helpers are shared by multiple Pages Router screens, so clarity in these files has a disproportionate maintenance benefit.
- Making date formatting and timeline sorting more explicit reduces the cognitive load for future changes and lowers the risk of accidental divergence.

## Pain points

- Inline `Intl.DateTimeFormat` construction obscures the actual fallback logic in `formatBonsaiDate`.
- Repeated `new Date(...).getTime()` calls inside the sort callback make the sorting rule harder to read.
- The tie-break behavior for timeline images is implemented but not directly described by a dedicated test assertion.

## Current metrics

- Complexity:
  - `lib/bonsai-display.ts`: low
  - `lib/bonsai-images.ts`: low to moderate due to inline mapping and sorting
- Duplication:
  - Localized date formatter setup is embedded directly in helper logic.
  - Timestamp conversion is repeated inside the sort callback.
- Test coverage:
  - `tests/bonsai-display.test.ts` covers all exported behavior in `lib/bonsai-display.ts` and `lib/bonsai-images.ts`.
  - No dedicated component/page tests were identified for `pages/bonsai/[id].tsx`, `pages/dashboard.tsx`, or `pages/feed.tsx`.

## Test coverage verification

- `lib/bonsai-display.ts`
  - Tests: `tests/bonsai-display.test.ts`
  - Coverage assessment: sufficient for helper-level refactoring because each exported function is exercised directly.
- `lib/bonsai-images.ts`
  - Tests: `tests/bonsai-display.test.ts`
  - Coverage assessment: sufficient for helper-level refactoring, with one gap in explicit documentation of the secondary sort key.
- Pages using these helpers
  - Tests: none identified for the branch-specific rendering changes
  - Decision: do not refactor page logic beyond mechanically consuming the existing helper APIs.

## Success criteria

- Helper code is easier to read and reason about.
- Timeline ordering rules are expressed through named helpers instead of inline timestamp conversions.
- Test behavior and public outputs remain unchanged.
- Full test suite, typecheck, and build pass after the refactoring.
