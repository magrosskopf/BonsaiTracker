Status: IMPLEMENTED
Last Modified: 2026-03-02

# Spec: Prisma Client wird vor Next.js-Ausfuehrung konsistent erzeugt

## Purpose/Goal

Der aktuelle Start von Auth-API-Routen scheitert mit `@prisma/client did not initialize yet`, weil der fuer `@prisma/client` erwartete generierte Client in `node_modules/.prisma/client` nicht verlässlich vorhanden ist. Ziel ist, die Prisma-Client-Generierung fuer lokale Entwicklung und Build so abzusichern, dass `lib/prisma.ts` den Client ohne manuellen Zwischenschritt importieren kann.

## Functional Requirements

1. Das Projekt muss vor `next dev` und `next build` sicherstellen, dass `prisma generate` fuer das aktuelle Schema ausgefuehrt wurde.
2. Die bestehende Laufzeitverwendung von `@prisma/client` in `lib/prisma.ts` und den Auth-Pfaden bleibt erhalten.
3. Die Loesung darf keinen manuellen Sonderpfad fuer lokale Entwickler voraussetzen, um den Login-Flow zu starten.
4. Die Loesung muss den aktuellen Fehler in der Auth-Route beseitigen, sofern die ueblichen Projektabhaengigkeiten installiert sind.

## Technical Constraints

1. Keine Aenderung am Prisma-Datenmodell.
2. Keine Umstellung der Anwendung auf einen alternativen Importpfad wie `prisma/generated/prisma-client`, solange `@prisma/client` regulär nutzbar gemacht werden kann.
3. Bestehende npm-Skripte fuer Entwicklung, Build und Tests bleiben als Einstiegspunkte erhalten.

## Acceptance Criteria

1. `npm run dev` initialisiert vor dem Start den Prisma Client automatisch.
2. `npm run build` initialisiert vor dem Build den Prisma Client automatisch.
3. Ein anschließender Typecheck oder Build importiert `lib/prisma.ts` nicht mehr mit dem Fehler `@prisma/client did not initialize yet`.
4. Die Aenderung ist in einem kurzen Verifikationsschritt lokal pruefbar.

## Out-of-Scope

1. Datenbankmigrationen oder Schemaaenderungen.
2. Refactoring der Auth-Konfiguration.
3. Entfernen bereits eingecheckter generierter Dateien ausserhalb des fuer den Bugfix noetigen Scopes.
