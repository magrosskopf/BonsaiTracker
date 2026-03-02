Status: IMPLEMENTED
Last Modified: 2026-03-01

# Spec: Bonsai-Erstellung zeigt konkrete Validierungsfehler

## Purpose/Goal

Beim Anlegen eines Bonsai schlägt `POST /api/bonsais` aktuell mit `422 Unprocessable Entity` fehl, ohne dass die UI den konkreten Validierungsfehler anzeigt. Nutzer sehen dadurch nur einen generischen Fehler und können die Eingabe nicht gezielt korrigieren.

## Functional Requirements

1. Die API fuer `POST /api/bonsais` soll bei Zod-Validierungsfehlern eine konkrete, fuer Nutzer lesbare Fehlermeldung zurueckgeben.
2. Die Create-Bonsai-Seite soll diese konkrete Fehlermeldung anzeigen.
3. Falls keine konkrete Feldmeldung verfuegbar ist, bleibt eine sichere generische Fallback-Meldung erhalten.
4. Datumsfelder, die keine Zukunftsdaten erlauben, sollen im Datepicker bereits auf heute begrenzt werden.

## Technical Constraints

1. Bestehendes API-Envelope-Format mit `ok`/`error` bleibt erhalten.
2. Keine Aenderung am Datenmodell oder an der Formularstruktur.
3. Die Loesung muss mit vorhandenen Node-Testwerkzeugen (`tsx --test`) pruefbar sein.

## Acceptance Criteria

1. Ein Validierungsfehler bei der Bonsai-Erstellung liefert nicht mehr nur `"Die Bonsai-Daten sind ungültig."`, sondern bevorzugt die erste konkrete Feld- oder Formularmeldung inklusive Feldbezug.
2. Die Create-Seite zeigt diese Meldung fuer `422`-Antworten sichtbar an.
3. Der Datepicker verhindert fuer `Besitz seit` und `Letztes Umtopfen` die Auswahl eines Datums nach dem heutigen Tag.
4. Automatisierte Tests decken die Auswahl der konkreten Fehlermeldung ab.

## Out-of-Scope

1. Feldgenaue Inline-Fehler direkt im Formular.
2. Aenderungen an weiteren APIs oder Formularen ausser der Bonsai-Erstellung.
