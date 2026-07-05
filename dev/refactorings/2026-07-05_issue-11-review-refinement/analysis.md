STATUS: COMPLETE

# Analysis

## Scope

- Branch: `sandcastle/issue-11`
- Goal: Improve code clarity, consistency, and maintainability without changing behavior
- In scope for refactoring:
  - `lib/forms.ts`
  - `lib/config/forms.ts`
  - `tests/bonsai-contracts.test.ts`
- Out of scope for structural refactoring:
  - `components/BonsaiForm.tsx`

## Why this code needs improvement

- `lib/forms.ts` now contains the new euro-to-cents conversion behavior, but the new logic is embedded inline and repeats date-input formatting patterns.
- The new branch behavior depends on a few small conversion rules that benefit from clearer helper boundaries and stronger contract coverage.
- `lib/config/forms.ts` contains a dense inline field definition for the euro price input that is harder to scan than the surrounding config entries.

## Pain points

- Repeated `slice(0, 10)` date formatting obscures intent.
- Euro parsing and formatting rules are correct, but the conversion logic has no named constants and no dedicated normalization step.
- The current tests cover the main happy path but can better document accepted decimal input variants and formatted roundtrips.

## Test coverage and safety assessment

- `lib/forms.ts`
  - Test file: `tests/bonsai-contracts.test.ts`
  - Coverage status: Sufficient for the touched branch behavior
  - Covered behavior:
    - DTO to form mapping without `nickname`
    - Nullable `age` and `ownedSince`
    - Euro input `"12,50"` mapping to cents
    - Blank euro input mapping to `null`
- `lib/config/forms.ts`
  - Test file: `tests/bonsai-contracts.test.ts`
  - Coverage status: Sufficient for the touched branch behavior
  - Covered behavior:
    - Optionality of selected fields
    - Euro label for `purchasePriceCents`
- `components/BonsaiForm.tsx`
  - No direct test coverage found for step-validation and field rendering branches
  - Decision: do not perform structural refactoring in this file during this pass

## Success criteria

- Code is easier to follow in `lib/forms.ts` through explicit helper names and constants.
- No runtime behavior changes.
- Existing contract behavior is preserved and documented more clearly in tests.
- Full project verification remains green:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
