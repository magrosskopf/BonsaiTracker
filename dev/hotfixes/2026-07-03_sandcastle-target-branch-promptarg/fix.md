# Fix: Sandcastle TARGET_BRANCH Prompt Argument Failure

**Implemented**: 2026-07-03 18:43 CEST
**Developer**: Codex
**Reviewer**: Pending

## Changes Made

### Files Modified

- `.sandcastle/main.mts` - removed the forbidden `TARGET_BRANCH` prompt argument override and unused branch lookup.
- `dev/features/2026-07-03_sandcastle-setup/implementation.md` - updated the setup note so it no longer documents the obsolete override.

### Code Changes

#### Before

```ts
promptArgs: {
  TARGET_BRANCH: targetBranch,
  BRANCH: issue.branch,
}
```

#### After

```ts
promptArgs: {
  BRANCH: issue.branch,
}
```

## Explanation

Sandcastle reserves `TARGET_BRANCH` as a built-in prompt argument. Passing it in `promptArgs` triggers validation before the reviewer agent starts. Removing the override allows `.sandcastle/review-prompt.md` to keep using `{{TARGET_BRANCH}}`, now supplied by Sandcastle.

## Testing Performed

- [x] Verified issue is resolved structurally by confirming no `TARGET_BRANCH` override remains.
- [x] Checked for obvious regressions with `npm test`.
- [x] Tested rollback procedure conceptually: re-add the removed override only for older Sandcastle versions.

## Deployment Notes

No application deployment required. This affects local Sandcastle orchestration only.

The full `npm run sandcastle` command was not run during verification because it would start live Codex agents against open GitHub issues.

## Technical Debt Created

None.
