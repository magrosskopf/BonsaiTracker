# Implementation Plan: Domain Modeling Skill

**Status**: COMPLETE  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Overview

Install the upstream `domain-modeling` Codex skill from `mattpocock/skills` into the personal Codex skills directory and validate the installed structure.

## Reference

- **Spec**: `dev/features/2026-07-03_domain-modeling-skill/spec.md`
- **Acceptance Criteria**:
  - `SKILL.md`, `ADR-FORMAT.md`, and `CONTEXT-FORMAT.md` exist under `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling`.
  - `SKILL.md` uses `name: domain-modeling`.
  - The skill passes `quick_validate.py`.
  - Bonsai Tracker application code remains unchanged.
  - User is told to restart Codex.

## File Structure

### Files to Create

- `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling/SKILL.md` - Upstream domain modeling skill instructions.
- `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling/ADR-FORMAT.md` - Upstream ADR format reference.
- `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling/CONTEXT-FORMAT.md` - Upstream context glossary format reference.

### Files to Modify

- `dev/features/2026-07-03_domain-modeling-skill/spec.md` - Mark implemented during DONE.
- `dev/features/2026-07-03_domain-modeling-skill/implementation.md` - Mark complete during DONE.

## Implementation Steps

### Step 1: Check Destination

**Goal**: Avoid overwriting an existing user skill.

**Actions**:
1. Check whether `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling` already exists.
2. If it exists, stop and inspect before deciding whether to update.

**Files involved**: Personal Codex skills directory.

### Step 2: Install from GitHub

**Goal**: Copy the upstream skill into the personal skills directory.

**Actions**:
1. Run `install-skill-from-github.py --repo mattpocock/skills --path skills/engineering/domain-modeling`.
2. Use the default destination unless tooling requires an explicit destination.

**Files involved**: `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling/`.

### Step 3: Inspect Installed Files

**Goal**: Confirm the expected upstream files landed.

**Actions**:
1. List installed files.
2. Inspect `SKILL.md` frontmatter enough to confirm `name: domain-modeling`.

**Files involved**: Installed skill folder.

### Step 4: Validate

**Goal**: Verify skill structure is valid.

**Actions**:
1. Run `quick_validate.py` against the installed skill directory.
2. If validation fails due to upstream formatting, make the minimal compatibility fix and rerun validation.

**Files involved**: Installed skill folder.

### Step 5: Mark Documentation Complete

**Goal**: Close the workflow artifacts.

**Actions**:
1. Mark `spec.md` as `IMPLEMENTED`.
2. Mark `implementation.md` as `COMPLETE`.
3. Check git status and report only relevant changes.

**Files involved**: `dev/features/2026-07-03_domain-modeling-skill/spec.md`, `dev/features/2026-07-03_domain-modeling-skill/implementation.md`.

## Code Architecture

### Key Components

#### Upstream Skill

- **Purpose**: Provide domain modeling workflow instructions.
- **Location**: `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling/SKILL.md`
- **Dependencies**: Codex skill loader.

#### Reference Files

- **Purpose**: Provide formats for ADRs and context glossaries.
- **Location**: Installed skill folder.
- **Dependencies**: Referenced by `SKILL.md`.

### Data Models

No application data models are involved.

### Module Interactions

Codex discovers the installed skill from the personal skills directory and loads `SKILL.md` when the skill triggers. The skill references local markdown format files as needed.

## Technical Decisions

- **Install instead of rewriting**: Preserve upstream content from the requested repository.
- **Personal skills directory**: Use Codex auto-discovery path.
- **Minimal changes only**: Modify installed files only if required for validation compatibility.

## Integration Points

### Existing Code Integration

None. This does not modify Bonsai Tracker application code.

### Database Changes

None.

## Test Strategy

### Unit Tests

No project unit tests apply.

### Validation Tests

- Run `quick_validate.py /Users/maius/.codex/skills/domain-modeling`.
- Inspect installed file list and `SKILL.md` frontmatter.

### Test Data

No test data required.

## Edge Cases & Error Handling

### Edge Cases

1. Existing destination skill: stop and inspect rather than overwriting.
2. Download failure: retry through the installer fallback behavior if available.

### Error Scenarios

1. GitHub/network unavailable: report failure and do not fake installation.
2. Validation failure: apply only the smallest compatibility fix needed.

## Performance Considerations

No runtime performance impact.

## Security Considerations

- Install only from the user-specified public GitHub path.
- Do not run code from the installed skill; only install markdown resources.

## Rollback Plan

If installation fails:
1. Leave workflow docs with current status and report the error.
2. Do not delete existing user skill files without explicit approval.

## Validation Checklist

- [x] Expected upstream files installed.
- [x] `SKILL.md` uses `name: domain-modeling`.
- [x] `quick_validate.py` passes.
- [x] No application code changed.
- [x] User is told to restart Codex.

## Notes

The installer uses network access and writes outside the project, so escalated command approval is required.
