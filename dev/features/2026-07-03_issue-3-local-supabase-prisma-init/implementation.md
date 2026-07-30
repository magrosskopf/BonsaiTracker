Status: COMPLETE
Last Modified: 2026-07-03

# Implementation Plan: Issue 3 Local Supabase Prisma Initialization

## Overview

Dieses Issue liefert den kleinsten wiederholbaren Repo-Slice, mit dem eine lokale Supabase-Postgres-Datenbank aus bestehenden Prisma-Migrationen initialisiert werden kann: ein Initialisierungsskript mit Guardrails, ein aktualisiertes Runbook und Regressionstests fuer beide.

## Reference

Spec: `/home/agent/workspace/dev/features/2026-07-03_issue-3-local-supabase-prisma-init/spec.md`

Wesentliche Acceptance Criteria:

1. Lokale Schema-Initialisierung ueber Prisma-Migrationen ist im Repo beschrieben und ausfuehrbar.
2. Direkte Postgres-URL ist Pflicht; `prisma+postgres://` wird abgewiesen.
3. Das Ziel bleibt lokal, ausser jemand setzt bewusst einen expliziten Override.
4. Tests und Typecheck laufen gruen.

## File Structure

Zu erstellen:

- `/home/agent/workspace/dev/features/2026-07-03_issue-3-local-supabase-prisma-init/spec.md`
- `/home/agent/workspace/dev/features/2026-07-03_issue-3-local-supabase-prisma-init/implementation.md`
- `/home/agent/workspace/scripts/init-local-supabase-db.sh`

Zu aendern:

- `/home/agent/workspace/docs/supabase-postgres-migration.md`
- `/home/agent/workspace/tests/supabase-migration-docs.test.ts`

Unveraendert:

- `workflows/`
- `prisma/schema.prisma`
- historische Dateien unter `prisma/migrations/`
- lokale Secret-Dateien
- Runtime-Code unter `pages/`, `components/`, `lib/`

## Implementation Steps

### Step 1: RED-Test fuer Initialisierungspfad schreiben

Arbeiten:

- den bestehenden Supabase-Doku-Test um Anforderungen an den Initialisierungspfad erweitern
- pruefen, dass das Repo ein Init-Skript mit Prisma-Validierung, `migrate deploy`, `migrate status`, optionalem Seed und Local-Guardrails erwartet
- pruefen, dass das Runbook dieses Skript und die Rueckstellung beschreibt

Ergebnis:

- der Test faellt, solange Skript und neue Runbook-Inhalte fehlen

### Step 2: Initialisierungsskript implementieren

Arbeiten:

- `scripts/init-local-supabase-db.sh` mit `bash`-Guardrails anlegen
- `DATABASE_URL` auf Vorhandensein, direktes Postgres-Schema und lokales Ziel pruefen
- `npm run prisma -- validate`, `migrate deploy` und `migrate status` ausfuehren
- optionales Seed ueber ein Environment-Flag erlauben

Ergebnis:

- Entwickler koennen mit gesetzter lokaler Supabase-`DATABASE_URL` die DB reproduzierbar initialisieren

### Step 3: Runbook auf konkrete Initialisierung aktualisieren

Arbeiten:

- `docs/supabase-postgres-migration.md` von reiner Ziel-Dokumentation auf Initialisierungs-Runbook erweitern
- Skriptaufruf, manuelle Prisma-Kommandos, Seed-Option, Verifikation und Rueckstellung dokumentieren

Ergebnis:

- die Repo-Doku beschreibt einen konkreten, sicheren Local-Init-Flow

### Step 4: Verifikation

Arbeiten:

- `npm test`
- `npm run typecheck`
- Prisma-CLI-Pruefung mit Platzhalter-`DATABASE_URL`: `npm run prisma -- validate`

Ergebnis:

- Tests und Typecheck laufen, und der Prisma-Schema-Check ist mit direkter Postgres-URL gruen

## Technical Decisions

1. Ein Shell-Skript ist der pragmatischste Repo-Mechanismus, weil es keine App-Runtime aendert und direkt die vorhandenen Prisma-Kommandos kapselt.
2. Das Skript blockiert `prisma+postgres://`, weil Issue `#2` und das uebergeordnete Feature fuer lokal direkte Postgres-Verbindungen festgelegt haben.
3. Das Skript blockiert standardmaessig nicht-lokale Hosts, damit Migrationen nicht versehentlich gegen entfernte Datenbanken laufen.
4. `npm run build` wird bewusst nicht ausgefuehrt, weil keine Next.js-Seiten, API-Routen, Prisma-Generierungskonfiguration oder sonstiger Produktions-Build-Pfad geaendert wird.

## Validation Checklist

1. Nur Issue `#3` bearbeitet
2. Kein Parent-PRD offen
3. Workflow-Artefakte fuer dieses Issue vorhanden
4. Init-Skript vorhanden und mit Guardrails versehen
5. Runbook beschreibt Initialisierung statt nur Zukunftsnotiz
6. `npm test` erfolgreich
7. `npm run typecheck` erfolgreich
