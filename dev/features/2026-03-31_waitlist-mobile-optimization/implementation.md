Status: COMPLETE
Last Modified: 2026-03-31

# Implementation Plan: Waitlist Mobile Optimization

## Overview

Die mobile Optimierung konzentriert sich auf drei Ebenen:

1. Hero und CTA-Bereich in `pages/waitlist.tsx` in eine mobil klarere Informationshierarchie bringen
2. Waitlist-Formular und begleitende Hinweise mobil praegnenter gestalten
3. Bestehende `waitlist-*`-Styles in `styles/globals.css` so nachschaerfen, dass die Seite auf kleinen Screens bewusster wirkt und auf Desktop nicht regressiert

## Reference

Spec: `/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-31_waitlist-mobile-optimization/spec.md`

Besonders relevante Acceptance Criteria:
- AC 1-3: bessere mobile Priorisierung und Scanbarkeit
- AC 4-5: keine funktionalen Regressionen, Typecheck und Build bleiben gruen

## File Structure

Zu aendern:
- `/Users/maius/Projekte/Bonsai-Tracker/pages/waitlist.tsx`
- `/Users/maius/Projekte/Bonsai-Tracker/components/WaitlistRequestForm.tsx`
- `/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css`

Optional zu aendern, falls fuer mobile CTA-Klarheit sinnvoll:
- `/Users/maius/Projekte/Bonsai-Tracker/components/LegalFooter.tsx`

## Current State Context

1. `pages/waitlist.tsx` nutzt bereits einen grossen Hero mit Copy links und Formular rechts bzw. darunter.
2. Mobile und Desktop teilen sich aktuell fast dieselbe Inhaltsdichte.
3. `styles/globals.css` enthaelt bereits mehrere `waitlist-*`-Komponentenklassen, aber praktisch keine explizite mobile Verdichtung unterhalb von `768px`.

## Code Architecture

### 1. Hero neu staffeln

`pages/waitlist.tsx` wird mobil staerker entlang einer klaren Reihenfolge organisiert:

1. kurze Kennzeichnung / Eyebrow
2. starke Headline
3. kompaktere Supporting Copy
4. verdichtete Highlights
5. primäre Aktion
6. direkt anschliessender Formularblock

Dabei kann ein Teil der sekundären CTA-Kommunikation mobil verdichtet oder umpositioniert werden.

### 2. Formularblock fuer Mobile priorisieren

`components/WaitlistRequestForm.tsx` und der umgebende Formularcontainer werden mobil so geschaerft, dass:

1. Titel und Beschreibung kompakter wirken
2. Inputs und CTA klar als Hauptziel der Seite lesbar sind
3. Success-/Error-Zustaende weiterhin sauber sichtbar bleiben

### 3. Untere Sektionen mobiler machen

Die Story-, Benefit- und Step-Sektionen in `pages/waitlist.tsx` bleiben erhalten, werden aber mobil in Rhythmus, Abstaenden und eventueller Reihenfolge optimiert, damit nach dem Hero weniger "Wall of cards"-Gefuehl entsteht.

### 4. CSS-Fokus auf kleine Screens

`styles/globals.css` erhaelt mobile-spezifische Nachschaerfungen fuer:

1. Hero-Padding, Radius und innere Abstaende
2. CTA-Cluster und Highlight-Liste
3. Formular-Panel und Footnote
4. Story-/Benefit-/Steps-Karten
5. Typografische Spannungen zwischen `text-4xl`, `text-lg` und Karteninhalten

## Technical Decisions

1. Die Optimierung bleibt in vorhandenen Komponenten und globalen Styles; kein Layout-Framework-Wechsel.
2. Mobile bekommt bewusst kompaktere Vertikalabstaende und eine staerkere CTA-Priorisierung.
3. Desktop-Layout bleibt weitgehend erhalten; mobile-first Anpassungen greifen vor allem unterhalb `md`.
4. Die bestehende Formularlogik bleibt unveraendert.

## Integration Points

1. `pages/waitlist.tsx`
   - Hauptstruktur und Reihenfolge der Landingpage

2. `components/WaitlistRequestForm.tsx`
   - Formular-Heading, Description und CTA-Praesentation

3. `styles/globals.css`
   - zentrale mobile Gestaltung fuer alle Waitlist-Elemente

## Implementation Steps

### Step 1: Mobile Hero und CTA umstrukturieren

Arbeiten:
- Hero-Inhalt fuer kleine Screens verdichten
- CTA-Cluster und Formular visuell entkoppeln und priorisieren
- mobile Reihenfolge der Hero-Bloecke verbessern

Ergebnis:
- schnellerer Einstieg in den Conversion-Pfad

### Step 2: Formular mobil schaerfen

Arbeiten:
- Typografie und Spacing im Formular auf mobile Nutzung abstimmen
- Formularblock als klaren Hauptaktionsbereich markieren

Ergebnis:
- Formular wirkt mobil prominenter und leichter ausfuellbar

### Step 3: Untere Content-Bloecke verdichten

Arbeiten:
- Story-, Benefit- und Steps-Sektionen mobil entschlacken
- Kartenabstaende, Typografie und gegebenenfalls Reihenfolge nachschaerfen

Ergebnis:
- weniger card-stack-Gefuehl, bessere Scanbarkeit

### Step 4: Verifikation

Arbeiten:
- `npm run typecheck`
- `npm run build`

Ergebnis:
- technische Absicherung der Aenderung

## Edge Cases & Error Handling

1. Lange Headlines duerfen mobil nicht unkontrolliert umbrechen oder den CTA nach unten wegdruecken.
2. Formularmeldungen muessen auch nach Verdichtung gut lesbar bleiben.
3. Footer und Cookie-Banner duerfen mit dem mobilen Seitenende nicht kollidieren.
4. Desktop darf durch mobile-first CSS nicht regressieren.

## Validation Checklist

1. Hero ist mobil kompakter
2. Formular ist mobil frueher und klarer im Fokus
3. Nachfolgende Sektionen sind mobil ruhiger und scanbarer
4. Typecheck erfolgreich
5. Build erfolgreich
