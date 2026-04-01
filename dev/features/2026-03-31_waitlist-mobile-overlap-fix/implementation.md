Status: COMPLETE
Last Modified: 2026-03-31

# Implementation Plan: Waitlist Mobile Overlap Fix

## Overview

Der Fehler wird ueber einen globalen Viewport-Fix behoben. In der Pages-Router-App wird ein `meta name="viewport"` zentral gesetzt, damit mobile Browser die Seiten nicht mehr auf eine Desktop-Layoutbreite skalieren.

## Reference

Spec: `/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-31_waitlist-mobile-overlap-fix/spec.md`

## File Structure

Zu aendern:
- `/Users/maius/Projekte/Bonsai-Tracker/pages/_app.tsx`

Optional zur Verifikation:
- lokale Screenshot-Erzeugung der Waitlist in mobilem Viewport

## Implementation Steps

### Step 1: Globalen Viewport setzen

Arbeiten:
- `Head` in `pages/_app.tsx` ergaenzen
- global `meta name="viewport" content="width=device-width, initial-scale=1"` setzen

Ergebnis:
- mobile Browser rendern in echter Geraetebreite

### Step 2: Verifikation

Arbeiten:
- mobile Waitlist lokal erneut reproduzieren
- `npm run typecheck`
- `npm run build`

Ergebnis:
- Ueberlappung beseitigt und Build bleibt gruen

## Technical Decisions

1. Der Fix wird global statt seitenlokal gesetzt, weil der fehlende Viewport die gesamte Pages-App betrifft.
2. Zusätzliche Layoutänderungen erfolgen nur, wenn der Viewport-Fix wider Erwarten nicht ausreicht.

## Validation Checklist

1. Viewport-Meta vorhanden
2. Waitlist mobil nicht mehr skaliert/ueberlappt
3. Typecheck erfolgreich
4. Build erfolgreich
