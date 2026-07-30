# Bonsai Create Diagnostics Implementation Plan

Status: COMPLETE
Last modified: 2026-07-25

## Overview

Instrument the `POST /api/bonsais` handler with structured server logs around the create flow. The diagnostics should show request entry, validation outcome, persistence success, and failure details without changing API responses.

## Reference

Spec: `dev/features/2026-07-25_bonsai-create-diagnostics/spec.md`

Key acceptance criteria:
- `bonsai.create_failed` is logged for unexpected 500s.
- `bonsai.create_validation_failed` is logged for Zod errors.
- Successful requests log start, parsed summary, and created ID.
- Response behavior remains unchanged.

## File Structure

Modify:
- `pages/api/bonsais.ts`

Create:
- `dev/features/2026-07-25_bonsai-create-diagnostics/spec.md`
- `dev/features/2026-07-25_bonsai-create-diagnostics/implementation.md`

## Implementation Steps

1. Import `logError`, `logInfo`, and `logWarn` from `@/lib/observability`.
2. Add a small helper that summarizes a parsed Bonsai create payload without exposing image paths or full notes.
3. In the POST branch:
   - log `bonsai.create_started` before parsing;
   - log `bonsai.create_payload_parsed` after successful parsing;
   - log `bonsai.create_succeeded` after persistence succeeds;
   - log `bonsai.create_validation_failed` in the Zod catch path;
   - log `bonsai.create_failed` before returning the existing 500 response.
4. Keep existing `fail`/`ok` behavior unchanged.
5. Run a focused TypeScript check.

## Code Architecture

The API handler remains the single orchestration point. The repository layer keeps throwing Supabase errors. Observability stays centralized through `lib/observability.ts`.

## Technical Decisions

Use structured event names that match the existing observability helper style, for example `subentry.create_failed`.

Payload summaries include scalar fields useful for debugging schema/default mapping and counts for image arrays, but not raw image paths or long free-text fields.

## Integration Points

- `requireUser` provides `actor.id` for user-scoped log context.
- `bonsaiCreateSchema` validates and defaults submitted Bonsai data.
- `createOwnedBonsai` performs the Supabase insert and may throw the error behind the observed 500.

## Test Strategy

Run `npm run typecheck` because this is a TypeScript-only instrumentation change that should not alter runtime behavior. Existing API tests are not changed because no response contract changes.

## Edge Cases & Error Handling

- Validation errors keep returning `422` and now log flattened field/form errors.
- Unknown errors keep returning `500` and now log serialized error details.
- If `images` is missing, the route still defaults it to an empty array before parsing.

## Validation Checklist

- [x] Workflow docs created.
- [x] Route imports observability helpers.
- [x] POST create path logs start, parsed summary, success, validation failure, and unexpected failure.
- [x] Client-facing response behavior unchanged.
- [x] TypeScript verification completed or documented.
