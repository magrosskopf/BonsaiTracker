# Supabase SDK Cutover Runbook

## Preconditions

1. Create a verifiable backup of the current non-production database and relevant Storage objects before any reset.
2. Configure hosted Supabase Auth providers manually: Google OAuth, Magic Link redirects, `before_user_created` hook and Custom SMTP via Resend.
3. Provide only canonical runtime env vars to Next.js: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_STORAGE_BUCKET`.
4. Keep direct Postgres credentials out of the app runtime; they belong only to Supabase CLI/CI migration jobs.

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

## Remote Guardrail

Do not run `supabase db reset --linked`, `supabase db push`, remote secret updates or bucket policy changes without a separate explicit approval and a named backup artifact.

## Rollback

Rollback requires the previous application version plus the matching database backup. Do not start the old Prisma/NextAuth application against the new Supabase baseline.
