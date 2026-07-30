# Implementation Plan: Issue 6 Supabase Automated Validation

**Status**: COMPLETE  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-04

## Overview

Dieses Issue verankert einen reproduzierbaren Repo-Check fuer die lokale Supabase-Postgres-Umgebung: ein Guardrail-Skript fuer die eigentlichen Checks, einen selbststartenden Repo-Einstiegspunkt fuer fehlende lokale Laufzeit, ein aktualisiertes Runbook und einen Regressionstest, der diese Repo-Vertraege festhaelt.

## Reference

- **Spec**: `dev/features/2026-07-03_issue-6-supabase-automated-validation/spec.md`
- **Key acceptance criteria**:
  - Runbook-Sektion fuer automatisierte Validierung vorhanden
  - Repo-Skript deckt Test, Typecheck, Build und `migrate status` ab
  - Bevorzugter Repo-Einstiegspunkt kann die benoetigte lokale DB bei Bedarf selbst bereitstellen
  - Lokale Guardrails und Blocker-Kommunikation sind explizit
  - Regressionstest deckt Doku und Skript ab

## File Structure

### Files to Create

- `dev/features/2026-07-03_issue-6-supabase-automated-validation/spec.md`
- `dev/features/2026-07-03_issue-6-supabase-automated-validation/implementation.md`
- `scripts/run-local-supabase-validation.ts`
- `scripts/validate-local-supabase-checks.sh`

### Files to Modify

- `tests/supabase-migration-docs.test.ts`
- `docs/supabase-postgres-migration.md`
- `package.json`

## Implementation Steps

### Step 1: RED Test for Automated Validation Contract

Goal: Die fehlende Repo-Verankerung fuer den Validierungspfad zuerst rot machen.

Actions:

1. `tests/supabase-migration-docs.test.ts` um Anforderungen fuer die automatisierte Supabase-Validierung erweitern.
2. Doku- und Skriptanforderungen auf konkrete Check-Kommandos, Guardrails und Blocker-Hinweise formulieren.

### Step 2: Add Repo Validation Entrypoints

Goal: Ein einziger Repo-Einstiegspunkt fuehrt die geforderten Checks gegen die lokale Supabase-Konfiguration aus, auch wenn noch keine lokale DB lauscht.

Actions:

1. `scripts/validate-local-supabase-checks.sh` mit direkten Postgres-/Localhost-Guardrails anlegen.
2. `scripts/run-local-supabase-validation.ts` als bevorzugten Repo-Einstiegspunkt anlegen, der bei Bedarf ein lokales Embedded-Postgres unter der dokumentierten Zieladresse startet.
3. Reihenfolge festlegen: Initialisierung, dann `npm test`, `npm run typecheck`, `npm run build`, `npm run prisma -- migrate status`.
4. Bei fehlender DB-Erreichbarkeit im Guardrail-Skript eine konkrete Fehlermeldung fuer den lokalen Supabase-Blocker ausgeben.

### Step 3: Extend the Runbook

Goal: Das Repo dokumentiert, wann und wie der automatisierte Validierungspfad benutzt wird.

Actions:

1. `docs/supabase-postgres-migration.md` um eine Sektion fuer automatisierte Validierung erweitern.
2. Den bevorzugten Wrapper, das Guardrail-Skript und die Einzelkommandos nennen.
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
- `scripts/run-local-supabase-validation.ts` startet bei Bedarf ein temporaeres lokales Embedded-Postgres auf der dokumentierten Zieladresse und delegiert dann an die bestehenden Repo-Skripte.
- Der bestehende Initialisierungspfad `scripts/init-local-supabase-db.sh` bleibt fuer Migration/Seed zustandig.
- Das Runbook beschreibt die operative Reihenfolge und Blocker-Triage, waehrend der Test diese Repo-Vertraege absichert.

## Technical Decisions

1. Ein eigenes Guardrail-Skript bleibt sinnvoll, weil damit der intended path fuer lokale Supabase-Checks explizit ausfuehrbar bleibt.
2. Der zusaetzliche Wrapper schliesst die Luecke dieser Arbeitsumgebung, in der weder Docker noch Supabase-CLI verfuegbar sind, ohne das Repo auf nicht-lokale DB-Ziele auszuweiten.
3. Die Guardrails spiegeln den Initialisierungspfad, damit Validierung nicht versehentlich gegen nicht-lokale Datenbanken laeuft.
4. Ein DB-Erreichbarkeitsfehler wird im Guardrail-Skript nicht maskiert; stattdessen wird er als lokaler Supabase-Blocker klar benannt.

## Test Strategy

- RED/GREEN ueber `tests/supabase-migration-docs.test.ts`
- Repo-Checks: `npm test`, `npm run typecheck`, `npm run build`, `npm run validate:local-supabase`

## Edge Cases & Error Handling

1. `DATABASE_URL` fehlt oder nutzt `prisma+postgres://`:
   - Das Skript bricht vor den Repo-Checks mit klarer Fehlermeldung ab.
2. Unter der lokalen Zieladresse lauscht noch keine DB:
   - der Wrapper startet ein temporaeres Embedded-Postgres mit derselben direkten `DATABASE_URL`-Form.
3. Lokale Supabase-DB ist erreichbar, aber `migrate status` scheitert:
   - `npm run prisma -- migrate status` bleibt der eigentliche failing check; das Skript meldet den Zustand als lokalen Supabase-Blocker.
4. Allgemeine Repo-Regression:
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
- [x] `npm run validate:local-supabase` erfolgreich
