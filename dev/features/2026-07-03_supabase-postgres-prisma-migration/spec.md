# Spec: Local Supabase Postgres Migration with Prisma

## Status

APPROVED

## Purpose/Goal

Bonsai Tracker soll lokal auf Supabase Postgres als relationale PostgreSQL-Datenbank umgestellt werden, waehrend Prisma weiterhin die serverseitige Datenzugriffsschicht und Prisma Migrations weiterhin die Schema-Quelle bleiben.

Ziel ist ein einfacheres Plattform-Setup als Grundlage fuer eine spaetere selbst gehostete Supabase-Umgebung. Diese Spec behandelt zuerst die lokale Datenbankumstellung. Supabase soll Postgres bereitstellen, ohne gleichzeitig eine riskante Auth-, RLS- oder Datenzugriffsarchitektur-Migration auszulösen.

## Current Situation

1. Die App nutzt Next.js Pages Router, TypeScript, Prisma, Tailwind und NextAuth.
2. Prisma ist aktuell die zentrale Datenzugriffsschicht ueber `lib/prisma.ts`.
3. Das Datenmodell liegt in `prisma/schema.prisma`.
4. Prisma Migrations liegen unter `prisma/migrations/`.
5. Die Runtime-Datenbank wird ueber `DATABASE_URL` konfiguriert.
6. `.env.example` dokumentiert aktuell noch einen Prisma-Accelerate-kompatiblen Platzhalter fuer `DATABASE_URL`.
7. Supabase Storage ist bereits als Upload-Backend implementiert.
8. Supabase Postgres ist bisher nur als Migrationspfad in `docs/supabase-postgres-migration.md` dokumentiert.
9. Auth laeuft weiterhin ueber NextAuth mit PrismaAdapter und soll in dieser Migration nicht auf Supabase Auth umgestellt werden.
10. Es gibt bereits eine lokale Supabase-Umgebung.
11. Die lokale Supabase-Datenbank darf leer starten.

## Functional Requirements

1. Lokales Supabase Postgres wird die einzige autoritative relationale Datenbank fuer die lokale Zielumgebung.
2. Prisma bleibt die einzige regulaere serverseitige Datenzugriffsschicht fuer App-Daten.
3. Prisma Migrations bleiben die Quelle fuer Schemaaenderungen.
4. Die bestehende Datenstruktur muss auf Supabase Postgres reproduzierbar erstellt werden koennen.
5. Die lokale Ziel-Datenbank darf leer initialisiert werden; Datenexport und Datenimport sind fuer diese lokale Phase nicht erforderlich.
6. Die App darf lokal nach der Umstellung nicht gegen zwei unabhaengige Datenbanken schreiben.
7. NextAuth-Tabellen muessen ueber Prisma Migrations korrekt angelegt werden:
   - `User`
   - `Account`
   - `Session`
   - `VerificationToken`
8. App-Tabellen muessen ueber Prisma Migrations korrekt angelegt werden:
   - Bonsais
   - Subentries
   - Reminders
   - Profiles/User-Profilfelder
   - Posts
   - Post likes
   - Post comments
   - Upload-Referenzen in Bildfeldern
   - Waitlist, Allowlist, Signup-Gating- und Rate-Limit-Daten, soweit im Prisma-Schema vorhanden
9. Die lokale Supabase-Connection-Konfiguration muss fuer Runtime und Migrationen eindeutig dokumentiert werden.
10. Der Umstieg muss lokal reversibel bleiben, indem die bisherige lokale `DATABASE_URL` wieder gesetzt werden kann.
11. Nach der lokalen Umstellung muessen Tests, Typecheck und ein manueller Smoke-Test gegen Supabase Postgres durchgefuehrt werden.
12. Die Spec muss bewusst festhalten, dass der Wechsel von Prisma auf Supabase SDK fuer Datenbankzugriffe nicht Teil dieser lokalen Umstellung ist.

## Technical Constraints

1. Supabase ersetzt nicht Prisma; Supabase hostet PostgreSQL.
2. `provider = "postgresql"` in `prisma/schema.prisma` bleibt bestehen.
3. Es wird keine Migration auf Supabase Auth in dieser Spec durchgefuehrt.
4. Es wird keine Umstellung auf direkte `@supabase/supabase-js` Datenbankzugriffe durchgefuehrt.
5. Row Level Security wird nicht als primaeres App-Sicherheitsmodell eingefuehrt.
6. Autorisierung bleibt serverseitig ueber bestehende Session- und Ownership-Pruefungen.
7. Supabase Storage bleibt separat von der Postgres-Migration zu betrachten.
8. Secrets duerfen nicht in Git committed werden.
9. Migrationen und Datenimporte duerfen nicht gegen eine falsche Produktionsdatenbank ausgefuehrt werden.
10. `workflows/` wird nicht geaendert.
11. Prisma Accelerate wird fuer die lokale Supabase-Zielumgebung nicht verwendet.
12. Self-hosted Supabase ist ein spaeteres Betriebsziel, aber nicht Teil der lokalen Implementierung.

