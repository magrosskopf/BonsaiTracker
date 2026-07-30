STATUS: COMPLETE

# Analysis

## Scope

- Branch: `sandcastle/issue-11`
- Goal: Improve clarity and maintainability without changing behavior
- In scope:
  - `lib/config/forms.ts`
  - `lib/api/validation.ts`
  - `tests/bonsai-contracts.test.ts`
- Out of scope:
  - `components/BonsaiForm.tsx` structural refactoring, because it still lacks direct characterization coverage

## Why this code needs improvement

- Form field config keys are typed as plain `string`, which weakens editor help and allows accidental drift from `BonsaiFormValues`.
- `asOptions` uses a cast that can be avoided with a tighter generic.
- Validation field labels are also typed as generic strings, even though the branch now relies on exact form-field naming for euro-price messaging.

## Test coverage and safety assessment

- `lib/config/forms.ts`
  - Covered by `tests/bonsai-contracts.test.ts`
  - Coverage is sufficient for the touched behavior and field metadata contracts
- `lib/api/validation.ts`
  - Indirectly exercised by validator tests and typecheck
  - Refactor scope is type-only / structure-only, with no runtime rule changes
- `components/BonsaiForm.tsx`
  - No direct tests for step validation and rendering branches
  - Decision: do not perform non-trivial refactoring there in this pass

## Success criteria

- Form config keys align with `BonsaiFormValues` at compile time.
- Existing unsafe casts in option mapping are removed where possible.
- Validation field labels stay aligned with the form contract.
- Full verification remains green:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
