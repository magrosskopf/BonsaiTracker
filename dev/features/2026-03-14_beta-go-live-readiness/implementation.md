# Implementation Plan: Beta Go-Live Readiness

## Status

PLAN-REVIEW

## Overview

Implement the beta go-live hardening work as one coordinated feature. The first closed beta includes login, waitlist approval, bonsai management, sub-entry management, reminders, uploads, feed, and public profiles. The work is divided into storage hardening, community privacy hardening, observability, automated verification, and operator documentation.

## Reference

Spec: [`dev/features/2026-03-14_beta-go-live-readiness/spec.md`](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-14_beta-go-live-readiness/spec.md)

Key accepted planning assumptions:
1. Community features are in scope for the first beta and must be treated as supported product functionality.
2. Production uploads move to Supabase Storage, with local filesystem fallback for development.
3. Browser-level smoke coverage is added for critical user journeys, while existing `tsx --test` coverage remains in place for utility-level tests.
4. Magic-link login remains part of the final manual smoke checklist, but is not automated in browser tests for the first beta.
5. PostgreSQL remains the primary relational database; this feature does not migrate the app database to Supabase.

## File Structure

Modify:
1. [`package.json`](/Users/maius/Projekte/Bonsai-Tracker/package.json)
2. [`.gitignore`](/Users/maius/Projekte/Bonsai-Tracker/.gitignore)
3. [`SPEC.md`](/Users/maius/Projekte/Bonsai-Tracker/SPEC.md)
4. [`lib/uploads.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/uploads.ts)
5. [`lib/validators/upload.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/validators/upload.ts)
6. [`pages/api/upload.ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/upload.ts)
7. [`pages/api/subentries.ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/subentries.ts)
8. [`pages/api/subentries/[id].ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/subentries/[id].ts)
9. [`pages/create-bonsai.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/create-bonsai.tsx)
10. [`pages/bonsai/[id]/subentries.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/bonsai/[id]/subentries.tsx)
11. [`components/Navigation.tsx`](/Users/maius/Projekte/Bonsai-Tracker/components/Navigation.tsx)
12. [`pages/feed.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/feed.tsx)
13. [`pages/profile.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/profile.tsx)
14. [`pages/profile/[id].tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/profile/[id].tsx)
15. [`pages/api/posts.ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/posts.ts)
16. [`pages/api/posts/[id].ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/posts/[id].ts)
17. [`pages/api/posts/[id]/likes.ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/posts/[id]/likes.ts)
18. [`pages/api/posts/[id]/comments.ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/posts/[id]/comments.ts)
19. [`pages/api/profiles/[id].ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/profiles/[id].ts)
20. [`lib/mappers.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/mappers.ts)
21. [`README.md`](/Users/maius/Projekte/Bonsai-Tracker/README.md)
22. [`types/dto.ts`](/Users/maius/Projekte/Bonsai-Tracker/types/dto.ts)

