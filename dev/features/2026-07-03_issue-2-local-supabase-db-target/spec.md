Status: IMPLEMENTED
Last Modified: 2026-07-03

# Spec: Issue 2 Local Supabase DB Target Documentation

## Purpose/Goal

Issue `#2` soll den lokalen Supabase-Postgres-Zielwert fuer Prisma dokumentieren und die lokale Rueckstellung auf die bisherige Datenbankkonfiguration nachvollziehbar machen, ohne Runtime-Code oder echte lokale Secrets zu aendern.

## Functional Requirements

1. Es wird ausschliesslich GitHub-Issue `#2` bearbeitet.
2. `.env.example` dokumentiert fuer `DATABASE_URL` eine direkte lokale Supabase-Postgres-URL statt eines Prisma-Accelerate-Platzhalters.
3. `docs/supabase-postgres-migration.md` beschreibt die lokale Ziel-Datenbank, den Prisma-only-Ansatz und die Rueckstellung.
4. Die Dokumentation weist explizit darauf hin, dass `.env`, `.env.local`, Passwoerter und andere lokale Secrets nicht committed werden duerfen.
5. Es werden keine Runtime-Dateien unter `pages/`, `lib/`, `components/` oder `prisma/` geaendert, soweit dieses Issue betroffen ist.
6. Ein automatisierter Test deckt die Repo-Dokumentation fuer diesen lokalen Zielwert ab.

## Technical Constraints

1. `workflows/` bleibt unveraendert.
2. Prisma bleibt die relationale Datenzugriffsschicht.
3. Prisma Accelerate ist fuer das lokale Supabase-Ziel nicht Teil der dokumentierten Zielkonfiguration.
4. Reale Env-Werte duerfen weder gelesen noch committed werden.

## Acceptance Criteria

1. `.env.example` enthaelt eine sichere lokale Supabase-Postgres-Placeholder-URL.
2. `docs/supabase-postgres-migration.md` dokumentiert den lokalen Zielwert und den Revert-Pfad.
3. Ein Test faellt, wenn die Repo-Dokumentation wieder auf `prisma+postgres://` oder eine fehlende Rueckstellung zurueckfaellt.
4. `npm test` und `npm run typecheck` laufen erfolgreich.
5. Kein Build ist erforderlich, weil keine Build- oder Runtime-Dateien geaendert werden.
6. Es gibt einen Commit mit `Sandcastle:`-Prefix.

## Out-of-Scope

1. Prisma-Migrationen gegen die lokale Supabase-Datenbank ausfuehren
2. Seed-Daten erzeugen
3. App-Laufzeit oder Produktionskonfiguration umstellen
4. Weitere Supabase-Migrations-Issues bearbeiten
