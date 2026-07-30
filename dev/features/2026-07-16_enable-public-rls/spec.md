# Public RLS fuer lokale Supabase-Tabellen

Status: IMPLEMENTED
Created: 2026-07-16
Last modified: 2026-07-16

## Purpose / Goal

Die in `public` angelegten Bonsai-Tracker-Tabellen sollen in Supabase nicht ohne Row Level Security bleiben. Ziel ist eine sichere Baseline, bei der Supabase API-Rollen ohne explizite Policies keinen Datenzugriff auf App-Tabellen erhalten.

Diese Aenderung ist Defense-in-Depth fuer Supabase. Die App bleibt weiterhin Prisma-/NextAuth-basiert und erzwingt fachliche Zugriffskontrolle in den bestehenden API-Routen.

## Functional Requirements

1. Fuer alle Bonsai-Tracker-App-Tabellen im `public`-Schema wird Row Level Security aktiviert.
2. Es werden keine offenen `anon`- oder `authenticated`-Policies angelegt.
3. Tabellenzugriff ueber Supabase API-Rollen soll ohne spaetere explizite Policies standardmaessig keine Zeilen lesen oder schreiben koennen.
4. Prisma-Migrationen bleiben die kanonische Schema-Aenderung.
5. Die lokale Supabase-Datenbank auf `127.0.0.1:54322` wird mit der neuen Migration aktualisiert.
6. Die App-Logik, NextAuth und Prisma-Zugriffe werden nicht umgebaut.

## RLS Table Scope

RLS wird fuer diese App-Tabellen aktiviert:

1. `User`
2. `Account`
3. `Session`
4. `Bonsai`
5. `SubEntry`
6. `Reminder`
7. `Post`
8. `PostEntryReference`
9. `PostLike`
10. `PostComment`
11. `VerificationToken`
12. `SignupAllowlist`
13. `WaitlistRequest`
14. `AuthRateLimitEvent`
15. `SignupSlot`

`_prisma_migrations` wird nicht veraendert.

## Technical Constraints

1. Stack: Next.js Pages Router, TypeScript, Prisma, Supabase Postgres.
2. Aktuelle App-Authentifizierung: NextAuth; keine Supabase Auth User IDs in der Datenbank.
3. Prisma nutzt einen direkten Postgres-Connection-String.
4. Per-User-RLS-Policies koennen nicht korrekt formuliert werden, solange die DB-Session nicht pro Request eine verifizierte App-User-ID setzt oder Supabase Auth eingefuehrt ist.
5. `FORCE ROW LEVEL SECURITY` wird in dieser Baseline nicht aktiviert, damit der bestehende Prisma-Owner-/Service-Zugriff nicht gebrochen wird.
6. Keine Secrets werden committed.

## Acceptance Criteria

1. Eine neue Prisma-Migration aktiviert RLS fuer alle Tabellen aus dem Scope.
2. Die Migration laeuft lokal gegen `127.0.0.1:54322` erfolgreich durch.
3. `prisma migrate status` meldet die lokale Datenbank als aktuell.
4. Eine Verifikationsabfrage auf `pg_class.relrowsecurity` bestaetigt `true` fuer alle Scope-Tabellen.
5. Es werden keine `CREATE POLICY`-Statements angelegt, die `anon` oder `authenticated` pauschal Zugriff geben.
6. `_prisma_migrations` bleibt ohne RLS-Aenderung.

## Out of Scope

1. Supabase Auth Migration.
2. Vollstaendige per-User-RLS-Policies fuer App-Daten.
3. DB-Session-Variable pro Prisma-Request.
4. `FORCE ROW LEVEL SECURITY`.
5. Storage-Bucket Policies.
6. Produktions-Cutover oder Remote-Supabase-Aenderungen.

## Security Note

Diese Baseline schuetzt vor versehentlichem Zeilenzugriff ueber Supabase API-Rollen ohne Policies. Sie ersetzt nicht die bestehende API-Autorisierung und ist noch kein vollstaendiges Mandanten-Isolationsmodell auf Datenbankebene.

## Verification Result

1. Migration `20260716000100_enable_public_rls` wurde lokal erfolgreich angewendet.
2. `prisma migrate status` meldete 12 Migrationen und `Database schema is up to date!`.
3. `pg_class.relrowsecurity` ist fuer alle 15 Scope-Tabellen `true`.
4. `pg_class.relforcerowsecurity` ist fuer alle 15 Scope-Tabellen `false`.
5. Die Migration enthaelt keine `CREATE POLICY`-Statements.
