Status: IMPLEMENTED
Last Modified: 2026-03-31

# Spec: Waitlist Mobile Optimization

## Purpose/Goal

Die oeffentliche Waitlist-Seite soll auf kleinen Screens fokussierter, leichter scanbar und conversion-staerker werden. Ziel ist nicht ein komplettes Re-Design, sondern eine mobile Optimierung der bestehenden Landingpage, damit der Hero, die Wartelisten-CTA und die nachfolgenden Informationsbloecke in einer klareren Reihenfolge und mit besserer mobilen Lesbarkeit erscheinen.

## Current Situation

1. Die Waitlist-Seite ist bereits responsiv, bleibt auf kleinen Screens aber sehr textreich.
2. Hero, Highlight-Liste, CTA-Cluster und Formular konkurrieren mobil zu stark um Hoehe und Aufmerksamkeit.
3. Die nachfolgenden Story-, Benefit- und Next-Step-Sektionen fuehlen sich mobil eher wie Desktop-Karten in einer Einspaltendarstellung an als wie eine bewusst mobile Dramaturgie.

## Functional Requirements

1. Die mobile Waitlist-Seite muss den primären Conversion-Pfad schneller sichtbar machen.
2. Auf kleinen Screens soll die Hero-Sektion kompakter und klarer priorisiert sein als bisher.
3. Das Wartelisten-Formular muss mobil als klarer Hauptaktionsbereich wirken.
4. Sektionen unterhalb des Heroes sollen in einer fuer mobile Nutzung geeigneten Reihenfolge, Dichte und visuellen Hierarchie erscheinen.
5. CTA, Formular, Erwartungsmanagement und Kernaussagen muessen auf Mobilgeraeten ohne ueberladenen Ersteindruck erfassbar bleiben.
6. Die Desktop-Darstellung soll erhalten bleiben oder nur behutsam verbessert werden.

## Technical Constraints

1. Die Umsetzung erfolgt in der bestehenden Next.js-Pages-Router-App mit Tailwind und globalen CSS-Komponenten.
2. Keine neuen Bibliotheken.
3. Bestehende Inhalte duerfen verdichtet, umgeordnet oder mobil anders praesentiert werden, aber der fachliche Kern der Waitlist-Kommunikation bleibt erhalten.
4. Meta-Tags, Formularfunktion und API-Verhalten bleiben unveraendert.
5. Die globale Footer-/Cookie-Banner-Integration darf durch die Waitlist-Anpassung nicht brechen.

## Acceptance Criteria

1. Die Waitlist-Seite wirkt auf Smartphone-Breiten sichtbar kompakter und klarer priorisiert.
2. Der primäre CTA und das Formular sind mobil schneller erreichbar und visuell deutlicher hervorgehoben.
3. Hero-Text, Highlight-Liste und untere Content-Bloecke sind mobil besser scanbar als zuvor.
4. Es entstehen keine Regressionen bei Formularfunktion, Navigation oder Footer-Erreichbarkeit.
5. `npm run typecheck` und `npm run build` bleiben gruen.

## Out-of-Scope

1. Neue Backend-Funktionen oder Aenderungen an `/api/access-requests`
2. Vollstaendige textliche Neuerstellung der Waitlist-Copy
3. Neue Illustrationen, externe Assets oder Animationen ausserhalb des bestehenden CSS-Rahmens
4. A/B-Testing oder Analytics-basierte Optimierung
