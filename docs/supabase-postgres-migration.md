# Supabase Postgres Migration

## Ziel dieses Dokuments

Dieses Runbook dokumentiert die lokale Zielumgebung und die Initialisierung einer leeren lokalen Supabase-Postgres-Datenbank aus den committed Prisma-Migrationen.

Die lokale relationale Ziel-Datenbank ist ein direkt erreichbares Supabase-Postgres unter Prisma. Prisma bleibt die relationale Datenzugriffsschicht. Prisma Accelerate wird fuer dieses lokale Ziel nicht verwendet.

## Guardrails

1. Keine `.env`, `.env.local` oder echte Passwoerter committen.
2. Reale `DATABASE_URL`-Werte nur lokal setzen.
3. Prisma bleibt die einzige regulaere Schicht fuer relationale App-Daten.
4. Supabase SDK wird in dieser Phase nicht fuer relationale Datenbankzugriffe eingefuehrt.
5. Supabase Auth, RLS und Produktions-Cutover sind nicht Teil dieses lokalen Schritts.

## Lokales Datenbankziel

Die committed Beispielkonfiguration zeigt das erwartete Format fuer lokales Supabase Postgres:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

Hinweise:

1. Das ist ein lokales Beispiel ohne echte Secrets.
2. Wenn deine lokale Supabase-Instanz andere Ports oder Zugangsdaten verwendet, uebernimm die tatsaechlichen lokalen Werte nur in deine uncommitteten Env-Dateien.
3. `prisma+postgres://...` wird fuer dieses lokale Ziel bewusst nicht verwendet.

## Vorbereitung

1. Lokale Supabase-Instanz starten oder ihren Status pruefen, zum Beispiel mit `supabase start` und `supabase status`, falls die CLI vorhanden ist.
2. Vor der Umstellung den bisherigen lokalen `DATABASE_URL`-Wert ausserhalb von Git sichern.
3. Die lokale `.env.local`, `.env` oder Shell-Session identifizieren, aus der `DATABASE_URL` gelesen wird.
4. Sicherstellen, dass keine lokalen Secret-Dateien gestaged sind.

## Lokale Umstellung

1. `DATABASE_URL` lokal auf das direkte Supabase-Postgres-Ziel setzen.
2. Das Repo-Skript `scripts/init-local-supabase-db.sh` fuehrt Prisma-Validierung, Migration und Statuspruefung aus.
3. Alternativ koennen die Prisma-Kommandos auch manuell ausgefuehrt werden: `npm run prisma -- validate`, `npm run prisma -- migrate deploy`, `npm run prisma -- migrate status`.
4. Optional kann anschliessend `PRISMA_SEED=1 bash scripts/init-local-supabase-db.sh` verwendet werden.
5. Bestehende App-Konfiguration fuer NextAuth, Mail und Storage nur dann lokal anpassen, wenn sie fuer spaetere Smoke-Tests gebraucht wird.

### Bevorzugter Repo-Flow

```bash
bash scripts/init-local-supabase-db.sh
```

Das Skript erwartet:

1. Eine gesetzte direkte `postgresql://`- oder `postgres://`-`DATABASE_URL`
2. Kein `prisma+postgres://`
3. Standardmaessig ein lokales Ziel unter `127.0.0.1` oder `localhost`

Wenn du bewusst gegen ein anderes Ziel pruefen willst, musst du dies explizit mit `ALLOW_NON_LOCAL_DATABASE=1` uebersteuern.

### Manueller Prisma-Flow

```bash
npm run prisma -- validate
npm run prisma -- migrate deploy
npm run prisma -- migrate status
```

Optionales Seed fuer leere lokale Testdaten:

```bash
PRISMA_SEED=1 bash scripts/init-local-supabase-db.sh
```

Oder direkt:

```bash
npm run prisma -- db seed
```

Das Seed ist nicht Teil der reinen Schema-Initialisierung, kann aber fuer lokale Smoke-Tests hilfreich sein.

