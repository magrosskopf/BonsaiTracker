Status: COMPLETE
Last Modified: 2026-07-03

# Implementation Plan: Issue 2 Local Supabase DB Target Documentation

## Overview

Das Issue wird als dokumentationsgetriebene Vorbereitung der lokalen Supabase-Postgres-Migration behandelt. Die Aenderung bleibt auf Repo-Dokumentation und einen Regressionstest begrenzt, damit das lokale Datenbankziel und die Rueckstellung spaeter nicht wieder implizit werden.

## Reference

Spec: `/home/agent/workspace/dev/features/2026-07-03_issue-2-local-supabase-db-target/spec.md`

## File Structure

Zu erstellen:

- `/home/agent/workspace/dev/features/2026-07-03_issue-2-local-supabase-db-target/spec.md`
- `/home/agent/workspace/dev/features/2026-07-03_issue-2-local-supabase-db-target/implementation.md`
- `/home/agent/workspace/tests/supabase-migration-docs.test.ts`

Zu aendern:

- `/home/agent/workspace/.env.example`
- `/home/agent/workspace/docs/supabase-postgres-migration.md`

Unveraendert:

- Runtime-Code unter `pages/`, `components/`, `lib/`, `prisma/`
- lokale Env-Dateien und Secrets
- `workflows/`

## Implementation Steps

### Step 1: Issue und bestehende Planungsartefakte abgleichen

Arbeiten:

- `gh issue view 2` ausfuehren
- pruefen, ob ein Parent-PRD verlinkt ist
- den passenden Slice in `dev/features/2026-07-03_supabase-postgres-prisma-migration/` identifizieren

Ergebnis:

- Scope bleibt auf Dokumentation und Revertierbarkeit des lokalen DB-Ziels begrenzt

### Step 2: RED-Test fuer Repo-Dokumentation schreiben

Arbeiten:

- einen Test anlegen, der `DATABASE_URL` in `.env.example` validiert
- denselben Test die Revert- und Guardrail-Aussagen in `docs/supabase-postgres-migration.md` pruefen lassen

Ergebnis:

- der Altzustand mit `prisma+postgres://` faellt reproduzierbar durch

### Step 3: Doku auf den lokalen Supabase-Zielwert umstellen

Arbeiten:

- `.env.example` auf eine direkte lokale Postgres-URL umstellen
- `docs/supabase-postgres-migration.md` als lokales Runbook mit Guardrails und Rueckstellung umschreiben

Ergebnis:

- der committed Repo-Stand beschreibt das lokale Ziel klar und ohne Secrets

### Step 4: Verifikation

Arbeiten:

- `npm test`
- `npm run typecheck`

Ergebnis:

- der neue Test und die bestehenden Projektchecks laufen gruen

## Technical Decisions

1. Ein Repo-Test ist angemessen, weil das Issue ausschliesslich dokumentierte Konfiguration absichern soll.
2. `npm run build` wird bewusst nicht ausgefuehrt, weil weder Runtime-Code noch Next.js-Konfiguration, API-Routen oder Prisma-Generierung geaendert werden.
3. Die Beispiel-URL nutzt den lokalen Supabase-Standardport `54322`, bleibt aber explizit als Platzhalter fuer uncommittete lokale Werte dokumentiert.
4. Das bestehende uebergeordnete Feature `supabase-postgres-prisma-migration` bleibt in Draft/Teilumsetzung; nur dieses Issue-Artefakt wird als abgeschlossen markiert.

## Validation Checklist

1. Nur Issue `#2` bearbeitet
2. Kein Parent-PRD offen
3. Workflow-Artefakte fuer dieses Issue vorhanden
4. `.env.example` nutzt kein `prisma+postgres://` mehr
5. Revert-Pfad ist dokumentiert
6. `npm test` erfolgreich
7. `npm run typecheck` erfolgreich
