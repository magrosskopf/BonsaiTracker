# External Supabase Project

Status: IMPLEMENTED
Last modified: 2026-07-26

## Purpose/Goal

The Bonsai app should use the existing external local Supabase project in `/Users/maius/Projekte/supabase` as the single Supabase project folder. This repository should not keep a second `supabase/` project directory after its migrations, seed, and DB tests have been transferred.

## Functional Requirements

1. Transfer Bonsai Supabase migrations, seed, and DB tests into the external Supabase project folder.
2. Keep this repository's Supabase CLI scripts working by pointing them at the external project folder.
3. Remove the local `supabase/` directory from this repository.
4. Keep app runtime environment pointed at the existing `http://127.0.0.1:54321` Supabase API.
5. Allow overriding the external Supabase root through `BONSAI_SUPABASE_PROJECT_ROOT`.

## Technical Constraints

1. Project stack is Next.js Pages Router, TypeScript, Supabase SDK/CLI, Tailwind.
2. Default external project root is `../supabase` from the Bonsai repo root.
3. Supabase CLI commands must pass `--workdir` to the external project root.
4. Do not delete Docker volumes or reset the database.
5. Preserve unrelated dirty worktree changes.

## Acceptance Criteria

1. `/Users/maius/Projekte/supabase/supabase/migrations` contains the Bonsai migrations.
2. `/Users/maius/Projekte/supabase/supabase/seed.sql` exists.
3. `/Users/maius/Projekte/supabase/supabase/tests` contains the Bonsai DB tests.
4. This repository no longer contains a `supabase/` directory.
5. `npm test` and `npm run typecheck` pass.

## Out-of-Scope

1. Deleting Docker volumes.
2. Resetting local Supabase data.
3. Moving application runtime code into the Supabase project.
4. Changing cloud/remote Supabase settings.
