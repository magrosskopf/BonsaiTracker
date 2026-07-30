# TASK

Merge the following branches into the current branch:

{{BRANCHES}}

For each branch:

1. Run `git merge <branch> --no-edit`
2. If there are merge conflicts, resolve them intelligently by reading both sides and choosing the correct resolution
3. After resolving conflicts, run `npm test` and `npm run typecheck` to verify everything works
4. Run `npm run build` if the merged changes touch Next.js pages, API routes, Prisma generation, configuration, or runtime behavior
5. If tests fail, fix the issues before proceeding to the next branch

After all branches are merged, make a single commit summarizing the merge if Git has not already created merge commits.

# CLOSE ISSUES

For each branch that was merged, close its issue using the following command:

`gh issue close <ID> --comment "Completed by Sandcastle"`

Here are all the issues:

{{ISSUES}}

Do not close an issue if its branch could not be merged or verification failed.

Once you've merged everything you can, output <promise>COMPLETE</promise>.
