# Spec: Issue 5 Supabase Core App Flows

**Status**: IMPLEMENTED  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Purpose/Goal

Issue `#5` soll den lokalen Supabase-Postgres-Flow bis zur nachvollziehbaren Kernfluss-Verifikation vervollstaendigen, damit Entwickler die wichtigsten Bonsai-Tracker-Ablaufe reproduzierbar gegen die Supabase-gestuetzte lokale Datenbank pruefen koennen.

## Functional Requirements

1. Es wird ausschliesslich GitHub-Issue `#5` bearbeitet.
2. Das Repo dokumentiert eine konkrete lokale Smoke-Test-Reihenfolge fuer die wichtigsten App-Flows gegen Supabase Postgres.
3. Die dokumentierten Flows decken mindestens Healthcheck, Dashboard, Bonsai, SubEntry, Reminder, Feed/Posts, Waitlist/Signup-Gating und Upload/Media ab.
4. Die Doku beschreibt explizit, welche Schritte lokale Auth-, Mail- oder Storage-Konfiguration voraussetzen und wie solche Schritte als `skip` dokumentiert werden.
5. Ein automatisierter Regressionstest faellt, wenn diese Kernfluss-Dokumentation aus dem Repo entfernt oder abgeschwaecht wird.

## Technical Constraints

1. `workflows/` bleibt unveraendert.
2. Es werden keine echten `.env`-Werte, OAuth-Credentials, Mail-Secrets oder Storage-Secrets committed.
3. Prisma bleibt die relationale Datenzugriffsschicht; dieses Issue fuehrt keine neuen Datenzugriffspfade ein.
4. Die hier verfuegbare Umgebung enthaelt keine lokale Supabase-CLI oder Docker-Laufzeit; deshalb muss die Repo-Aenderung ohne echte lokale Supabase-Ausfuehrung verifizierbar bleiben.
5. Produktions-Cutover, Supabase Auth und Broad-Fix-Arbeiten ausserhalb des lokalen Supabase-Slices sind nicht Teil dieses Issues.

## Acceptance Criteria

1. `docs/supabase-postgres-migration.md` enthaelt eine konkrete Kernfluss-Checklist fuer lokale Supabase-Smoke-Tests.
2. Die Checklist nennt fuer jeden Kernfluss den Zielpfad oder Endpunkt und die erwartete Beobachtung.
3. Die Checklist nennt explizite `pass`-/`skip`-Regeln fuer Auth-, Mail- und Media-abhaengige Schritte.
4. `docs/IMPLEMENTATION_NOTES.md` oder das Supabase-Runbook halten fest, dass die echte lokale Supabase-Ausfuehrung in dieser Repo-Umgebung nicht stattgefunden hat, weil die dafuer benoetigten lokalen Tools fehlen.
5. `tests/supabase-migration-docs.test.ts` deckt die Kernfluss-Dokumentation als Regressionstest ab.
6. `npm test`, `npm run typecheck` und `npm run build` laufen erfolgreich.
7. Es gibt einen Commit mit `Sandcastle:`-Prefix.

## Out-of-Scope

1. Eine echte lokale Supabase-Instanz in dieser Umgebung starten
2. Produktions- oder Staging-Datenbanken umstellen
3. Neue Runtime- oder Infrastrukturpfade nur fuer lokale Testhilfen einfuehren
4. Historische Prisma-Migrationen aendern
5. Issues ausserhalb von `#5` bearbeiten
