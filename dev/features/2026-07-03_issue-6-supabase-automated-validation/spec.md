# Spec: Issue 6 Supabase Automated Validation

**Status**: IMPLEMENTED  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Purpose/Goal

Issue `#6` soll den automatisierten Repo-Validierungspfad fuer die lokale Supabase-Postgres-Zielumgebung verankern, damit Entwickler die Standardchecks reproduzierbar gegen das lokale Supabase-Setup ausfuehren und Blocker klar von allgemeinen Repo-Problemen trennen koennen.

## Functional Requirements

1. Es wird ausschliesslich GitHub-Issue `#6` bearbeitet.
2. Das Repo enthaelt einen dedizierten, wiederholbaren Validierungspfad fuer die Supabase-gestuetzte lokale Umgebung.
3. Der Validierungspfad deckt mindestens `npm test`, `npm run typecheck`, `npm run build` und `npm run prisma -- migrate status` ab.
4. Die Doku beschreibt, wie fehlende lokale Supabase-Laufzeit oder Verbindungsprobleme als konkreter Blocker erkannt und dokumentiert werden.
5. Ein Regressionstest faellt, wenn die Validierungsdoku oder das Repo-Skript entfernt oder abgeschwaecht werden.

## Technical Constraints

1. `workflows/` bleibt unveraendert.
2. Es werden keine echten lokalen Secrets oder `.env`-Werte committed.
3. Prisma bleibt die relationale Datenzugriffsschicht und `migrate status` laeuft gegen eine direkte lokale Postgres-URL.
4. Breite Runtime- oder Produktaenderungen ausserhalb des lokalen Supabase-Validierungspfads sind nicht Teil dieses Issues.
5. Eine fehlende lokale Supabase-Laufzeit in dieser Arbeitsumgebung darf nicht durch Fake-Erfolge verdeckt werden.

## Acceptance Criteria

1. `docs/supabase-postgres-migration.md` enthaelt eine eigene Sektion fuer die automatisierte Validierung gegen lokales Supabase Postgres.
2. Die Doku nennt `npm test`, `npm run typecheck`, `npm run build` und `npm run prisma -- migrate status` explizit.
3. Das Repo enthaelt ein Skript, das diese Checks in der vorgesehenen Reihenfolge fuer eine direkte lokale Supabase-`DATABASE_URL` ausfuehrt.
4. Das Skript erzwingt lokale Guardrails analog zum Initialisierungspfad und bricht mit konkreter Fehlermeldung bei fehlender lokaler DB-Verbindung ab.
5. `tests/supabase-migration-docs.test.ts` deckt die neue Doku- und Skript-Erwartung ab.
6. `npm test`, `npm run typecheck` und `npm run build` laufen erfolgreich.
7. Es gibt einen Commit mit `Sandcastle:`-Prefix.

## Out-of-Scope

1. Lokale Supabase-CLI oder Docker in dieser Arbeitsumgebung nachruesten
2. Produktions- oder Staging-Validierung
3. Produktive Build-, API- oder Schemaaenderungen ohne direkten Bezug zum Validierungspfad
4. Issues ausserhalb von `#6` bearbeiten
