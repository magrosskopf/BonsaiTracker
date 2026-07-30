# GitHub Issues: Local Supabase Postgres Migration with Prisma

These issue drafts are vertical slices from [`implementation.md`](./implementation.md). They are ready to create in GitHub once issue write access is available.

## Issue 1: Local Supabase DB target is documented and reversible

### Body

## Context

Part of `dev/features/2026-07-03_supabase-postgres-prisma-migration`.

Goal: before changing any local database state, make the intended local Supabase Postgres target understandable and reversible.

## Scope

- Document the local Supabase Postgres target and expected direct Postgres `DATABASE_URL` shape.
- Update `.env.example` away from a Prisma Accelerate-first local database example.
- Document that local Prisma connects directly to Supabase Postgres.
- Document how to preserve and restore the previous local `DATABASE_URL`.
- Explicitly state that real `.env`, `.env.local`, passwords, service-role keys, and local secrets must not be committed.

## Acceptance Criteria

- `.env.example` contains a safe local Supabase Postgres-style `DATABASE_URL` placeholder.
- `docs/supabase-postgres-migration.md` explains the local DB target and revert path.
- Docs clearly say Prisma remains the data layer and Supabase SDK is not introduced for relational data access.
- Docs clearly say Prisma Accelerate is not used for the local Supabase target.
- No runtime app code changes are required.
- No secrets or local env files are committed.

## Verification

- Review `git diff` for docs/example-only changes.
- Confirm no `.env` or `.env.local` changes are staged.
- Confirm the previous local DB can be restored from documented steps.

## Issue 2: Local Supabase database can be initialized from Prisma migrations

### Body

## Context

Part of `dev/features/2026-07-03_supabase-postgres-prisma-migration`.

Goal: prove a clean local Supabase Postgres database can be initialized to the full Bonsai Tracker schema using Prisma migrations.

## Scope

- Inspect local Supabase status and actual local Postgres connection details.
- Point the local shell or local env file at the local Supabase Postgres database.
- Run Prisma generation if needed.
- Apply existing Prisma migrations to local Supabase Postgres.
- Check Prisma migration status after applying migrations.
- Inspect that expected tables, constraints, and indexes exist.
- Do not reset an existing non-empty DB without explicit confirmation.

## Acceptance Criteria

- Local Supabase Postgres is running and reachable.
- `DATABASE_URL` used for this issue is a direct Postgres URL, not `prisma+postgres://`.
- Prisma migrations apply successfully to local Supabase Postgres.
- `npm run prisma -- migrate status` reports a clean state.
- The database contains the expected Prisma-managed tables, including NextAuth tables and app tables.
- Any local reset decision is explicitly documented.

## Verification

- Run `npm run prisma -- generate` if needed.
- Run `npm run prisma -- migrate deploy` or the locally approved migration command.
- Run `npm run prisma -- migrate status`.
- Inspect tables through Supabase Studio, `psql`, or Prisma tooling.

## Issue 3: Local app can run against Supabase Postgres with baseline data

### Body

## Context

Part of `dev/features/2026-07-03_supabase-postgres-prisma-migration`.

Goal: get the local app running against Supabase Postgres with enough data to perform basic read/write checks.

## Scope

- Keep local runtime configured for Supabase Postgres.
- Decide whether `prisma db seed` is needed for baseline local data.
- Run the existing seed if useful.
- Verify seeded data exists when seed is run.
- Start the local app against Supabase Postgres.
- Perform a basic read/write sanity check through the app or API.

## Acceptance Criteria

- The local app starts with the Supabase-backed `DATABASE_URL`.
- Optional seed either succeeds or is explicitly skipped with a reason.
- If seed runs, `demo@example.com` exists in the local Supabase database.
- At least one app data read/write sanity check succeeds against Supabase Postgres.
- No production data import is performed.
- No secret env changes are committed.

## Verification

- Run `npm run prisma -- db seed` if selected.
- Start the app with `npm run dev`.
- Verify a basic API/UI flow can create or read data from Supabase Postgres.
- Confirm Git does not include local env changes.

## Issue 4: Core app flows pass against Supabase Postgres

### Body

## Context

Part of `dev/features/2026-07-03_supabase-postgres-prisma-migration`.

Goal: manually prove the main Bonsai Tracker flows still work against the Supabase-backed local database.

## Scope

- Run the local app against Supabase Postgres.
- Smoke-test core read/write flows.
- Document skipped steps where local OAuth, email, or storage credentials are not available.
- Keep the test focused on local Supabase Postgres behavior, not production cutover.

## Acceptance Criteria

- Health endpoint or equivalent local health check passes.
- Dashboard loads.
- Bonsai create/read or edit/read flow works.
- Subentry create/read or read flow works.
- Reminder create/read or read flow works.
- Feed/post route sanity check passes where local auth permits it.
- Waitlist/signup-gating route sanity check passes where local config permits it.
- Upload/media path sanity check passes or is explicitly skipped with reason.
- Any auth-provider limitations are documented.

## Verification

- Start the app with `npm run dev`.
- Execute the manual smoke-test checklist from `implementation.md`.
- Record pass/skip/fail notes in the migration docs or implementation notes.

## Issue 5: Automated validation passes on the Supabase-backed local setup

### Body

## Context

Part of `dev/features/2026-07-03_supabase-postgres-prisma-migration`.

Goal: verify the repository still passes automated checks while the local environment points to Supabase Postgres.

## Scope

- Run the standard project checks against the Supabase-backed local setup.
- Keep failures separated between Supabase-migration blockers and pre-existing unrelated issues.
- Do not make broad unrelated fixes in this issue unless they are required to validate the migration.

## Acceptance Criteria

- `npm test` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `npm run prisma -- migrate status` is clean against local Supabase Postgres.
- Any skipped or blocked check is documented with a concrete reason.
- No production cutover or production env changes are performed.

## Verification

- Run `npm test`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Run `npm run prisma -- migrate status`.

## Issue 6: Local Supabase operating runbook is complete

### Body

## Context

Part of `dev/features/2026-07-03_supabase-postgres-prisma-migration`.

Goal: finish the local operating documentation after the real local Supabase setup has been exercised.

## Scope

- Update docs with actual local Supabase commands and observed ports.
- Document the final local `DATABASE_URL` pattern without secrets.
- Document migration, optional seed, verification, smoke-test, and revert procedures.
- Record skipped checks and local environment caveats.
- Keep future self-hosted Supabase and production cutover as follow-up work, not part of this issue.

## Acceptance Criteria

- `docs/supabase-postgres-migration.md` reflects the actual local setup discovered during implementation.
- The runbook includes start/status, migrate, seed, verify, smoke-test, and revert steps.
- Skipped smoke-test steps are documented with reasons.
- Future self-hosted Supabase work is explicitly separated from the local migration.
- `implementation.md` can be updated from `DRAFT - Awaiting Plan Review` only after plan approval and actual implementation completion.
- No secrets are committed.

## Verification

- Review docs against the commands actually used locally.
- Confirm a fresh developer could follow the runbook.
- Confirm `git diff` contains no local secret values.
