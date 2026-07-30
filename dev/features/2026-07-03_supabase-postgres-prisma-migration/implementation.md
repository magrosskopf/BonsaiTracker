# Implementation Plan: Local Supabase Postgres Migration with Prisma

## Status

DRAFT - Awaiting Plan Review

## Overview

Implement the approved local migration path from Prisma against the current local database setup to Prisma against local Supabase Postgres.

This plan intentionally does not replace Prisma with Supabase SDK, does not introduce Supabase Auth, does not introduce Row Level Security as the app security model, and does not perform a production cutover. The first implementation target is local development only, with an empty Supabase Postgres database allowed.

## Reference

Spec: [`dev/features/2026-07-03_supabase-postgres-prisma-migration/spec.md`](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-07-03_supabase-postgres-prisma-migration/spec.md)

Key acceptance criteria covered by this plan:

1. Prisma migrations run successfully against local Supabase Postgres.
2. Local Supabase Postgres contains the expected Prisma schema.
3. Prisma Client can be generated and used against local Supabase Postgres.
4. Optional local seed can run against local Supabase Postgres.
5. Tests, typecheck, build, and manual smoke-test pass against local Supabase Postgres.
6. The previous local `DATABASE_URL` can be restored if needed.
7. No secrets are committed.

## File Structure

### Files to modify

1. [`.env.example`](/Users/maius/Projekte/Bonsai-Tracker/.env.example)
   - Replace the Prisma Accelerate-first `DATABASE_URL` example with a local Supabase Postgres example.
   - Keep comments or placeholders generic enough to avoid committing secrets.
   - Document that local Supabase uses direct Postgres for this phase, not Prisma Accelerate.

2. [`docs/supabase-postgres-migration.md`](/Users/maius/Projekte/Bonsai-Tracker/docs/supabase-postgres-migration.md)
   - Update from a future generic migration note to a local-first migration runbook.
   - Add local Supabase startup/status, local connection string discovery, Prisma migration, seed, verification, and revert steps.
   - Keep production/self-hosted migration as later/out-of-scope.

3. Optional: [`docs/IMPLEMENTATION_NOTES.md`](/Users/maius/Projekte/Bonsai-Tracker/docs/IMPLEMENTATION_NOTES.md)
   - Add a short note that local development can run against Supabase Postgres while Prisma remains the data layer.
   - Only modify if this file is still used as current operational context.

4. Optional: local-only environment documentation
   - If the project already has a committed local env template convention, add the Supabase local `DATABASE_URL` there.
   - Do not create or commit `.env.local` with real values.

### Files expected not to change

1. [`prisma/schema.prisma`](/Users/maius/Projekte/Bonsai-Tracker/prisma/schema.prisma)
   - No schema change is expected because Supabase Postgres is still PostgreSQL.

