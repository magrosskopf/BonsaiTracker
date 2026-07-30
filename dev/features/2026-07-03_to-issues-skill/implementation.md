# Implementation Plan: To Issues Skill

**Status**: COMPLETE  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Overview

Install the upstream `to-issues` Codex skill from `mattpocock/skills`, remove the unsupported upstream frontmatter key if present, and validate the skill locally.

## Reference

- **Spec**: `dev/features/2026-07-03_to-issues-skill/spec.md`
- **Acceptance Criteria**:
  - `SKILL.md` exists under `${CODEX_HOME:-$HOME/.codex}/skills/to-issues`.
  - `SKILL.md` uses `name: to-issues`.
  - `SKILL.md` has no unsupported `disable-model-invocation` key.
  - `quick_validate.py` passes.
  - Bonsai Tracker application code remains unchanged.
  - User is told to restart Codex.

## File Structure

### Files to Create

- `${CODEX_HOME:-$HOME/.codex}/skills/to-issues/SKILL.md` - Upstream skill instructions with local validation compatibility fix.

### Files to Modify

- `dev/features/2026-07-03_to-issues-skill/spec.md` - Mark implemented during DONE.
- `dev/features/2026-07-03_to-issues-skill/implementation.md` - Mark complete during DONE.

## Implementation Steps

### Step 1: Check Destination

**Goal**: Avoid overwriting an existing user skill.

**Actions**:
1. Check whether `${CODEX_HOME:-$HOME/.codex}/skills/to-issues` already exists.
2. If it exists, stop and inspect before deciding how to proceed.

**Files involved**: Personal Codex skills directory.

### Step 2: Install from GitHub

**Goal**: Copy the upstream skill into the personal skills directory.

**Actions**:
1. Run `install-skill-from-github.py --repo mattpocock/skills --path skills/engineering/to-issues --method git`.
2. Use Git method directly because the previous Python download path hit local SSL certificate validation issues.

**Files involved**: `${CODEX_HOME:-$HOME/.codex}/skills/to-issues/`.

### Step 3: Apply Compatibility Fix

**Goal**: Make upstream `SKILL.md` pass local validation without changing behavior.

**Actions**:
1. Inspect `SKILL.md` frontmatter.
2. Remove `disable-model-invocation: true` if present.
3. Leave the rest of the upstream content intact.

**Files involved**: `${CODEX_HOME:-$HOME/.codex}/skills/to-issues/SKILL.md`.

### Step 4: Validate

**Goal**: Verify skill structure is valid.

**Actions**:
1. Run `quick_validate.py /Users/maius/.codex/skills/to-issues`.
2. Fix any remaining validation issues with minimal changes.

**Files involved**: Installed skill folder.

### Step 5: Mark Documentation Complete

**Goal**: Close workflow artifacts.

**Actions**:
1. Mark `spec.md` as `IMPLEMENTED`.
2. Mark `implementation.md` as `COMPLETE`.
3. Check git status and report relevant changes.

**Files involved**: `dev/features/2026-07-03_to-issues-skill/spec.md`, `dev/features/2026-07-03_to-issues-skill/implementation.md`.

## Code Architecture

### Key Components

#### Skill Definition

- **Purpose**: Guide Codex to break source material into vertical-slice issues.
- **Location**: `${CODEX_HOME:-$HOME/.codex}/skills/to-issues/SKILL.md`
- **Dependencies**: Codex skill loader and any issue tracker tools available during actual use.

### Data Models

No application data models are involved.

### Module Interactions

Codex discovers `to-issues` from the personal skill directory and loads `SKILL.md` when triggered.

## Technical Decisions

- **Install upstream**: Preserve the requested source skill.
- **Minimal validation fix**: Remove only unsupported frontmatter.
- **Git installer method**: Avoid known local Python SSL issue from direct download.

## Integration Points

### Existing Code Integration

None. This does not modify Bonsai Tracker application code.

### Database Changes

None.

## Test Strategy

### Unit Tests

No project unit tests apply.

### Validation Tests

- Run `quick_validate.py /Users/maius/.codex/skills/to-issues`.
- Inspect installed `SKILL.md` frontmatter.

### Test Data

No test data required.

## Edge Cases & Error Handling

### Edge Cases

1. Existing destination skill: inspect and avoid overwriting.
2. Upstream content changes: still validate and only fix local compatibility issues.

### Error Scenarios

1. GitHub/network unavailable: report failure and do not fake installation.
2. Validation failure: apply minimal compatibility fixes and rerun.

## Performance Considerations

No runtime performance impact.

## Security Considerations

- Install only from the user-specified public GitHub path.
- Do not publish issues or contact issue trackers during installation.

## Rollback Plan

If installation fails:
1. Leave workflow docs with current status and report the error.
2. Do not delete existing user skill files without explicit approval.

## Validation Checklist

- [x] Installed `SKILL.md`.
- [x] Removed unsupported frontmatter key if present.
- [x] `quick_validate.py` passes.
- [x] No application code changed.
- [x] User is told to restart Codex.

## Notes

The installed skill itself may require issue tracker context or tools when used later, but installation does not configure those dependencies.
