# TASK

Fix issue {{TASK_ID}}: {{ISSUE_TITLE}}

Pull in the issue using `gh issue view <ID>`. If it has a parent PRD, pull that in too.

Only work on the issue specified.

Work on branch {{BRANCH}}. Make commits and run tests.

# MANDATORY PROJECT WORKFLOW

Before changing code:

1. Read `AGENTS.md`.
2. Read `workflows/README.md`.
3. Select the matching workflow:
   - Feature, change, or bugfix: `workflows/feature-development.md`
   - Production incident or acute fix: `workflows/hot-fix.md`
   - Refactoring with tests: `workflows/refactoring.md`
4. Follow the selected workflow. Do not edit `workflows/` unless the issue explicitly asks for it.

If the workflow requires documentation under `dev/features/`, `dev/hotfixes/`, or `dev/refactorings/`, create or update it as part of the task.

# CONTEXT

Here are the last 10 commits:

<recent-commits>

!`git log -n 10 --format="%H%n%ad%n%B---" --date=short`

</recent-commits>

# EXPLORATION

Explore the repo and fill your context window with relevant information that will allow you to complete the task.

Pay extra attention to test files that touch the relevant parts of the code.

Project map:

- Next.js Pages Router UI: `pages/`, `components/`, `styles/`
- API routes: `pages/api/`
- Shared backend code: `lib/`
- Prisma schema: `prisma/schema.prisma`
- Tests: `tests/`
- Product baseline: `SPEC.md`
- Operations notes: `README.md`, `docs/`

# EXECUTION

If applicable, use RGR to complete the task.

1. RED: write one test
2. GREEN: write the implementation to pass that test
3. REPEAT until done
4. REFACTOR the code

# FEEDBACK LOOPS

Before committing, run:

1. `npm test`
2. `npm run typecheck`

Also run `npm run build` when the change touches Next.js pages, API routes, Prisma generation, app configuration, runtime behavior, or anything that could affect production build output.

# COMMIT

Make a git commit. The commit message must:

1. Start with `Sandcastle:` prefix
2. Include the issue ID and completed task
3. Mention key decisions made
4. Mention blockers or notes for next iteration, if any

Keep it concise.

# THE ISSUE

If the task is not complete, leave a comment on the issue with what was done.

Do not close the issue - this will be done later.

Once complete, output <promise>COMPLETE</promise>.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.
Do not commit secrets or copy real values from `.env`, `.env.local`, Codex auth files, npm logs, or platform dashboards.
