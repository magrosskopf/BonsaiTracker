# Postgres nach Supabase Schema- und Tabellenuebertragung

Status: IMPLEMENTED
Created: 2026-07-16
Last modified: 2026-07-16

## Purpose / Goal

Die bestehende relationale Bonsai-Tracker-Datenbankstruktur soll in eine Supabase-Postgres-Datenbank uebertragen werden, sodass die App ihre Tabellen, Enums, Indizes und Constraints im Supabase-Ziel vorfindet.

Prisma bleibt die kanonische Quelle fuer die relationale Schema-Struktur. Supabase wird als Postgres-Ziel verwendet, nicht als Ersatz fuer Prisma als Datenzugriffsschicht.

## Functional Requirements

1. Das Ziel-Supabase-Postgres muss alle committed Prisma-Migrationen aus `prisma/migrations/` angewendet haben.
2. Das Ziel muss nach der Uebertragung dieselben Prisma-Modelle, Enums, Relationen, Unique Constraints und Indizes unterstuetzen wie `prisma/schema.prisma`.
3. Die Uebertragung muss gegen einen direkten `postgres://`- oder `postgresql://`-Connection-String erfolgen.
4. `prisma+postgres://` darf nicht als Ziel fuer die Schema-Uebertragung verwendet werden.
5. Echte Secrets duerfen nicht committed oder in Dokumentation kopiert werden.
6. Vor einer nicht-lokalen Ziel-Datenbank muss explizit bestaetigt werden, dass dieses Supabase-Projekt beschrieben werden soll.
7. Datenimport bestehender Datensaetze ist nur enthalten, wenn dies explizit bestaetigt wird. Ohne diese Bestaetigung wird nur das Schema inklusive leerer Tabellenstruktur uebertragen.

## Technical Constraints

1. Stack: Next.js Pages Router, TypeScript, Prisma, Tailwind.
2. Prisma datasource: `provider = "postgresql"` mit `url = env("DATABASE_URL")`.
3. Bestehender Repo-Flow fuer lokale Supabase-Ziele: `scripts/init-local-supabase-db.sh`.
4. Das Skript blockiert nicht-lokale Ziele standardmaessig; ein Remote-Supabase-Ziel erfordert bewusstes `ALLOW_NON_LOCAL_DATABASE=1`.
5. Supabase API-Keys oder Service-Role-Keys reichen nicht fuer Prisma-DDL; benoetigt wird ein direkter Postgres-Connection-String zum Supabase-Projekt.
6. Supabase Auth, Row Level Security und Wechsel auf Supabase SDK fuer relationale Daten sind ausserhalb dieser Aufgabe.

## Acceptance Criteria

1. Prisma schema validation laeuft gegen das konfigurierte Ziel erfolgreich durch.
2. `prisma migrate deploy` wendet alle committed Migrationen auf das Ziel an oder meldet nachvollziehbar, dass sie bereits angewendet sind.
3. `prisma migrate status` meldet das Ziel als synchron mit den lokalen Migrationen.
4. Es gibt keine committed Secrets oder ungewollten Aenderungen an `workflows/`.
5. Falls nur Schema-Transfer beauftragt ist, bleiben bestehende Produktions- oder Betadaten unangetastet.
6. Falls ein Datenimport separat bestaetigt wird, wird vor dem Import ein Backup/Export-Schritt dokumentiert und ausgefuehrt.

## Verification Result

1. `bash scripts/init-local-supabase-db.sh` lief am 2026-07-16 gegen `127.0.0.1:54322` erfolgreich durch.
2. Alle 11 committed Prisma-Migrationen wurden angewendet.
3. `prisma migrate status` meldete: `Database schema is up to date!`
4. Kein Seed und kein Datenimport wurden ausgefuehrt.

## Out of Scope

1. Migration von NextAuth zu Supabase Auth.
2. Einfuehrung oder Aktivierung von RLS-Policies.
3. Wechsel von Prisma auf Supabase SDK fuer relationale App-Daten.
4. Storage-Bucket-Migration fuer Medien.
5. Produktiver Cutover der App-Konfiguration.
6. Datenimport ohne separate explizite Freigabe.

## Open Questions

1. Soll nur die leere Tabellenstruktur uebertragen werden, oder auch bestehende Datensaetze aus der alten Postgres-Datenbank?
   - Antwort: Nur leere Tabellenstruktur, keine bestehenden Datensaetze.
2. Ist das Ziel die lokale Supabase-Postgres-Instanz unter `127.0.0.1:54322` oder ein Remote-Supabase-Projekt?
   - Antwort: Lokale Supabase-Postgres-Instanz.
3. Falls Remote: welcher direkte Supabase-Postgres-Connection-String soll fuer `DATABASE_URL` verwendet werden?
   - Antwort: Nicht relevant.
4. Falls bestehende Daten importiert werden sollen: welche Quelle ist verbindlich und liegt ein aktuelles Backup vor?
   - Antwort: Nicht relevant, kein Datenimport.