## Architecture Decision: Prisma vs Supabase SDK

Die App bleibt fuer relationale App-Daten vorerst bei Prisma.

Begruendung:

1. Die bestehende App ist serverseitig um Prisma, NextAuth und API-Routen herum gebaut.
2. Das bestehende Datenmodell nutzt relationale Beziehungen, Prisma-Typen und Prisma Migrations.
3. Ein Wechsel auf Supabase SDK fuer Datenbankzugriffe waere kein reiner Datenbank-Host-Wechsel, sondern ein Rewrite der Datenzugriffsschicht.
4. Supabase SDK fuer Datenbankzugriffe waere vor allem dann attraktiv, wenn die App bewusst auf Supabase Auth, Row Level Security und direkte Client- oder PostgREST-Zugriffe umgestellt wird.
5. Diese zusaetzliche Migration wuerde Auth, Autorisierung, Tests und API-Design gleichzeitig beruehren und wird deshalb nicht mit der lokalen Postgres-Umstellung vermischt.
6. Supabase bleibt trotzdem sinnvoll, weil es Postgres, Studio, lokale Entwicklungsumgebung, Storage und spaeter eine selbst gehostete Plattform bereitstellen kann.

Supabase SDK bleibt in dieser Spec nur fuer Supabase-spezifische Plattformfunktionen erlaubt, zum Beispiel Storage. Es wird nicht fuer relationale App-Datenbankzugriffe eingefuehrt.

## Required Deliverables

1. Aktualisierte Dokumentation fuer lokales Supabase Postgres als Ziel-Datenbank.
2. Aktualisierte `.env.example` mit Supabase-Postgres-kompatiblen Hinweisen, ohne echte Secrets.
3. Ein konkreter Migrationsablauf fuer:
   - lokale Vorbereitung
   - lokale Supabase-Vorbereitung
   - Schema-Migration
   - Verifikation
   - lokale Umschaltung
   - lokale Rueckstellung
4. Die klare Entscheidung, dass Prisma lokal direkt gegen Supabase Postgres laeuft und Prisma Accelerate nicht verwendet wird.
5. Eine klare Entscheidung, welche Schritte Sandcastle/Factory automatisiert und welche Schritte im interaktiven Terminal manuell ausgefuehrt werden.
6. Eine Verifikationscheckliste fuer Tests und Smoke-Test.

## Proposed Migration Shape

### Phase 1: Preparation

1. Lokale Supabase-Umgebung identifizieren.
2. Lokalen Supabase-Status pruefen.
3. Lokalen Postgres-Connection-String fuer Runtime und Migration erfassen.
4. Bisherige lokale `DATABASE_URL` sichern, damit sie bei Bedarf wiederhergestellt werden kann.
5. Lokale Zielumgebung als erste und einzige Implementierungsumgebung dieser Spec bestaetigen.

### Phase 2: Schema on Supabase

1. Lokale Supabase-Postgres-Datenbank leer bereitstellen.
2. Prisma Client gegen die Zielkonfiguration generieren.
3. Prisma Migrations gegen lokales Supabase Postgres ausfuehren.
4. Migrationsergebnis pruefen.
5. Sicherstellen, dass Extensions, Indizes und Constraints korrekt vorhanden sind.

### Phase 3: Local Seed and Baseline Data

1. Kein Export aus der bisherigen Datenbank ist fuer die lokale Phase erforderlich.
2. Kein Import in Supabase Postgres ist fuer die lokale Phase erforderlich.
3. Falls die App lokale Startdaten braucht, wird `prisma/seed.ts` gegen Supabase Postgres ausgefuehrt.
4. Seed-Ergebnis wird geprueft.
5. Sequenzen und Relationsintegritaet werden durch Migration und Seed validiert.

### Phase 4: App Verification

1. App mit lokaler Supabase-`DATABASE_URL` starten.
2. `npm test` ausfuehren.
3. `npm run typecheck` ausfuehren.
4. `npm run build` ausfuehren.
5. Manuellen Smoke-Test ausfuehren:
   - Login
   - Dashboard
   - Bonsai anzeigen
   - Bonsai erstellen oder bearbeiten
   - Subentry anzeigen oder erstellen
   - Reminder anzeigen oder erstellen
   - Feed/Post-Funktion pruefen
   - Upload-Referenzen und Medienabruf pruefen
   - Waitlist/Signup-Gating pruefen

### Phase 5: Local Switch

1. Lokale `.env.local` oder lokale Runtime-Konfiguration auf Supabase Postgres setzen.
2. Lokale App neu starten.
3. Healthcheck und Smoke-Test ausfuehren.
4. Bisherige lokale `DATABASE_URL` dokumentiert behalten.

### Phase 6: Local Revert

