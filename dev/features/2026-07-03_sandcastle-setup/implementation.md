# Implementation Plan: Sandcastle Setup Completion

**Status**: COMPLETE  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Overview

Finish the Sandcastle template configuration for Bonsai Tracker without changing application behavior.

## Reference

- **Spec**: `spec.md`
- **Acceptance Criteria**: npm sandbox setup, Zod installed, project-specific prompts, project-specific coding standards.

## File Structure

### Files to Create

- None beyond this workflow documentation.

### Files to Modify

- `.sandcastle/CODING_STANDARDS.md` - replace template placeholders with Bonsai Tracker standards.
- `.sandcastle/implement-prompt.md` - align execution instructions with AGENTS/workflows and checks.
- `.sandcastle/review-prompt.md` - align review instructions with project standards and checks.
- `.sandcastle/merge-prompt.md` - align merge verification with project checks.
- `.sandcastle/main.mts` - rely on Sandcastle's built-in `TARGET_BRANCH` for review diffs.

## Implementation Steps

### Step 1: Confirm Dependency Setup

**Goal**: Verify npm and Zod setup.

**Actions**:
1. Confirm `package-lock.json` exists and npm is the active package manager.
2. Confirm `zod` exists in `package.json`.
3. Keep `copyToWorktree = ["node_modules"]` and `npm install` hook unless a mismatch is found.

### Step 2: Customize Coding Standards

**Goal**: Replace placeholder standards with concrete project conventions.

**Actions**:
1. Document TypeScript, Next.js Pages Router, Prisma, Tailwind, env handling, and testing expectations.
2. Include security rules around secrets, auth, uploads, and user input.

### Step 3: Customize Prompts

**Goal**: Make Sandcastle agents follow the repository's workflow.

**Actions**:
1. Ensure implementer reads `AGENTS.md` and workflow docs first.
2. Keep agents scoped to one issue/branch.
3. Ensure `npm test`, `npm run typecheck`, and relevant build checks are requested before commits.
4. Ensure reviewer uses `.sandcastle/CODING_STANDARDS.md`.

### Step 4: Validate

**Goal**: Catch syntax and dependency issues.

**Actions**:
1. Run `npm run typecheck`.
2. Run `npm test`.
3. Run `npx tsx --help` or a non-mutating syntax/import check if feasible for `.sandcastle/main.mts`.

## Code Architecture

Sandcastle remains a local orchestration layer under `.sandcastle/`. It does not affect the Next.js app unless the user runs `npm run sandcastle`.

## Technical Decisions

- Keep npm because the project already uses `package-lock.json`.
- Keep Zod because it is already installed and used by the generated template.
- Keep `node_modules` copy optimization because the host and Docker image both use Node 22.

## Integration Points

- `package.json` script `sandcastle`.
- GitHub issues with label `Sandcastle`.
- Codex auth mounted from `~/.codex`.

## Test Strategy

- Existing project tests: `npm test`.
- Type checking: `npm run typecheck`.
- Build only if prompt/config changes suggest runtime impact; this setup should not affect application code.

## Edge Cases & Error Handling

1. Missing GitHub CLI auth: prompts should make failures visible rather than silently continuing.
2. Missing Codex auth: mounted `~/.codex` should be documented as required.
3. Platform-specific native binaries: keep `npm install` safety hook.

## Performance Considerations

- Copying `node_modules` keeps sandbox startup faster than a fresh install.
- `npm install` remains as a correctness safety net.

## Security Considerations

- Do not commit `.env`, `.env.local`, or Codex auth files.
- Treat mounted `~/.codex` as sensitive.
- Avoid exposing API keys in prompts, logs, or issue comments.

## Rollback Plan

Revert `.sandcastle/` changes if the setup becomes unusable. No application state or database changes are involved.

## Validation Checklist

- [x] All planned files updated.
- [x] `npm test` passes.
- [ ] `npm run typecheck` passes. Existing failure: `tests/community-api.test.ts` fixture is missing `user.image`.
- [x] Prompt instructions match project workflow.
- [x] No secrets added.

## Notes

The current project already has `zod` installed and npm configured.
