# Merge sandcastle issues 10 and 13

**Status**: APPROVED
**Created**: 2026-07-06
**Last Modified**: 2026-07-06

## Purpose/Goal

Merge the `sandcastle/issue-10` and `sandcastle/issue-13` branches into the current branch while preserving the intended simplified bonsai creation flow and the community snapshot fallback behavior.

## Functional Requirements

1. Run `git merge <branch> --no-edit` for `sandcastle/issue-10` and `sandcastle/issue-13` on the current branch.
2. Resolve merge conflicts by inspecting both sides and keeping the correct combined behavior.
3. After each successful merge or conflict resolution, run `npm test` and `npm run typecheck`.
4. Run `npm run build` for a merged branch if its changes affect Next.js pages, API routes, Prisma generation, configuration, or runtime behavior.
5. Fix verification failures caused by the merge before proceeding to the next branch.
6. Close issue `10` and issue `13` with `gh issue close <ID> --comment "Completed by Sandcastle"` only when the corresponding branch merge and verification succeed.
7. Create one explicit summarizing commit only if Git does not already leave merge commits covering the completed merges.

## Technical Constraints

- Follow `workflows/README.md` and `workflows/feature-development.md`.
- Do not modify centralized workflow files.
- Preserve unrelated existing worktree changes.
- Use the repository verification commands as the source of truth.

## Acceptance Criteria

1. `sandcastle/issue-10` and `sandcastle/issue-13` are merged into the current branch, or any failure is clearly identified.
2. Any merge conflicts are resolved with correct resulting behavior.
3. Required verification commands succeed after each completed merge.
4. `gh issue close` is executed only for branches whose merge and verification succeed.
5. The resulting history contains Git's merge commits or one explicit summarizing commit if Git did not create them.

## Out-of-Scope

- Refactoring unrelated code.
- Changing workflow definitions.
- Closing issues for failed merges.
