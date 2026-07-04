# Merge sandcastle issue 6

**Status**: APPROVED
**Created**: 2026-07-04
**Last Modified**: 2026-07-04

## Purpose/Goal

Merge the `sandcastle/issue-6` branch into the current branch and preserve the intended validation improvements for the local Supabase workflow.

## Functional Requirements

1. Run `git merge sandcastle/issue-6 --no-edit` on the current branch.
2. Resolve any merge conflicts by inspecting both sides and keeping the correct combined behavior.
3. Run `npm test` and `npm run typecheck` after conflict resolution or a clean merge.
4. Run `npm run build` if the merged changes affect pages, API routes, Prisma generation, configuration, or runtime behavior.
5. Fix any verification failures before considering the merge complete.
6. Close issue `6` with the provided `gh issue close` command only if the branch merge and verification succeed.
7. Create a single summarizing commit only if Git does not already create a merge commit.

## Technical Constraints

- Follow the repository workflow instructions in `workflows/README.md` and `workflows/feature-development.md`.
- Do not alter centralized workflow files.
- Preserve existing unrelated worktree changes.
- Use the repository verification commands as the source of truth.

## Acceptance Criteria

1. `sandcastle/issue-6` is merged into the current branch.
2. Any merge conflicts are resolved and committed correctly.
3. Required verification commands complete successfully.
4. Issue `6` is closed with comment `Completed by Sandcastle` only on success.
5. The branch history contains either Git's merge commit or one explicit summarizing commit for this merge.

## Out-of-Scope

- Changing workflow definitions.
- Refactoring unrelated code.
- Closing issues for branches that were not merged successfully.
