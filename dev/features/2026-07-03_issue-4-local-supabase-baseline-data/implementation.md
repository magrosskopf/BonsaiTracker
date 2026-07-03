# Implementation Plan: Issue 4 Local Supabase Baseline Data

**Status**: COMPLETE  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Overview

Der bestehende lokale Supabase-Init-Flow wird um ein belastbares, idempotentes Prisma-Seed und passende Runbook-Hinweise erweitert, damit eine lokale App mit Baseline-Daten fuer Dashboard, Reminder und Feed gestartet werden kann.

## Reference

- **Spec**: `dev/features/2026-07-03_issue-4-local-supabase-baseline-data/spec.md`
- **Key acceptance criteria**:
  - Idempotentes Seed fuer Demo-Benutzer plus Kernobjekte
  - Dokumentierter `PRISMA_SEED=1`-Flow
  - Regressionstests fuer Seed und Doku

## File Structure

### Files to Modify

- `prisma/seed.ts` - Lokale Baseline-Daten definieren und idempotent erzeugen.
- `docs/supabase-postgres-migration.md` - Seed-Flow und erwartete lokale Baseline beschreiben.
- `tests/supabase-migration-docs.test.ts` - Regressionen fuer Seed-/Runbook-Anforderungen absichern.
- `dev/features/2026-07-03_issue-4-local-supabase-baseline-data/spec.md` - Bei Abschluss auf IMPLEMENTED setzen.
- `dev/features/2026-07-03_issue-4-local-supabase-baseline-data/implementation.md` - Bei Abschluss auf COMPLETE setzen.

## Implementation Steps

### Step 1: Add Red Test

Goal: Den fehlenden lokalen Baseline-Data-Contract zuerst testbar machen.

Actions:

1. `tests/supabase-migration-docs.test.ts` um Anforderungen fuer Baseline-Doku und Seed-Inhalte erweitern.
2. Test so formulieren, dass er ohne echte Datenbank rein dateibasiert laeuft.

### Step 2: Implement Baseline Seed

Goal: Ein wiederholbar ausfuehrbares Seed mit app-relevanten Kernobjekten bereitstellen.

Actions:

1. `prisma/seed.ts` auf benannte lokale Seed-Identitaeten umstellen.
2. Seed-Benutzer per `upsert` anlegen.
3. Zugehoerige App-Daten in stabiler Reihenfolge loeschen und neu anlegen oder anderweitig idempotent halten.
4. Kernobjekte erzeugen:
   - Demo-Benutzer
   - optional zweiter Community-Benutzer
   - Bonsai
   - SubEntry
   - Reminder
   - Community-Post inklusive sozialer Interaktion, falls mit kleinem Aufwand moeglich

### Step 3: Update Runbook

Goal: Den lokalen Smoke-Test mit Seed-Daten konkret beschreiben.

Actions:

1. `docs/supabase-postgres-migration.md` um Seed-Erwartungen ergaenzen.
2. Demo-Identitaet und erwartete sichtbare Baseline-Daten dokumentieren.
3. Klarstellen, dass nur lokale, nicht-sensitive Beispieldaten angelegt werden.

### Step 4: Verify and Close

Goal: Aenderung gegen Repo-Checks absichern und Workflow-Artefakte abschliessen.

Actions:

1. `npm test` ausfuehren.
2. `npm run typecheck` ausfuehren.
3. `npm run build` ausfuehren, da sich lokales Runtime-/Seed-/Runbook-Verhalten fuer App-Start und Verifikation aendert.
4. `spec.md` auf `IMPLEMENTED` und `implementation.md` auf `COMPLETE` setzen.
5. Git-Commit mit Issue-Referenz erstellen.

## Technical Decisions

- Tests bleiben dateibasiert, weil CI und Repo-Kontext keine echte lokale Supabase-Datenbank voraussetzen sollen.
- Das Seed wird auf stabile Demo-E-Mails und deterministische Daten aufgebaut.
- Dokumentation und Seed werden zusammen abgesichert, damit der lokale Runbook-Flow nicht wieder auseinanderdriftet.

## Test Strategy

- Dateibasierte Regressionstests fuer Runbook und Seed-Code.
- Vollstaendige Repo-Checks: `npm test`, `npm run typecheck`, `npm run build`.

## Edge Cases & Error Handling

1. Wiederholtes Seed darf nicht unkontrolliert duplizieren.
2. Seed-Daten muessen innerhalb des aktuellen Schemas und seiner Relationen gueltig bleiben.
3. Die Doku darf keine echten Verbindungs- oder Auth-Geheimnisse voraussetzen oder enthalten.

## Validation Checklist

- [ ] Seed deckt Kernobjekte ab.
- [ ] Seed ist stabil wiederholbar.
- [ ] Runbook beschreibt Baseline-Daten konkret.
- [ ] Tests, Typecheck und Build sind gruen.
