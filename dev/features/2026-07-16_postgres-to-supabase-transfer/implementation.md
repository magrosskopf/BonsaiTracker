# Implementierungsplan: Lokale Supabase Schema-Initialisierung

Status: COMPLETE
Created: 2026-07-16
Last modified: 2026-07-16

## Overview

Die lokale Supabase-Postgres-Datenbank wird mit den committed Prisma-Migrationen initialisiert. Es werden keine bestehenden Daten importiert und kein Seed ausgefuehrt.

## Reference

Spec: `dev/features/2026-07-16_postgres-to-supabase-transfer/spec.md`

Key Acceptance Criteria:

1. Prisma schema validation laeuft gegen das konfigurierte lokale Ziel erfolgreich durch.
2. `prisma migrate deploy` wendet alle committed Migrationen auf das Ziel an oder meldet, dass sie bereits angewendet sind.
3. `prisma migrate status` meldet das Ziel als synchron.
4. Keine Secrets oder Workflow-Aenderungen werden committed.
5. Keine bestehenden Daten werden importiert.

## File Structure

Zu aendern:

1. `dev/features/2026-07-16_postgres-to-supabase-transfer/spec.md`
2. `dev/features/2026-07-16_postgres-to-supabase-transfer/implementation.md`

Zu verwenden:

1. `prisma/schema.prisma`
2. `prisma/migrations/`
3. `scripts/init-local-supabase-db.sh`
4. `.env` oder `.env.local` mit lokalem `DATABASE_URL`

## Implementation Steps

1. Lokale Zielkonfiguration pruefen:
   - `DATABASE_URL` muss direkt auf `postgresql://postgres:postgres@127.0.0.1:54322/postgres` oder ein aequivalentes lokales Supabase-Postgres zeigen.
   - `PRISMA_SEED` bleibt unset oder `0`.
2. Lokale Supabase-Erreichbarkeit pruefen.
3. `bash scripts/init-local-supabase-db.sh` ausfuehren.
4. Ergebnis pruefen:
   - `prisma validate` erfolgreich.
   - `prisma migrate deploy` erfolgreich.
   - `prisma migrate status` erfolgreich.
5. Falls das lokale `public`-Schema nicht leer ist, duerfen nach expliziter Freigabe bestehende lokale Fremdtabellen geloescht werden, um ein leeres Prisma-Ziel herzustellen.
6. Optional nur bei Bedarf einzelne Tabellenanzahl gegen das lokale Ziel pruefen; keine Seed- oder Importdaten schreiben.
7. Status der Workflow-Artefakte aktualisieren.

## Code Architecture

Es wird keine neue App-Architektur eingefuehrt. Prisma bleibt Schema- und Migrationsschicht. Das lokale Supabase-Postgres ist nur ein PostgreSQL-Ziel fuer `prisma migrate deploy`.

## Technical Decisions

1. Kein `prisma db push`, weil die committed Migrationen die nachvollziehbare Schemahistorie darstellen.
2. Kein `PRISMA_SEED=1`, weil explizit nur leere Tabellen gewuenscht sind.
3. Kein `ALLOW_NON_LOCAL_DATABASE=1`, weil das Ziel lokal ist.
4. Keine Aenderung an `.env`, solange vorhandene lokale Werte bereits passen.
5. `public.rag_chunks` wird geloescht, weil der Nutzer diese lokale destruktive Aktion explizit freigegeben hat und Prisma `migrate deploy` sonst mit `P3005` blockiert.

## Integration Points

1. Prisma liest `DATABASE_URL` aus der lokalen Umgebung.
2. `scripts/init-local-supabase-db.sh` kapselt Validierung, Migration und Statuspruefung.
3. Die App kann danach unveraendert ueber Prisma gegen dieselbe lokale Datenbank laufen.

## Test Strategy

1. Primaerer Nachweis: erfolgreicher Lauf von `bash scripts/init-local-supabase-db.sh`.
2. Migrationstatus: im Skript enthalten durch `npm run prisma -- migrate status`.
3. Kein voller App-Testlauf erforderlich, da nur leere lokale Schema-Initialisierung beauftragt ist.

## Edge Cases & Error Handling

1. Lokale Supabase-Datenbank nicht erreichbar:
   - Abbrechen und die konkrete Verbindungsfehlermeldung melden.
2. `DATABASE_URL` nicht gesetzt:
   - Skript bricht mit Guardrail ab.
3. Ziel ist nicht lokal:
   - Skript bricht ohne `ALLOW_NON_LOCAL_DATABASE=1` ab.
4. Migrationen bereits angewendet:
   - Akzeptiert, wenn `migrate status` synchron meldet.
5. Vorhandene lokale Fremdtabellen:
   - Nur nach expliziter Freigabe loeschen; kein Seed/import ausfuehren.

## Validation Checklist

1. `bash scripts/init-local-supabase-db.sh` erfolgreich.
2. Kein Seed-Lauf.
3. Keine Datenimport-Kommandos.
4. `git status --short` zeigt nur erwartete Workflow-Artefakte und bestehende unberuehrte User-Aenderungen.
5. `spec.md` Status am Ende auf `IMPLEMENTED`.
6. `implementation.md` Status am Ende auf `COMPLETE`.

## Verification Result

1. Der erste Migrationslauf wurde durch Prisma `P3005` blockiert, weil `public.rag_chunks` bereits im lokalen Ziel existierte.
2. Nach expliziter Nutzerfreigabe wurde `public.rag_chunks` lokal geloescht.
3. Der zweite Lauf von `bash scripts/init-local-supabase-db.sh` war erfolgreich.
4. Angewendet wurden alle 11 committed Migrationen bis `20260705201605_simplify_bonsai_creation_defaults`.
5. `prisma migrate status` meldete `Database schema is up to date!`.
6. Die erwarteten App-Tabellen plus `_prisma_migrations` existieren im lokalen `public`-Schema.
