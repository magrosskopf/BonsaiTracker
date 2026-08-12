# Reminder creation and care entry wording

Status: IMPLEMENTED
Last modified: 2026-08-06

## Purpose/Goal

Users currently cannot create standalone reminders from the reminders screen, even though `/api/reminders` supports `POST`. The app also exposes the implementation term `Sub-Eintrag` to end users, which is unclear. The user-facing experience should let users create reminders and use the clearer term `Pflegeeintrag` for care-history entries.

## Functional Requirements

1. Authenticated users can create a new reminder from the reminders page.
2. Creating a reminder requires selecting one owned, non-deleted Bonsai and a reminder date.
3. Creating a reminder may include an optional title.
4. New reminders appear in the reminders list after successful creation without requiring a full page reload.
5. Reminder creation shows validation or server errors in the page UI.
6. Existing reminder list actions continue to work: mark done, snooze by 14 days, navigate to documentation.
7. The API reminder create validator continues to accept valid standalone reminders with no `subEntryId`.
8. Enduser-facing copy uses `Pflegeeintrag`/`Pflegeeinträge` instead of `Sub-Eintrag`/`Sub-Einträge`.
9. Technical identifiers, route names, table names, DTO names, repository names, storage paths, and API paths remain unchanged unless a user-facing string requires a copy change.

## Technical Constraints

- Stack: Next.js Pages Router, TypeScript, Supabase SDK, Tailwind/DaisyUI.
- Existing `/api/reminders` and `/api/reminders/[id]` endpoints remain backward-compatible.
- Reminder persistence must keep using `createOwnedReminder` and the Supabase RPC `create_owned_reminder`.
- Bonsai selection should use existing authenticated API calls; no new database schema is required.
- The internal `sub_entries` model remains named as-is.
- Public API v1 routes keep their current paths.

## Acceptance Criteria

1. On `/reminders`, an authenticated user can fill a form with Bonsai, date, optional title, submit it, and see the created reminder in the list.
2. Submitting the form without Bonsai or date does not call the create API and leaves the user with a clear inline error or disabled submit state.
3. A successful create request sends a payload compatible with `reminderCreateSchema`, including `subEntryId: null` or omitting the field in a way that validates to `null`.
4. If the create API returns an error, the page displays the error and keeps the user's input.
5. Existing tests for validators and public API surface pass.
6. New or updated tests cover standalone reminder create validation.
7. Typecheck passes.
8. `rg "Sub-Eintrag|Sub-Einträge"` in enduser-facing app files no longer returns visible UI copy, except internal comments/tests where the technical model is being referenced.
9. The user-visible care-history UI reads naturally with `Pflegeeintrag`/`Pflegeeinträge`.

## Out-of-Scope

- Renaming database tables, routes, DTO fields, TypeScript domain types, repository names, storage folders, or Supabase generated types.
- Adding recurring reminders.
- Adding reminder edit/delete UI beyond existing done/snooze behavior.
- Reworking the care-history data model.
- Redesigning the full reminders page layout beyond the creation flow required here.
