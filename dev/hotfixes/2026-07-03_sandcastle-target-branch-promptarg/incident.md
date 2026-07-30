# Incident: Sandcastle TARGET_BRANCH Prompt Argument Failure

**Status**: RESOLVED
**Severity**: Medium
**Detected**: 2026-07-03 18:41 CEST
**Reporter**: User

## Symptoms

The Sandcastle implementer started on `sandcastle/issue-1`, then the workflow failed before review with a prompt argument validation error.

## Impact

- **Users Affected**: Local developer running `npm run sandcastle`
- **Services Affected**: Sandcastle review orchestration only
- **Business Impact**: Automated review/merge flow is blocked; the Next.js application is not affected.

## Timeline

- **18:41 CEST**: User reported `TARGET_BRANCH` prompt argument failure.
- **18:42 CEST**: Root cause confirmed in Sandcastle's built-in prompt argument validation.
- **18:43 CEST**: Local override removed.
- **18:44 CEST**: Syntax check and project tests passed.

## Error Details

```text
PromptError: "TARGET_BRANCH" is a built-in prompt argument and cannot be overridden via promptArgs
```

## Root Cause Analysis

**Root Cause**: `.sandcastle/main.mts` passed `TARGET_BRANCH` through `promptArgs`, but Sandcastle now provides `TARGET_BRANCH` as a built-in prompt argument.

**Affected Components**:
- `.sandcastle/main.mts`
- Sandcastle reviewer runs

**Why it happened**: The local setup explicitly computed the current branch and injected it into reviewer prompt arguments. Sandcastle's current prompt substitution layer rejects overrides for built-in keys `SOURCE_BRANCH` and `TARGET_BRANCH`.

## Fix Strategy

**Approach**: Remove the local `TARGET_BRANCH` prompt argument and the now-unused `execFileSync` branch lookup. Keep `BRANCH` as a custom prompt argument.

**Alternative Approaches Considered**:
1. Rename the prompt placeholder - rejected because the existing `{{TARGET_BRANCH}}` placeholder is now supplied by Sandcastle itself.
2. Inline the target branch in the prompt - rejected because it would duplicate built-in behavior.

**Risks**:
- If Sandcastle's built-in `TARGET_BRANCH` differs from the intended host branch in a future run, review diffs could target the wrong base. Mitigation: rely on Sandcastle's built-in branch metadata and inspect reviewer logs if diffs look wrong.

**Rollback Plan**:
Revert the `.sandcastle/main.mts` removal if using an older Sandcastle version that does not provide `TARGET_BRANCH`.
