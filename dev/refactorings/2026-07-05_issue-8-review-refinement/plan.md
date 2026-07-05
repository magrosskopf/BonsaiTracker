# Refactoring Plan: Issue 8 Review Refinement

**Status**: COMPLETE  
**Created**: 2026-07-05  
**Last Modified**: 2026-07-05

## Approval Context

Die Ausfuehrung erfolgt direkt auf ausdrueckliche User-Anweisung fuer einen Review-Refinement-Durchlauf auf `sandcastle/issue-8`.

## Goal

Den Bonsai-Validator aus Issue `#8` klarer und konsistenter machen, ohne Validierungsverhalten oder API-Semantik zu aendern.

## Planned Steps

1. Fehlende Verhaltenstests fuer das Patch-Schema ergaenzen.
   - Clean Code Gewinn: Refactoring wird auf die nun abgesicherten Verhaltenspfade begrenzt.
   - Verifikation: `npm test`
   - Ergebnis: erledigt
2. Redundante nullable Feldmuster in kleine benannte Hilfsfunktionen ueberfuehren.
   - Clean Code Gewinn: Create- und Patch-Schema zeigen ihre echten Unterschiede expliziter.
   - Verifikation: `npm test`, `npm run typecheck`
   - Ergebnis: erledigt
3. Redundante `default(null)`-Verkettungen im Patch-Schema entfernen und die Felddefinitionen konsistent ausrichten.
   - Clean Code Gewinn: weniger visuelle Last, weniger irrefuehrende Zod-Kombinationen.
   - Verifikation: `npm test`, `npm run typecheck`, `npm run build`
   - Ergebnis: erledigt

## Safety

1. Keine neuen Validator-Regeln und keine Aenderung an Fehlermeldungen.
2. UI-, Mapper- und Prisma-Dateien aus dem Branch bleiben unberuehrt, weil dafuer keine gleichwertige Unit-Test-Abdeckung vorliegt.
3. Build wird mit ausgefuehrt, weil der Branch Runtime-Verhalten und Next.js-Seiten beruehrt.

## Rollback Strategy

1. Wenn ein Test-, Typecheck- oder Build-Fehler auftritt, die letzte kleine Struktur-Aenderung sofort rueckgaengig machen.
2. Keine angrenzenden Aufraeumarbeiten ausserhalb des getesteten Validator-Scope aufnehmen.

## Verification Summary

1. `npm test` erfolgreich am 2026-07-05
2. `npm run typecheck` erfolgreich am 2026-07-05
3. `npm run build` erfolgreich am 2026-07-05
4. Reviewer Assessment: Ja, der Validator ist jetzt leichter lesbar, weil die eigentlichen Feldunterschiede zwischen Create und Patch nicht mehr in redundanten Zod-Ketten versteckt sind.
