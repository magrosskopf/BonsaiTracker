# Refactoring Plan: Issue 7 Runbook Review

**Status**: APPROVED  
**Created**: 2026-07-04  
**Last Modified**: 2026-07-04

## Approval Context

Die Ausfuehrung erfolgt direkt auf ausdrueckliche User-Anweisung fuer einen Review-Refinement-Durchlauf auf `sandcastle/issue-7`.

## Goal

Die neuen Issue-`#7`-Runbook-Tests klarer und konsistenter strukturieren, ohne Inhalte, Assertion-Staerke oder Verhalten zu veraendern.

## Planned Steps

1. Den gemeinsamen Pfad zu `docs/supabase-postgres-migration.md` zentral als Konstante benennen.
   - Clean Code Gewinn: weniger String-Duplikation, klarere Intent-Benennung
   - Verifikation: `npm test`
2. Einen kleinen Helfer fuer Runbook-Datei-Assertions einfuehren und die betroffenen Tests darauf umstellen.
   - Clean Code Gewinn: konsistenter Testaufbau, weniger wiederholter Boilerplate
   - Verifikation: `npm test`, `npm run typecheck`

## Safety

1. Keine Regex-Anforderung wird entfernt oder gelockert.
2. Keine Testbeschreibung und kein gepruefter Dateipfad ausser der internen Zentralisierung wird funktional geaendert.
3. Da nur Teststruktur angepasst wird, ist kein `npm run build` erforderlich.

## Rollback Strategy

1. Wenn `npm test` oder `npm run typecheck` fehlschlaegt, die letzte kleine Struktur-Aenderung unmittelbar rueckgaengig machen.
2. Keine Dokument- oder Runtime-Dateien anfassen, solange der Review-Gewinn ausschliesslich im Testfile erreicht werden kann.
