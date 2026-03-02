Status: COMPLETE
Last Modified: 2026-03-01

# Implementation Plan: Bonsai-Erstellung Validierungsfehler

## Overview

Die Implementierung extrahiert aus Zod-Fehlerdetails die erste nutzbare Fehlermeldung mit Feldbezug und verwendet sie sowohl im API-Handler fuer `POST /api/bonsais` als auch im Frontend der Create-Seite. Zusaetzlich werden Datepicker fuer nicht-zukuenftige Datumsfelder begrenzt.

## Reference

Spec: `/work/dev/features/2026-03-01_bonsai-create-validation/spec.md`

Wichtige Acceptance Criteria:
- Konkrete Fehlermeldung statt pauschalem Validation-Text
- Anzeige der konkreten Meldung im Create-Flow
- Testabdeckung fuer Fehlermeldungs-Auswahl

## File Structure

Zu erstellen:
- `/work/lib/api/validation.ts`
- `/work/tests/api-validation.test.ts`

Zu aendern:
- `/work/pages/api/bonsais.ts`
- `/work/pages/create-bonsai.tsx`

## Implementation Steps

1. Utility erstellen, die aus `formErrors` und `fieldErrors` die erste verwertbare Fehlermeldung extrahiert.
2. API-Handler fuer `POST /api/bonsais` auf diese Utility umstellen und weiterhin `error.details` mitsenden.
3. Feldbezogene Meldungen mit den sichtbaren Formularbezeichnungen anreichern.
4. Datepicker fuer `Besitz seit` und `Letztes Umtopfen` per `max` auf heute begrenzen; `Naechstes Umtopfen` optional per `min` an `Letztes Umtopfen` koppeln.
5. Create-Seite so anpassen, dass sie API-Fehler robust aus `message` oder `details` aufloest.
6. Node-Tests fuer Feldfehler, Formularfehler und Fallback-Verhalten ergaenzen.

## Code Architecture

- `lib/api/validation.ts` enthaelt reine, isomorphe Hilfsfunktionen ohne Framework-Abhaengigkeit.
- Der API-Handler bleibt fuer HTTP-Status und Envelope zustaendig.
- Die Page bleibt fuer die Anzeige des extrahierten Fehlers zustaendig.

## Technical Decisions

1. Keine neue externe Abhaengigkeit.
2. Erste Feldmeldung hat Prioritaet vor generischem Fallback, weil sie fuer Nutzer direkt umsetzbar ist.
3. Die Utility wird geteilt genutzt, damit API und Frontend dieselbe Priorisierungslogik verwenden.

## Integration Points

1. `pages/api/bonsais.ts` im `POST`-Catch fuer `ZodError`
2. `pages/create-bonsai.tsx` in der Fehlerbehandlung nach `fetch`

## Test Strategy

1. Unit-Tests fuer Utility mit `fieldErrors`
2. Unit-Tests fuer Utility mit `formErrors`
3. Unit-Tests fuer Utility-Fallback ohne Details
4. Sichtpruefung der Datepicker-Grenzen im Formularcode

## Edge Cases & Error Handling

1. Leere Arrays oder undefinierte Fehlereintraege fallen auf den Fallback zurueck.
2. Wenn die API weiterhin nur eine generische Meldung liefert, kann das Frontend aus `details` trotzdem eine konkrete Meldung ziehen.
3. Nicht-Validierungsfehler behalten die bestehende generische Serverfehlermeldung.

## Validation Checklist

- API-Envelope unveraendert
- `422`-Fehler liefern konkrete Meldungen
- Create-Seite zeigt Fehler weiterhin in bestehender Alert-Komponente
- Tests laufen erfolgreich