## Baseline-Daten aus dem Seed

Wenn du `PRISMA_SEED=1 bash scripts/init-local-supabase-db.sh` oder `npm run prisma -- db seed` verwendest, legt das Repo nur lokale, nicht-sensitive Baseline-Daten an.

Der Seed ist fuer wiederholte lokale Ausfuehrung gedacht und setzt den Demo-Bestand stabil auf denselben Zustand zurueck.

Enthalten sind aktuell:

1. Der bestehende Demo-Benutzer `demo@example.com`
2. Ein zweiter Community-Benutzer `community@example.com`
3. Ein freigegebener Signup-Allowlist-Eintrag `approved@example.com`
4. Eine lokale Waitlist-Anfrage `waitlist@example.com`
5. Ein Demo-Bonsai mit einem zugehoerigen SubEntry
6. Ein offener Reminder fuer den Demo-Bonsai
7. Mindestens ein Community-Feed-Post plus soziale Interaktion fuer den lokalen Feed

Diese Baseline-Daten sollen lokale Smoke-Tests beschleunigen, damit Dashboard, Reminder, Feed und Signup-/Waitlist-Pfade nicht auf einer komplett leeren Datenbank getestet werden muessen.

## Verifikation fuer dieses Repo

Pruefe nach der Initialisierung:

1. `.env.example` zeigt eine direkte lokale Supabase-Postgres-URL.
2. Dieses Dokument beschreibt Prisma als Datenzugriffsschicht.
3. Dieses Dokument beschreibt, dass Prisma Accelerate lokal nicht verwendet wird.
4. `scripts/init-local-supabase-db.sh` laeuft mit gesetzter lokaler `DATABASE_URL` durch Prisma-Validierung, Migration und Statuspruefung.
5. Optionales Seed ist fuer leere lokale Baseline-Daten verfuegbar.
6. Dieses Dokument beschreibt die Rueckstellung auf die vorherige lokale Datenbankkonfiguration.

## Lokaler Smoke-Test nach erfolgreicher Initialisierung

1. `npm test`
2. `npm run typecheck`
3. `npm run dev`
4. Optional fuer Baseline-Daten: `PRISMA_SEED=1 bash scripts/init-local-supabase-db.sh` ausfuehren
5. Login oder Auth-Konfiguration plausibilisieren; der Seed stellt dafuer `demo@example.com` als bestehende lokale Testidentitaet bereit
6. Dashboard laden und den Demo-Bonsai sehen
7. Bonsai-Detail und SubEntry des Demo-Bonsai pruefen
8. Reminder-Liste laden und den offenen Demo-Reminder sehen
9. Feed/Post-Funktion plausibilisieren und den Demo-/Community-Bestand sehen
10. Waitlist/Signup-Gating mit `approved@example.com` und `waitlist@example.com` plausibilisieren

## Automatisierte Validierung auf lokalem Supabase Postgres

Wenn die lokale App-Konfiguration bereits auf direktes Supabase Postgres zeigt, verwende fuer die Standardchecks bevorzugt:

Bevorzugter Repo-Befehl: `bash scripts/validate-local-supabase-checks.sh`.

```bash
bash scripts/validate-local-supabase-checks.sh
```

Das Repo-Skript fuehrt in dieser Reihenfolge aus:

1. `npm test`
2. `npm run typecheck`
3. `npm run build`
4. `npm run prisma -- migrate status`

Der Guardrail entspricht dem Initialisierungspfad:

1. `DATABASE_URL` muss gesetzt sein.
2. `DATABASE_URL` muss eine direkte `postgres://`- oder `postgresql://`-URL sein.
3. `prisma+postgres://` ist fuer diese lokale Validierung nicht erlaubt.
4. Standardmaessig wird nur ein lokales Ziel unter `127.0.0.1` oder `localhost` akzeptiert.

Wenn `migrate status` wegen fehlender lokaler Supabase-Erreichbarkeit fehlschlaegt, den Lauf als lokalen Supabase-Blocker dokumentieren.

