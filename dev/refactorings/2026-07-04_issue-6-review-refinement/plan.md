# Refactoring Plan: Issue 6 Review Refinement

**Status**: APPROVED  
**Created**: 2026-07-04  
**Last Modified**: 2026-07-04

## Approval Context

Die Ausfuehrung erfolgt direkt auf ausdrueckliche User-Anweisung fuer einen Review-Refinement-Durchlauf auf `sandcastle/issue-6`.

## Goal

Den lokalen Supabase-Validierungs-Wrapper lesbarer und konsistenter machen, ohne Funktion, Fehlerfaelle oder Repo-Vertraege zu veraendern.

## Planned Steps

1. Konfigurationsableitung aus `DATABASE_URL` in eine kleine benannte Struktur extrahieren.
   - Clean Code Gewinn: klarere Benennung und weniger implizite Zustandsableitung in `main()`
   - Verifikation: `npm test`, `npm run typecheck`
2. Ausgabe- und Fehlermeldungs-Helfer fuer Embedded Postgres extrahieren.
   - Clean Code Gewinn: weniger Inline-Komplexitaet, keine wiederholte Nachrichten-Normalisierung
   - Verifikation: `npm test`, `npm run typecheck`
3. Embedded-Postgres-Bootstrap in eine eigene Hilfsfunktion verschieben und `main()` auf Orchestrierung reduzieren.
   - Clean Code Gewinn: klarere Trennung zwischen Vorbereitung, Bootstrap und eigentlicher Ausfuehrung
   - Verifikation: `npm test`, `npm run typecheck`, `npm run build`

## Safety

1. Keine neuen Features, keine neuen Repo-Kommandos, keine Aenderung der Ausfuehrungsreihenfolge.
2. Bestehende Fehlermeldungen bleiben inhaltlich unveraendert.
3. Build wird mit ausgefuehrt, da der Branch Runtime- und Next.js-Dateien beruehrt.

## Rollback Strategy

1. Wenn Tests, Typecheck oder Build fehlschlagen, die letzte kleine Struktur-Aenderung unmittelbar rueckgaengig machen.
2. Keine angrenzenden Dateien ohne klaren Gewinn anfassen.