Add:
1. [`lib/config/beta.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/config/beta.ts)
2. [`lib/storage/types.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/storage/types.ts)
3. [`lib/storage/local.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/storage/local.ts)
4. [`lib/storage/supabase.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/storage/supabase.ts)
5. [`lib/storage/index.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/storage/index.ts)
6. [`lib/observability.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/observability.ts)
7. [`pages/api/health.ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/health.ts)
8. [`tests/api-ownership.test.ts`](/Users/maius/Projekte/Bonsai-Tracker/tests/api-ownership.test.ts)
9. [`tests/upload-storage.test.ts`](/Users/maius/Projekte/Bonsai-Tracker/tests/upload-storage.test.ts)
10. [`tests/reminders-api.test.ts`](/Users/maius/Projekte/Bonsai-Tracker/tests/reminders-api.test.ts)
11. [`tests/community-api.test.ts`](/Users/maius/Projekte/Bonsai-Tracker/tests/community-api.test.ts)
12. [`playwright.config.ts`](/Users/maius/Projekte/Bonsai-Tracker/playwright.config.ts)
13. [`tests/e2e/beta-smoke.spec.ts`](/Users/maius/Projekte/Bonsai-Tracker/tests/e2e/beta-smoke.spec.ts)
14. [`tests/e2e/fixtures/`](/Users/maius/Projekte/Bonsai-Tracker/tests/e2e/fixtures)
15. [`docs/beta-approval-runbook.md`](/Users/maius/Projekte/Bonsai-Tracker/docs/beta-approval-runbook.md)
16. [`docs/backup-restore.md`](/Users/maius/Projekte/Bonsai-Tracker/docs/backup-restore.md)
17. [`docs/support-incident-process.md`](/Users/maius/Projekte/Bonsai-Tracker/docs/support-incident-process.md)
18. [`docs/community-privacy.md`](/Users/maius/Projekte/Bonsai-Tracker/docs/community-privacy.md)
19. [`docs/manual-beta-smoke-checklist.md`](/Users/maius/Projekte/Bonsai-Tracker/docs/manual-beta-smoke-checklist.md)
20. [`.env.example`](/Users/maius/Projekte/Bonsai-Tracker/.env.example)

Optional during implementation:
1. [`scripts/storage-backfill.ts`](/Users/maius/Projekte/Bonsai-Tracker/scripts/storage-backfill.ts)
2. [`scripts/backup-verify.ts`](/Users/maius/Projekte/Bonsai-Tracker/scripts/backup-verify.ts)

## Code Architecture

### 1) Beta configuration and launch settings

Add `lib/config/beta.ts` as the single source for beta-specific runtime toggles:
1. `BETA_HEALTHCHECK_ENABLED`
2. upload-storage mode selection
3. community privacy related copy or policy switches if needed

Expose small helpers such as:
1. `isHealthcheckEnabled()`
2. `getUploadStorageMode()`

Use these helpers in pages and APIs so beta runtime behavior is encoded once and enforced consistently.

### 2) Upload storage abstraction

Refactor upload handling so request parsing stays in `multer`, but persistence is delegated to a storage adapter:
1. `UploadStorage.save(...)`
2. `UploadStorage.remove(...)`
3. `UploadStorage.getPublicUrl(...)`

Proposed behavior:
1. Local development uses filesystem storage outside git-tracked artifacts and serves files from a controlled public path.
2. Production uses Supabase Storage with configuration-driven project URL, service key, and bucket name.
3. Beta media uses private buckets plus authenticated access or signed URLs, because content is only meant for logged-in beta users.
4. APIs continue returning persisted asset paths or signed URLs, not temporary local paths.

This keeps `pages/api/upload.ts` and sub-entry upload flows stable while removing the current hard dependency on `public/uploads` as the production source of truth.

### 3) Community privacy and behavior hardening

Required beta behavior:
1. Keep community navigation entries visible and intentional.
2. Audit and document exactly which profile fields and post data are visible to other authenticated users.
3. Add or adjust explanatory copy on profile/feed surfaces so users understand that profiles and posts are visible within the beta community.
4. Verify server-side ownership and read boundaries for posts, comments, likes, and public profiles.
5. Ensure support runbooks cover privacy complaints, inappropriate content reports, and accidental oversharing during beta.

This keeps the existing community implementation but raises it to beta-ready status instead of treating it as optional.

Implementation shape:
1. Split self-service and public DTO contracts where necessary instead of reusing one overly broad profile DTO.
2. Add explicit public mappers for feed posts, comments, and public profiles.
3. Remove private account fields such as `email` from public profile responses.
4. Keep existing `bonsaiId` and `entryReferenceIds` in community DTOs for the beta, because the current UI may rely on them.

### 4) Observability and health

Add `lib/observability.ts` to centralize:
1. structured server logs
2. request-context enrichment where available

Add `/api/health` as a lightweight readiness endpoint that verifies:
1. app process is running
2. database connectivity is available
3. required beta-critical config is present

The endpoint should return a compact JSON payload and remain safe for external uptime checks.

### 5) Test architecture

Testing is split into three layers:
1. Existing fast unit tests continue under `tests/*.test.ts`.
2. New API/integration tests cover ownership, validation, and failure behavior around protected endpoints.
3. New Playwright smoke coverage exercises the real browser flows for beta-critical journeys.

Recommended smoke suite scope:
1. waitlist request submission
2. operator approval handoff using the documented script/process
3. bonsai create/edit/delete
4. sub-entry create/edit/delete
5. reminder create/edit/complete
6. feed access, post creation, like/comment interaction, and public profile access

## Technical Decisions

1. Community features are supported in the first beta and therefore receive explicit privacy, support, and test coverage.
2. Upload persistence is abstracted behind a storage adapter, with Supabase Storage as the production backend instead of `multer.diskStorage`.
3. The repository ignores local upload artifacts and stops treating them as deployable source files.
4. Browser-level smoke testing is introduced because the critical beta risks span UI, auth, routing, API, community interaction, and file upload boundaries.
5. Runbooks live in `docs/` so product, support, and operators can use them without scanning feature-history folders.
6. Health and observability hooks are intentionally lightweight and additive, limited to healthcheck plus structured logs for the first beta.
7. Database scope remains PostgreSQL; only upload persistence changes provider in this feature.

## Integration Points

1. Upload endpoints must continue to work with existing forms in `pages/create-bonsai.tsx` and `pages/bonsai/[id]/subentries.tsx`.
2. Community hardening must integrate with existing navigation and post/profile APIs rather than removing schema or post models.
3. Health and monitoring must integrate with Prisma connection handling in [`lib/prisma.ts`](/Users/maius/Projekte/Bonsai-Tracker/lib/prisma.ts).
4. Runbooks must incorporate the existing waitlist approval script in [`scripts/approve-waitlist.js`](/Users/maius/Projekte/Bonsai-Tracker/scripts/approve-waitlist.js).
5. Documentation changes must align project root docs with the already existing product-level `SPEC.md`.
6. Public API contracts must align with `types/dto.ts` and mapper logic so privacy boundaries are enforced server-side, not only in the UI.

## Implementation Steps

1. Establish beta decisions and config surface.
   - Add `.env.example` entries for healthcheck, Supabase Storage credentials, bucket configuration, and any community-copy toggles.
   - Implement `lib/config/beta.ts`.
   - Document and wire any beta-specific privacy or copy configuration needed for community surfaces.

2. Harden community DTOs and API visibility.
   - Split `ProfileDto` into self-service versus public community payloads if needed.
   - Refactor `lib/mappers.ts` so public profile/feed endpoints cannot leak `email` or private bonsai internals.
   - Keep existing `bonsaiId` and `entryReferenceIds` where the current UI uses them.
   - Update feed/profile pages to rely only on the approved public data contract.

3. Refactor upload persistence.
   - Update `.gitignore` to exclude local upload artifacts.
   - Extract storage interface and local adapter.
   - Refactor `lib/uploads.ts` and upload APIs to call the adapter instead of writing directly to git-tracked `public/uploads`.
   - Add Supabase Storage adapter and environment parsing.
   - Add optional migration/backfill script only if existing persisted files need relocation.

4. Add observability and availability primitives.
   - Implement `lib/observability.ts`.
   - Add `/api/health`.
   - Ensure protected APIs log actionable failures through the shared wrapper.

5. Expand automated verification.
   - Add API/integration tests for ownership, validation, and community privacy behavior.
   - Add Playwright configuration and smoke specs for the core beta flows.
   - Exclude automated magic-link login and cover it in the manual smoke checklist instead.
   - Add fixtures or seed helpers needed for repeatable beta smoke runs.

6. Document operations and release procedure.
   - Write backup/restore runbook.
   - Write beta approval runbook using the current waitlist script.
   - Write support/incident process with severity and escalation guidance, including community reports.
   - Write community privacy and user communication document.
   - Write final manual smoke checklist.
   - Update `README.md` and `SPEC.md` to reflect final decisions.

7. Verify the full package.
   - Run unit tests.
   - Run typecheck.
   - Run browser smoke tests in the intended beta configuration.
   - Execute the manual smoke checklist once after automated verification is green, including login verification.

## Test Strategy

### Fast tests

1. Add storage adapter tests for path generation, provider selection, and local fallback behavior.
2. Add tests for community visibility rules and API responses.
3. Add ownership tests covering:
   - cross-user bonsai access
   - cross-user sub-entry access
   - cross-user reminder access
   - upload attempts against foreign bonsais
4. Add community tests covering:
   - authenticated feed access
   - post creation using only owned bonsai data
   - foreign post mutation rejection
   - comment and like behavior
   - public profile DTO visibility boundaries
   - absence of `email` and other private fields in public payloads

### Browser smoke tests

1. Waitlist request creates or updates a request successfully.
2. User can create a bonsai with image upload.
3. User can edit the bonsai and see updated data.
4. User can create, edit, and delete a sub-entry.
5. User can create and update a reminder.
6. User can create a post, interact with the feed, and open a public profile.

### Validation commands

1. `npm run typecheck`
2. `npm test`
3. `npm run test:e2e`
4. `npm run build`

## Edge Cases and Error Handling

1. Storage adapter misconfiguration must fail with actionable server logs, not silent upload success.
2. Upload failures after file parsing must not leave inconsistent image references in bonsai or sub-entry records.
3. Existing DB image paths may need compatibility handling during storage migration.
4. Community visibility text must match the actual API behavior and exposed DTO fields.
5. Healthcheck must distinguish between app-up and dependency-down states without leaking secrets.
6. Manual beta runbooks must define recovery order for database restore versus Supabase Storage restore.
7. Existing UI components must not silently depend on public payload fields that are removed for privacy reasons.

## Validation Checklist

1. `public/uploads` is no longer a tracked production storage dependency.
2. Local upload artifacts are git-ignored.
3. Community behavior, visibility, and support handling are documented and implemented consistently.
4. Upload, bonsai, sub-entry, and reminder flows still work end-to-end.
5. Ownership and failure-mode tests exist for the protected endpoints.
6. `/api/health` responds successfully in a healthy environment.
7. Structured server logging is wired in server paths; external error tracking is deferred.
8. Backup, restore, approval, support, incident, and manual smoke runbooks exist in `docs/`.
9. `SPEC.md`, `README.md`, and beta docs describe the same final scope.
10. Typecheck, test suite, smoke suite, and build are green before marking the feature complete.
