# Implementation Plan: Issue 5 Supabase Core App Flows

**Status**: COMPLETE  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Overview

Dieses Issue schliesst den repo-seitigen Nachweis fuer lokale Supabase-Postgres-Kernfluesse, indem das bestehende Runbook um eine konkrete Smoke-Test-Checklist mit Pass-/Skip-Regeln erweitert und diese Doku per Regressionstest abgesichert wird.

## Reference

- **Spec**: `dev/features/2026-07-03_issue-5-supabase-core-app-flows/spec.md`
- **Key acceptance criteria**:
  - Kernfluss-Checklist im Supabase-Runbook
  - Explizite Pass-/Skip-Regeln fuer lokale Auth- und Media-Abhaengigkeiten
  - Regressionstest fuer die Doku
  - Repo-Checks inklusive Build gruen

## File Structure

### Files to Create

- `dev/features/2026-07-03_issue-5-supabase-core-app-flows/spec.md`
- `dev/features/2026-07-03_issue-5-supabase-core-app-flows/implementation.md`

### Files to Modify

- `tests/supabase-migration-docs.test.ts`
- `docs/supabase-postgres-migration.md`
- `docs/IMPLEMENTATION_NOTES.md`

## Implementation Steps

### Step 1: RED Test for Core Flow Smoke Contract

Goal: Die fehlende Kernfluss-Dokumentation zuerst reproduzierbar rot machen.

Actions:

1. `tests/supabase-migration-docs.test.ts` um Anforderungen fuer den lokalen Supabase-Kernfluss-Smoketest erweitern.
2. Anforderungen auf konkrete Flow-Namen, Endpunkte/Pfade und Pass-/Skip-Regeln formulieren.

### Step 2: Extend the Supabase Runbook

Goal: Das Repo beschreibt die vollstaendige manuelle Kernfluss-Verifikation gegen lokale Supabase-Postgres-Baseline-Daten.

Actions:

1. `docs/supabase-postgres-migration.md` um eine eigene Kernfluss-Checklist ergaenzen.
2. Pro Schritt die Zielroute oder den API-Endpunkt und die erwartete Beobachtung angeben.
3. Klarstellen, wann Auth-, Mail- oder Storage-Mangel einen `skip` rechtfertigt.

### Step 3: Record Local Environment Limitation

Goal: Repo und spaetere Bearbeiter sehen sofort, warum in dieser Umgebung keine echte Supabase-Ausfuehrung enthalten ist.

Actions:

1. `docs/IMPLEMENTATION_NOTES.md` um die fehlende lokale Supabase-/Docker-Laufzeit in dieser Arbeitsumgebung ergaenzen.
2. Festhalten, dass der Repo-Slice deshalb die reproduzierbare Verifikationsdokumentation und nicht die live ausgefuehrte Smoke-Session liefert.

### Step 4: Verify and Close

Goal: Aenderung gegen Repo-Checks absichern und Workflow-Artefakte abschliessen.

Actions:

1. `npm test`
2. `npm run typecheck`
3. `npm run build`
4. `spec.md` auf `IMPLEMENTED` und `implementation.md` auf `COMPLETE` setzen.
5. Git-Commit mit Issue-Referenz erstellen.

## Code Architecture

- Kein Runtime-Code wird fuer dieses Issue erweitert, solange keine konkrete App-Regressionsursache im Repo nachweisbar ist.
- Der wichtigste Integrationspunkt ist das lokale Supabase-Runbook, weil dort der manuelle Nachweis fuer die bestehenden Prisma-/Next.js-Flows zusammenlaeuft.
- Der Regressionstest bleibt dateibasiert, damit das Repo auch ohne lokale Supabase-Laufzeit pruefbar bleibt.

## Technical Decisions

1. Die Kernfluss-Abdeckung wird als Repo-Contract ueber Runbook plus Test verankert, weil diese Umgebung keine echte Supabase-Laufzeit bereitstellt.
2. `docs/IMPLEMENTATION_NOTES.md` wird als expliziter Ort fuer die Umgebungsgrenze genutzt, damit `docs/supabase-postgres-migration.md` trotzdem das operative Zielbild sauber beschreibt.
3. `npm run build` bleibt Pflicht, weil das Issue App-Flows und operative Verifikation fuer produktionsnahe Pfade betrifft, auch wenn der konkrete Code-Slice dokumentationsgetrieben ist.

## Test Strategy

- RED/GREEN ueber `tests/supabase-migration-docs.test.ts`
- Repo-Checks: `npm test`, `npm run typecheck`, `npm run build`

## Edge Cases & Error Handling

1. Auth-Provider lokal nicht konfiguriert:
   - Runbook muss den Login-Schritt als `skip with reason` erlauben.
2. Upload-/Media-Storage lokal nicht konfiguriert:
   - Runbook muss den Media-Schritt als `skip with reason` erlauben.
3. Spaetere Bearbeiter fuehren die echte lokale Supabase-Session aus:
   - Dokumentation darf durch konkrete Pass-/Fail-Notizen ergaenzt werden, ohne den Regressionstest zu brechen.

## Validation Checklist

- [x] Nur Issue `#5` bearbeitet
- [x] Workflow-Artefakte fuer dieses Issue vorhanden
- [x] Kernfluss-Doku im Supabase-Runbook vorhanden
- [x] Umgebungsgrenze dokumentiert
- [x] `npm test` erfolgreich
- [x] `npm run typecheck` erfolgreich
- [x] `npm run build` erfolgreich
