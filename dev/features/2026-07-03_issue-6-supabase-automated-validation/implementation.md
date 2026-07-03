# Implementation Plan: Issue 6 Supabase Automated Validation

**Status**: COMPLETE  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Overview

Dieses Issue verankert einen reproduzierbaren Repo-Check fuer die lokale Supabase-Postgres-Umgebung: ein eigenes Validierungsskript, ein aktualisiertes Runbook mit klarer Blocker-Kommunikation und einen Regressionstest, der beide Repo-Vertraege festhaelt.

## Reference

- **Spec**: `dev/features/2026-07-03_issue-6-supabase-automated-validation/spec.md`
- **Key acceptance criteria**:
  - Runbook-Sektion fuer automatisierte Validierung vorhanden
  - Repo-Skript deckt Test, Typecheck, Build und `migrate status` ab
  - Lokale Guardrails und Blocker-Kommunikation sind explizit
  - Regressionstest deckt Doku und Skript ab

## File Structure

### Files to Create

- `dev/features/2026-07-03_issue-6-supabase-automated-validation/spec.md`
- `dev/features/2026-07-03_issue-6-supabase-automated-validation/implementation.md`
- `scripts/validate-local-supabase-checks.sh`

### Files to Modify

- `tests/supabase-migration-docs.test.ts`
- `docs/supabase-postgres-migration.md`

## Implementation Steps

### Step 1: RED Test for Automated Validation Contract

Goal: Die fehlende Repo-Verankerung fuer den Validierungspfad zuerst rot machen.

Actions:

1. `tests/supabase-migration-docs.test.ts` um Anforderungen fuer die automatisierte Supabase-Validierung erweitern.
2. Doku- und Skriptanforderungen auf konkrete Check-Kommandos, Guardrails und Blocker-Hinweise formulieren.

### Step 2: Add Repo Validation Script

Goal: Ein einziger Repo-Einstiegspunkt fuehrt die geforderten Checks gegen die lokale Supabase-Konfiguration aus.

Actions:

1. `scripts/validate-local-supabase-checks.sh` mit direkten Postgres-/Localhost-Guardrails anlegen.
2. Reihenfolge festlegen: `npm test`, `npm run typecheck`, `npm run build`, `npm run prisma -- migrate status`.
3. Bei fehlender DB-Erreichbarkeit eine konkrete Fehlermeldung fuer den lokalen Supabase-Blocker ausgeben.

### Step 3: Extend the Runbook

Goal: Das Repo dokumentiert, wann und wie der automatisierte Validierungspfad benutzt wird.

Actions:

1. `docs/supabase-postgres-migration.md` um eine Sektion fuer automatisierte Validierung erweitern.
2. Das Skript und die Einzelkommandos nennen.
3. Klar dokumentieren, wie `migrate status`-Blocker von allgemeinen Repo-Fehlern getrennt werden.

### Step 4: Verify and Close

Goal: Repo-Checks laufen grün und der neue Pfad ist sauber dokumentiert.

Actions:

1. `npm test`
2. `npm run typecheck`
3. `npm run build`
4. `spec.md` auf `IMPLEMENTED` und `implementation.md` auf `COMPLETE` setzen.
5. Git-Commit mit Issue-Referenz erstellen.

## Code Architecture

- Das neue Validierungsskript ist ein Shell-Wrapper um bestehende Repo-Kommandos; es fuehrt keine eigene Datenbanklogik ein.
- Der bestehende Initialisierungspfad `scripts/init-local-supabase-db.sh` bleibt fuer Migration/Seed zustandig.
- Das Runbook beschreibt die operative Reihenfolge und Blocker-Triage, waehrend der Test diese Repo-Vertraege absichert.

## Technical Decisions

1. Ein eigenes Validierungsskript ist sinnvoller als lose Doku, weil damit der intended path fuer lokale Supabase-Checks explizit ausfuehrbar bleibt.
2. Die Guardrails spiegeln den Initialisierungspfad, damit Validierung nicht versehentlich gegen nicht-lokale Datenbanken laeuft.
3. Ein DB-Erreichbarkeitsfehler wird nicht maskiert; stattdessen wird er als lokaler Supabase-Blocker klar benannt.

## Test Strategy

- RED/GREEN ueber `tests/supabase-migration-docs.test.ts`
- Repo-Checks: `npm test`, `npm run typecheck`, `npm run build`

## Edge Cases & Error Handling

1. `DATABASE_URL` fehlt oder nutzt `prisma+postgres://`:
   - Das Skript bricht vor den Repo-Checks mit klarer Fehlermeldung ab.
2. Lokale Supabase-DB ist nicht erreichbar:
   - `npm run prisma -- migrate status` bleibt der eigentliche failing check; das Skript meldet den Zustand als lokalen Supabase-Blocker.
3. Allgemeine Repo-Regression:
   - `npm test`, `npm run typecheck` oder `npm run build` sollen unveraendert hart fehlschlagen.

## Validation Checklist

- [x] Nur Issue `#6` bearbeitet
- [x] Workflow-Artefakte fuer dieses Issue vorhanden
- [x] Validierungsskript fuer lokale Supabase-Checks vorhanden
- [x] Runbook um automatisierte Validierungssektion erweitert
- [x] Regressionstest deckt Doku und Skript ab
- [x] `npm test` erfolgreich
- [x] `npm run typecheck` erfolgreich
- [x] `npm run build` erfolgreich
