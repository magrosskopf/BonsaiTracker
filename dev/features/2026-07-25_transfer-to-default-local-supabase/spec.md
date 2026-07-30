# Transfer To Default Local Supabase

Status: IMPLEMENTED
Last modified: 2026-07-25

## Purpose/Goal

The application must use the existing local Supabase instance named `supabase` on the default local ports instead of `bonsai-tracker-local`. The `supabase` database currently contains the legacy Prisma table `public."Bonsai"` but not the current Supabase SDK schema expected by the application.

## Functional Requirements

1. Configure local development to target the existing `supabase` stack on API port `54321`.
2. Reuse the existing `supabase` Docker volumes; do not create a new Supabase project.
3. Apply the repository Supabase migrations to the `supabase` database so `public.bonsais` and related objects exist.
4. Keep existing legacy tables untouched.
5. Preserve local data; do not reset the target database.

## Technical Constraints

1. Project stack is Next.js Pages Router, TypeScript, Supabase SDK/CLI, Tailwind.
2. The target Docker volume is labeled `com.supabase.cli.project=supabase`.
3. The target API URL is `http://127.0.0.1:54321`.
4. The target Postgres URL is `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.
5. Do not print or rotate local keys.

## Acceptance Criteria

1. `.env.local` points `NEXT_PUBLIC_SUPABASE_URL` to `http://127.0.0.1:54321`.
2. `supabase/config.toml` targets project id `supabase` and default local ports.
3. The `supabase` local database has `public.bonsais`.
4. The `supabase` local PostgREST endpoint no longer returns `PGRST205` for `bonsais`.
5. No database reset is performed.

## Out-of-Scope

1. Migrating old Prisma table data into the new lowercase schema.
2. Removing `bonsai-tracker-local` Docker volumes.
3. Changing remote/cloud Supabase projects.
4. Fixing optional local services unrelated to the app create flow.
