STATUS: COMPLETE

# Plan

Approval basis: user task explicitly requests review refinements on this branch.

## Refactoring steps

- [x] Extract small named helpers/constants in `lib/forms.ts` for date input formatting and euro amount normalization.
- [x] Reformat the euro price field config in `lib/config/forms.ts` for consistency with adjacent field entries.
- [x] Extend `tests/bonsai-contracts.test.ts` to document accepted euro input variants and euro string roundtrip behavior.
- [x] Run full verification: tests, typecheck, build.
- [x] Commit with a `refactor:` message.

## Techniques

- Extract Function
- Introduce Named Constant
- Replace repeated inline logic with intention-revealing helpers
- Strengthen characterization tests

## Safety

- Keep all public function signatures unchanged.
- Preserve payload and form value shapes exactly.
- Verify with the full automated suite before committing.

## Verification

- `npm test` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Clean Code focus

- Improve readability by naming formatting and normalization steps explicitly.
- Improve maintainability by localizing conversion rules in small helpers.
- Avoid touching untested UI control-flow in `components/BonsaiForm.tsx`.
