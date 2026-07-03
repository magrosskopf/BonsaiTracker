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
4. Login oder Auth-Konfiguration plausibilisieren
5. Dashboard laden
6. Bonsai lesen oder anlegen
7. Subentry lesen oder anlegen
8. Reminder lesen oder anlegen
9. Feed/Post-Funktion plausibilisieren
10. Waitlist/Signup-Gating pruefen

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
