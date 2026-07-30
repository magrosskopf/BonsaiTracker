# Transfer To Default Local Supabase Implementation Plan

Status: COMPLETE
Last modified: 2026-07-25

## Overview

Switch local app and Supabase CLI configuration back to the existing default local project `supabase`, then apply the repository migrations to that database without resetting it.

## Reference

Spec: `dev/features/2026-07-25_transfer-to-default-local-supabase/spec.md`

Key acceptance criteria:
- Local app URL is `http://127.0.0.1:54321`.
- Supabase CLI project id is `supabase`.
- The target DB contains `public.bonsais`.
- PostgREST sees `bonsais` on `54321`.
- No reset is run.

## File Structure

Modify:
- `.env`
- `.env.local`
- `.env.example`
- `supabase/config.toml`

Create:
- `dev/features/2026-07-25_transfer-to-default-local-supabase/spec.md`
- `dev/features/2026-07-25_transfer-to-default-local-supabase/implementation.md`

## Implementation Steps

1. Confirm Docker volumes for `supabase` still exist.
2. Update local configuration from `bonsai-tracker-local` ports to default `supabase` ports.
3. Start the existing `supabase` stack from its volumes.
4. Inspect the target schema.
5. Apply the repository migrations to the target DB without `db reset`.
6. Verify `public.bonsais` exists and PostgREST no longer returns `PGRST205`.

## Code Architecture

Application code already targets lowercase Supabase SDK tables and RPCs. This change aligns local runtime and database state with that existing code.

## Technical Decisions

Use the existing `supabase` Docker volumes as the source of truth for the selected local instance. Do not move data out of `bonsai-tracker-local`; the user explicitly wants the other Supabase instance.

Apply SQL migrations directly to the target Postgres database if Supabase CLI migration commands would require a reset or remote link.

## Integration Points

- `.env.local` controls the local Next.js runtime URL.
- `supabase/config.toml` controls which local Docker project the Supabase CLI starts.
- `supabase/migrations/*.sql` defines the current app schema.

## Test Strategy

Verify with SQL introspection against `supabase_db_supabase` and a PostgREST request against `http://127.0.0.1:54321/rest/v1/bonsais`.

## Edge Cases & Error Handling

- If migrations partially exist, inspect before applying and avoid dropping legacy objects.
- If optional Supabase services are unhealthy, start the minimal set required for app API work.
- Restart Next dev server after env changes.

## Validation Checklist

- [x] Workflow docs created.
- [x] Default Supabase volumes confirmed.
- [x] Local config points to `supabase`/`54321`.
- [x] Target stack started.
- [x] Migrations applied without reset.
- [x] `public.bonsais` verified.
