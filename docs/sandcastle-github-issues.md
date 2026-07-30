# Sandcastle GitHub Issues

Dieses Projekt nutzt GitHub Issues als Arbeitsvorrat fuer Sandcastle.

## Grundsatz

Issues fuer Sandcastle koennen direkt aus diesem Repository heraus angelegt werden, wenn ein gueltiger GitHub Token verfuegbar ist. Der Token wird nicht dokumentiert, ausgegeben oder in Logs geschrieben. Er wird nur fuer GitHub CLI/API-Aufrufe verwendet.

## Erwartetes Format

Ein Sandcastle-Issue sollte enthalten:

- klaren Titel
- konkrete Aufgabenbeschreibung
- messbare Acceptance Criteria
- wichtige Constraints, zum Beispiel Dateien oder Bereiche, die nicht geaendert werden sollen
- Label `Sandcastle`

## Typischer Ablauf

1. Issue mit `gh issue create` oder der GitHub API anlegen.
2. Label `Sandcastle` setzen.
3. `npm run sandcastle` starten.
4. Sandcastle liest offene Issues mit Label `Sandcastle`, plant unblocked Issues und arbeitet sie auf Branches wie `sandcastle/issue-<id>` ab.

## Sicherheit

- Keine Secrets in Issue-Titel, Body, Kommentare oder Prompt-Dateien schreiben.
- Keine Tokens committen.
- Bei fehlender GitHub-Authentifizierung wird die Arbeit als blockiert gemeldet, statt Auth-Daten zu erraten oder auszugeben.
