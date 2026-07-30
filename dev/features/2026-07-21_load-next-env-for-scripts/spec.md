# Load Next Env For Scripts

Status: IMPLEMENTED
Last modified: 2026-07-21

## Purpose/Goal

Running repository scripts that use Supabase runtime configuration should not fail with `Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL` when the variable is present in `.env.local` or `.env`. Next.js already loads these files for `next dev` and `next build`, but direct Node/TSX scripts currently rely only on the shell environment.

## Functional Requirements

1. Direct repository scripts that read Supabase runtime variables must load Next-compatible environment files from the project root before reading `process.env`.
2. The loading behavior must support the existing `.env.local` and `.env` files without changing their contents.
3. The existing fail-fast validation in `lib/config/runtime.ts` and script-level `readRequiredEnv` helpers must remain in place for truly missing or empty values.
4. No real secrets, local env values, or generated Supabase credentials may be committed or printed.
5. Existing Next.js runtime behavior for browser/server application code must not change.

## Technical Constraints

1. Project stack is Next.js Pages Router, TypeScript, Supabase SDK/CLI, Tailwind.
2. Use the existing Next environment loading mechanism through `@next/env` rather than adding ad hoc env parsing.
3. Keep the change scoped to script/runtime setup and focused tests.
4. Do not modify files under `workflows/`.
5. Preserve existing dirty worktree changes that are unrelated to this fix.

## Acceptance Criteria

1. `npm run approve-waitlist -- user@example.test "note"` and `node scripts/update-signup-settings.js signup_enabled=true` get past local env loading when `.env.local` or `.env` contains the required Supabase variables.
2. `npm run test:integration` and `npm run validate:local-supabase` execute with the same loaded env available to spawned test/build steps.
3. Existing tests continue to pass with `npm test`.
4. TypeScript still passes with `npm run typecheck`.
5. No `.env`, `.env.local`, `.env copy.local`, or secret value changes are made.

## Out-of-Scope

1. Creating or changing local Supabase credentials.
2. Starting or resetting the local Supabase stack.
3. Changing production/deployment environment variables.
4. Relaxing required environment validation.
5. Refactoring Supabase client creation outside the script env-loading path.

## Notes From Initial Diagnosis

- `lib/config/runtime.ts` throws the reported error when `process.env.NEXT_PUBLIC_SUPABASE_URL` is empty.
- `.env` and `.env.local` in this workspace contain the expected variable names and non-empty values.
- `npm test` currently passes, so the issue is likely limited to direct Node/TSX script contexts or external runtime contexts that do not load Next env files.
- `scripts/approve-waitlist.js` and `scripts/update-signup-settings.js` read Supabase env values directly without loading `.env.local`.
