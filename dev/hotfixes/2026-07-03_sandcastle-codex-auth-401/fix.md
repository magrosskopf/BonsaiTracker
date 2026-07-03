# Fix: Sandcastle Codex Auth 401

**Implemented**: 2026-07-03 18:30 CEST
**Developer**: Codex
**Reviewer**: Pending

## Changes Made

### Files Modified

- `.sandcastle/main.mts` - changed the Codex auth mount target to the absolute container home path.

### Code Changes

#### Before

```ts
hostPath: "~/.codex", sandboxPath: "home/agent/.codex"
```

#### After

```ts
hostPath: "~/.codex", sandboxPath: "/home/agent/.codex"
```

## Explanation

The Codex CLI reads cached login credentials from `/home/agent/.codex/auth.json` inside the Docker sandbox. The previous relative mount path was resolved below the sandbox worktree, so the CLI could not read the mounted auth cache and failed with a 401 against the Responses WebSocket.

## Testing Performed

- [x] Verified issue is resolved structurally by checking Sandcastle mount path resolution rules.
- [x] Checked for obvious regressions with `npm test`.
- [x] Tested rollback procedure conceptually: revert the single mount path change.

## Deployment Notes

No application deployment required. This affects local Sandcastle orchestration only.

The full `npm run sandcastle` command was not run during verification because it would start live Codex agents against open GitHub issues.

## Technical Debt Created

None.
