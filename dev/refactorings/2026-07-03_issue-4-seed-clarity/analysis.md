# Refactoring Analysis: Issue 4 Seed Clarity

**Status**: DRAFT
**Created**: 2026-07-03
**Last Modified**: 2026-07-03

## Scope

- `prisma/seed.ts`

## Current State

- Das Seed-Verhalten ist fachlich stimmig und deterministisch.
- `main()` enthaelt jedoch fast alle Fixture-Daten inline.
- Wiederkehrende Literalwerte wie Identitaeten, Reminder-Datum und Post-/Bonsai-Payloads sind ueber die Datei verteilt.

## Pain Points

- Geringe Lesbarkeit: Die eigentliche Reihenfolge des Seed-Flows geht zwischen grossen Objekt-Literalen unter.
- Hohe Aenderungskosten: Kleinere Text- oder Fixture-Anpassungen erfordern Suchen in grossen Inline-Bloecken.
- Inkonsistente Struktur: Manche Seed-Schritte nutzen Helper (`upsertSeedUser`), andere nicht.

## Test Coverage

- Direkte Regressionen: `tests/supabase-migration-docs.test.ts`
- Repo-Sicherheitsnetz: `npm test`
- Die Seed-Pruefung ist dateibasiert und deckt den dokumentierten lokalen Contract ab:
  - Seed-Identitaeten
  - benoetigte Modelle (`signupAllowlist`, `waitlistRequest`, `bonsai.create`, `subEntry.create`, `reminder.create`, `post.create`)
- Fuer diese eng begrenzte Struktur-Refaktorierung ist das Risiko niedrig, weil nur Fixture-Organisation und Helper-Zuschnitt veraendert werden.

## Success Criteria

- `main()` liest sich als klare Reihenfolge von Seed-Schritten.
- Seed-Literale sind in benannten Fixture-Buildern oder Konstanten gebuendelt.
- Funktionales Verhalten, Seed-Inhalte und Tests bleiben unveraendert.