Rueckstellung ist erforderlich, wenn die lokale App gegen Supabase Postgres nicht stabil laeuft.

Rueckstellungs-Schritte:

1. Lokalen Dev-Server stoppen.
2. Lokale `DATABASE_URL` wieder auf den vorherigen Wert setzen.
3. Lokalen Dev-Server neu starten.
4. Healthcheck ausfuehren.
5. Smoke-Test ausfuehren.
6. Ursache analysieren, bevor ein neuer lokaler Supabase-Versuch gestartet wird.

## Acceptance Criteria

1. `prisma migrate deploy` oder ein lokal geeigneter Prisma-Migrationsbefehl kann erfolgreich gegen lokales Supabase Postgres ausgefuehrt werden.
2. Die lokale Supabase-Datenbank enthaelt alle erwarteten Tabellen, Indizes und Constraints aus dem Prisma-Schema.
3. Optionaler lokaler Seed laeuft erfolgreich gegen Supabase Postgres.
4. Prisma Client kann gegen lokales Supabase Postgres generiert und genutzt werden.
5. NextAuth-Login funktioniert gegen lokales Supabase Postgres oder ist lokal mit den vorhandenen Provider-Secrets nachvollziehbar konfigurierbar.
6. Neue lokale User- und App-Daten koennen in Supabase Postgres erstellt und gelesen werden.
7. Upload-Referenzen bleiben im lokalen Flow lesbar, soweit Storage lokal konfiguriert ist.
8. `npm test` laeuft erfolgreich.
9. `npm run typecheck` laeuft erfolgreich.
10. `npm run build` laeuft erfolgreich.
11. Der manuelle Smoke-Test gegen lokales Supabase Postgres ist bestanden.
12. Lokale Entwicklung nutzt nach der Umstellung Supabase Postgres als autoritative relationale Datenbank.
13. Lokale Rueckstellung auf die vorherige `DATABASE_URL` ist dokumentiert und praktisch moeglich.
14. Keine Secrets wurden committed.

## Out-of-Scope

1. Migration von NextAuth zu Supabase Auth.
2. Austausch von Prisma durch direkte Supabase-Client-Datenzugriffe.
3. Einfuehrung von Row Level Security als App-Autorisierungsmodell.
4. Aenderungen am Produktdatenmodell, ausser sie sind zwingend fuer Supabase-Postgres-Kompatibilitaet erforderlich.
5. Rework der Upload-Storage-Architektur.
6. UI-Redesign.
7. Aenderungen an `workflows/`.
8. Produktiver Cutover.
9. Migration bestehender Produktivdaten.
10. Einrichtung einer selbst gehosteten Supabase-Produktionsumgebung.

## Open Questions

1. Welche lokalen Supabase-Kommandos und Ports sind in diesem Projekt tatsaechlich verfuegbar?
2. Welche lokale `DATABASE_URL` soll als Zielwert verwendet werden?
3. Soll `prisma db seed` Teil der lokalen Umstellung sein?
4. Welche Schritte sollen in Sandcastle/Factory automatisiert werden?
5. Welche Schritte sollen bewusst im interaktiven Terminal mit dir ausgefuehrt werden?

## Resolved Questions

1. Prisma bleibt fuer relationale App-Daten erhalten.
2. Supabase SDK ersetzt Prisma in dieser Spec nicht.
3. Prisma verbindet sich lokal direkt mit Supabase Postgres; Prisma Accelerate wird lokal nicht verwendet.
4. Die lokale Supabase-Datenbank darf leer starten.
5. Es gibt bereits ein lokales Supabase.
6. Die erste Umstellung passiert lokal.
7. Supabase Free oder Pro ist fuer die lokale Phase nicht relevant.
8. Spaetere Zielrichtung ist selbst gehostetes Supabase, aber nicht Teil dieser Spec.

## Sandcastle/Factory vs Interactive Terminal Decision

Diese Entscheidung wird vor dem Implementation-Plan finalisiert.

Vorlaeufige Einordnung:

1. Sandcastle/Factory eignet sich fuer wiederholbare Repo-Arbeit:
   - Dokumentation aktualisieren
   - `.env.example` aktualisieren
   - Migrationsskripte oder Checklisten vorbereiten
   - Tests/Smoke-Test-Hilfen ergaenzen
   - CI-nahe Checks laufen lassen
2. Das interaktive Terminal eignet sich fuer sensible, zustandsbehaftete Operationen:
   - echte Supabase-Secrets setzen
   - echte Datenbankverbindung testen
   - produktive Exporte erstellen
   - produktive Imports ausfuehren
   - Cutover durch Umstellen von Environment Variables
   - Rollback-Entscheidungen waehrend des Wartungsfensters

## Review Notes

Diese Spec ist absichtlich konservativ. Der Umbau wird als Postgres-Hosting-Migration behandelt, nicht als Auth-, RLS- oder Client-Datenzugriffs-Migration.
