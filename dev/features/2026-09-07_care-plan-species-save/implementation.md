# Care-Plan Species Save Bugfix Implementation Plan

Status: COMPLETE
Last modified: 2026-09-07

## Overview

Der Bugfix schliesst die Luecke zwischen Formular/API-Payload und Supabase-RPC-Contract: `carePlanSpeciesId` wird bereits gesendet, muss aber beim Bonsai-Update durch `patch_owned_bonsai` als `care_plan_species_id` persistiert und im Contract sichtbar sein.

## Reference

- Spec: `dev/features/2026-09-07_care-plan-species-save/spec.md`
- Wichtigste Akzeptanzkriterien: Bonsai-Update speichert `care_plan_species_id`; Pflegeeintraege bleiben unveraendert speicherbar; Tests laufen.

## File Structure

- `dev/features/2026-09-06_pflegeplan-paywall/migration.sql`
- `dev/features/2026-09-07_care-plan-species-save/supabase-migration.sql`
- `types/supabase.ts`
- `tests/bonsai-contracts.test.ts`
- `dev/features/2026-09-07_care-plan-species-save/spec.md`
- `dev/features/2026-09-07_care-plan-species-save/implementation.md`

## Implementation Steps

1. Einen fokussierten Contract-Test ergaenzen, der sicherstellt, dass Formular-Mapping `carePlanSpeciesId` rundtrippt und die Pflegeplan-Auswahl leer zu `null` normalisiert.
2. Einen Source-Contract-Test ergaenzen, der die Paywall-Migration auf `care_plan_species_id` im `patch_owned_bonsai`-Body prueft.
3. Die Paywall-Migration um eine idempotente `create or replace function public.patch_owned_bonsai(...)`-Definition erweitern, die `care_plan_species_id = coalesce/null-aware p_patch->...` unterstuetzt.
4. Eine separate deploybare Supabase-Migration mit nur der `create or replace function`-Definition erstellen, damit bereits angewendete Remote-Migrationen nicht geaendert werden muessen.
5. `types/supabase.ts` fuer den RPC-Return-Contract um `care_plan_*`-Felder ergaenzen, insbesondere `care_plan_species_id`.
6. Tests ausfuehren: zuerst zielgerichtet `npm test -- --test-name-pattern ...` falls moeglich, danach `npm test`.
7. Spec/Plan-Status auf implementiert/complete setzen.

## Code Architecture

- Das Frontend bleibt unveraendert, weil `BonsaiForm` und `bonsaiFormValuesToPayload` bereits `carePlanSpeciesId` senden.
- Das Repository `lib/repositories/bonsais.ts` bleibt die Integrationsstelle und sendet weiterhin `p_patch` an `patch_owned_bonsai`.
- Die Datenbankfunktion ist die autoritative Update-Schicht fuer Bonsai-Partial-Updates und Bild-Array-Aenderungen.

## Technical Decisions

- Die Migration wird idempotent gehalten, damit sie erneut in Supabase ausgefuehrt werden kann.
- Die neue Spalte wird nicht aus dem Freitext `species` abgeleitet.
- Pflegeeintrags-Code wird nur ueber Tests verifiziert; kein Code-Change, solange kein konkreter Defekt sichtbar ist.

## Integration Points

- `pages/bonsai/edit/[id].tsx` sendet den Payload an `PATCH /api/bonsais/:id`.
- `pages/api/bonsais/[id].ts` validiert `carePlanSpeciesId` und reicht den Patch weiter.
- `lib/repositories/bonsais.ts` mappt `carePlanSpeciesId` nach `care_plan_species_id`.
- Supabase `patch_owned_bonsai` persistiert das Feld.

## Test Strategy

- Unit/Contract-Test fuer Formular- und Payload-Mapping.
- Source-Contract-Test fuer die Migration, weil lokale DB-Migrationsdateien in diesem Repo nicht als normale Supabase-Migrationskette vorliegen.
- Gesamttestlauf `npm test`.

## Edge Cases & Error Handling

- Leere Pflegeplan-Auswahl muss `null` speichern.
- Ungueltige Pflegeplan-Art wird weiterhin vom Validator abgelehnt.
- Bestehende Bild-Add/Remove-Logik in `patch_owned_bonsai` darf nicht veraendert werden.
- Pflegeeintraege duerfen durch Bonsai-Update-Aenderungen nicht beeinflusst werden.

## Validation Checklist

- Contract-Tests fuer `carePlanSpeciesId` existieren.
- Migration enthaelt `care_plan_species_id` im `patch_owned_bonsai`-Update.
- Separate deploybare Supabase-Migration enthaelt denselben RPC-Fix.
- TypeScript-RPC-Return enthaelt `care_plan_species_id`.
- `npm test` ist gruen oder Abweichung ist dokumentiert.
