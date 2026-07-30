# Incident: Sandcastle Codex Auth 401

**Status**: RESOLVED
**Severity**: Medium
**Detected**: 2026-07-03 18:25 CEST
**Reporter**: User

## Symptoms

Running the Sandcastle planner starts the Docker sandbox successfully, then the Codex agent exits with a 401 while connecting to the Responses WebSocket.

## Impact

- **Users Affected**: Local developer running `npm run sandcastle`
- **Services Affected**: Sandcastle agent orchestration only
- **Business Impact**: Automated issue planning/implementation is blocked; the Next.js application is not affected.

## Timeline

- **18:25 CEST**: User reported `failed to connect to websocket: HTTP error: 401 Unauthorized`.
- **18:27 CEST**: Issue confirmed in `.sandcastle/logs/sandcastletest-planner.log`.
- **18:29 CEST**: Root cause identified in `.sandcastle/main.mts` Codex auth mount path.
- **18:31 CEST**: Mount path fixed and project tests passed.

## Error Details

```text
codex_api::endpoint::responses_websocket: failed to connect to websocket:
HTTP error: 401 Unauthorized, url: wss://api.openai.com/v1/responses
```

## Initial Observations

The sandbox setup and GitHub issue expansion completed before the agent invocation failed. Local `~/.codex/auth.json` exists, so the failure is consistent with the Docker container not seeing the Codex auth cache at the expected path.

## Communication

- [ ] Stakeholders notified
- [ ] Status page updated (if applicable)
- [x] Team alerted

## Root Cause Analysis

**Root Cause**: The Sandcastle Docker mount used a relative sandbox path, `home/agent/.codex`, instead of the absolute Codex home path `/home/agent/.codex`.

**Affected Components**:
- `.sandcastle/main.mts`
- Sandcastle Docker planner/implementer/reviewer/merger Codex agent runs

**Why it happened**: Sandcastle resolves relative `sandboxPath` values under the sandbox repository directory. The configured value therefore mounted host `~/.codex` under the worktree instead of the Codex CLI home directory.

## Fix Strategy

**Approach**: Change the mount target to `/home/agent/.codex` so the Codex CLI inside the Docker container can read the cached auth file.

**Alternative Approaches Considered**:
1. Re-login Codex on the host - rejected because the host auth file exists and the container path was wrong.
2. Copy only `auth.json` into the container manually - rejected because Sandcastle creates fresh containers and should be configured correctly.

**Estimated Time**: 10 minutes.

**Risks**:
- If host Codex auth is also expired, Sandcastle may still fail with 401 after the mount fix. Mitigation: run `codex login` on the host if verification still shows auth failure.

**Rollback Plan**:
Revert the `.sandcastle/main.mts` mount path change.
