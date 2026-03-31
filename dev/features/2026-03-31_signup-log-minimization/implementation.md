Status: COMPLETE
Last Modified: 2026-03-31

# Implementation Plan: Minimierung personenbezogener Signup-Logs

## Overview

Die bestehenden Logging-Stellen im Signup-Guard in `lib/auth.ts` werden so angepasst, dass keine Klartext-E-Mail-Adressen mehr in Standard-Logs landen. Stattdessen werden strukturierte Logs mit Ereignisname und Ablehnungsgrund geschrieben.

## Reference

Spec: `/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-31_signup-log-minimization/spec.md`

Wichtige Acceptance Criteria:
- AC 1-2: kein Klartext-PII mehr in `signup denied`-Logs, Grund bleibt sichtbar
- AC 3: Typecheck bleibt gruen

## File Structure

Zu aendern:
- `/Users/maius/Projekte/Bonsai-Tracker/lib/auth.ts`

Optional zu nutzen:
- `/Users/maius/Projekte/Bonsai-Tracker/lib/observability.ts`

## Code Architecture

1. `lib/auth.ts` ersetzt die bisherigen `console.info(..., { reason, email })`-Aufrufe durch minimierte strukturierte Logs ohne E-Mail.
2. Wenn sinnvoll, wird statt `console.info` die bestehende `logInfo`-Helferfunktion verwendet, damit das Logging-Format projektweit konsistenter bleibt.
3. Fehlerpfade bleiben funktional unveraendert.

## Implementation Steps

### Step 1: Logging-Stellen umstellen

Arbeiten:
- `signup denied`-Logs auf minimierte strukturierte Ereignisse umstellen
- rohe E-Mail aus dem Log-Kontext entfernen

Ergebnis:
- keine Klartext-E-Mail in Standard-Logs bei Ablehnungen

### Step 2: Verifikation

Arbeiten:
- Diff auf verbleibende Klartext-E-Mail-Logs im Signup-Guard pruefen
- `npm run typecheck`

Ergebnis:
- kompilierender Fix ohne Verhaltensaenderung

## Technical Decisions

1. Fuer diesen Fix wird die E-Mail vollstaendig aus Standard-Logs entfernt, weil der Ablehnungsgrund fuer den operativen Zweck ausreicht.
2. Falls spaeter Korrelation noetig wird, sollte ein separater pseudonymisierter Identifier mit Secret-basierter Ableitung eingefuehrt werden statt Klartext-PII.

## Edge Cases & Error Handling

1. Es wird kein Nutzerverhalten geaendert, nur Log-Kontext.
2. Fehlerpfade bei Exceptions bleiben bestehen.

## Validation Checklist

1. Keine Klartext-E-Mail mehr in `signup denied`
2. Ablehnungsgrund weiterhin sichtbar
3. Typecheck erfolgreich
