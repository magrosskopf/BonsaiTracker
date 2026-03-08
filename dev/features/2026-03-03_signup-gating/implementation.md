# Implementation Plan: Signup Gating and Abuse Prevention

## Status

COMPLETE

## Overview

Implement a closed-beta signup gate on top of existing NextAuth email login. Existing users keep magic-link login. First-time signups require DB-based approval, respect a global user cap of 100 (configurable), and are protected with signup-focused rate limiting using request/IP context. Add a waitlist/request-access endpoint and operator promotion flow.

## Reference

Spec: `/work/dev/features/2026-03-03_signup-gating/spec.md`

Key accepted decisions:
1. Invite/allowlist plus waitlist flow.
2. Approval source is database-backed.
3. User cap counts all rows in `User`.

## File Structure

Modify:
1. `/work/prisma/schema.prisma`
2. `/work/lib/auth.ts`
3. `/work/pages/index.tsx`
4. `/work/.env.example`

Add:
1. `/work/lib/signup-gating.ts`
2. `/work/lib/rate-limit.ts`
3. `/work/pages/api/access-requests.ts`
4. `/work/pages/api/auth/precheck.ts`
5. `/work/pages/api/admin/waitlist/approve.ts` (or script-based alternative)
6. `/work/scripts/approve-waitlist.ts` (if no admin endpoint is used)
7. `/work/tests/signup-gating.test.ts`
8. `/work/prisma/migrations/<timestamp>_signup_gating/*`

Optional (if needed for clean API responses):
1. `/work/lib/api/response.ts` (only if additional response helpers are required)

## Data Model

Add four new Prisma models:

1. `SignupAllowlist`
   - `id Int @id @default(autoincrement())`
   - `email String @unique`
   - `note String?`
   - `createdAt DateTime @default(now())`
   - `updatedAt DateTime @updatedAt`

2. `WaitlistRequest`
   - `id Int @id @default(autoincrement())`
   - `email String @unique`
   - `sourceIp String?`
   - `userAgent String?`
   - `status WaitlistStatus @default(PENDING)`
   - `createdAt DateTime @default(now())`
   - `updatedAt DateTime @updatedAt`

3. `AuthRateLimitEvent`
   - `id Int @id @default(autoincrement())`
   - `key String`
   - `scope String`
   - `createdAt DateTime @default(now())`
   - index on `[scope, key, createdAt]`

4. `SignupSlot`
   - `id Int @id @default(autoincrement())`
   - `slotNumber Int @unique` (seed values `1..MAX_TOTAL_USERS`)
   - `email String?`
   - `reservedAt DateTime?`
   - `releasedAt DateTime?`
   - `createdAt DateTime @default(now())`
   - `updatedAt DateTime @updatedAt`
   - index on `[email]`

Add enum:
1. `WaitlistStatus` with `PENDING`, `APPROVED`, `REJECTED`.

Rationale:
1. Keep gating decisions and waitlist in DB as requested.
2. Keep rate limiting DB-backed to avoid new infrastructure dependency for first release.
3. Use transactional slot reservation to enforce the hard user cap under concurrency.
4. Keep authoritative signup blocking in NextAuth callback so direct calls to `/api/auth/signin/email` cannot bypass checks.

## Runtime Configuration

Add env vars in `.env.example`:

1. `SIGNUP_ENABLED=true`
2. `MAX_TOTAL_USERS=100`
3. `SIGNUP_RATE_LIMIT_WINDOW_SECONDS=900`
4. `SIGNUP_RATE_LIMIT_MAX_PER_IP=10`
5. `SIGNUP_RATE_LIMIT_MAX_PER_EMAIL=5`
6. `WAITLIST_ENABLED=true`
7. `SIGNUP_SLOT_RESERVATION_TTL_SECONDS=900`
8. `RATE_LIMIT_RETENTION_HOURS=24`

## Architecture and Flow

### 1) Signup gate service (`lib/signup-gating.ts`)

Create pure service functions:
1. `normalizeEmail(email: string): string`
2. `isExistingUser(email: string): Promise<boolean>`
3. `isApprovedForSignup(email: string): Promise<boolean>`
4. `isUserCapacityReached(): Promise<boolean>`
5. `evaluateSignupEligibility(email: string): Promise<{ allowed: boolean; reason?: "NOT_APPROVED" | "CAPACITY_REACHED" | "SIGNUP_DISABLED" }>`
6. `reserveSignupSlot(email: string): Promise<{ reserved: boolean; reason?: "CAPACITY_REACHED" }>`
7. `releaseSignupSlot(email: string): Promise<void>`
8. `isSlotReservedForEmail(email: string): Promise<boolean>`

Logic:
1. Existing user always allowed to request login link.
2. New user must pass: `SIGNUP_ENABLED`, allowlist approval, and user-cap check.

### 2) Signup rate limiting (`lib/rate-limit.ts`)

Implement DB-backed sliding-window limiter:
1. Keyed by `scope + key`.
2. Cleanup old rows opportunistically for the current key/window.
3. For signup request path, check:
   - IP limit
   - email limit (normalized email)
