# Implementierungsplan: Public RLS Baseline

Status: COMPLETE
Created: 2026-07-16
Last modified: 2026-07-16

## Overview

Eine neue Prisma-Migration aktiviert Row Level Security fuer alle Bonsai-Tracker-App-Tabellen im `public`-Schema. Es werden keine Policies angelegt und kein App-Code geaendert.

## Reference

Spec: `dev/features/2026-07-16_enable-public-rls/spec.md`

Key Acceptance Criteria:

1. RLS ist fuer alle Scope-Tabellen aktiviert.
2. Lokale Supabase-Datenbank ist nach `migrate deploy` aktuell.
3. Keine offenen `anon`-/`authenticated`-Policies werden angelegt.
4. `_prisma_migrations` bleibt unveraendert.

## File Structure

Zu erstellen:

1. `prisma/migrations/20260716000100_enable_public_rls/migration.sql`

Zu aktualisieren:

1. `dev/features/2026-07-16_enable-public-rls/spec.md`
2. `dev/features/2026-07-16_enable-public-rls/implementation.md`

## Implementation Steps

1. Migration-Verzeichnis `prisma/migrations/20260716000100_enable_public_rls/` erstellen.
2. `migration.sql` mit `ALTER TABLE public."<Table>" ENABLE ROW LEVEL SECURITY;` fuer alle Scope-Tabellen anlegen.
3. Keine `CREATE POLICY`-Statements hinzufuegen.
4. Migration lokal ausfuehren:
   - `DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" npm run prisma -- migrate deploy`
5. Migrationstatus pruefen:
   - `DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" npm run prisma -- migrate status`
6. RLS-Status pruefen:
   - `pg_class.relrowsecurity = true` fuer alle Scope-Tabellen.
   - `_prisma_migrations` wird nicht in die Scope-Pruefung aufgenommen.
7. Workflow-Artefakte abschliessen.

## Code Architecture

Keine neue Code-Architektur. Die Aenderung liegt ausschliesslich in einer SQL-basierten Prisma-Migration.

## Technical Decisions

1. RLS wird via Migration statt manuell in Supabase Studio aktiviert, damit die Aenderung reproduzierbar bleibt.
2. Es werden keine Policies erstellt, weil die App noch kein Supabase-Auth- oder DB-Session-User-Konzept hat.
3. `FORCE ROW LEVEL SECURITY` wird nicht aktiviert, um bestehende Prisma-Owner-/Service-Verbindungen nicht zu brechen.
4. Bestehende API-Autorisierung bleibt massgeblich fuer App-Zugriffe.

## Integration Points

1. Prisma Migrations verwalten die lokale Supabase-Postgres-Struktur.
2. NextAuth bleibt die Authentifizierungsschicht.
3. Supabase API-Zugriffe auf Tabellen bleiben ohne spaetere Policies restriktiv.

## Test Strategy

1. `npm run prisma -- migrate deploy` gegen lokale Supabase-Datenbank.
2. `npm run prisma -- migrate status` gegen lokale Supabase-Datenbank.
3. SQL-Verifikation ueber `pg_class`.
4. Kein voller App-Testlauf erforderlich, weil keine App-Codepfade geaendert werden.

## Edge Cases & Error Handling

1. Tabelle fehlt:
   - Migration bricht ab; dann Schemazustand zuerst klaeren.
2. Migration bereits angewendet:
   - `migrate deploy` soll idempotent ueber Prisma-Migrationshistorie sein.
3. Prisma-Zugriff wird gebrochen:
   - Erwartet wird kein Bruch, weil kein `FORCE RLS` gesetzt wird und Prisma als direkter DB-User arbeitet.
4. Supabase API braucht spaeter Zugriff:
   - Separate Spec fuer konkrete Policies erstellen.

## Validation Checklist

1. Neue Migration existiert.
2. Migration enthaelt nur `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
3. Lokales `migrate deploy` erfolgreich.
4. Lokales `migrate status` aktuell.
5. SQL-Verifikation bestaetigt RLS fuer alle Scope-Tabellen.
6. `spec.md` Status am Ende `IMPLEMENTED`.
7. `implementation.md` Status am Ende `COMPLETE`.

## Verification Result

1. Erstellt: `prisma/migrations/20260716000100_enable_public_rls/migration.sql`.
2. Lokales `migrate deploy` gegen `127.0.0.1:54322` war erfolgreich.
3. Lokales `migrate status` meldete `Database schema is up to date!`.
4. SQL-Verifikation bestaetigte RLS fuer alle 15 Scope-Tabellen.
5. Keine Policies und kein `FORCE ROW LEVEL SECURITY` wurden gesetzt.
