# Implementation Plan: Homepage Bonsai Copy Refinement

## Status

COMPLETE

## Overview

Die Startseite erhaelt eine sprachliche Ueberarbeitung der sichtbaren Copy. Ziel ist ein natuerlicherer, fachnaeherer Ton fuer Bonsai-Enthusiasten, ohne funktionale oder strukturelle Aenderungen.

## Reference

Spec: `/work/dev/features/2026-03-08_homepage-bonsai-copy/spec.md`

Wichtige Akzeptanzkriterien:
1. Natuerliche, glaubwuerdige Hero-Copy.
2. Fachlich nachvollziehbare Bonsai-Begriffe und Arbeitsablaeufe.
3. Keine funktionalen Regressionen.

## File Structure

Modify:
1. `/work/pages/index.tsx`

Add:
1. `/work/dev/features/2026-03-08_homepage-bonsai-copy/spec.md`
2. `/work/dev/features/2026-03-08_homepage-bonsai-copy/implementation.md`

## Implementation Steps

1. Hero-Ueberschrift in `/work/pages/index.tsx` in natuerlicheres, zielgruppennahes Deutsch umformulieren.
2. Den beschreibenden Absatz so anpassen, dass typische Bonsai-Themen wie Giessen, Duengen, Umtopfen, Schnitt, Entwicklung und Fotodokumentation klar benannt werden.
3. Den Text in der Login-/Beta-Sektion sprachlich leicht nachziehen, damit der Ton konsistent bleibt.
4. Die Seite per TypeScript/Build-relevanter Pruefung verifizieren.

## Technical Decisions

1. Es werden nur String-Inhalte geaendert, keine Komponenten oder Props.
2. Die neue Copy bevorzugt konkrete, handwerklich klingende Begriffe statt abstrakter Produktsprache.
3. Fachwoerter werden nur dort verwendet, wo sie fuer Bonsai-Nutzer alltagsnah und verstaendlich sind.

## Integration Points

1. Keine neuen Integrationen.
2. Vorhandene Rendering- und Auth-Flows bleiben unberuehrt.

## Test Strategy

1. Typecheck mit `npm run typecheck`.
2. Optionaler kurzer Code-Check der geaenderten JSX-Texte auf Konsistenz.

## Edge Cases & Error Handling

1. Die neue Copy darf nicht voraussetzen, dass nur fortgeschrittene Bonsai-Nutzer angesprochen werden.
2. Die Formulierungen muessen auch fuer Interessierte ohne tiefes Fachvokabular verstaendlich bleiben.

## Validation Checklist

1. Nur Copy-Texte in `/work/pages/index.tsx` geaendert.
2. Hero und Unterzeile wirken weniger generisch/technisch.
3. Login-/Beta-Sektion bleibt inhaltlich korrekt.
4. Typecheck erfolgreich.
