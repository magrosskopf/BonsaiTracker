STATUS: COMPLETE

# Plan

Approval basis: user task explicitly requested review refinements on this branch.

## Refactoring steps

- [x] Tighten `FormFieldConfig.key` to `keyof BonsaiFormValues`.
- [x] Replace the casted `asOptions` implementation with a stricter generic helper.
- [x] Type bonsai validation labels against form keys for better consistency.
- [x] Keep existing behavior coverage intact and run full verification.
- [x] Commit with a `refactor:` message.

## Techniques

- Tighten Type
- Remove Unnecessary Cast
- Strengthen Compile-Time Contract

## Safety

- No runtime validation rules change.
- No DTO, payload, or response shape changes.
- No UI flow changes in untested component logic.

## Verification

- `npm test` ✅
- `npm run typecheck` ✅
- `npm run build` ✅
