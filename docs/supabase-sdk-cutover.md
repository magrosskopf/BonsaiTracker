# Supabase SDK Cutover Runbook

## Preconditions

1. Create a verifiable backup of the current non-production database and relevant Storage objects before any reset.
2. Configure hosted Supabase Auth providers manually: Google OAuth, Magic Link redirects, `before_user_created` hook and Custom SMTP via Resend.
3. Provide only canonical runtime env vars to Next.js: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_STORAGE_BUCKET`.
4. Keep direct Postgres credentials out of the app runtime; they belong only to Supabase CLI/CI migration jobs.
5. For the Public Client API, decide the app-integrity mode per environment before mobile release. Production must not run private `/api/v1/...` flows with integrity enforcement disabled.

## Local Validation

```bash
npm ci
npm run supabase:start
npm run supabase:reset
npm run test:db
npm run supabase:types:check
npm test
npm run test:integration
npm run typecheck
npm run build
npm run validate:local-supabase
```

## Public Client API Checks

1. Verify `/api/v1/posts?limit=20` returns `{ items, nextCursor }` and rejects invalid `limit` or `cursor`.
2. Verify private `/api/v1/...` routes return `401` without Bearer Auth and do not accept user IDs from request bodies as authority.
3. Verify `PATCH /api/v1/reminders/:id` accepts `status=CANCELLED` and clears `completed_at` and `snoozed_until`.
4. Verify upload limits remain `5 MB` and MIME types remain `image/jpeg`, `image/png` and `image/webp`.
5. Verify `POST /api/v1/posts/:id/reports` and comment reports are auth-only, idempotent and unreadable from direct `anon` or `authenticated` table access.
6. Verify Production app-integrity enforcement fails closed when headers or provider configuration are missing.

## Remote Guardrail

Do not run `supabase db reset --linked`, `supabase db push`, remote secret updates or bucket policy changes without a separate explicit approval and a named backup artifact.

## Rollback

Rollback requires the previous application version plus the matching database backup. Do not start the old Prisma/NextAuth application against the new Supabase baseline.
