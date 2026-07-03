Status: IMPLEMENTED
Last Modified: 2026-07-03

# Spec: Issue 3 Local Supabase Prisma Initialization

## Purpose/Goal

Issue `#3` soll sicherstellen, dass eine lokale Supabase-Postgres-Datenbank aus den vorhandenen Prisma-Migrationen initialisiert werden kann, ohne Prisma als Datenzugriffsschicht zu ersetzen und ohne echte lokale Secrets zu committen.

## Functional Requirements

1. Es wird ausschliesslich GitHub-Issue `#3` bearbeitet.
2. Das Repo enthaelt einen wiederholbaren Initialisierungspfad fuer eine leere lokale Supabase-Postgres-Datenbank auf Basis der vorhandenen Prisma-Migrationen.
3. Der Initialisierungspfad fuehrt Prisma-Validierung, Prisma-Migrationen und eine Statuspruefung aus.
4. Optionales Seeding bleibt moeglich, ist aber nicht zwingend fuer die Schema-Initialisierung.
5. Die Repo-Dokumentation beschreibt die benoetigte lokale `DATABASE_URL`, den Initialisierungsablauf und die Rueckstellung klar.
6. Ein automatisierter Test faellt, wenn Skript- oder Runbook-Guardrails fuer die lokale Prisma-Initialisierung entfernt werden.

## Technical Constraints

1. `workflows/` bleibt unveraendert.
2. Prisma bleibt die relationale Datenzugriffsschicht.
3. Prisma-Migrationen unter `prisma/migrations/` bleiben die Quelle fuer das relationale Schema.
4. Die lokale Initialisierung darf keine `prisma+postgres://`-URL verwenden.
5. Echte `.env`-Werte, Passwoerter und andere Secrets duerfen nicht committed werden.
6. Supabase Auth, RLS, Produktions-Cutover und Produktionsdatenmigration sind nicht Teil dieses Issues.

## Acceptance Criteria

1. Ein committed Skript oder gleichwertiger Repo-Mechanismus initialisiert eine lokale Supabase-Datenbank aus Prisma-Migrationen, sobald lokal eine direkte Postgres-`DATABASE_URL` gesetzt ist.
2. Das Skript oder der Mechanismus verweigert `prisma+postgres://` und offensichtlich nicht-lokale Ziele ohne expliziten Override.
3. `docs/supabase-postgres-migration.md` beschreibt den Initialisierungsablauf mit Prisma-Validierung, Migration, Statuspruefung, optionalem Seed und Rueckstellung.
4. Ein automatisierter Test deckt Skript- und Runbook-Anforderungen ab.
5. `npm test` und `npm run typecheck` laufen erfolgreich.
6. `npm run build` ist nicht erforderlich, sofern keine Runtime-, Next.js-, Prisma-Generierungs- oder Produktionsdateien geaendert werden.
7. Es gibt einen Commit mit `Sandcastle:`-Prefix.

## Out-of-Scope

1. Eine echte lokale Supabase-Instanz in dieser Umgebung starten
2. Produktions- oder Staging-Datenbanken migrieren
3. Runtime-Code unter `pages/`, `components/` oder `lib/` fuer Supabase-Datenzugriffe umbauen
4. Supabase Auth oder Row Level Security einfuehren
5. Historische Prisma-Migrationen inhaltlich aendern
