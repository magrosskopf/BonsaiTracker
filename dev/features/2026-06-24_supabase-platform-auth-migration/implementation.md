# Implementation Plan: Supabase Platform and Social Login Migration

## Status

COMPLETE

## Overview

Implement the approved direction from [`spec.md`](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-06-24_supabase-platform-auth-migration/spec.md) incrementally:

1. Add Google Login to the existing NextAuth setup.
2. Remove magic link from the primary login UI while keeping it available as a hidden/operator fallback.
3. Make closed-beta signup gating authoritative for social login.
4. Document Supabase Postgres, Supabase Free, keepalive, backup/export, and later Supabase Pro upgrade decisions.
5. Defer direct Supabase Auth migration to a separate future spec.

This plan intentionally keeps Prisma and NextAuth in place for the first implementation step because the repository already uses the NextAuth Prisma adapter and the Prisma schema already contains the needed OAuth account tables.

## Reference

Spec: [`dev/features/2026-06-24_supabase-platform-auth-migration/spec.md`](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-06-24_supabase-platform-auth-migration/spec.md)

Key acceptance criteria covered by this plan:

1. The first implementation step is Google Login through existing NextAuth.
2. Magic link is removed from the public UI but retained as a technical fallback unless explicitly removed later.
3. Supabase Postgres is planned as the production database consolidation path, not mixed with a second production database.
4. Supabase Free is accepted for MVP/beta with documented pause risk, keepalive allowance, and backup/export requirements.
5. Signup-gating behavior for social login is explicit and testable.
6. Existing app data remains owned by the same local `User` records.

## File Structure

### Code files to modify

1. [`lib/auth.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/auth.ts)
   - Add `GoogleProvider`.
   - Extract shared signup-gating logic for both email and Google providers.
   - Preserve existing email provider as fallback behind configuration.
   - Ensure social login does not bypass beta gating.

2. [`pages/index.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/index.tsx)
   - Replace primary magic-link form with Google sign-in CTA.
   - Keep waitlist/request-access path visible.
   - Show auth errors in user-friendly copy.
   - Optionally keep a non-prominent fallback route or env-gated fallback UI for magic link.

3. [`pages/api/auth/precheck.ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/auth/precheck.ts)
   - Keep for magic-link fallback if the email provider remains available.
   - Do not use it as the primary Google flow gate; Google gating must happen server-side in the NextAuth `signIn` callback.

4. [`lib/signup-gating.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/signup-gating.ts)
   - Reuse existing functions.
   - Add helper only if needed to make provider-independent signup checks readable and testable.

