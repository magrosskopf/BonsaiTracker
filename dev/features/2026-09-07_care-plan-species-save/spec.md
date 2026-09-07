# Care-Plan Species Save Bugfix Spec

Status: IMPLEMENTED
Last modified: 2026-09-07

## Purpose/Goal

Beim Bearbeiten eines Bonsai kann die Pflegeplan-Pflanzenart nicht zuverlaessig gespeichert werden. Das blockiert die Pflegeplan-Vorschau und anschliessende Pflegeplan-Reminder, obwohl die App den Wert bereits im Formular anbietet und an die API sendet.

## Functional Requirements

- Beim Erstellen eines Bonsai wird `carePlanSpeciesId` weiterhin optional akzeptiert und als `care_plan_species_id` gespeichert.
- Beim Bearbeiten eines Bonsai wird `carePlanSpeciesId` optional akzeptiert und als `care_plan_species_id` aktualisiert.
- Eine leere Auswahl entfernt die Pflegeplan-Pflanzenart und speichert `null`.
- Der bestehende Freitext `species` bleibt unabhaengig davon speicherbar.
- Pflegeeintraege muessen weiterhin erstellt und bearbeitet werden koennen.

## Technical Constraints

- Stack bleibt Next.js Pages Router, TypeScript, Supabase SDK und bestehende Repository-Struktur.
- Bonsai-Updates laufen aktuell ueber die Supabase-RPC-Funktion `patch_owned_bonsai`.
- Die zentrale `workflows/`-Definition wird nicht geaendert.
- Lokale Supabase-Migrationen liegen in diesem Repository nicht als `supabase/migrations/` vor; vorhandene Paywall-Migration liegt als Feature-Artefakt unter `dev/features/2026-09-06_pflegeplan-paywall/migration.sql`.

## Acceptance Criteria

- `bonsaiFormValuesToPayload` liefert fuer eine ausgewaehlte Pflegeplan-Pflanzenart den erwarteten `carePlanSpeciesId` und fuer leer `null`.
- `patch_owned_bonsai`-bezogene Artefakte decken `care_plan_species_id` in Update und Return-Contract ab.
- Bestehende Pflegeeintrag-Tests bleiben gruen.
- `npm test` laeuft erfolgreich.

## Out-of-Scope

- Keine neue Pflegeplan-Art.
- Keine automatische Migration von Freitext-`species` zu `care_plan_species_id`.
- Keine Aenderung an Stripe-Entitlements oder Paywall-Logik.
- Keine UI-Neugestaltung.
