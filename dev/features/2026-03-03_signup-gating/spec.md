# Spec: Signup Gating and Abuse Prevention

## Status

IMPLEMENTED

## Purpose/Goal

Reduce low-effort bot signups and protect the product during a limited beta by separating "existing user login" from "new user registration" and enforcing a hard upper bound on total activated users.

## Current Situation

1. The landing page at `/work/pages/index.tsx` allows anyone to request a magic link with only an email address.
2. `NextAuth` email login in `/work/lib/auth.ts` creates new users automatically through the Prisma adapter when the email verification flow succeeds.
3. There is currently no invite requirement, no registration allowlist, no signup-specific rate limit, no CAPTCHA/challenge, and no global user cap.
4. A bot or agent with access to disposable inboxes can therefore create many valid accounts with low effort.

## Recommended Product Decision

Introduce a closed-beta signup flow with three layers:

1. Existing users keep the current magic-link login for low friction.
2. New registrations require prior approval via invite or allowlist.
3. The system enforces a configurable maximum number of activated users, initially `100`.

This is preferred over a pure "100-user cap only" approach because the cap limits growth but does not meaningfully stop bots from consuming those 100 slots.

## Functional Requirements

1. The product must distinguish between:
   - existing users who are allowed to log in via magic link
   - new email addresses that are attempting first-time registration
2. New registration attempts must be rejected unless the email address is explicitly approved.
3. Approved registration must support at least one of these mechanisms:
   - invite list stored in the database
   - allowlist configured through admin-managed records
4. The application must enforce a configurable global maximum of activated users.
5. Once the maximum is reached, further first-time registrations must be blocked with a clear, non-technical message.
6. Existing users must still be able to log in even after the maximum is reached.
7. Signup-related endpoints must be protected by rate limiting to reduce scripted abuse.
8. The UI on `/` must clearly communicate whether the user is:
   - logging into an existing account
   - requesting access / joining a waitlist
   - blocked because registrations are closed
9. The system must log rejected registration attempts and the reason category at an operational level suitable for debugging and abuse monitoring.
10. The registration gate must run before verification emails are sent and must include request-level context (especially IP) for abuse controls.
11. The configured maximum number of users must be enforced robustly under concurrent signup attempts.
12. There must be an operationally clear process to promote waitlist requests into approved signup emails.

## Technical Constraints

1. The project uses Next.js Pages Router, TypeScript, Prisma, Tailwind, and NextAuth email provider.
2. Existing login behavior for already registered users should remain as simple as possible.
3. The solution must not depend on a full custom auth stack replacement.
4. The feature should be configurable through environment variables where operational tuning is likely:
   - signup enabled/disabled
   - max activated users
   - rate-limit thresholds
5. `workflows/` must not be changed.

## Proposed Solution Shape

### Access model

1. `User` remains the account entity for active users.
2. A new approval source is introduced for first-time signups, for example `SignupInvite` or `SignupAllowlist`.
3. A new registration is permitted only if:
   - the email does not already belong to an existing user, and
   - the email is approved, and
   - the activated user count is still below the configured limit

### Auth flow

1. Existing email login keeps using NextAuth magic links.
2. Before a verification email is sent for a first-time user, a dedicated pre-auth signup check endpoint evaluates eligibility with request context (IP, user agent, normalized email).
3. If approval or capacity fails, no account is created and no verification email is sent.
4. Existing users bypass invite checks and capacity checks during login.
5. The product UX should use the pre-auth check before calling the sign-in endpoint; server-side auth callbacks remain authoritative fallback to block bypass attempts.

### Abuse protection

1. Add signup-focused rate limiting by IP and, where practical, by normalized email.
2. Prefer a lightweight bot challenge only on first-time registration attempts, not on normal login for existing users.
3. Cloudflare Turnstile is preferred over a generic CAPTCHA if a challenge is added because it is lighter weight and less disruptive.

### Rollout

1. Start with closed beta:
   - max activated users = `100`
   - invite/allowlist required for first-time registration
   - rate limiting enabled
   - bot challenge enabled only on signup path if abuse remains noticeable
2. Keep a later path open for waitlist-based expansion without redesigning auth again.
3. Include an internal operator flow for moving waitlist emails to allowlist entries.

## Acceptance Criteria

1. A non-approved email address cannot create a new account through the magic-link flow.
2. An approved email address can create a new account as long as capacity is available.
3. When activated users reach the configured limit, new account creation is blocked.
4. Existing users can still log in after the limit is reached.
5. Repeated signup attempts from the same source are rate-limited with an appropriate response.
6. The landing page communicates the closed-beta/signup state clearly.
7. The implementation is covered by tests for:
   - existing user login
   - approved first-time signup
   - rejected first-time signup because of missing approval
   - rejected first-time signup because of user limit
   - rate-limit behavior
   - concurrent signup attempts around the capacity boundary
8. A first-time signup request does not send a verification email unless eligibility checks succeed (pre-auth path and authoritative callback fallback).
9. Waitlist-to-allowlist promotion is operationally documented and executable.

## Out-of-Scope

1. Full social login or password-based authentication.
2. Building a full back-office admin UI unless required for invite management.
3. Advanced fraud scoring or third-party identity verification.
4. Reworking unrelated product onboarding after login.

## Review Decisions

1. Access model includes invite/allowlist and a passive waitlist/request-access path.
2. Approval source is database-backed (no env-only allowlist for first version).
3. The `100` user cap counts all users in `User`, not only `emailVerified` users.
