# Bonsai Tracker Beta Operations

## Runtime Architecture

- Supabase Auth handles Google login, email/password auth, optional Magic Links, browser sessions, refresh and logout.
- Browser code uses Supabase only for Auth with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
  For self-hosted Supabase behind Kong, this key must be the public anon JWT, not a Supabase Cloud `sb_publishable_...` key.
- Next.js API Routes remain the application data boundary and validate `Authorization: Bearer <access-token>`.
- Data API, service-only RPCs and private Storage are accessed only server-side with `SUPABASE_SECRET_KEY`.
- Supabase CLI migrations live in the external local Supabase project at `../supabase/supabase/migrations/` by default.

## Local Development

```bash
npm ci
npm run supabase:start
npm run supabase:reset
npm run test:db
npm run supabase:types
npm run dev
```

If the external Supabase project is not in `../supabase`, set `BONSAI_SUPABASE_PROJECT_ROOT` to its project root before running Supabase CLI scripts.

## Supabase Auth

- Enable the Google provider in Supabase Auth.
- Enable the Email provider in Supabase Auth and allow password-based signups.
- Configure the local redirect URL in Supabase: `http://localhost:3000/auth/callback`.
- Add the production redirect URL later when a production domain exists: `https://<production-domain>/auth/callback`.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser auth. Self-hosted/Kong deployments require the anon JWT as the browser key; using a Cloud `sb_publishable_...` key against Kong returns `401 Unauthorized`.
- Keep server-only Supabase access on `SUPABASE_SECRET_KEY` and `SUPABASE_STORAGE_BUCKET`. Self-hosted/Kong deployments require the service-role JWT as the server key.
- Password signups are still gated by `/api/auth/precheck` and the server-side Supabase signup checks.
- Configure email confirmations deliberately for the beta setup; confirmed signup and password-recovery links should both return to `/auth/callback`.
- The Magic Link fallback stays hidden by default and can be enabled with `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED=true`.

## Operations

- Approve a waitlist user: `npm run approve-waitlist -- user@example.test "optional note"`
- Update signup settings: `node scripts/update-signup-settings.js signup_enabled=true waitlist_enabled=true max_total_users=100`
- Validate local stack: `npm run validate:local-supabase`
- Cutover and rollback: `docs/supabase-sdk-cutover.md`
