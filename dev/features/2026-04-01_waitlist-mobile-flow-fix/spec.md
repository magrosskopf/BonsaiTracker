Status: IMPLEMENTED
Last Modified: 2026-04-01

# Spec: Waitlist Mobile Flow Fix

## Purpose/Goal

Die Waitlist-Hero-Sektion soll auf schmalen Screens sauber vertikal fliessen. Der Formularblock darf den Haupttext nicht mehr ueberlagern oder zu frueh neben ihm stehen.

## Current Situation

1. Auf mobilen bzw. schmalen Breiten wirkt der Formularblock im Hero nicht stabil unterhalb des Haupttexts.
2. Die Form-Box kann visuell ueber dem Hero-Text haengen, statt als naechster Block darunter zu erscheinen.

## Functional Requirements

1. Auf schmalen Screens muessen Hero-Text und Formular strikt untereinander angeordnet sein.
2. Die Reihenfolge bleibt: Hero-Text zuerst, Formular danach.
3. Auch auf Tablet-Breiten in Portrait oder anderen mittleren Breiten darf die Hero-Sektion nicht vorzeitig in eine seitliche Anordnung kippen.
4. Auf wirklich grossen Screens darf das bestehende zweispaltige Hero-Layout erhalten bleiben.

## Technical Constraints

1. Der Fix soll ohne neue Bibliotheken in der bestehenden Waitlist-Implementierung erfolgen.
2. Bestehende Copy und Formularlogik bleiben unveraendert.
3. Der Fix soll sich auf die Waitlist-spezifischen Styles beschraenken.

## Acceptance Criteria

1. Die Waitlist-Hero-Sektion nutzt auf schmalen Screens eine explizit vertikale Anordnung.
2. Formular und Hero-Text ueberlagern sich nicht mehr.
3. Die Waitlist bleibt auch auf mittleren Breiten einspaltig.
4. Das Desktop-Hero bleibt erst ab wirklich grosser Breite zweispaltig.
5. `npm test`, `npm run typecheck` und `npm run build` bleiben gruen.

## Out-of-Scope

1. Neue Inhalte oder Copy-Aenderungen auf der Waitlist
2. Anpassungen am Backend oder Formularverhalten
