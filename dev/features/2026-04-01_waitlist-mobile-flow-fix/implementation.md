Status: COMPLETE
Last Modified: 2026-04-01

# Implementation Plan: Waitlist Mobile Flow Fix

## Overview

Der Fix macht den Waitlist-Hero auf schmalen und mittleren Screens explizit vertikal, statt sich auf das implizite Einspaltenverhalten des Grids zu verlassen. Zusaetzlich werden die Hero-Kinder gegen Ueberlauf abgesichert und die zweispaltige Umschaltung weiter nach hinten verschoben.

## Reference

Spec: `/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-04-01_waitlist-mobile-flow-fix/spec.md`

## File Structure

Zu aendern:
- `/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css`
- `/Users/maius/Projekte/Bonsai-Tracker/tests/waitlist-page.test.ts`

Zu erstellen:
- `/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-04-01_waitlist-mobile-flow-fix/spec.md`
- `/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-04-01_waitlist-mobile-flow-fix/implementation.md`

## Implementation Steps

### Step 1: Mobile Hero explizit stapeln

Arbeiten:
- `waitlist-hero__grid` standardmaessig als vertikale Flex-Spalte definieren
- Reihenfolge und Breite der Hero-Bloecke explizit absichern
- Desktop erst ab wirklich grosser Breite wieder auf Grid umstellen

Ergebnis:
- Hero-Text und Formular fliessen auf schmalen und mittleren Screens sicher untereinander

### Step 2: Ueberlauf absichern

Arbeiten:
- Hero-Kindern `min-width: 0` geben

Ergebnis:
- lange Inhalte koennen in der zweispaltigen Variante sauber umbrechen statt optisch zu kollidieren

### Step 3: Verifikation

Arbeiten:
- Style-Test fuer Mobile-/Desktop-Hero-Regeln ergaenzen
- `npm test`
- `npm run typecheck`
- `npm run build`

Ergebnis:
- der Fix ist technisch abgesichert

## Technical Decisions

1. Mobile nutzt explizit Flex-Column statt implizitem Einspalten-Grid.
2. Desktop behaelt das bestehende Grid erst ab `1280px`, damit Tablets und mittlere Breiten weiter stapeln.
3. Die Absicherung erfolgt in CSS, weil die DOM-Reihenfolge bereits korrekt ist.

## Validation Checklist

1. Mobile Hero stapelt vertikal
2. Mittlere Breiten bleiben ebenfalls gestapelt
3. Desktop Hero bleibt zweispaltig
4. Kein sichtbarer Ueberlauf zwischen Text und Formular
5. Tests, Typecheck und Build erfolgreich
