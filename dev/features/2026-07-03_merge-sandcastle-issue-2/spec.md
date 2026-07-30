Status: IMPLEMENTED
Last Modified: 2026-07-03

# Spec: Merge Sandcastle Issue 2

## Purpose/Goal

Der Branch `sandcastle/issue-2` soll kontrolliert in den aktuellen Arbeitsbranch gemergt werden, inklusive intelligenter Konfliktaufloesung, anschliessender Projektverifikation und Abschluss des zugehoerigen GitHub-Issues.

## Functional Requirements

1. `git merge sandcastle/issue-2 --no-edit` wird auf dem aktuellen Branch ausgefuehrt.
2. Auftretende Merge-Konflikte werden anhand beider Seiten fachlich korrekt aufgeloest.
3. Nach erfolgreicher Konfliktaufloesung werden mindestens `npm test` und `npm run typecheck` ausgefuehrt.
4. `npm run build` wird zusaetzlich ausgefuehrt, wenn der Merge Next.js-Seiten, API-Routen, Prisma-Generierung, Konfiguration oder Runtime-Verhalten betrifft.
5. Falls die Verifikation fehlschlaegt, werden die Probleme behoben, bevor das Ergebnis abgeschlossen wird.
6. Issue `#2` wird nur dann per GitHub CLI geschlossen, wenn Merge und Verifikation erfolgreich abgeschlossen wurden.

## Technical Constraints

1. `workflows/` wird nicht veraendert.
2. Bestehende, nutzerseitige Aenderungen im Worktree werden nicht rueckgaengig gemacht.
3. Es wird nur ein finaler zusaetzlicher Commit erstellt, falls Git nicht bereits einen Merge-Commit angelegt hat.

## Acceptance Criteria

1. `sandcastle/issue-2` ist erfolgreich in den aktuellen Branch integriert oder ein technischer Blocker ist klar dokumentiert.
2. Alle erforderlichen Verifikationskommandos fuer den tatsaechlichen Aenderungsumfang wurden erfolgreich ausgefuehrt.
3. Issue `#2` ist bei erfolgreichem Abschluss mit dem vorgegebenen Kommentar geschlossen.
4. Workflow-Dokumentation fuer Spec und Implementierungsplan liegt unter `dev/features/2026-07-03_merge-sandcastle-issue-2/` vor.

## Out-of-Scope

1. Weitere Branches oder Issues ausser `sandcastle/issue-2` beziehungsweise `#2`
2. Inhaltliche Produktaenderungen, die nicht zur Konfliktaufloesung oder Verifikationsreparatur erforderlich sind
