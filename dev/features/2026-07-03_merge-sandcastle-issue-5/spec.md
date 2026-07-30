Status: APPROVED
Last Updated: 2026-07-03

# Spec: Merge sandcastle/issue-5

## Purpose/Goal

Integrate the changes from `sandcastle/issue-5` into the current branch, resolve any merge conflicts correctly, and verify the merged result before closing the related issue.

## Functional Requirements

1. Run `git merge sandcastle/issue-5 --no-edit` from the current branch.
2. If conflicts occur, inspect both sides and resolve them intentionally.
3. Run `npm test` and `npm run typecheck` after the merge or after conflict resolution.
4. Run `npm run build` if the merged changes affect Next.js pages, API routes, Prisma generation, configuration, or runtime behavior.
5. Fix any verification failures before considering the merge complete.
6. Create a single commit summarizing the merge only if Git did not already create the necessary merge commit.
7. Close issue `#5` with `gh issue close 5 --comment "Completed by Sandcastle"` only if merge and verification succeed.

## Technical Constraints

- Do not modify `workflows/` as part of this task.
- Preserve unrelated repository changes.
- Use project verification commands defined in `AGENTS.md`.

## Acceptance Criteria

- `sandcastle/issue-5` is merged into the current branch.
- Any merge conflicts are resolved and staged correctly.
- Required verification commands succeed.
- Issue `#5` is closed with the required comment if and only if verification succeeds.
- The repository ends in a committed state for the merge work.

## Out-of-Scope

- Additional refactoring unrelated to the merge.
- Closing issues for branches that were not successfully merged.