Allgemeine Repo-Fehler aus `test`, `typecheck` oder `build` nicht als Supabase-Migrationsproblem umetikettieren.

Falls du das Skript nicht verwenden willst, koennen dieselben Checks auch einzeln ausgefuehrt werden:

```bash
npm test
npm run typecheck
npm run build
npm run prisma -- migrate status
```

## Kernfluss-Checklist fuer lokale Supabase-Smoke-Tests

Notiere jeden Schritt mit `pass`, `skip` oder `fail`.

Wenn lokales OAuth oder E-Mail-Login nicht konfiguriert ist, den Login-Schritt als `skip` mit konkretem Grund dokumentieren.

Wenn lokaler Upload-Storage oder Supabase-Storage nicht verfuegbar ist, den Media-Schritt als `skip` mit Grund dokumentieren.

1. Login und Session
   - Ziel: Startseite `/` und anschliessend Session fuer geschuetzte Routen
   - Erwartung: bestehender lokaler Testnutzer kann sich anmelden oder der Schritt wird als `skip` mit fehlender lokaler Auth-Konfiguration dokumentiert
2. Healthcheck
   - Ziel: `GET /api/health`
   - Erwartung: JSON-Antwort mit `ok`, `database: "ok"` und dem aktiven Upload-Storage
3. Dashboard
   - Ziel: `/dashboard`
   - Erwartung: der seeded Demo-Bonsai erscheint ohne Datenbankfehler
4. Bonsai create/read oder edit/read
   - Ziel: `/create-bonsai` und anschliessend `/bonsai/[id]`
   - Erwartung: ein neuer Bonsai kann angelegt werden oder ein bestehender Demo-Bonsai laesst sich bearbeiten und direkt wieder lesen
5. SubEntry create/read oder read
   - Ziel: `/bonsai/[id]/subentries`
   - Erwartung: vorhandene SubEntries des Demo-Bonsai laden oder ein neuer SubEntry kann angelegt und direkt wieder angezeigt werden
6. Reminder create/read oder status update
   - Ziel: `/reminders`
   - Erwartung: der offene Demo-Reminder laedt oder ein Reminder kann erstellt bzw. aktualisiert werden
7. Feed und Posts
   - Ziel: `/feed`
   - Erwartung: der seeded Demo-/Community-Bestand laedt und ein Post-Read oder Post-Write funktioniert, sofern die lokale Session verfuegbar ist
8. Waitlist und Signup-Gating
   - Ziel: `POST /api/access-requests`
   - Erwartung: eine lokale Waitlist-Anfrage kann gespeichert werden und die Seed-Identitaeten fuer Allowlist/Waitlist bleiben nachvollziehbar
9. Media-Pfade
   - Ziel: Bilder ueber `/api/media/` oder den aktiven Upload-Flow pruefen
   - Erwartung: bestehende Bilder werden ueber den App-Media-Pfad ausgeloest oder der Schritt wird als `skip` mit fehlender lokaler Storage-Konfiguration dokumentiert

Empfohlene Notizform pro Schritt:

- `pass`: was konkret funktioniert hat
- `skip`: welche lokale Voraussetzung fehlte
- `fail`: welcher Pfad oder Endpunkt mit welcher Fehlermeldung gebrochen ist

## Rueckstellung

1. Lokalen Dev-Server stoppen.
2. `DATABASE_URL` wieder auf den zuvor gesicherten lokalen Wert setzen.
3. Dev-Server und spaetere Prisma-Kommandos erneut mit der alten lokalen Konfiguration starten.
4. Ursache analysieren, bevor der Supabase-Zielwert erneut gesetzt wird.

## Nicht enthalten

1. Wechsel von Prisma auf direkte Supabase-Client-Zugriffe.
2. Einfuehrung von Row Level Security als primaeres App-Sicherheitsmodell.
3. Migration von NextAuth zu Supabase Auth.
4. Produktionsnahe Datenimporte oder produktiver Cutover.
