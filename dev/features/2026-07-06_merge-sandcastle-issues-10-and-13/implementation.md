# Merge sandcastle issues 10 and 13 Implementation Plan

**Status**: PLAN-APPROVED
**Created**: 2026-07-06
**Last Modified**: 2026-07-06

## Overview

Inspect the current branch and both incoming branches, merge them one at a time with Git's native merge flow, resolve conflicts carefully, run the required verification after each merge, and close only the issues that correspond to successful merges.

## Reference

- Spec: `/dev/features/2026-07-06_merge-sandcastle-issues-10-and-13/spec.md`
- Key acceptance criteria: successful merges, passing verification after each branch, conditional issue closure

## File Structure

- Create:
  - `dev/features/2026-07-06_merge-sandcastle-issues-10-and-13/spec.md`
  - `dev/features/2026-07-06_merge-sandcastle-issues-10-and-13/implementation.md`
- Modify:
  - Repository files only when merge conflict resolution or verification fixes require it

## Implementation Steps

1. Inspect the current worktree, existing local changes, and the diff for `sandcastle/issue-10` and `sandcastle/issue-13` against the current branch.
2. Temporarily protect unrelated local worktree changes if Git requires a clean state for the merges.
3. Run `git merge sandcastle/issue-10 --no-edit`.
4. Resolve any conflicts by reading both sides and keeping the correct combined behavior.
5. Run `npm test` and `npm run typecheck`, plus `npm run build` if the merged branch affects pages, API routes, Prisma generation, configuration, or runtime behavior.
6. Fix merge-caused verification failures and rerun verification until green or clearly blocked.
7. Close issue `10` after successful merge verification.
8. Repeat the same merge and verification flow for `sandcastle/issue-13`.
9. Confirm whether Git already created merge commits; if not, create one summarizing commit.
10. Restore any protected unrelated local changes and verify the final worktree state.

## Code Architecture

- Expected merge impact is in the simplified bonsai creation UI and community snapshot rendering paths.
- Conflict resolution must preserve the already-merged changes on the current branch while integrating new UI and fallback behavior from issues 10 and 13.

## Technical Decisions

- Use `git merge --no-edit` first to preserve the source branch history.
- Treat changes under `pages/`, `components/`, `lib/`, Prisma artifacts, configuration, and user-visible rendering as build-relevant.
- Keep unrelated user worktree changes intact even if they require temporary stashing.

## Integration Points

- Git history on `implfeatures`
- Next.js pages and shared UI components
- Community snapshot data rendering
- Repository verification commands declared in `package.json`

## Test Strategy

- Run `npm test` after each completed branch merge
- Run `npm run typecheck` after each completed branch merge
- Run `npm run build` for branches that touch build-relevant runtime areas

## Edge Cases & Error Handling

- If Git blocks merging because of unrelated local changes, stash them temporarily and restore them after the merge flow.
- If a conflict occurs, inspect both versions before editing.
- If verification fails, distinguish merge-caused regressions from pre-existing issues before changing code.
- If `gh issue close` fails because of auth or remote state, report it after confirming the merge itself is green.

## Validation Checklist

- Both requested merges attempted in order
- Conflicts resolved correctly
- Required verification commands passed after each successful merge
- Issues closed only for successful merges
- Merge commit history preserved or explicitly summarized