2. [`lib/prisma.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/prisma.ts)
   - No change is expected because it already uses `PrismaClient` and `DATABASE_URL`.

3. Application API routes and pages
   - No code change is expected for the local database host switch.

4. `workflows/`
   - Must not be modified.

## Technical Decisions

1. Prisma remains the relational data access layer.
2. Prisma Migrations remain the schema source.
3. Local Prisma connects directly to local Supabase Postgres.
4. Prisma Accelerate is not used in the local Supabase configuration.
5. Supabase SDK is not introduced for relational app data access.
6. Supabase SDK remains allowed only for existing Supabase-specific platform functionality such as Storage.
7. The Supabase database can start empty; no data export/import is part of this local phase.
8. `prisma db seed` is allowed and recommended if local UI flows need a baseline user.

## Implementation Steps

### Step 1: Inspect local Supabase setup

Purpose: identify the actual local Supabase state and connection details without changing app code.

Actions:

1. Check whether Supabase CLI and/or Docker-based local Supabase are available.
2. Check local Supabase status.
3. Identify local Postgres host, port, database, user, and password.
4. Record the intended local `DATABASE_URL` format in documentation using placeholders.
5. Do not commit real local credentials.

Expected result:

1. The implementation has a confirmed local Supabase Postgres connection target.
2. The target connection string is documented as an example only.

### Step 2: Preserve current local database configuration

Purpose: make local revert practical.

Actions:

1. Inspect which local env file is currently used for `DATABASE_URL`.
2. Record the old local `DATABASE_URL` outside Git or in a non-secret local note.
3. Add documentation describing how to restore the old value.
4. Do not commit `.env`, `.env.local`, or any real connection string changes.

Expected result:

1. A developer can switch back to the previous local database if Supabase Postgres fails.

### Step 3: Update committed documentation and examples

Purpose: make the local Supabase path repeatable.

Actions:

1. Update `.env.example` so `DATABASE_URL` shows a direct local Supabase Postgres-style URL.
2. Keep any Prisma Accelerate reference only as historical or non-local context if still needed.
3. Update `docs/supabase-postgres-migration.md` with:
   - local Supabase prerequisite
   - local status check
   - local `DATABASE_URL` pattern
   - Prisma migration command
   - optional seed command
   - verification commands
   - manual smoke-test checklist
   - local revert steps
   - self-hosted/production explicitly out-of-scope for this phase
4. Optionally update `docs/IMPLEMENTATION_NOTES.md` with a brief local database note.

Expected result:

1. The committed docs explain how local Supabase Postgres should be used with Prisma.
2. No secret values are committed.

### Step 4: Switch local runtime configuration interactively

Purpose: apply the local target database only in the developer environment.

Actions:

1. In the interactive terminal, update the local uncommitted env file with the local Supabase `DATABASE_URL`.
2. Ensure the value is a direct Postgres URL, not `prisma+postgres://`.
3. Keep `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Google OAuth, email fallback, and storage env vars unchanged unless needed for local smoke testing.

Expected result:

1. Local Prisma commands and the local app point at local Supabase Postgres.
2. Git does not contain secret env changes.

### Step 5: Apply Prisma schema to local Supabase Postgres

Purpose: create the empty local Supabase database schema from the existing migrations.

Actions:

1. Run Prisma Client generation if needed:
   - `npm run prisma -- generate`
2. Apply migrations to local Supabase Postgres:
   - Prefer `npm run prisma -- migrate deploy` when validating committed migrations.
   - Use `npm run prisma -- migrate reset` only if intentionally resetting the local Supabase DB is acceptable.
3. Inspect migration status:
   - `npm run prisma -- migrate status`
4. If the database is not empty and conflicts appear, stop and decide whether a local reset is acceptable.

Expected result:

1. Local Supabase Postgres has all tables, constraints, and indexes described by Prisma migrations.
2. Prisma migration history is clean.

### Step 6: Seed local baseline data if needed

Purpose: support local UI and auth-adjacent smoke tests without importing old data.

Actions:

1. Decide whether the existing `prisma/seed.ts` baseline user is useful.
2. If yes, run:
   - `npm run prisma -- db seed`
3. Verify that `demo@example.com` exists if the seed ran.
4. Do not treat seed as a production data migration.

Expected result:

1. Optional baseline data exists in local Supabase Postgres.

### Step 7: Verify Prisma and app behavior

Purpose: prove the app works against local Supabase Postgres.

Actions:

1. Run:
   - `npm test`
   - `npm run typecheck`
   - `npm run build`
2. Start the local app:
   - `npm run dev`
3. Run a manual smoke test:
   - health endpoint
   - login or auth configuration sanity check
   - dashboard
   - create or read a bonsai
   - create or read a subentry
   - create or read a reminder
   - feed/post route sanity check
   - waitlist/signup-gating route sanity check
   - upload/media path sanity check if storage is configured

Expected result:

1. Automated checks pass.
2. Manual smoke-test confirms the app can read and write app data in Supabase Postgres.

### Step 8: Document results and local operating notes

Purpose: leave the repo with an auditable local migration result.

Actions:

1. Update the implementation plan status only after actual implementation and verification.
2. Record any local Supabase port or command differences discovered during implementation in docs.
3. Record any skipped smoke-test steps with reasons.
4. Keep production/self-hosted follow-up explicitly separate.

Expected result:

1. The local Supabase Postgres setup is documented well enough to repeat.

## Code Architecture

### Database access

The app continues using `PrismaClient` from `lib/prisma.ts`.

`DATABASE_URL` is the only intended switch for the relational database target. No repository code should branch on "Supabase" for relational data access in this phase.

### Schema management

`prisma/schema.prisma` and `prisma/migrations/` remain authoritative.

Local Supabase Postgres should be treated like any other PostgreSQL target for Prisma migrations.

### Auth integration

NextAuth keeps using the PrismaAdapter. Its tables are created by the existing Prisma schema and migrations.

No Supabase Auth integration is added.

### Storage integration

Existing Supabase Storage code remains independent. The database host switch must not require changing upload storage mode.

## Integration Points

1. `DATABASE_URL`
   - Primary integration point for Prisma and NextAuth adapter persistence.

2. Prisma migrations
   - Create all local Supabase Postgres schema objects.

3. NextAuth PrismaAdapter
   - Uses the same Prisma client and schema tables.

4. Tests and build
   - Validate that TypeScript and app behavior still match the current data layer.

5. Local Supabase
   - Provides the PostgreSQL server and Supabase Studio for inspection.

## Test Strategy

### Automated checks

1. `npm test`
2. `npm run typecheck`
3. `npm run build`
4. `npm run prisma -- migrate status`

### Manual verification

1. Verify local Supabase is running.
2. Verify Prisma migrations have applied.
3. Verify optional seed data exists if seed is run.
4. Verify the app starts with the local Supabase `DATABASE_URL`.
5. Verify core app read/write flows.

### Data verification

Because the local Supabase database may start empty, no source-vs-target data count comparison is required.

Required local verification:

1. Tables exist.
2. Migrations are recorded.
3. Seed data exists if seeded.
4. New records can be created and read.

## Edge Cases and Error Handling

1. Local Supabase is not running.
   - Stop implementation and start/check local Supabase before Prisma commands.

2. Local Supabase port differs from the default.
   - Use discovered local status output; update docs with actual convention or placeholder guidance.

3. `DATABASE_URL` still points to Prisma Accelerate.
   - Stop before migrations; local Supabase phase requires direct Postgres URL.

4. Existing local Supabase DB is not empty.
   - Do not reset silently.
   - Decide interactively whether local reset is acceptable.

5. Prisma migration fails.
   - Capture error.
   - Do not edit historical migrations unless there is an approved plan update.
   - Prefer fixing environment/connection issues first.

6. Seed fails because optional related env/config is missing.
   - Determine whether seed is required for acceptance.
   - If not required, document as skipped.

7. Login cannot be fully tested due to missing OAuth/email credentials.
   - Verify provider configuration as far as local secrets allow.
   - Document any skipped auth provider flow.

8. Tests rely on environment assumptions.
   - Keep env changes local and explicit.
   - Document required local env for test execution.

9. Build fails for reasons unrelated to Supabase Postgres.
   - Record failure and separate unrelated pre-existing issues from migration blockers.

## Sandcastle/Factory vs Interactive Terminal

## Vertical GitHub Issue Slices

These slices are the intended GitHub issue breakdown. Each issue ends in a usable, independently verifiable state instead of only completing one technical layer.

1. **Local Supabase DB target is documented and reversible**
   - A developer can identify the local Supabase Postgres target, understand the intended `DATABASE_URL`, and restore the previous local DB configuration.
   - Covers local target documentation, safe env examples, no-secret handling, and revert path.

2. **Local Supabase database can be initialized from Prisma migrations**
   - An empty local Supabase Postgres database can be brought to the complete app schema using Prisma.
   - Covers connection confirmation, migration execution, migration status, and schema inspection.

3. **Local app can run against Supabase Postgres with baseline data**
   - The local app can start against Supabase Postgres and has enough baseline data to exercise basic UI/API flows.
   - Covers local env switch, optional seed, and a first read/write sanity check.

4. **Core app flows pass against Supabase Postgres**
   - The main product flows work manually against the Supabase-backed local database.
   - Covers dashboard, bonsai, subentry, reminder, feed/waitlist, and media path smoke tests.

5. **Automated validation passes on the Supabase-backed local setup**
   - Repository checks pass while the local environment points to Supabase Postgres.
   - Covers `npm test`, `npm run typecheck`, `npm run build`, and Prisma migration status.

6. **Local Supabase operating runbook is complete**
   - The final local setup, discovered ports/commands, skipped checks, and operating/revert notes are documented.
   - Covers finishing docs after real local execution and separating future self-hosted work.

### Build with Sandcastle/Factory

Use Sandcastle/Factory for repeatable repo work:

1. Update `.env.example`.
2. Update `docs/supabase-postgres-migration.md`.
3. Optionally update `docs/IMPLEMENTATION_NOTES.md`.
4. Add any non-secret checklist or helper documentation.
5. Run non-destructive repository checks where environment allows.

### Do interactively in terminal

Do these with the user in the interactive terminal:

1. Inspect actual local Supabase status.
2. Confirm local Supabase ports and credentials.
3. Update `.env.local` or local shell environment with real `DATABASE_URL`.
4. Run Prisma migrations against the local Supabase DB.
5. Run optional local reset if needed.
6. Run optional seed.
7. Start the local dev server.
8. Perform manual smoke-test.
9. Revert local `DATABASE_URL` if needed.

## Validation Checklist

Before implementation can be marked complete:

1. Spec status is `APPROVED`.
2. Implementation plan status is `PLAN-APPROVED`.
3. `.env.example` documents local Supabase Postgres without secrets.
4. Supabase Postgres migration docs describe local setup, migration, verification, and revert.
5. Local Supabase status is known.
6. Local `DATABASE_URL` points to direct Supabase Postgres.
7. Prisma migrations apply successfully.
8. Prisma migration status is clean.
9. Optional seed is run or explicitly skipped.
10. `npm test` passes.
11. `npm run typecheck` passes.
12. `npm run build` passes.
13. Manual smoke-test passes or skipped steps are documented.
14. No real secrets or local env files are committed.
15. No production cutover has been performed.

## Approval Gate

No implementation should start until this plan is explicitly approved with `PLAN-APPROVED` or an equivalent confirmation.
