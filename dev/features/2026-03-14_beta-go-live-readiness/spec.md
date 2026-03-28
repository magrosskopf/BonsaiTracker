# Spec: Beta Go-Live Readiness

## Status

REVIEW

## Purpose/Goal

Prepare Bonsai Tracker for a closed beta launch by hardening storage, privacy, testing, observability, and operational processes around the existing authenticated bonsai workflows.

## Current Situation

1. Uploads are currently written into `public/uploads` through [`lib/uploads.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/uploads.ts) and served from the repository working tree.
2. The codebase already contains community features in [`pages/feed.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/feed.tsx), [`pages/profile.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/profile.tsx), [`pages/profile/[id].tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/profile/[id].tsx), and the related post/profile APIs, and these are now confirmed as part of the first beta.
3. Closed-beta signup gating and manual waitlist approval already exist, including [`lib/signup-gating.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/signup-gating.ts) and [`scripts/approve-waitlist.js`](/Users/maius/Projekte/Bonsai-Tracker/scripts/approve-waitlist.js), but the operator process is not yet packaged as beta runbook documentation.
4. Test coverage currently focuses on utility and validator behavior in [`tests/`](/Users/maius/Projekte/Bonsai-Tracker/tests), but there are no browser-level smoke or integration checks for the end-to-end beta flows.
5. There is no dedicated healthcheck endpoint, no explicit error-tracking integration, and no documented backup/restore or incident/support process for production beta operations.
6. Public community APIs currently reuse broad DTOs and mappings, including exposure of `email` in public profile responses via [`lib/mappers.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/mappers.ts) and [`types/dto.ts`](/Users/maius/Projekte/Bonsai-Tracker/types/dto.ts).

## Product Decision

Community features are part of the first closed beta.

Implications:
1. Feed, post creation, likes, comments, and public profiles remain accessible in the authenticated product.
2. Visibility, privacy, user-facing copy, and support handling for community behavior become mandatory beta launch work.
3. Community APIs and pages must be included in automated verification and operational monitoring.
4. Production upload storage will use Supabase Storage; local filesystem storage remains only for local development.
5. PostgreSQL remains the system of record for relational product data; only uploaded media moves to Supabase Storage.

## Functional Requirements

1. Upload handling must no longer depend on repository-tracked files in `public/uploads`.
2. The application must introduce a storage abstraction so production uploads can be persisted in Supabase Storage, outside the app container or git working tree.
3. The repository must ignore generated upload files locally while preserving deterministic URL handling for stored media references.
4. A documented backup and restore process must exist for both PostgreSQL data and uploaded files, including recovery order, retention, and operator ownership.
5. The beta scope must explicitly include community features with documented visibility, privacy, and user communication rules.
6. Core beta workflows must be covered by automated smoke or integration tests:
   - waitlist request and manual approval handoff
   - bonsai create
   - bonsai edit
   - bonsai delete and restore behavior if retained
   - sub-entry create
   - sub-entry edit
   - sub-entry delete
   - reminder create/update lifecycle
7. Existing-user login via magic link must be covered by the final manual beta smoke checklist, but does not need browser-level automation for the first beta.
8. Ownership and API error scenarios must be covered by automated tests for unauthorized access, cross-user access, validation errors, and missing resources.
9. The application must expose a lightweight health endpoint suitable for availability checks.
10. External error-tracking vendor integration is not required for the first beta; structured server logging plus healthcheck coverage is sufficient.
11. The closed-beta approval process must be documented as a runbook using the current waitlist/allowlist flow.
12. A support and incident process must be documented for beta operations, including intake channel, severity triage, response ownership, and communication expectations.
13. `SPEC.md` and project-facing documentation must be updated to reflect the final beta scope, storage model, operational requirements, and test strategy.
14. A final manual beta smoke pass must be defined as a release checklist item after automated verification is green.

## Technical Constraints

1. The project uses Next.js Pages Router, TypeScript, Prisma, Tailwind, and NextAuth.
2. Existing authenticated bonsai flows and signup gating must remain the primary product path.
3. `workflows/` must not be changed.
4. Upload persistence must support local development without requiring production infrastructure.
5. Production storage uses Supabase Storage and must not require storing binaries in git.
6. Feature gating for beta scope should be controlled through environment configuration rather than code deletion where flags are still useful.
7. Automated smoke coverage may introduce a browser-level test stack, but existing `npm test` utility coverage should remain usable for fast local checks.
8. Health and monitoring additions must not expose secrets or user data.
9. Documentation produced by this feature must be sufficient for a human operator to execute approval, backup, restore, support, and incident workflows without reading source code first.
10. Because community visibility is limited to authenticated beta users, production upload buckets for community media must not be world-readable by default.

