STATUS: COMPLETE

# Plan

Approval basis: the user explicitly requested direct review refinements on branch `sandcastle/issue-10`.

## Refactoring steps

- [x] Extract small helpers in `components/BonsaiForm.tsx` for submit validation, quickstart/detail step selection, step validity, and repeated field rendering.
- [x] Keep TSX runtime imports explicit in the touched render path (`BonsaiForm` and `FormWizard`) so server-render characterization stays valid in this environment.
- [x] Replace position-based quickstart field access with key-based selection while preserving the same rendered field.
- [x] Add characterization coverage for the edit wizard render path in `tests/bonsai-contracts.test.ts`.
- [x] Run `npm test` and `npm run typecheck`.
- [x] Attempt `npm run build` and document the reproduced environment hang after `Creating an optimized production build ...`.
- [x] Commit with a `refactor:` message.

## Techniques

- Extract Function
- Replace Nested Conditional with Guarded Helper
- Remove Duplication
- Strengthen Configuration Access

## Safety

- Keep all submit rules identical:
  - create mode only requires `name`
  - edit mode still requires `name`, `location`, and valid custom style handling
- Do not change form field config, payload mapping, or page routing behavior.
- Verify both create and edit render modes through markup-based characterization tests.

## Verification

- Full test suite remained green after the refactor.
- Typecheck remained green after the refactor.
- `npm run build` was attempted as required and reproduced the pre-existing environment hang after `next build` entered `Creating an optimized production build ...`.
