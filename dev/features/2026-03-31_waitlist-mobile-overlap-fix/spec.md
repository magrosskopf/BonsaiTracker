Status: IMPLEMENTED
Last Modified: 2026-03-31

# Spec: Waitlist Mobile Overlap Fix

## Purpose/Goal

Die mobile Waitlist-Darstellung soll ohne ueberlappende oder zusammengeschobene Inhalte rendern. Ziel ist ein gezielter Fix fuer die aktuell auf Mobilgeraeten sichtbar falsche Layout-Skalierung.

## Current Situation

1. Die Waitlist ueberlappt mobil weiterhin sichtbar.
2. Die reproduzierte mobile Darstellung zeigt ein auf Desktop-Breite gerendertes Layout, das auf Mobilbreite herunterskaliert wird.
3. Im Projekt ist aktuell kein `viewport`-Meta-Tag vorhanden.

## Functional Requirements

1. Die Anwendung muss auf mobilen Browsern mit einem korrekten Viewport rendern.
2. Die Waitlist-Seite darf auf Smartphone-Breiten nicht mehr als herunterskaliertes Desktop-Layout erscheinen.
3. Hero, Formular und nachfolgende Sektionen duerfen sich mobil nicht mehr ueberlagern.

## Technical Constraints

1. Der Fix soll moeglichst klein und gezielt sein.
2. Der Viewport-Fix soll global fuer die Pages-Router-Anwendung gelten.
3. Die bestehende Waitlist-Struktur und Copy bleiben unveraendert, sofern der Viewport-Fix allein das Problem loest.

## Acceptance Criteria

1. Ein globaler `viewport`-Meta-Tag ist gesetzt.
2. Die Waitlist rendert auf Mobile in echter Geraetebreite.
3. Der reproduzierte Ueberlappungsfehler tritt nicht mehr auf.
4. `npm run typecheck` und `npm run build` bleiben gruen.

## Out-of-Scope

1. Weitere gestalterische Optimierungen ueber den Layout-Fix hinaus
2. Neue Inhalte oder neue Interaktionen auf der Waitlist
