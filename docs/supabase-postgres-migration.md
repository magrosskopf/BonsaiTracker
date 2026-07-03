# Supabase Postgres Migration

## Ziel dieses Dokuments

Dieses Runbook dokumentiert nur die lokale Zielumgebung fuer die Supabase-Postgres-Migration.

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
2. Prisma-Kommandos gegen diese direkte Postgres-URL ausfuehren.
3. Bestehende App-Konfiguration fuer NextAuth, Mail und Storage nur dann lokal anpassen, wenn sie fuer spaetere Smoke-Tests gebraucht wird.

## Verifikation fuer dieses Repo

Dieses Issue dokumentiert nur den Zielwert und die Rueckstellbarkeit. Die eigentliche Schema-Initialisierung und Laufzeitverifikation folgen in spaeteren Issues.

Pruefe fuer diesen Stand:

1. `.env.example` zeigt eine direkte lokale Supabase-Postgres-URL.
2. Dieses Dokument beschreibt Prisma als Datenzugriffsschicht.
3. Dieses Dokument beschreibt, dass Prisma Accelerate lokal nicht verwendet wird.
4. Dieses Dokument beschreibt die Rueckstellung auf die vorherige lokale Datenbankkonfiguration.

## Rueckstellung

1. Lokalen Dev-Server stoppen.
2. `DATABASE_URL` wieder auf den zuvor gesicherten lokalen Wert setzen.
3. Dev-Server und spaetere Prisma-Kommandos erneut mit der alten lokalen Konfiguration starten.
4. Ursache analysieren, bevor der Supabase-Zielwert erneut gesetzt wird.

## Nicht enthalten

1. Wechsel von Prisma auf direkte Supabase-Client-Zugriffe.
2. Einfuehrung von Row Level Security als primaeres App-Sicherheitsmodell.
3. Migration von NextAuth zu Supabase Auth.
4. Schema-Migrationen, Seed-Lauf oder produktionsnahe Datenimporte.
