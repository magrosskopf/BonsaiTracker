# GitHub Issue Drafts: API Surface fuer Flutter Native App

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`

Publishing target: `magrosskopf/BonsaiTracker`

Status: Published via GitHub API using the local Sandcastle `GH_TOKEN`.

## Published Issues

- #23: https://github.com/magrosskopf/BonsaiTracker/issues/23
- #24: https://github.com/magrosskopf/BonsaiTracker/issues/24
- #25: https://github.com/magrosskopf/BonsaiTracker/issues/25
- #26: https://github.com/magrosskopf/BonsaiTracker/issues/26
- #27: https://github.com/magrosskopf/BonsaiTracker/issues/27
- #28: https://github.com/magrosskopf/BonsaiTracker/issues/28
- #29: https://github.com/magrosskopf/BonsaiTracker/issues/29
- #30: https://github.com/magrosskopf/BonsaiTracker/issues/30
- #31: https://github.com/magrosskopf/BonsaiTracker/issues/31
- #32: https://github.com/magrosskopf/BonsaiTracker/issues/32

## Proposed Vertical Slices

1. Add first Public Client API tracer for authenticated Bonsai listing
   - Blocked by: None
   - User stories covered: Flutter can list own Bonsais; private API validates
     Bearer Auth; Public Client API versioning is introduced.
2. Expose v1 Bonsai CRUD and care-entry flows
   - Blocked by: #23
   - User stories covered: Flutter can create, view, edit, archive/restore
     Bonsais and manage care entries.
3. Support authenticated v1 media upload, access and deletion
   - Blocked by: #23
   - User stories covered: Flutter can upload, attach, retrieve and remove
     protected images.
4. Add v1 Reminder cancellation and filtering
   - Blocked by: #23
   - User stories covered: Flutter can list, create, update, complete, snooze
     and cancel Reminders without hard deletes.
5. Add paginated v1 Community Feed and post interactions
   - Blocked by: #23
   - User stories covered: Flutter can page through Feed posts, create/edit/
     delete own posts and toggle likes.
6. Let users manage Community comments through v1
   - Blocked by: #27
   - User stories covered: Flutter can load, create, edit and delete comments.
7. Add v1 Community reporting
   - Blocked by: #27 and #28
   - User stories covered: Flutter users can report visible posts and comments;
     Admin moderation remains separate.
8. Expose v1 Profile and beta-access helper APIs
   - Blocked by: #23
   - User stories covered: Flutter can read/update own profile, read public
     profiles, precheck signup and submit waitlist requests.
9. Apply mobile abuse controls and release documentation
   - Blocked by: #24, #25, #26, #27, #28, #29 and #30
   - User stories covered: Production enforces App Integrity and rate limits;
     runtime configuration and validation are documented.
10. Initialize Flutter repo workflow and write the derived Flutter API plan
    - Blocked by: #31
    - User stories covered: Cross-repository planning ends with a separate
      Flutter implementation plan and Git/workflow prerequisites.

---

## Issue 1: Add first Public Client API tracer for authenticated Bonsai listing

## What to build

Create the first narrow `/api/v1` Public Client API path by exposing
authenticated Bonsai listing end-to-end. This slice establishes the shared
request boundary for Flutter: Supabase Bearer token validation, app-integrity
header handling, reusable ID/cursor helpers, JSON envelope responses, and a
paginated Bonsai list that reuses the existing repository and DTO mapping.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] `GET /api/v1/bonsais` returns the caller's Bonsai summaries in the
  existing `{ ok, data: { items, nextCursor } }` envelope.
- [ ] Missing or malformed Bearer auth returns `401` and the actor is derived
  only from the validated Supabase token.
- [ ] App-integrity headers `X-Bonsai-App-Integrity` and `X-Bonsai-Platform`
  are parsed separately from auth, with explicit non-production bypass
  configuration and fail-closed production behavior.
- [ ] Cursor/limit validation is shared and rejects malformed cursors or limits
  outside the allowed range.
- [ ] Existing `/api/bonsais` behavior remains compatible.
- [ ] Tests cover v1 route existence, auth requirement, app-integrity mode
  behavior, envelope shape, and no client-supplied user-id trust.

## Blocked by

None - can start immediately

---

## Issue 2: Expose v1 Bonsai CRUD and care-entry flows

## What to build

Expose the remaining Bonsai and care-entry workflows through `/api/v1` so
Flutter can create, inspect, update, archive/restore and maintain Bonsais
without direct Supabase table access. The slice should reuse existing validators,
repositories and DTO mappers, while preserving all legacy Web API behavior.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] `/api/v1/bonsais` supports `POST` with the existing Bonsai create
  validation and response envelope.
- [ ] `/api/v1/bonsais/:id` supports `GET`, `PATCH` and `DELETE` for own
  Bonsais, including archive/restore semantics already present in the backend.
- [ ] `/api/v1/subentries` supports `GET` and `POST` for entries on own active
  Bonsais.
- [ ] `/api/v1/subentries/:id` supports `PATCH` and `DELETE` for own entries.
- [ ] Foreign, missing or invisible resources return `404` rather than
  confirming ownership or visibility.
- [ ] Tests cover successful own-resource flows, validation failures,
  unauthorized requests and foreign-resource `404` responses.

## Blocked by

- #23

---

## Issue 3: Support authenticated v1 media upload, access and deletion

## What to build

Provide the complete protected media path for Flutter under `/api/v1`: image
upload, optional Bonsai attachment, authenticated media retrieval and authorized
media deletion. Media URLs must remain backend-protected rather than permanent
public bucket URLs.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] `POST /api/v1/upload` accepts `multipart/form-data` with a single image
  file and returns a protected media URL/path in the standard envelope.
- [ ] Uploads enforce the documented maximum size and MIME allowlist:
  `image/jpeg`, `image/png`, `image/webp`.
- [ ] Uploading with a `bonsaiId` attaches the image only when the Bonsai
  belongs to the actor.
- [ ] `GET /api/v1/media/...` serves or redirects protected media only after
  `canAccessMedia` authorizes the actor.
- [ ] `DELETE /api/v1/media/...` deletes media only after `canDeleteMedia`
  authorizes the actor.
- [ ] Tests cover missing file, oversized file, unsupported media type, foreign
  Bonsai attachment, foreign media access and successful deletion.

## Blocked by

- #23

---

## Issue 4: Add v1 Reminder cancellation and filtering

## What to build

Add the Flutter Reminder lifecycle under `/api/v1`, including the new soft-delete
business state `CANCELLED`. Flutter must be able to list, create, update,
complete, snooze and cancel reminders without hard deletion.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] The external Supabase project migration allows Reminder status
  `CANCELLED`.
- [ ] Generated Supabase/domain types and Reminder validators accept
  `CANCELLED`.
- [ ] `/api/v1/reminders` supports `GET` and `POST` with filters for `status`,
  `bonsaiId` and `includeDone`.
- [ ] `/api/v1/reminders/:id` supports `PATCH status=CANCELLED` and clears
  snooze/completion timestamps consistently.
- [ ] Default Reminder listing excludes `DONE` and `CANCELLED` unless filters
  explicitly request them.
- [ ] Tests cover the migration/type expectation, cancellation behavior,
  default filtering and foreign-resource `404`.

## Blocked by

- #23

---

## Issue 5: Add paginated v1 Community Feed and post interactions

## What to build

Expose a mobile-safe Community Feed under `/api/v1/posts` with cursor
pagination and full post ownership actions. Flutter should be able to page
through visible posts, create posts, edit/delete own posts and toggle likes
without unbounded responses.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] `GET /api/v1/posts` returns `{ items, nextCursor }` using cursor
  pagination.
- [ ] Feed default `limit` is `20`, maximum `limit` is `50`, and invalid limits
  or cursors return `400`.
- [ ] Feed ordering is stable: `createdAt desc`, then `id desc`.
- [ ] `/api/v1/posts` supports `POST`; `/api/v1/posts/:id` supports `GET`,
  `PATCH` and `DELETE` for visible/owned resources as appropriate.
- [ ] `/api/v1/posts/:id/likes` supports authenticated like/unlike toggling and
  is ready for mobile rate limiting.
- [ ] Existing Web Feed routes remain compatible.
- [ ] Tests cover pagination boundaries, nextCursor generation, ownership,
  validation failures and like toggling.

## Blocked by

- #23

---

## Issue 6: Let users manage Community comments through v1

## What to build

Complete the Flutter comment-management path for visible posts. Flutter users
must be able to load comments, create comments and then edit or delete only their
own comments through `/api/v1`.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] `/api/v1/posts/:id/comments` supports `GET` and `POST` for visible posts.
- [ ] `/api/v1/posts/:id/comments/:commentId` supports `PATCH` for own
  comments using validated text.
- [ ] `/api/v1/posts/:id/comments/:commentId` supports `DELETE` for own
  comments.
- [ ] Foreign comments, comments on invisible posts and mismatched post/comment
  pairs return `404`.
- [ ] Comment creation is ready for mobile rate limiting.
- [ ] Tests cover list/create/update/delete, validation errors, ownership
  failures and invisible-post behavior.

## Blocked by

- #27

---

## Issue 7: Add v1 Community reporting

## What to build

Allow authenticated Flutter users to report visible posts and comments while
keeping moderation decisions out of the Flutter app. Reports are minimal,
idempotent for the same reporter/target, rate-limited and hidden from normal
client roles.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] The external Supabase project migration creates the report storage needed
  for post and comment reports.
- [ ] Report reasons are constrained to `SPAM`, `HARASSMENT`,
  `HATE_OR_EXTREMISM`, `SEXUAL_CONTENT`, `VIOLENCE_OR_SELF_HARM`,
  `ILLEGAL_CONTENT`, `PERSONAL_DATA` and `OTHER`.
- [ ] `OTHER` requires a non-empty bounded note; other reasons allow an
  optional bounded note.
- [ ] Duplicate open reports by the same user for the same target are handled
  idempotently.
- [ ] `POST /api/v1/posts/:id/reports` reports visible posts.
- [ ] `POST /api/v1/posts/:id/comments/:commentId/reports` reports visible
  comments.
- [ ] Normal users cannot read moderation/report data directly.
- [ ] Tests cover validators, idempotency, rate limiting, visibility checks and
  generic error responses.

## Blocked by

- #27
- #28

---

## Issue 8: Expose v1 Profile and beta-access helper APIs

## What to build

Expose the account-adjacent APIs Flutter needs without introducing backend
password login. Flutter continues to use Supabase Auth directly, while this
backend provides profile DTOs, signup precheck and waitlist submission through
the Public Client API.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] `GET /api/v1/profile/me` returns the actor's profile including private
  email from the auth boundary.
- [ ] `PATCH /api/v1/profile/me` updates only allowed own profile fields.
- [ ] `GET /api/v1/profiles/:id` returns public profile data for visible beta
  users and omits private email.
- [ ] `POST /api/v1/auth/precheck` exposes the existing signup precheck
  behavior without backend password login.
- [ ] `POST /api/v1/access-requests` exposes the existing waitlist behavior and
  remains unauthenticated but rate-limited.
- [ ] Native profile-image upload remains absent.
- [ ] Tests cover private/public profile field separation, profile validation,
  precheck/waitlist envelopes and rate-limit behavior.

## Blocked by

- #23

---

## Issue 9: Apply mobile abuse controls and release documentation

## What to build

Finish the Public Client API release hardening by applying app-integrity
enforcement and mobile rate limits consistently across private and write-heavy
v1 routes, then document the runtime configuration and validation commands.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] Production requires app-integrity validation for private and write-heavy
  Public Client API calls.
- [ ] Non-production app-integrity bypass requires explicit environment
  configuration and never bypasses Bearer Auth.
- [ ] Mobile rate-limit scopes cover upload, post creation, comment creation,
  reports, like toggles and suspicious media reads.
- [ ] Rate-limit checks consider IP, actor ID and available integrity/device
  subject.
- [ ] `.env.example` documents all public-client, app-integrity and mobile
  rate-limit variables without secrets.
- [ ] Project docs describe Flutter runtime configuration, Supabase redirect/
  deep-link requirements and local validation.
- [ ] `npm test`, `npm run typecheck`, `npm run build`,
  `npm run supabase:types:check` and relevant DB/integration tests pass or
  environment blockers are documented.

## Blocked by

- #24
- #25
- #26
- #27
- #28
- #29
- #30

---

## Issue 10: Initialize Flutter repo workflow and write the derived Flutter API plan

## What to build

Prepare the existing Flutter app repository for its own implementation phase and
write the repo-specific Flutter migration plan derived from the backend Public
Client API. This slice does not implement Flutter app code; it creates the
required planning and workflow foundation before Flutter code changes happen.

Source plan: `dev/features/2026-08-02_flutter-api-surface/implementation.md`.

## Acceptance criteria

- [ ] `/Users/maius/Projekte/Bonsai-Tracker-Flutter-App` is initialized as its
  own Git repository before any Flutter code changes.
- [ ] The Flutter repository has an equivalent workflow/planning structure:
  `AGENTS.md`, `workflows/` and `dev/features/`.
- [ ] A Flutter implementation plan exists in the Flutter repository and is
  separate from the backend plan.
- [ ] The Flutter plan migrates the existing `RemoteApiClient` from legacy
  `/api/...` calls to `/api/v1/...`.
- [ ] The Flutter plan keeps Supabase Auth direct in Flutter for login, signup,
  OAuth, Magic Link, password reset, session refresh and logout.
- [ ] The Flutter plan explicitly excludes Supabase secret keys, service role
  keys, direct table access, private bucket access and backend password login.

## Blocked by

- #31