4. Return typed result with `allowed` and retry metadata.
5. Add retention cleanup strategy:
   - lightweight opportunistic cleanup on write for old rows
   - explicit periodic cleanup command/script for robust retention

Scopes:
1. `signup_ip`
2. `signup_email`
3. `waitlist_ip`
4. `waitlist_email`

### 3) Pre-auth endpoint for signup/login handoff (`pages/api/auth/precheck.ts`)

Implement POST endpoint that runs before client call to `signIn("email")`:
1. Validate and normalize email.
2. Check whether email is existing user.
3. If existing user:
   - apply login-friendly limiter (higher thresholds, optional).
   - return `allowed=true`.
4. If first-time email:
   - enforce signup IP/email rate limit.
   - evaluate approval + capacity.
   - reserve slot transactionally.
   - return `allowed=true` only on success.
5. Return response designed to avoid account enumeration.

Important behavior:
1. Existing users continue to receive magic links even when cap is reached.
2. New users are blocked if not approved or cap reached.
3. Request-IP context is available and used for limits before sign-in trigger.

### 4) NextAuth integration finalization (`lib/auth.ts`)

Use NextAuth callbacks/events for consistency and cleanup:
1. In sign-in callback with `verificationRequest`, run authoritative checks for new users:
   - approval must be present.
   - capacity must be available or already reserved for that email.
2. If first-time email has no reservation, attempt transactional reservation in callback (fallback when precheck was skipped).
3. Existing users bypass slot checks.
4. Add cleanup path for stale reservations (older than TTL) to release abandoned slots.

### 5) Waitlist endpoint (`pages/api/access-requests.ts`)

Implement POST endpoint:
1. Validate email input.
2. Apply waitlist rate limit.
3. Upsert `WaitlistRequest` by normalized email.
4. Return generic success response to avoid user enumeration.

### 6) Waitlist approval operator flow

Provide at least one controlled path:
1. Script: `scripts/approve-waitlist.ts --email <email>`
2. Optional protected admin API route if script-only is not desired.
3. Promotion action writes to `SignupAllowlist` and updates `WaitlistRequest.status=APPROVED`.
4. Document runbook in feature docs.

### 7) Landing page UX (`pages/index.tsx`)

Update page to show two clear actions when unauthenticated:
1. Login with magic link (existing users).
2. Request access (waitlist form).

Behavior:
1. Keep existing login form.
2. Add waitlist form and success/error feedback.
3. Provide short copy: "Bestehender Account? Login-Link", "Neu hier? Zugang anfragen".

## Implementation Steps

1. Add Prisma models/enums and migration, including `SignupSlot` reservation support.
2. Add env defaults and config parsing with safe fallbacks.
3. Build `lib/signup-gating.ts` with eligibility + transactional slot reservation.
4. Build `lib/rate-limit.ts` and add retention cleanup script path.
5. Implement `/api/auth/precheck` endpoint with IP-aware limits and slot reservation.
6. Integrate `lib/auth.ts` callback guards for authoritative approval/cap enforcement and fallback reservation.
7. Implement `/api/access-requests` with validation and non-enumerating responses.
8. Implement waitlist approval script (and optional admin endpoint).
9. Update `/pages/index.tsx` to use backend pre-auth endpoint and waitlist form.
10. Add tests for gating, rate limits, and concurrency.
11. Run typecheck and tests.

## Test Strategy

Create `tests/signup-gating.test.ts` covering:

1. Existing user login is allowed regardless of cap.
2. New user denied when signup disabled.
3. New user denied when email not allowlisted.
4. New user denied when `User` count >= `MAX_TOTAL_USERS`.
5. New user allowed when allowlisted and below cap.
6. Rate limiter blocks after threshold for signup IP and email.
7. Waitlist endpoint upserts and returns generic success.
8. Concurrent first-time signups near the boundary do not exceed cap.
9. First-time signup cannot bypass cap when precheck is skipped and direct NextAuth endpoint is called.
10. Waitlist approval flow correctly promotes to allowlist.

Validation commands:
1. `npm run typecheck`
2. `npm test`

## Edge Cases and Error Handling

1. Email casing and whitespace differences must normalize to one canonical value.
2. Waitlist endpoint must not leak whether an email is already allowlisted or already requested.
3. If rate-limit persistence fails unexpectedly, fail closed for signup requests and return a generic temporary error.
4. If allowlist lookup fails, fail closed for new user creation.
5. Log failures with reason tags but never expose internal details to client.
6. Reservation leaks (crash between reserve and consume) require periodic reconciliation/cleanup.
7. Generic responses must be identical for unknown email vs blocked email to prevent enumeration.
8. Precheck endpoint is advisory for UX/IP limiting; callback checks remain authoritative for security.

## Validation Checklist

1. Prisma migration created and applied locally.
2. Signup gating enforced for first-time email sign-ins.
3. Existing users unaffected.
4. Hard user cap enforced against total `User` count.
5. Waitlist endpoint functional and non-enumerating.
6. Rate limiting active on signup and waitlist paths.
7. Hard cap is preserved under concurrent attempts in tests.
8. Waitlist promotion flow is executable and documented.
9. Direct calls to NextAuth sign-in endpoint cannot bypass allowlist/cap.
10. Tests pass and typecheck is green.
