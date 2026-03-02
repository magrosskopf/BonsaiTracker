Status: COMPLETE
Last Modified: 2026-03-02

# Implementation Plan: Prisma Client Generation Fix

## Overview

Die Implementierung verankert `prisma generate` an den relevanten npm-Einstiegspunkten, damit der Standard-Client fuer `@prisma/client` vor Next.js-Start und Build erzeugt wird. Anschliessend wird die Generierung lokal ausgefuehrt und per Typecheck/Build verifiziert.

## Reference

Spec: `/work/dev/features/2026-03-02_prisma-client-generation-fix/spec.md`

Wichtige Acceptance Criteria:
- Automatische Prisma-Client-Generierung vor `dev`
- Automatische Prisma-Client-Generierung vor `build`
- Kein Initialisierungsfehler mehr beim Import von `lib/prisma.ts`

## File Structure

Zu aendern:
- `/work/package.json`

Optional zu aktualisieren durch generierten Output:
- `/work/package-lock.json`

## Implementation Steps

1. `package.json` um Skripte erweitern, die `prisma generate` vor `dev` und `build` ausfuehren.
2. Die Generierung lokal einmal ausfuehren, damit die aktuelle Arbeitskopie wieder einen vollstaendigen Prisma Client besitzt.
3. Die Aenderung mit `npm run typecheck` und, falls stabil moeglich, `npm run build` verifizieren.

## Code Architecture

- Prisma bleibt ueber `@prisma/client` eingebunden.
- npm Lifecycle-Skripte uebernehmen die Vorbedingungen fuer Entwicklungs- und Build-Start.

## Technical Decisions

1. Lifecycle-Skripte sind robuster als eine Laufzeit-Workaround-Logik in `lib/prisma.ts`, weil der Fehler vor der ersten Anfrage beseitigt wird.
2. Der bestehende Importpfad bleibt unberuehrt, damit Adapter und Typen weiterhin konsistent aus `@prisma/client` kommen.

## Integration Points

1. `npm run dev`
2. `npm run build`

## Test Strategy

1. `npx prisma generate`
2. `npm run typecheck`
3. `npm run build`

## Edge Cases & Error Handling

1. Wenn Abhaengigkeiten ohne Lifecycle-Hooks installiert wurden, reparieren die `predev`- und `prebuild`-Skripte den Zustand vor der Anwendungsausfuehrung.
2. Falls weitere Skripte spaeter Prisma benoetigen, kann dasselbe Muster gezielt erweitert werden.

## Validation Checklist

- `package.json` enthaelt Vorab-Generierung fuer Dev und Build
- Prisma Client wird lokal erfolgreich erzeugt
- Typecheck oder Build reproduziert den Initialisierungsfehler nicht mehr
