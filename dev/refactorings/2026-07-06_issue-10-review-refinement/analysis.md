STATUS: COMPLETE

# Analysis

## Scope

- Branch: `sandcastle/issue-10`
- Goal: Improve clarity, consistency, and maintainability while preserving the quickstart create flow and existing edit wizard behavior.
- In scope:
  - `components/BonsaiForm.tsx`
  - `components/FormWizard.tsx`
  - `tests/bonsai-contracts.test.ts`
- Out of scope:
  - Behavioral changes to create validation, wizard progression, or submit payloads
  - `workflows/` documentation

## Why this code needs improvement

- `BonsaiForm` mixes create-mode layout, edit-mode wizard logic, field rendering, and step validation in one component body.
- The current implementation repeats step field rendering and relies on nested conditional expressions in places where named helpers would be clearer.
- The quickstart field selection currently depends on `bonsaiFormStepConfigs[0].fields[0]`, which is harder to maintain than key-based selection.

## Test coverage and safety assessment

- `components/BonsaiForm.tsx`
  - Covered by `tests/bonsai-contracts.test.ts`
  - Existing characterization test covers the create quickstart branch via server-side markup rendering.
  - Refactoring will extend this coverage to the edit wizard branch so both high-level render modes remain protected.
  - Untested areas that remain intentionally out of scope:
    - interactive step navigation
    - input event handling
    - detail toggle state transitions
- `components/FormWizard.tsx`
  - Indirectly covered by the edit-mode server-render characterization test because `BonsaiForm` renders the wizard in edit mode.
  - Refactor scope is limited to the explicit runtime import needed by this TSX execution environment.
- `tests/bonsai-contracts.test.ts`
  - Safe to extend with additional characterization assertions because no runtime behavior is being changed.

## Success criteria

- Create and edit form modes are easier to follow through named helpers and reduced duplication.
- No nested ternary remains in the touched logic.
- Quickstart field selection is explicit instead of position-based.
- Existing behavior remains unchanged and verification stays green:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
