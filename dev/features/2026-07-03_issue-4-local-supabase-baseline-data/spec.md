# Issue 4: Local Supabase Baseline Data

**Status**: IMPLEMENTED  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Purpose/Goal

Ergaenze den bestehenden lokalen Supabase-Postgres-Flow so, dass die App mit committed Baseline-Daten startbar und fuer lokale Smoke-Tests sinnvoll befuellt ist.

## Functional Requirements

1. Das Repo muss ein idempotentes Prisma-Seed fuer lokale Baseline-Daten enthalten.
2. Das Seed muss mindestens einen bestehenden Demo-Benutzer fuer Login-/Auth-Smoketests anlegen.
3. Das Seed muss fuer diesen Demo-Benutzer fachliche Basisdaten anlegen, sodass Dashboard, Bonsai-Detail, Reminder und Community-Feed lokal nicht leer starten muessen.
4. Das Seed darf wiederholtes Ausfuehren nicht mit Duplikaten oder inkonsistenten Beziehungen bestrafen.
5. Die bestehende lokale Supabase-Runbook-Dokumentation muss den Seed-Flow und die erwarteten Baseline-Daten konkret beschreiben.
6. Die Doku muss klar machen, dass die Daten lokal fuer Smoke-Tests gedacht sind und keine echten Secrets oder produktiven Inhalte enthalten.

## Technical Constraints

- Prisma bleibt die relationale Datenzugriffsschicht.
- Der bestehende lokale Initialisierungspfad ueber `scripts/init-local-supabase-db.sh` bleibt der empfohlene Repo-Flow.
- Es werden keine Aenderungen an `workflows/` vorgenommen.
- Es werden keine echten `.env`-Werte, Tokens oder Passwoerter dokumentiert oder committed.
- Die Seed-Daten muessen mit dem vorhandenen Prisma-Schema kompatibel sein.

## Acceptance Criteria

1. `prisma/seed.ts` beschreibt und erzeugt eine lokale Baseline fuer mindestens:
   - einen Demo-Benutzer
   - mindestens einen Bonsai
   - mindestens einen SubEntry
   - mindestens einen Reminder
   - mindestens einen Community-Post
2. Das Seed ist idempotent oder explizit so aufgesetzt, dass Wiederholung zu einem stabilen Ergebnis fuehrt.
3. `docs/supabase-postgres-migration.md` beschreibt, dass `PRISMA_SEED=1 bash scripts/init-local-supabase-db.sh` lokale Baseline-Daten erzeugt und welche Smoke-Test-Erwartungen daraus folgen.
4. Automatisierte Tests decken Seed- und Doku-Regressionen fuer diesen lokalen Flow ab.

## Out-of-Scope

1. Umstellung von NextAuth auf Supabase Auth.
2. Produktions-Cutover oder Live-Datenimporte.
3. Neue Laufzeitpfade fuer relationale Datenzugriffe ausserhalb von Prisma.
4. Allgemeine Produkt- oder UI-Aenderungen ausserhalb der minimal benoetigten lokalen Baseline-Datenfaehigkeit.
