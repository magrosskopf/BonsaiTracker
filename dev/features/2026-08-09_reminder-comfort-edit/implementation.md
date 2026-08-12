# Reminder komfortabel anlegen und bearbeiten

Status: COMPLETE
Created: 2026-08-09
Last Modified: 2026-08-09

## Overview

Die bestehende globale Reminder-Seite wird zu einer direkten Erfassungs- und Bearbeitungsoberflaeche erweitert. Die vorhandene Anlage wird beibehalten und durch Inline-Bearbeitung pro Reminder ergaenzt. API-seitig wird der Patch-Validator so erweitert, dass die UI auch Bonsai-Zuordnung, Titel und Faelligkeitsdatum speichern kann.

## Reference

Spec: `dev/features/2026-08-09_reminder-comfort-edit/spec.md`

Key acceptance criteria:

- Reminder anlegen mit Bonsai und Datum.
- Bestehende Reminder direkt bearbeiten.
- Titel, Datum und Bonsai-Zuordnung speichern.
- Fehler pro Reminder anzeigen.
- Sortierung nach Datum und ID bleibt stabil.

## File Structure

Modify:

- `pages/reminders.tsx`
- `lib/validators/reminder.ts`
- `pages/api/reminders/[id].ts`
- `tests/new-validators.test.ts`

Create:

- `dev/features/2026-08-09_reminder-comfort-edit/spec.md`
- `dev/features/2026-08-09_reminder-comfort-edit/implementation.md`

No database migrations.

## Implementation Steps

1. Extend `reminderPatchSchema`.
   - Allow optional `bonsaiId`.
   - Keep strict body validation.
   - Add tests for patching title, date and bonsai.

2. Extend `PATCH /api/reminders/:id`.
   - Pass `bonsai_id` when `bonsaiId` is provided.
   - Keep existing status, snooze and cancel semantics.
   - Do not alter completed/snoozed timestamps for simple title/date/bonsai edits.

3. Refactor `/reminders` state.
   - Keep create form state.
   - Add per-reminder edit state keyed by reminder ID.
   - Add per-reminder pending and error state.
   - Add helpers for date input formatting and list replacement/sorting.

4. Add inline edit UI.
   - Each reminder card has `Bearbeiten`.
   - Editing card shows Bonsai select, date input and title input.
   - Actions: `Speichern`, `Abbrechen`.
   - Existing quick actions are shown only in view mode.

5. Improve error and empty states.
   - Create errors stay near the create form.
   - Edit errors stay in the affected card.
   - Empty state mentions both Pflegeeintraege and direct Reminder creation.

6. Verify.
   - Run targeted validator tests during implementation if useful.
   - Run `npm test`.
   - Run `npm run typecheck`.

## Code Architecture

### Reminder Form Model

`ReminderFormState` remains:

- `bonsaiId: string`
- `title: string`
- `reminderDate: string`

The same shape is reused for edit forms, stored as:

- `editForms: Record<number, ReminderFormState>`

### UI Interaction

- `startEditingReminder(reminder)` initializes an edit form from the DTO.
- `cancelEditingReminder(id)` removes the edit form and clears card errors.
- `saveReminder(id)` validates local required fields, calls PATCH, updates the list and exits edit mode.
- `updateReminder(id, body)` remains the generic PATCH helper for status and snooze actions, with optional per-card error handling.

### API Payload

Simple edit PATCH body:

```json
{
  "bonsaiId": 12,
  "title": "Draht kontrollieren",
  "reminderDate": "2026-08-20"
}
```

The API maps this to Supabase columns:

- `bonsai_id`
- `title`
- `reminder_date`

## Technical Decisions

1. Inline editing is used instead of a separate route because Reminder editing is a small, contextual operation and the page already owns the required Bonsai list.
2. No new component is extracted unless the page becomes difficult to follow; the existing page is self-contained.
3. The API remains PATCH-only for updates to avoid introducing a second update route.
4. The default Reminder list continues to exclude done/cancelled reminders via existing repository filtering.

## Integration Points

- `pages/reminders.tsx` uses `GET /api/reminders` and `GET /api/bonsais?status=active&limit=50`.
- `pages/reminders.tsx` sends POST/PATCH via `apiFetch`.
- `pages/api/reminders/[id].ts` validates with `reminderPatchSchema`.
- `lib/repositories/reminders.ts` already accepts `Partial<ReminderRow>` and does not need changes.

## Test Strategy

Automated:

- `tests/new-validators.test.ts`:
  - existing snooze acceptance.
  - standalone create without subentry.
  - patch accepts editable fields: `bonsaiId`, `title`, `reminderDate`.
  - patch rejects unknown fields through strict validation.

Manual/code review:

- Verify `/reminders` render structure for view and edit modes.
- Verify no UI action depends on done/cancelled Reminder visibility.

Commands:

- `npm test`
- `npm run typecheck`

## Edge Cases & Error Handling

1. No active Bonsais: create and edit submit buttons are disabled and the page points to Bonsai creation.
2. Missing Bonsai/date in edit mode: local card-level validation message.
3. PATCH validation/server failure: error stays on the edited card.
4. Snooze/done failure: error stays on the affected card.
5. Reminder edited to a later/earlier date: list is re-sorted after successful response.
6. Empty title: sent as `null`, displayed with fallback `Pflege fuer {bonsaiName}`.

## Validation Checklist

- [x] Spec exists and is approved.
- [x] Implementation plan exists and is approved.
- [x] `reminderPatchSchema` accepts edit fields.
- [x] `/api/reminders/:id` persists editable fields.
- [x] `/reminders` can create and edit reminders.
- [x] Card-level errors are present.
- [x] Existing done, snooze and document actions still work.
- [x] Tests updated.
- [x] `npm test` run.
- [x] `npm run typecheck` run.
