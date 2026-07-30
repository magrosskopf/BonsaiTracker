# Spec: Issue 7 Local Supabase Operating Runbook

**Status**: IMPLEMENTED  
**Created**: 2026-07-04  
**Last Modified**: 2026-07-04

## Purpose/Goal

Issue `#7` soll das lokale Supabase-Betriebs-Runbook auf einen abgeschlossenen Repo-Stand bringen, damit ein Entwickler die beobachteten lokalen Befehle, den verifizierten Port, die dokumentierten Skip-Gruende und die Rueckstellung ohne Rueckgriff auf Issue-Historie nachvollziehen kann.

## Functional Requirements

1. Es wird ausschliesslich GitHub-Issue `#7` bearbeitet.
2. `docs/supabase-postgres-migration.md` dokumentiert die in diesem Repo-Slice tatsaechlich beobachtete lokale Validierungsausfuehrung.
3. Das Runbook nennt explizit den beobachteten lokalen Datenbank-Host/-Port und die erfolgreich gelaufenen Kernbefehle fuer Migration und Repo-Checks.
4. Das Runbook haelt fest, welche interaktiven Smoke-Test-Teile in dieser Arbeitsumgebung als `skip` dokumentiert bleiben und warum.
5. Zukuenftige Self-Hosted-Supabase-Arbeit und Produktions-Cutover werden klar als spaetere Arbeit abgetrennt.
6. Ein Regressionstest faellt, wenn diese Abschlussnotizen aus dem Runbook verschwinden oder abgeschwaecht werden.

## Technical Constraints

1. `workflows/` bleibt unveraendert.
2. Es werden keine echten `.env`-Werte, OAuth-Secrets, Mail-Secrets oder Storage-Secrets committed.
3. Nur Issue `#7` wird bearbeitet; breite Runtime-, Schema- oder Produktaenderungen sind nicht Teil dieses Slices.
4. Prisma bleibt die relationale Datenzugriffsschicht; das Issue fuehrt keine neuen Datenzugriffspfade ein.
5. Dokumentierte Beobachtungen muessen auf dem in dieser Repo-Umgebung wirklich ausgefuehrten lokalen Pfad beruhen.

## Acceptance Criteria

1. `docs/supabase-postgres-migration.md` enthaelt eine Sektion fuer die beobachtete lokale Ausfuehrung in diesem Repo-Slice.
2. Diese Sektion dokumentiert den erfolgreichen Lauf von `npm run validate:local-supabase`, den temporaeren Listener auf `127.0.0.1:54322` und die erfolgreichen Prisma-Kommandos.
3. Das Runbook enthaelt dokumentierte `skip`- und Caveat-Notizen fuer Auth-, Browser-/Session- und Storage-abhaengige Schritte in dieser Arbeitsumgebung.
4. Das Runbook trennt spaetere Self-Hosted-Supabase-Beobachtungen und Produktions-Cutover explizit von diesem Issue.
5. `tests/supabase-migration-docs.test.ts` deckt diese Abschlussnotizen als Regression ab.
6. `npm test`, `npm run typecheck` und `npm run build` laufen erfolgreich.
7. Es gibt einen Commit mit `Sandcastle:`-Prefix.

## Out-of-Scope

1. Eine dauerhafte lokale Supabase-CLI- oder Docker-Installation in dieser Arbeitsumgebung herstellen
2. Produktions- oder Staging-Datenbanken umstellen
3. Echte lokale Secrets committen oder ausgeben
4. Issues ausserhalb von `#7` bearbeiten