## Proposed Solution Shape

### Scope hardening

1. Keep community surfaces enabled for the beta.
2. Document exactly which profile and post data is visible to other authenticated beta users.
3. Add user-facing privacy and expectation-setting copy for community participation.
4. Enforce consistent server-side access rules for community reads and writes.

### Community visibility model

1. Feed and public profiles are visible only to authenticated beta users, never to anonymous visitors.
2. Public profile data is limited to:
   - `id`
   - `name`
   - `bio`
   - `profileImageUrl`
   - published posts
3. Public profiles must not expose:
   - `email`
   - waitlist or account-status data
   - private bonsai fields outside published post snapshots
   - reminder or sub-entry internals
4. Feed/post data visible to other beta users is limited to:
   - author display data needed for rendering
   - post text
   - post type
   - snapshot name and species
   - explicitly attached post images
   - existing `bonsaiId` and `entryReferenceIds` fields, because the current UI may continue to rely on them in beta
   - created/updated timestamps
   - aggregate counts for likes and comments
   - viewer-specific `viewerHasLiked`
5. Feed/post responses must not expose:
   - author email
   - unpublished bonsai details or private care notes
6. Comments visible in community surfaces may include only:
   - commenter `userId`
   - commenter display name
   - commenter profile image
   - comment text
   - timestamps
7. Post creation remains restricted to the owner of the referenced bonsai and may only use images and sub-entry references from that same owned bonsai.
8. Likes and comments are allowed only for authenticated beta users.
9. Support documentation and UI copy must state that posts and public profile content are visible to other authenticated beta testers.
10. Beta user communication must explicitly state:
   - profiles and posts are visible to all authenticated beta users
   - users should not post private personal data or third-party content without permission
   - support reports for privacy or content issues are handled manually by the beta team
   - the team may hide or remove reported content during the beta if needed

### Storage hardening

1. Replace direct `multer.diskStorage` coupling with an upload storage adapter.
2. Keep a local filesystem adapter for development.
3. Add a Supabase Storage production adapter so uploads persist independently of the repository and deployment artifact.
4. Use private Supabase buckets with authenticated access or signed URLs for beta media.
5. Ensure upload APIs continue returning stable URL references or signed asset paths.

### Operational hardening

1. Add a healthcheck route for uptime probes.
2. Add a shared observability wrapper for structured operational logging.
3. Add beta runbooks under `docs/` for:
   - backup and restore
   - closed-beta approvals
   - support and incident handling

### Verification hardening

1. Keep fast unit-style tests in `tests/*.test.ts`.
2. Add browser-level smoke coverage for the core beta user journeys.
3. Add focused API/integration tests for ownership and failure cases on the protected endpoints.

## Acceptance Criteria

1. `public/uploads` is ignored by git and no longer required as the authoritative production storage location.
2. Upload APIs and bonsai/sub-entry forms work with a storage adapter that supports local development and production persistence.
3. A written backup/restore runbook exists and covers both database data and uploaded files.
4. Community visibility rules are documented and reflected in UI copy and API behavior.
5. Public profile APIs no longer expose `email` or other private account fields to other users.
6. Feed and post APIs expose only the approved public community fields and no private bonsai internals.
7. Supabase Storage is integrated as the production upload backend, while local filesystem storage remains available for development.
8. Automated smoke/integration tests exist for the core beta workflows listed above and for feed/profile access, excluding automated magic-link login.
9. Automated tests exist for ownership and API error scenarios on bonsai, sub-entry, reminder, upload, post, comment, like, and profile endpoints.
10. A health endpoint returns a machine-readable success response when the app is ready to serve traffic.
11. Structured operational logging is present for production-oriented server failures; external error-tracking tooling is deferred.
12. Closed-beta approval, support, and incident runbooks exist under project documentation and explicitly cover community-related requests or reports.
13. `SPEC.md` and release-facing documentation reflect the implemented beta scope and operations model.
14. A final manual smoke checklist exists for launch-day validation, including login verification.

## Out-of-Scope

1. Rebuilding the authentication system or replacing NextAuth.
2. Designing a full admin back office for support or waitlist management.
3. Building community moderation tooling for a public social rollout.
4. Full disaster-recovery automation beyond documented and scriptable first-version procedures.
5. Native mobile app support or unrelated product redesigns.

## Review Checklist

1. Community is confirmed as part of the first beta.
2. The feature covers every item from `TODO.md` and groups them into scope, storage, testing, observability, and operations.
3. Acceptance criteria are testable and operationally verifiable.
4. The spec is intentionally limited to beta readiness, not general roadmap work.