5. [`pages/datenschutz.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/datenschutz.tsx)
   - Replace magic-link-primary wording with social-login wording.
   - Add Google as an authentication provider.
   - Keep email login text only if fallback remains active.

6. [`components/Navigation.tsx`](/Users/maius/Projekte/Bonsai-Tracker/components/Navigation.tsx)
   - No expected behavior change, but verify sign-out/session display still works after provider change.

7. [`prisma/schema.prisma`](/Users/maius/Projekte/Bonsai-Tracker/prisma/schema.prisma)
   - Verify compatibility with the NextAuth Prisma adapter for OAuth users.
   - Add `image String?` to `User` if the Google provider/adapter requires the standard NextAuth `image` field.
   - Alternatively implement a custom adapter mapping only if avoiding the standard field is explicitly worth the extra complexity.

8. `prisma/migrations/...`
   - Add a migration only if `User.image` or another adapter-compatibility field is required.
   - Keep existing `profileImageUrl` unchanged for product profile display unless a separate profile-image migration is approved.

### Documentation files to modify or create

1. [`docs/IMPLEMENTATION_NOTES.md`](/Users/maius/Projekte/Bonsai-Tracker/docs/IMPLEMENTATION_NOTES.md)
   - Add a short note for social-login and Supabase platform direction if this file is still the general operational notes location.

2. `docs/supabase-mvp-operations.md`
   - New document covering Supabase Free, pause risk, keepalive, backups/exports, and Pro upgrade trigger.

3. `docs/supabase-postgres-migration.md`
   - New document or section describing the future database migration path to Supabase Postgres while keeping Prisma.

4. [`.env.example`](/Users/maius/Projekte/Bonsai-Tracker/.env.example)
   - Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and optional feature flags.
   - Add `AUTH_EMAIL_LOGIN_ENABLED` if the email provider becomes configurable.
   - Keep Supabase storage variables documented as separate from Supabase Auth.

### Test files to modify or create

1. `tests/auth-signup-gating.test.ts`
   - New focused tests for provider-independent signup gate behavior if helpers are extracted.

2. [`tests/waitlist-page.test.ts`](/Users/maius/Projekte/Bonsai-Tracker/tests/waitlist-page.test.ts)
   - Update text assertions if login copy changes.

3. Existing API/community tests
   - No direct change expected unless session shape or auth helper behavior changes.

## Implementation Steps

### Step 1: Prepare provider configuration

1. Import Google provider from `next-auth/providers/google` in `lib/auth.ts`.
2. Add Google provider when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present.
3. Keep email provider available by default for local development unless `AUTH_EMAIL_LOGIN_ENABLED=false`.
4. Avoid failing app boot when Google env vars are missing in local/test environments.
5. Add a small provider builder function only if it improves readability.

Expected result:

1. Production can enable Google Login through env vars.
2. Local development can still use magic link fallback without Google credentials.

### Step 1a: Verify NextAuth Prisma adapter schema compatibility

1. Compare the current `User` model with the fields used by the NextAuth Prisma adapter during OAuth user creation.
2. Pay special attention to the Google profile image:
   - the current app has `profileImageUrl`
   - the standard NextAuth Prisma schema uses `image`
3. If the adapter attempts to create `User.image`, add `image String?` to the Prisma `User` model through a migration.
4. Do not remove or rename `profileImageUrl` in this implementation.
5. Decide whether `image` should remain an auth-provider metadata field while `profileImageUrl` remains the app profile field.
6. Regenerate Prisma client after any schema change.

Expected result:

1. First-time Google user creation does not fail because of an unknown Prisma field.
2. Existing profile image behavior remains unchanged.

### Step 2: Make signup gating provider-independent

1. Extract the shared first-time-user gate from the email-specific `signIn` callback into a helper, for example:
   - `evaluateAuthSignupGate(candidateEmail: string)`
   - or `authorizeFirstTimeSignin(candidateEmail: string, options)`
2. The helper must:
   - normalize email
   - release expired signup slots
   - allow existing users
   - require allowlist/eligibility for new users
   - reserve signup slot for approved first-time users
   - log denial reasons
3. For email magic link:
   - Run the gate during `verificationRequest`.
   - Release reserved slot after successful final sign-in, preserving current behavior.
4. For Google:
   - Run the gate in `callbacks.signIn` when `account.provider === "google"`.
   - Use `user.email` as the candidate email.
   - Reject sign-in if Google does not provide an email.
   - Decide whether to trust Google emails only when `user.emailVerified` is available. If NextAuth's Google user shape does not expose this reliably, treat provider email as sufficient for MVP and document the limitation.
5. Ensure `account.provider !== "email"` no longer returns `true` unconditionally.

Expected result:

1. Google sign-in cannot bypass closed-beta approval or capacity limits.
2. Existing users can still sign in after capacity is reached.
3. First-time social users need approval just like first-time magic-link users.

### Step 3: Handle account linking and existing users

1. Preserve the local `User` table as the app ownership source.
2. Verify how NextAuth behaves when a Google account signs in with an email that already exists from magic link.
3. Preferred behavior:
   - Existing user with the same email should be able to sign in with Google and keep the same local `User.id`.
4. If NextAuth blocks with `OAuthAccountNotLinked`, use one of these approaches:
   - enable safe email-based account linking for Google only if email is verified and risk is accepted
   - or document a manual migration/linking process before public rollout
5. Do not create duplicate users with the same email.
6. Add a manual test case for existing magic-link user switching to Google.
7. If enabling email-based linking, configure it narrowly for Google only and document why Google email verification is trusted for this app.
8. If not enabling email-based linking, add explicit UI/error copy for `OAuthAccountNotLinked` so users are not stuck with a generic error.

Expected result:

1. Existing beta users keep their bonsais, reminders, posts, likes, comments, and profiles.
2. New Google users are still subject to approval before account creation.

### Step 4: Update landing/login UI

1. Replace the email form in `pages/index.tsx` with a primary Google login button:
   - `signIn("google", { callbackUrl: "/dashboard" })`
2. Keep the waitlist form visible for users without access.
3. Remove "Magic Link senden" from the main path.
4. If email fallback remains:
   - hide it behind an env flag, a support-only route, or a low-prominence fallback section.
   - do not present it as the normal user path.
5. Update error copy for OAuth failures:
   - denied signup
   - login failed
   - account linking issue
   - missing provider configuration
   - OAuth callback or access-denied errors returned through `router.query.error`
6. Maintain the existing authenticated state actions:
   - dashboard link
   - logout button

Expected result:

1. New visitors understand the primary action as social login.
2. The waitlist path remains clear for users without beta access.

### Step 5: Update legal and operational documentation

1. Update `pages/datenschutz.tsx`:
   - add Google Login as authentication provider
   - explain that Google account data needed for authentication is processed
   - remove or demote magic-link language if the UI no longer offers it prominently
2. Create `docs/supabase-mvp-operations.md`:
   - Supabase Free is allowed during MVP/beta
   - Free-tier projects may pause on low activity
   - keepalive every 5-6 days is acceptable only for MVP/beta continuity
   - Pro upgrade trigger: public launch, paying users, meaningful stored user data, or unacceptable pause risk
   - backup/export cadence before meaningful beta usage
3. Create `docs/supabase-postgres-migration.md`:
   - Supabase Postgres remains Postgres
   - Prisma stays the schema/data access layer
   - one production database is authoritative
   - migration outline: provision project, set connection strings, run migrations, import/export data, verify, switch env vars
4. Add required env vars to docs:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - optional `AUTH_EMAIL_LOGIN_ENABLED`
   - existing Supabase storage env vars
5. Add Google OAuth setup notes:
   - authorized redirect URI for local development
   - authorized redirect URI for production
   - OAuth consent screen status
   - support/contact email shown by Google
   - requirement that `NEXTAUTH_URL` matches the deployed domain

Expected result:

1. The platform decision is documented for future operators.
2. The legal page no longer describes the old login model as the only auth mechanism.

### Step 6: Add or update tests

1. Add unit tests for the extracted signup gate if it can be isolated without heavy database setup.
2. If existing DB-backed helpers are hard to unit test directly, add lightweight tests around pure decisions and document manual verification for DB-backed concurrency behavior.
3. Update login/waitlist copy tests to reflect Google-first UI.
4. Add tests or assertions for provider config behavior if practical:
   - Google provider appears only with credentials
   - email provider fallback respects feature flag
5. Add tests or manual verification notes for NextAuth error query handling on `/`.
6. Add a schema/migration verification item if `User.image` is added.
7. Keep existing test command:
   - `npm test`
8. Run typecheck:
   - `npm run typecheck`

Expected result:

1. The social-login gate is covered at the lowest practical level.
2. Existing tests are updated for the new login copy.

### Step 7: Manual verification checklist

Before considering implementation complete:

1. Existing approved user can sign in with Google and reaches `/dashboard`.
2. Non-approved Google user is rejected and does not get an app account.
3. Capacity limit blocks new users but not existing users.
4. Existing magic-link user can sign in with Google without losing data, or the account-linking limitation is documented as a release blocker.
5. Sign out still works.
6. Waitlist request path still works.
7. Magic-link fallback works only if intentionally enabled.
8. Datenschutz page reflects the active login providers.
9. Supabase MVP operations documentation exists and states Free-tier limitations clearly.
10. Google OAuth consent screen and callback URL are configured for the target environment.
11. First-time Google sign-in creates a user without Prisma adapter field errors.

## Code Architecture

### Auth provider setup

`authOptions.providers` should be assembled from small provider factory logic:

1. Always include Google when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` exist.
2. Include EmailProvider when `AUTH_EMAIL_LOGIN_ENABLED !== "false"`.
3. Keep provider setup side-effect free except for the existing Resend send callback.

### Signup gate

The sign-in callback should route by provider but use shared signup-gating semantics:

1. `email` verification request:
   - gate first-time email before sending login email.
2. `email` final callback:
   - release signup slot and allow existing NextAuth behavior.
3. `google` callback:
   - gate first-time OAuth sign-in before account creation.
4. unknown OAuth providers:
   - reject unless intentionally supported later.

### Data model

No product data model redesign is intended for Phase 1.

Existing models already cover the core ownership and OAuth account structure:

1. `User.email`
2. `Account.provider`
3. `Account.providerAccountId`
4. `Session`

OAuth user creation may still require an additive Prisma migration for the standard NextAuth `User.image` field because the current app-specific profile image field is named `profileImageUrl`. This must be verified before implementation is marked complete.

Supabase Postgres migration also should not require schema changes beyond any NextAuth adapter compatibility fix. It is primarily a hosting and connection-string migration unless later Supabase Auth integration adds fields.

## Technical Decisions

1. Use NextAuth Google provider for first implementation because the app already uses NextAuth and Prisma adapter tables.
2. Do not migrate to Supabase Auth in this implementation because it would require broad session and API authorization rewrites.
3. Keep Prisma as the data access layer even if the database moves to Supabase Postgres.
4. Keep email magic link as a technical fallback for now unless the user explicitly approves full removal.
5. Treat Supabase Free as acceptable for MVP/beta but document operational risk and backup requirements.
6. Keep social login beta gating server-side in `callbacks.signIn`; UI checks alone are not sufficient.
7. Treat `User.image` and `User.profileImageUrl` as separate concepts if `image` is added:
   - `image` stores OAuth/provider metadata for adapter compatibility.
   - `profileImageUrl` remains the product profile image shown in the app.

## Integration Points

1. NextAuth routes remain under [`pages/api/auth/[...nextauth].ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/auth/[...nextauth].ts).
2. Server authorization remains through [`lib/authz.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/authz.ts).
3. Client session handling remains through `SessionProvider` in [`pages/_app.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/_app.tsx).
4. Existing protected pages continue using `useSession`.
5. Existing Supabase Storage remains separate from auth and database migration work.
6. Waitlist/allowlist data remains in the Prisma-managed database.
7. Google OAuth setup integrates with the external Google Cloud Console and must be reflected in deployment configuration.

## Test Strategy

### Automated tests

Run:

```bash
npm test
npm run typecheck
```

Test targets:

1. Signup gate allows existing users.
2. Signup gate rejects unapproved first-time users.
3. Signup gate allows approved first-time users when capacity exists.
4. Signup gate rejects approved first-time users when capacity is full.
5. Google callback cannot bypass signup gate.
6. Landing page/login copy no longer expects "Magic Link senden" as the primary CTA.
7. Waitlist form remains reachable.
8. Prisma schema remains compatible with NextAuth OAuth account creation.
9. Error rendering covers known NextAuth query errors used by OAuth callbacks.

### Manual tests

Manual verification is required because Google OAuth depends on external provider configuration:

1. Configure Google OAuth redirect URI:
   - local: `http://localhost:3000/api/auth/callback/google`
   - production: `https://<domain>/api/auth/callback/google`
2. Sign in with an approved Google account.
3. Attempt sign-in with a non-approved Google account.
4. Attempt sign-in as an existing magic-link user.
5. Verify account ownership by opening dashboard and existing bonsai records.
6. Confirm the created `Account` row uses provider `google`.
7. Confirm no duplicate `User` row is created for an existing email.

## Edge Cases and Error Handling

1. Missing Google env vars:
   - App should still boot.
   - Google button should not render or should show a controlled unavailable state.
2. Google account has no email:
   - Reject sign-in.
3. Unapproved email:
   - Reject sign-in and show clear beta/waitlist copy.
4. Capacity reached:
   - Reject new users but allow existing users.
5. OAuthAccountNotLinked:
   - Treat as a migration/release risk.
   - Either enable safe linking with verified Google email or document manual remediation.
6. Duplicate user risk:
   - Do not create a second `User` for the same email.
7. Email fallback disabled:
   - `/api/auth/signin/email` should not be part of public UX.
8. Supabase Free project paused:
   - Document restore from dashboard.
   - Keep backups/exports for meaningful beta data.
9. Google OAuth app not configured or not published:
   - Login should fail visibly and operational docs should point to redirect URI and consent-screen setup.
10. NextAuth adapter rejects unknown user fields:
   - Add the required schema field or adjust adapter behavior before rollout.

## Validation Checklist

Before moving to `DONE`:

1. `lib/auth.ts` includes Google provider and no unconditional allow for non-email providers.
2. Signup gating applies to Google sign-ins.
3. Login UI uses Google as the primary CTA.
4. Magic link is removed from primary UI.
5. Waitlist access remains visible.
6. Datenschutz text reflects active auth providers.
7. Supabase MVP operations doc exists.
8. Supabase Postgres migration doc exists.
9. Tests pass with `npm test`.
10. Typecheck passes with `npm run typecheck`.
11. Manual Google OAuth checklist is completed or documented as pending due to missing credentials.
12. Existing-user account-linking behavior is verified or explicitly marked as a blocker.
13. `.env.example` includes Google and optional auth fallback variables.
14. Google Cloud Console redirect and consent-screen requirements are documented.
15. Prisma adapter compatibility for OAuth user creation is verified.

## Rollout Plan

1. Implement behind env configuration.
2. Test locally with Google OAuth credentials.
3. Deploy to staging or preview with Google OAuth redirect URI configured.
4. Verify approved and rejected sign-in paths.
5. Enable Google login in production.
6. Keep magic-link fallback available for operator recovery during initial rollout.
7. After successful beta usage, decide whether to fully remove email provider.

## Rollback Plan

1. Disable Google provider by removing `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the environment.
2. Re-enable email login if `AUTH_EMAIL_LOGIN_ENABLED=false` had been set.
3. Restore previous landing-page login UI only if needed.
4. No data migration rollback should be required for Phase 1 because no schema changes are planned.
5. For later Supabase Postgres migration, rollback must be documented separately before any production database switch.

## Resolved Implementation Decisions

1. Google account linking by matching email is enabled only for the Google provider through NextAuth provider configuration.
2. Apple Login is deferred.
3. Magic link remains available as a technical fallback but is hidden from the primary UI unless `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED=true`.
4. Supabase Free backup/export cadence is documented as at least weekly during active beta, plus before migrations and larger releases.
5. Keepalive execution location remains operationally selectable between deployment cron, external monitor, or GitHub Actions.
