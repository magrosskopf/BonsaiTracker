# Reminder creation and care entry wording implementation

Status: COMPLETE
Last modified: 2026-08-06

## Overview

Implement standalone reminder creation on `/reminders` and replace enduser-facing `Sub-Eintrag` wording with `Pflegeeintrag`. Keep all internal data model names, API routes, DTOs, repositories, and storage paths unchanged.

## Reference

Spec: `/dev/features/2026-08-06_reminder-creation-care-entry-wording/spec.md`

Key acceptance criteria:

- `/reminders` lets authenticated users create a reminder for an owned active Bonsai with date and optional title.
- Created reminders appear in the current list immediately.
- Form validation and API errors are visible and do not discard input.
- `reminderCreateSchema` supports standalone reminders without a `subEntryId`.
- Enduser-facing app copy no longer exposes `Sub-Eintrag`/`Sub-Einträge`.
- Tests and typecheck pass.

## File Structure

Modify:

- `pages/reminders.tsx`
  - Add Bonsai list loading.
  - Add create reminder form state and submit handler.
  - Display form errors and created reminders.
  - Keep existing done/snooze/document actions.
- `pages/bonsai/[id]/subentries.tsx`
  - Replace visible `Sub-Eintrag` copy with `Pflegeeintrag`.
  - Update user-facing error messages and modal copy only.
- `pages/bonsai/[id].tsx`
  - Replace visible `Sub-Einträge` copy with `Pflegeeinträge`.
- `lib/validators/reminder.ts`
  - Make `subEntryId` optional while still normalizing omitted/blank/null values to `null`.
- `tests/new-validators.test.ts`
  - Add or update tests for standalone reminder creation validation.

Optional, only if search shows remaining visible copy:

- Other `pages/` or `components/` files containing visible `Sub-Eintrag` strings.

Do not modify:

- `workflows/`
- Supabase generated types.
- API route names such as `/api/subentries`.
- Internal type/repository/model names.

## Implementation Steps

1. Update reminder create validation.
   - Import `reminderCreateSchema` in `tests/new-validators.test.ts`.
   - Add test: valid `{ bonsaiId, title, reminderDate }` parses successfully and normalizes `subEntryId` to `null`.
   - Change `subEntryId` in `reminderCreateSchema` to be optional with default `null`.

2. Add reminder form data dependencies.
   - In `pages/reminders.tsx`, import `BonsaiSummary`.
   - Add a Bonsai list response type.
   - Load `/api/bonsais?status=active&limit=50` when authenticated, alongside reminders.
   - Store active Bonsais for a select input.

3. Implement reminder creation UI on `/reminders`.
   - Add form state: `bonsaiId`, `title`, `reminderDate`.
   - Add create error state if current general `error` would be too coarse.
   - Render a compact form above the reminder list with Bonsai select, date input, optional title input, and submit button.
   - Disable submit while submitting or while required fields are missing.
   - If no active Bonsais exist, show a useful empty state linking to `/create-bonsai`.

4. Implement reminder create submit.
   - POST JSON to `/api/reminders` with `bonsaiId: Number(...)`, `title`, `reminderDate`, and `subEntryId: null`.
   - On success, insert the returned reminder into `items` sorted by `reminderDate` ascending and reset the form except Bonsai if preserving it improves flow.
   - On API failure, display the returned message and keep form values.

5. Replace user-facing `Sub-Eintrag` copy.
   - In `pages/bonsai/[id]/subentries.tsx`, use:
     - `Neuen Pflegeeintrag hinzufügen`
     - `Pflegeeintrag anlegen`
     - `Pflegeeintrag bearbeiten`
     - `Der Pflegeeintrag konnte ...`
     - `aus diesem Pflegeeintrag`
   - In `pages/bonsai/[id].tsx`, use `Pflegeeinträge` for navigation and empty state.
   - Leave route segments and API paths untouched.

6. Update implementation document status after verification.

## Code Architecture

`pages/reminders.tsx` remains a page-level component with local state. It will coordinate:

- Auth status from `useRequireAuth()`.
- `apiFetch("/api/reminders")` for current reminders.
- `apiFetch("/api/bonsais?status=active&limit=50")` for select options.
- `apiFetch("/api/reminders", { method: "POST" })` for creation.

No shared component extraction is planned because the form is currently used only once and the requested change is narrowly scoped.

`reminderCreateSchema` continues to define the API contract. It should accept both explicit `subEntryId: null` and omitted `subEntryId` for standalone reminders.

## Technical Decisions

- Use `Pflegeeintrag` as the enduser term because it matches existing `Pflegehistorie` copy and the form captures care actions, observations, notes, images, and reminders.
- Keep `Reminder` as-is unless separately requested; the user's wording concern was specifically about `sub-einträge`.
- Keep standalone reminders tied to Bonsai, not subentries. This matches the current DB model and API validator.
- Fetch up to 50 active Bonsais for the select because the existing API limit max is 50 and reminder creation only needs active owned Bonsais.
- Avoid adding a new API endpoint for Bonsai select options.

## Integration Points

- `/api/reminders` POST:
  - Validates `reminderCreateSchema`.
  - Calls `createOwnedReminder`.
  - Returns `ReminderDto`.
- `/api/bonsais` GET:
  - Provides active Bonsai summaries for select options.
- `/bonsai/[id]/subentries` route:
  - Path remains unchanged although visible copy changes to `Pflegeeintrag`.

## Test Strategy

Run:

- `npm test`
- `npm run typecheck`

Focused test coverage:

- `tests/new-validators.test.ts` validates standalone reminder creation with omitted `subEntryId`.
- Existing tests continue to cover reminder patch behavior and public API route presence.

Manual checks if a dev server is already practical:

- `/reminders` renders form for authenticated users.
- Required fields disable/guard submit.
- Successful POST adds reminder to the list.
- Visible app copy no longer shows `Sub-Eintrag`/`Sub-Einträge`.

## Edge Cases & Error Handling

- No active Bonsais: form should not submit and should offer navigation to create a Bonsai.
- Bonsai list load failure: page should display a clear error and avoid submitting a malformed reminder.
- Reminder create API validation failure: show returned validation message and keep user input.
- Reminder create server failure: show returned server message and keep user input.
- Empty title: send `null` or an empty value that normalizes to `null`.
- Existing reminder actions should remain unaffected.

## Validation Checklist

- [x] Spec status is `APPROVED`.
- [x] Implementation follows this plan.
- [x] `/reminders` can create standalone reminders.
- [x] New reminders appear immediately after creation.
- [x] Required fields are guarded.
- [x] API errors are shown without clearing input.
- [x] User-facing `Sub-Eintrag` copy is replaced.
- [x] `npm test` passes.
- [x] `npm run typecheck` passes.
- [x] `rg "Sub-Eintrag|Sub-Einträge" pages components` has no enduser-visible hits.
- [x] Implementation status is marked `COMPLETE`.
