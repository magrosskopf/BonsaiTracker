# Bonsai Create Diagnostics

Status: IMPLEMENTED
Last modified: 2026-07-25

## Purpose/Goal

`POST /api/bonsais` returns `500` when a new Bonsai is created. The API currently hides the underlying failure behind a generic response, so the server logs need enough diagnostic context to identify whether the failure happens during validation or persistence.

## Functional Requirements

1. Add server-side diagnostics to `POST /api/bonsais`.
2. Log the start of a create request with non-sensitive request metadata.
3. Log successful validation with a small summary of the parsed payload.
4. Log successful creation with the created Bonsai ID.
5. Log validation failures and unexpected creation failures with structured error details.
6. Keep client-facing responses and status codes unchanged.

## Technical Constraints

1. Project stack is Next.js Pages Router, TypeScript, Supabase SDK/CLI, Tailwind.
2. Use the existing `lib/observability.ts` helpers instead of introducing a separate logger.
3. Do not log complete request bodies, secrets, cookies, auth headers, or image paths.
4. Keep the change scoped to `pages/api/bonsais.ts` and workflow documentation.
5. Preserve unrelated dirty worktree changes.

## Acceptance Criteria

1. A failing `POST /api/bonsais` emits a structured error log with event `bonsai.create_failed`.
2. A validation failure emits a structured warning log with event `bonsai.create_validation_failed`.
3. A successful create request emits structured info logs for start, parsed payload summary, and success.
4. API response behavior is unchanged for success, validation errors, and unexpected errors.
5. TypeScript compilation accepts the modified route.

## Out-of-Scope

1. Fixing the underlying create failure.
2. Changing the Bonsai database schema or Supabase policies.
3. Changing frontend form behavior or user-facing error copy.
4. Logging full submitted payloads or uploaded image paths.
