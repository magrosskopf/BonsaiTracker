# Spec: Issue 6 Supabase Automated Validation

**Status**: IMPLEMENTED  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-04

## Purpose/Goal

Issue `#6` soll den automatisierten Repo-Validierungspfad fuer die lokale Supabase-Postgres-Zielumgebung verankern, damit Entwickler die Standardchecks reproduzierbar gegen das lokale Supabase-Setup ausfuehren und Blocker klar von allgemeinen Repo-Problemen trennen koennen.

## Functional Requirements

1. Es wird ausschliesslich GitHub-Issue `#6` bearbeitet.
2. Das Repo enthaelt einen dedizierten, wiederholbaren Validierungspfad fuer die Supabase-gestuetzte lokale Umgebung.
3. Der bevorzugte Repo-Einstiegspunkt kann die benoetigte lokale Postgres-Laufzeit fuer den Validierungslauf selbst bereitstellen, wenn unter der lokalen Zieladresse noch nichts lauscht.
4. Der Validierungspfad deckt mindestens `npm test`, `npm run typecheck`, `npm run build` und `npm run prisma -- migrate status` ab.
5. Die Doku beschreibt, wie fehlende lokale Supabase-Laufzeit oder Verbindungsprobleme als konkreter Blocker erkannt und dokumentiert werden.
6. Ein Regressionstest faellt, wenn die Validierungsdoku oder das Repo-Skript entfernt oder abgeschwaecht werden.

## Technical Constraints

1. `workflows/` bleibt unveraendert.
2. Es werden keine echten lokalen Secrets oder `.env`-Werte committed.
3. Prisma bleibt die relationale Datenzugriffsschicht und `migrate status` laeuft gegen eine direkte lokale Postgres-URL.
4. Breite Runtime- oder Produktaenderungen ausserhalb des lokalen Supabase-Validierungspfads sind nicht Teil dieses Issues.
5. Eine fehlende lokale Supabase-Laufzeit in dieser Arbeitsumgebung darf nicht durch Fake-Erfolge verdeckt werden.
6. Der selbststartende Validierungspfad darf nur gegen direkte lokale `127.0.0.1`- oder `localhost`-Postgres-Ziele laufen.

## Acceptance Criteria

1. `docs/supabase-postgres-migration.md` enthaelt eine eigene Sektion fuer die automatisierte Validierung gegen lokales Supabase Postgres.
2. Die Doku nennt `npm test`, `npm run typecheck`, `npm run build` und `npm run prisma -- migrate status` explizit.
3. Das Repo enthaelt einen bevorzugten Einstiegspunkt `npm run validate:local-supabase`, der bei Bedarf eine lokale Postgres-Laufzeit fuer die dokumentierte Zieladresse hochfaehrt, die Prisma-Migrationen initialisiert und dann die Validierungschecks ausfuehrt.
4. Das bestehende Skript `scripts/validate-local-supabase-checks.sh` erzwingt weiterhin lokale Guardrails analog zum Initialisierungspfad.
5. `tests/supabase-migration-docs.test.ts` deckt die neue Doku- und Skript-Erwartung ab.
6. `npm test`, `npm run typecheck`, `npm run build` und `npm run validate:local-supabase` laufen erfolgreich.
7. Es gibt einen Commit mit `Sandcastle:`-Prefix.

## Out-of-Scope

1. Lokale Supabase-CLI oder Docker in dieser Arbeitsumgebung nachruesten
2. Produktions- oder Staging-Validierung
3. Produktive Build-, API- oder Schemaaenderungen ohne direkten Bezug zum Validierungspfad
4. Issues ausserhalb von `#6` bearbeiten
