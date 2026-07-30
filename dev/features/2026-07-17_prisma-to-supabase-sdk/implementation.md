# Implementation Plan: Prisma-Runtime durch Supabase Platform SDK ersetzen

Status: IMPLEMENTED
Created: 2026-07-18
Last Modified: 2026-07-19

## Overview

Dieser Plan setzt die freigegebene Spec als vollstaendigen lokalen Cutover um:

1. Der vollstaendige lokale Supabase-Stack ersetzt Embedded Postgres und
   Prisma Migrate.
2. Supabase Auth ersetzt NextAuth fuer Google, Magic Link und Sessions.
3. Der Browser nutzt Supabase nur fuer Auth und sendet Access Tokens an
   Next.js API Routes.
4. Next.js validiert jeden Token und greift mit einem server-only Secret-Key-
   Client auf Data API, RPCs und Storage zu.
5. Fachliche Repositories verlangen immer eine validierte Actor-UUID.
6. SQL-Funktionen kapseln atomare und konkurrierende Operationen.
7. RLS und Grants sperren direkten Zugriff mit Publishable Key und
   Benutzer-Token, obwohl der Next.js-Server RLS mit dem Secret Key umgeht.
8. Prisma, NextAuth, der direkte Resend-Aufruf und alle direkten Runtime-
   Datenbankzugangsdaten werden am Ende entfernt.

Lokale Zwischenstaende duerfen beide Implementierungen enthalten. Vor dem
Abschluss muessen jedoch alle Runtime-Pfade gemeinsam umgestellt sein. Es wird
kein gemischter Zwischenstand deployed. Remote-Supabase-Aenderungen, ein
Remote-Reset oder ein Cutover werden durch diesen Plan nicht automatisch
ausgefuehrt.

## Reference

Freigegebene Spec:
[`spec.md`](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-07-17_prisma-to-supabase-sdk/spec.md)

Die Implementierung muss insbesondere diese Akzeptanzgruppen abdecken:

- Supabase Auth und UUID-Benutzeridentitaeten.
- Closed-Beta-Hook mit Allowlist, Capacity und atomarem Lock.
- Ausschliesslich backendseitiger Daten- und Storage-Zugriff.
- Explizite Ownership-Pruefungen trotz Secret-Key-RLS-Bypass.
- SQL-Migrationen, pgTAP, generierte Typen und Drift-Check.
- Atomare Post-, Archiv-, Reminder-, Like-, Rate-Limit- und Bildoperationen.
- Vollstaendige Entfernung von Prisma und NextAuth aus der Runtime.
- Reproduzierbarer Cutover mit Backup- und Rollback-Runbook.

Aktuelle offizielle Referenzen fuer die verwendeten Plattformmechanismen:

- Supabase Auth Hook `before_user_created`:
  https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook
- Lokale Auth-Hook-Konfiguration:
  https://supabase.com/docs/guides/auth/auth-hooks
- Serverseitig verifizierte Benutzerabfrage mit `auth.getUser(jwt)`:
  https://supabase.com/docs/reference/javascript/auth-getuser
- Supabase CLI Migrationen:
  https://supabase.com/docs/guides/deployment/database-migrations
- pgTAP und `supabase test db`:
  https://supabase.com/docs/guides/local-development/cli/testing-and-linting
- Generierte Datenbanktypen:
  https://supabase.com/docs/guides/local-development/cli-workflows
- Custom SMTP:
  https://supabase.com/docs/guides/auth/auth-smtp

## Non-Negotiable Invariants

1. `DATABASE_URL` darf in keinem Next.js-Runtime-Pfad gelesen werden.
2. `SUPABASE_SECRET_KEY` darf nie aus einem Modul importiert werden, das von
   Browser-Code erreichbar ist.
3. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ist oeffentlich und wird nur fuer
   Auth verwendet.
4. API Routes leiten eine Actor-UUID ausschliesslich aus einem serverseitig
   verifizierten Bearer Token ab.
5. Client-Body, Query-Parameter und URL-IDs duerfen die Actor-UUID niemals
   ueberschreiben.
6. Jede Repository-Funktion fuer benutzerbezogene Daten verlangt
   `actorUserId: string` als erstes Argument.
7. Fremde private Ressourcen ergeben `404`, nicht `403`.
8. Alle Anwendungs-Tabellen haben RLS, aber keine `anon`- oder
   `authenticated`-Policies.
9. SQL-Funktionen fuer den Next.js-Server sind fuer `public`, `anon` und
   `authenticated` gesperrt und nur fuer die Postgres-Rolle `service_role`
   ausfuehrbar. Diese Rollenbezeichnung ist eine Datenbankrolle und kein
   Rueckfall auf den alten Key-Namen.
10. Alle SQL-Funktionen verwenden eine feste leere `search_path` und voll
    qualifizierte Objektnamen. Sollte ausnahmsweise `SECURITY DEFINER`
    erforderlich werden, braucht dies zusaetzlich eine dokumentierte
    Begruendung und einen erneuten Plan-Review.
11. E-Mail-Adressen werden mit `trim().toLowerCase()` normalisiert.
12. API-DTOs bleiben camelCase. Nur User- und Profile-IDs werden UUID-Strings.
13. Alle verwalteten Storage-Objekte erhalten als ersten Key-Abschnitt die
    Actor-UUID.
14. Kein Remote-Reset, `db reset --linked`, `db push` oder Secret-Update wird
    ohne separate ausdrueckliche Freigabe ausgefuehrt.

## File Structure

### Files to create

#### Supabase project

- `supabase/config.toml`
  - Lokale Auth-, API-, Storage- und Mail-Catcher-Konfiguration.
  - `site_url` und erlaubte Redirects fuer `http://localhost:3000`.
  - Aktivierter Postgres-Hook unter `[auth.hook.before_user_created]` mit
    `pg-functions://postgres/public/before_user_created`.
  - Google lokal standardmaessig deaktiviert; Integrationstests verwenden
    lokale Testidentitaeten statt echte OAuth-Secrets.
- `supabase/migrations/20260718000100_app_baseline.sql`
  - Enums, Tabellen, Constraints, Indizes, `updated_at`-Trigger, RLS und
    Grundrechte.
- `supabase/migrations/20260718000200_auth_and_signup.sql`
  - Profil-Trigger, Signup-Helfer, Before-User-Created-Hook,
    `precheck_signup`, `consume_auth_rate_limit` und
    `approve_waitlist`.
- `supabase/migrations/20260718000300_service_rpcs.sql`
  - Atomare fachliche RPCs und Medienberechtigungsfunktion.
- `supabase/migrations/20260718000400_storage.sql`
  - Privater Bucket `bonsai-beta-media`, idempotente Anlage und explizites
    Entfernen direkter Storage-Policies fuer `anon` und `authenticated`.
- `supabase/seed.sql`
  - Ausschliesslich lokale Settings und reproduzierbare Testkonfiguration.
  - Aktiviert Signups/Waitlist mit Capacity `100` und erlaubt mindestens
    `user-a@example.test`, `user-b@example.test` sowie getrennte
    `capacity-*@example.test`-Adressen. Keine Remote-Secrets.
- `supabase/tests/001_schema.test.sql`
  - Tabellen, Spalten, Enums, Defaults, Constraints und Indizes.
- `supabase/tests/002_security.test.sql`
  - RLS, Grants, Function-Execute-Rechte und Storage-Policies.
- `supabase/tests/003_auth_hooks.test.sql`
  - Signup-Entscheidungen, Profil-Trigger und Fail-closed-Verhalten.
- `supabase/tests/004_service_rpcs.test.sql`
  - Ownership, Atomaritaet, Rollback und Rueckgabevertraege der RPCs.

#### Supabase TypeScript boundary

- `types/supabase.ts`
  - Ausschliesslich durch Supabase CLI generierte `Database`-Typen.
- `types/database.ts`
  - Kleine lesbare Aliase fuer Row-, Insert-, Update- und RPC-Typen, ohne die
    generierte Datei manuell zu veraendern.
- `lib/config/runtime.ts`
  - Getrennte, fail-fast gelesene Browser-, Server- und Storage-Konfiguration.
- `lib/supabase/browser.ts`
  - Browser-Singleton mit Publishable Key, persistierter Session,
    Auto-Refresh und PKCE. Automatische URL-Erkennung bleibt aus, weil die
    Callback-Page den Code genau einmal explizit tauscht.
- `lib/supabase/server-auth.ts`
  - Server-only Client mit Publishable Key fuer `auth.getUser(token)`.
- `lib/supabase/server-data.ts`
  - Server-only Client mit Secret Key fuer Data API, RPC und Storage;
    Session-Persistenz und Auto-Refresh deaktiviert.
- `lib/supabase/errors.ts`
  - Zentraler, sanitizender Mapper fuer PostgREST-, Auth- und Storage-Fehler.

#### Auth and client transport

- `components/AuthProvider.tsx`
  - Zentraler Auth-Kontext mit `session`, `user`, Status und Logout.
- `components/AuthenticatedImage.tsx`
  - Laedt `/api/media/*` mit `apiFetch`, erzeugt eine Blob-URL und gibt sie
    beim Unmount frei. Externe, nicht verwaltete URLs bleiben normale Bilder.
- `lib/api/client.ts`
  - `apiFetch` fuer geschuetzte Next.js-Endpunkte mit Bearer Token und
    kontrolliertem einmaligem Session-Refresh vor einem Retry nach `401`.
- `lib/auth/use-require-auth.ts`
  - Wiederverwendbarer Client-Hook fuer Redirect und Loading-Zustand
    geschuetzter Pages.
- `pages/auth/callback.tsx`
  - Tauscht den PKCE-Code gegen eine Session, behandelt Auth-Fehler generisch
    und leitet erfolgreich nach `/dashboard` weiter.

#### Data repositories

- `lib/repositories/bonsais.ts`
  - Owner-scoped List, Detail, Create, Patch, Archive/Restore und Bild-Linking.
- `lib/repositories/subentries.ts`
  - Owner-scoped List, Create, Patch und Delete samt Bildpfaden.
- `lib/repositories/reminders.ts`
  - Owner-scoped List, Create und Status-Update.
- `lib/repositories/posts.ts`
  - Feed, Detail, atomare Create/Update, Delete, Like und Kommentare.
- `lib/repositories/profiles.ts`
  - Public-in-Beta Profile, Self-Profil und Patch ohne E-Mail-Duplizierung.
- `lib/repositories/signup.ts`
  - Settings, Precheck, Waitlist-Upsert und Approval-RPC.
- `lib/repositories/media.ts`
  - Prueft Besitzer-Prefix und Community-/Profil-Referenzen vor Download oder
    Delete.

#### Scripts, CI and tests

- `scripts/generate-supabase-types.ts`
  - Fuehrt `supabase gen types --local --schema public` aus und schreibt die
    generierte Datei atomar.
- `scripts/check-supabase-types.ts`
  - Generiert in eine Temp-Datei und bricht bei Drift ab.
- `scripts/run-supabase-integration-tests.ts`
  - Liest lokale CLI-Statuswerte, setzt die kanonischen Env-Namen, startet
    einen Next.js-Testserver auf freiem Port und fuehrt Integrationstests
    seriell mit eindeutigen Fixture-E-Mails aus.
- `scripts/update-signup-settings.js`
  - Server-only Operator-Skript fuer `signup_enabled`, `waitlist_enabled` und
    `max_total_users` ueber den Secret-Key-Client.
- `scripts/cleanup-orphaned-media.ts`
  - Listet alte, unreferenzierte Objekte im privaten Bucket und loescht nur
    nach Dry-Run plus expliziter Bestaetigung.
- `.github/workflows/ci.yml`
  - Startet den lokalen Supabase-Stack und prueft DB, Typ-Drift, Unit-Tests,
    Integration, Typecheck und Build.
- `tests/supabase-config.test.ts`
  - Env-Trennung, Fail-fast und Verwechslung von Publishable/Secret Key.
- `tests/supabase-mappers.test.ts`
  - snake_case nach camelCase, Zeitwerte, Enums, UUIDs und E-Mail-Privacy.
- `tests/auth-client.test.ts`
  - Auth-Fehlermapping und `apiFetch`-Header-/Refresh-Verhalten.
- `tests/authenticated-image.test.ts`
  - Managed-vs-external URL-Auswahl und Blob-URL-Lifecycle auf Helferebene.
- `tests/integration/supabase-auth.test.ts`
  - Hook, Magic-Link-nahe Signup-Semantik, User A/User B und Tokens.
- `tests/integration/supabase-api.test.ts`
  - Geschuetzte API-Vertraege und Cross-Tenant-Zugriffe.
- `tests/integration/supabase-storage.test.ts`
  - Upload, Download, Zugriff, Kompensation und Delete.
- `tests/supabase-runtime-docs.test.ts`
  - Aktuelle Env-, Runbook- und Script-Guardrails.
- `docs/supabase-sdk-cutover.md`
  - Backup, lokale Umstellung, Remote-Voraussetzungen, Cutover und Rollback.

### Files to modify

- `package.json`, `package-lock.json`
  - Supabase CLI und `server-only` hinzufuegen.
  - Prisma-, NextAuth-, Resend-, Nodemailer- und Embedded-Postgres-
    Abhaengigkeiten entfernen, sobald keine Imports mehr bestehen.
  - Prisma-Hooks und Scripts durch Supabase-Scripts ersetzen.
- `.env.example`
  - Fuer Supabase und Auth nur kanonische Runtime-Namen dokumentieren:
    `NEXT_PUBLIC_SUPABASE_URL`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
    `SUPABASE_SECRET_KEY`,
    `SUPABASE_STORAGE_BUCKET`,
    Rate-Limit-Konfiguration und Healthcheck-Flag.
  - `DATABASE_URL`, NextAuth-, direkte Google-, direkte Resend-, Signup-Slot-
    und lokale Dateisystem-Storage-Variablen entfernen.
  - Unabhaengige App- und Analytics-Konfiguration unveraendert lassen.
- `.gitignore`
  - Supabase-Tempdateien und lokale Testartefakte ignorieren, aber
    Migrationen, Seed, Tests und generierte DB-Typen behalten.
- `AGENTS.md`, `CODING_ASSISTANT_PROMPT.md`
  - Aktuellen Stack und Datenmodellpfad auf Supabase CLI/SDK umstellen;
    Workflow-Regeln nicht veraendern.
- `types/dto.ts`
  - `userId` und Profil-`id` auf `string`; Domain-IDs bleiben `number`.
- `lib/mappers.ts`
  - Prisma-Typen durch explizite Repository-Record-Typen ersetzen.
- `lib/posts.ts`
  - Prisma-`SubEntry`-Import durch minimales strukturelles Interface ersetzen.
- `lib/authz.ts`
  - NextAuth-Session durch Bearer-Parsing und `auth.getUser(token)` ersetzen;
    Ownership-Datenzugriffe in Repositories verschieben.
- `lib/signup-gating.ts`
  - Env-/Slot-Logik entfernen; Precheck und Settings ueber Signup-Repository.
- `lib/rate-limit.ts`
  - Keys vor Speicherung mit SHA-256 hashen und atomaren RPC verwenden.
- `lib/storage/index.ts`, `lib/storage/supabase.ts`, `lib/storage/types.ts`
  - Nur noch Supabase Storage; Actor-UUID im Key; serverseitiger Download als
    Buffer statt Signed-URL-Redirect.
- `lib/uploads.ts`
  - Actor-UUID an Storage weiterreichen und bestehende MIME-/Groessenlimits
    beibehalten.
- `lib/api/request.ts`, `lib/api/response.ts`
  - UUID-Parser und zentralen sanitisierten Data-Error-Responder ergaenzen.
- Alle fachlichen API Routes:
  - `pages/api/bonsais.ts`
  - `pages/api/bonsais/[id].ts`
  - `pages/api/subentries.ts`
  - `pages/api/subentries/[id].ts`
  - `pages/api/reminders.ts`
  - `pages/api/reminders/[id].ts`
  - `pages/api/posts.ts`
  - `pages/api/posts/[id].ts`
  - `pages/api/posts/[id]/likes.ts`
  - `pages/api/posts/[id]/comments.ts`
  - `pages/api/profile/me.ts`
  - `pages/api/profiles/[id].ts`
  - `pages/api/upload.ts`
  - `pages/api/media/[...key].ts`
  - `pages/api/access-requests.ts`
  - `pages/api/auth/precheck.ts`
  - `pages/api/health.ts`
- Auth- und Fetch-Consumer:
  - `pages/_app.tsx`
  - `pages/index.tsx`
  - `pages/dashboard.tsx`
  - `pages/create-bonsai.tsx`
  - `pages/bonsai/[id].tsx`
  - `pages/bonsai/[id]/subentries.tsx`
  - `pages/bonsai/edit/[id].tsx`
  - `pages/feed.tsx`
  - `pages/reminders.tsx`
  - `pages/profile.tsx`
  - `pages/profile/[id].tsx`
  - `components/Navigation.tsx`
  - `components/LegalFooter.tsx`
- Bild-Consumer:
  - `pages/dashboard.tsx`
  - `pages/create-bonsai.tsx`
  - `pages/bonsai/[id].tsx`
  - `pages/bonsai/[id]/subentries.tsx`
  - `pages/bonsai/edit/[id].tsx`
  - `pages/feed.tsx`
  - `pages/profile/[id].tsx`
- `pages/datenschutz.tsx`
  - NextAuth/Resend-Direktversand durch Supabase Auth, Google und Supabase
    Custom SMTP mit Resend ersetzen.
- `scripts/init-local-supabase-db.sh`
  - Guarded Full-Stack-Start und `supabase db reset`, keine Prisma-Kommandos.
- `scripts/validate-local-supabase-checks.sh`
  - DB-Tests, Typ-Drift, App-Tests, Integration, Typecheck und Build.
- `scripts/run-local-supabase-validation.ts`
  - Docker/Supabase CLI statt Embedded Postgres orchestrieren.
- `scripts/approve-waitlist.js`
  - Secret-Key-Client plus `approve_waitlist`-RPC statt Prisma-Transaktion.
- `README.md`, `docs/IMPLEMENTATION_NOTES.md`,
  `docs/supabase-mvp-operations.md`, `docs/supabase-postgres-migration.md`,
  `docs/beta-approval-runbook.md`, `docs/backup-restore.md`,
  `docs/manual-beta-smoke-checklist.md`
  - Alte Prisma-/NextAuth-Anweisungen entfernen oder als historisch markieren
    und den neuen Betriebsweg dokumentieren.
- Bestehende Unit- und Contract-Tests
  - UUIDs, neue Record-Typen, Auth-Fehler und Storage-Konfiguration anpassen.

### Files and directories to delete after successful replacement

- `pages/api/auth/[...nextauth].ts`
- `lib/auth.ts`
- `lib/prisma.ts`
- `lib/storage/local.ts`
- `lib/config/beta.ts`
- `lib/search/bonsais.ts`
- `types/next-auth.d.ts`
- `types/embedded-postgres.d.ts`
- `tests/supabase-migration-docs.test.ts` nach Ersatz durch den neuen Test.
- `prisma/` einschliesslich Schema, Seed, generiertem Client und bisherigen
  Migrationen. Die Git-Historie ist die historische Referenz.

Unabhaengige ungetrackte Dateien und `tsconfig.tsbuildinfo` werden nicht
veraendert. Vor dem Entfernen des ungetrackten RLS-Migrationsordners muss dessen
RLS-Absicht nachweislich in der neuen Baseline und in pgTAP abgedeckt sein.

## Database Architecture

### Canonical schema

Alle Zeitstempel sind `timestamptz`. Numerische Domain-IDs sind
`integer generated by default as identity`. Enums behalten ihre bisherigen
API-Werte und erhalten snake_case Typnamen.

Verbindliche Enum-Werte:

- `indoor_outdoor_enum`: `INDOOR`, `OUTDOOR`, `BEIDES`.
- `health_status_enum`: `UNBEKANNT`, `SEHR_GUT`, `GUT`, `BEOBACHTEN`,
  `KRITISCH`.
- `development_stage_enum`: `UNBEKANNT`, `ROHLING`, `IN_GESTALTUNG`,
  `VERFEINERUNG`, `REIF`.
- `winter_hardiness_enum`: `NICHT_WINTERHART`, `BEDINGT_WINTERHART`,
  `WINTERHART`.
- `sun_exposure_enum`: `VOLLE_SONNE`, `HALBSCHATTEN`, `SCHATTEN`.
- `entry_type_enum`: `GIESSEN`, `DUENGEN`, `SCHNEIDEN`, `DRAHTEN`,
  `UMTOPFEN`, `KONTROLLE`, `FOTO_UPDATE`, `SONSTIGES`.
- `reminder_status_enum`: `PENDING`, `DONE`, `SNOOZED`.
- `post_type_enum`: `SHOWCASE`, `HELP`.
- `waitlist_status_enum`: `PENDING`, `APPROVED`, `REJECTED`.

#### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `name text null`
- `bio text null`
- `profile_image_url text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

E-Mail, OAuth-Identitaeten und Provider-Metadaten verbleiben in `auth.users`.

#### `bonsais`

- `id integer identity primary key`
- `user_id uuid not null references profiles(id) on delete cascade`
- `deleted_at timestamptz null`
- `name text not null`, `nickname text null`, `species text not null`
- `latin_name text null`, `location text not null`
- `indoor_outdoor indoor_outdoor_enum not null`
- `age`, `height_cm`, `width_cm`, `trunk_diameter_mm` als nullable integer mit
  nicht-negativen Check Constraints.
- `style text not null`, `custom_style text null`
- `owned_since timestamptz null`, `acquired_from text null`
- `purchase_price_cents integer null` mit nicht-negativem Check.
- `health_status health_status_enum not null`
- `development_stage development_stage_enum not null`
- `last_repot_date`, `next_repot_due` als nullable timestamptz.
- `winter_hardiness winter_hardiness_enum null`
- `sun_exposure sun_exposure_enum null`
- `pot_type`, `pot_color`, `watering_notes`, `fertilizing_notes`,
  `pruning_notes`, `wiring_notes`, `notes` als nullable text.
- `images text[] not null default '{}'`
- `created_at`, `updated_at` als nicht-null Zeitstempel.
- Unique-Hilfsconstraint `(id, user_id)` fuer zusammengesetzte FKs.
- Indizes entsprechend bisherigen Owner-, Archiv-, Update- und Feed-Zugriffen.

#### `sub_entries`

- `id integer identity primary key`
- `bonsai_id integer not null references bonsais(id) on delete cascade`
- `date timestamptz not null`
- `entry_type entry_type_enum not null`
- `health_observation health_status_enum null`
- `performed_actions text[] not null default '{}'`
- `next_action text null`, `reminder_date timestamptz null`, `notes text null`
- `images text[] not null default '{}'`
- `created_at`, `updated_at`
- Unique-Hilfsconstraint `(id, bonsai_id)` und bisherige Sortierindizes.

#### `reminders`

- `id integer identity primary key`.
- `user_id uuid not null references profiles(id) on delete cascade`
- `bonsai_id integer not null`
- `sub_entry_id integer null`
- `title text null`, `reminder_date timestamptz not null`.
- `status reminder_status_enum not null default 'PENDING'`.
- `completed_at timestamptz null`, `snoozed_until timestamptz null`.
- `created_at`, `updated_at` als nicht-null Zeitstempel.
- Zusammengesetzter FK `(bonsai_id, user_id)` stellt denselben Owner sicher.
- Zusammengesetzter FK `(sub_entry_id, bonsai_id)` stellt bei vorhandenem
  SubEntry denselben Bonsai sicher; `ON DELETE SET NULL (sub_entry_id)` setzt
  nur die optionale Spalte zurueck und behaelt `bonsai_id`.
- Status-, Datum- und Owner-Indizes bleiben erhalten.

#### Community tables

- `posts`
  - `id integer identity primary key`, `user_id uuid not null`,
    `bonsai_id integer not null`.
  - `text text not null`, `post_type post_type_enum not null`.
  - `snapshot_name text not null`, `snapshot_species text not null`.
  - `images text[] not null default '{}'`, `archived_at timestamptz null`.
  - `created_at`, `updated_at` als nicht-null Zeitstempel.
  - `(bonsai_id, user_id)` referenziert einen eigenen Bonsai.
- `post_entry_references`
  - `id integer identity primary key`, `post_id integer not null`,
    `sub_entry_id integer null`, `created_at timestamptz not null`.
  - Post-FK hat Cascade, SubEntry-FK `ON DELETE SET NULL`.
  - `(post_id, sub_entry_id)` ist eindeutig, soweit `sub_entry_id` nicht null
    ist.
- `post_likes`
  - `id integer identity primary key`, `post_id integer not null`,
    `user_id uuid not null`, `created_at timestamptz not null`.
  - Eindeutigkeit `(post_id, user_id)`.
- `post_comments`
  - `id integer identity primary key`, `post_id integer not null`,
    `user_id uuid not null`, `text text not null`.
  - `created_at`, `updated_at` als nicht-null Zeitstempel.
- Alle `user_id`-Spalten referenzieren `profiles(id) on delete cascade`.

#### Signup and operations tables

- `signup_settings`
  - Feste Zeile `id smallint primary key check (id = 1)`.
  - `signup_enabled boolean not null`.
  - `waitlist_enabled boolean not null`.
  - `max_total_users integer not null check (max_total_users >= 0)`.
  - Baseline-Default ist fail-closed: Signups aus, Capacity `0`.
  - Lokales Seed aktiviert die Testkonfiguration bewusst.
- `signup_allowlist`
  - `id integer identity primary key`, normalisierte eindeutige `email text`,
    `note text null`, `created_at` und `updated_at`.
  - Check Constraint erzwingt `email = lower(trim(email))`.
- `waitlist_requests`
  - `id integer identity primary key`, normalisierte eindeutige `email text`.
  - `source_ip text null`, `user_agent text null`.
  - `status waitlist_status_enum not null default 'PENDING'`.
  - `created_at`, `updated_at` als nicht-null Zeitstempel.
- `auth_rate_limit_events`
  - `id integer identity primary key`, `scope text not null`,
    `key_hash text not null`, `created_at timestamptz not null default now()`.
  - Es werden keine rohen E-Mail- oder IP-Keys gespeichert.
  - Index `(scope, key_hash, created_at)`.

### Shared triggers

1. `set_updated_at()` setzt `new.updated_at = statement_timestamp()`.
2. Der Trigger wird auf jeder mutierbaren Tabelle mit `updated_at` installiert.
3. `handle_new_auth_user()` legt das Profil mit `new.id` an und uebernimmt nur
   `full_name`/`name` und `avatar_url`/`picture` aus sicheren User-Metadaten.
4. Die E-Mail wird niemals in `profiles` kopiert.
5. Die Profilanlage laeuft in derselben Auth-Transaktion; Fehler brechen die
   Benutzeranlage ab.
6. Auch der Profil-Trigger bleibt `SECURITY INVOKER`; eine enge Insert-Policy
   und minimale Grants erlauben nur `supabase_auth_admin` die Systemanlage.

### Auth hook and signup functions

1. Eine private Normalisierungsfunktion behandelt E-Mails einheitlich.
2. Eine private Eligibility-Funktion prueft in dieser Reihenfolge:
   - existierender Auth-Benutzer: erlaubt,
   - fehlende oder ungueltige Settings: abgelehnt,
   - `signup_enabled = false`: abgelehnt,
   - E-Mail nicht auf Allowlist: abgelehnt,
   - `count(auth.users) >= max_total_users`: abgelehnt,
   - sonst erlaubt.
3. `public.before_user_created(event jsonb) returns jsonb`:
   - validiert vorhandene E-Mail,
   - nimmt einen festen `pg_advisory_xact_lock`,
   - ruft die private Eligibility-Funktion auf,
   - gibt `{}` bei Erfolg zurueck,
   - gibt einen generischen Auth-Hook-Fehler ohne Existenz-Offenlegung zurueck.
4. Nur `supabase_auth_admin` erhaelt `execute`; benoetigte Tabellenrechte werden
   mit engen Grants und ausschliesslich fuer diese Systemrolle geltenden RLS-
   Policies minimal vergeben. Der Hook bleibt `SECURITY INVOKER`.
5. Die private Eligibility-Funktion bleibt ebenfalls `SECURITY INVOKER`.
   `supabase_auth_admin` und `service_role` erhalten nur die fuer den
   bestehenden Benutzer-Check benoetigten Leserechte auf `auth.users`; `anon`
   und `authenticated` erhalten keine. Das Schema `auth` wird nicht in den
   exponierten PostgREST-Schemas konfiguriert.
6. `public.precheck_signup(p_email text)` ist service-only und liefert
   `allowed`, einen internen Reason-Code und `waitlist_enabled`. Die API
   uebersetzt Reasons in generische Benutzertexte.
7. `public.approve_waitlist(p_email text, p_note text default null)` ist
   service-only und fuehrt Allowlist-Upsert plus Waitlist-Status in einer
   Transaktion aus.
8. `public.consume_auth_rate_limit(...)` loescht abgelaufene Events, sperrt den
   Scope/Key per Advisory Lock, zaehlt und schreibt atomar und liefert
   `allowed`, `remaining` und `retry_after_seconds`.

### Service-only business RPCs

Die folgenden Funktionssignaturen und Verantwortungen sind verbindlich. JSONB-
Patch-Funktionen akzeptieren nur die jeweils explizit genannten Keys, lehnen
unbekannte Keys ab und verlassen sich nicht allein auf die API-Zod-Pruefung.

- `list_owned_bonsais`
  - Signatur: `(p_actor_user_id uuid, p_search text default null,
    p_species text default null, p_health_status health_status_enum default
    null, p_development_stage development_stage_enum default null,
    p_indoor_outdoor indoor_outdoor_enum default null, p_status text default
    'active', p_cursor_updated_at timestamptz default null,
    p_cursor_id integer default null, p_limit integer default 20)`.
  - Actor, optionale validierte Filter, Cursor und Limit.
  - Parametrisierte `ILIKE`-Suche ohne rohe PostgREST-Filterstrings.
  - Liefert `limit + 1` Zeilen plus SubEntry-Count in einem Request.
- `set_bonsai_archived`
  - Signatur: `(p_actor_user_id uuid, p_bonsai_id integer,
    p_archived boolean) returns integer`.
  - Sperrt den Bonsai, prueft Owner und archiviert/restauriert atomar.
  - Snoozed/Pending-Reminder werden im selben Vorgang angepasst.
- `append_bonsai_image`
  - Signatur: `(p_actor_user_id uuid, p_bonsai_id integer,
    p_media_path text) returns text[]`.
  - Sperrt die Zeile, prueft Owner und fuegt einen Pfad genau einmal hinzu.
- `patch_owned_bonsai`
  - Signatur: `(p_actor_user_id uuid, p_bonsai_id integer, p_patch jsonb,
    p_images_to_add text[], p_images_to_remove text[]) returns bonsais`.
  - Erlaubte Patch-Keys entsprechen den mutierbaren Bonsai-Feldern der
    bestehenden `bonsaiPatchSchema`, ausgenommen `images`.
  - Schreibt Scalar-Patch und explizite Add-/Remove-Mengen atomar, statt blind
    ein veraltetes Array zu ersetzen. Unbekannte parallele Additionen bleiben
    erhalten.
- `create_owned_sub_entry`, `patch_owned_sub_entry`,
  `delete_owned_sub_entry`
  - Signaturen:
    `(p_actor_user_id uuid, p_payload jsonb, p_images text[])
    returns sub_entries`,
    `(p_actor_user_id uuid, p_sub_entry_id integer, p_patch jsonb,
    p_images_to_add text[], p_images_to_remove text[]) returns sub_entries`
    und `(p_actor_user_id uuid, p_sub_entry_id integer) returns text[]`.
  - Erlaubte JSON-Keys entsprechen den Create-/Patch-Validatorfeldern ohne
    Actor-ID und `images`; Bilder werden nur ueber die typisierten
    Array-Parameter geaendert.
  - Pruefen Bonsai-Ownership und geben die fuer Storage-Kompensation
    erforderlichen Bildpfade zurueck.
- `create_owned_reminder`
  - Signatur: `(p_actor_user_id uuid, p_payload jsonb) returns reminders`.
  - Erlaubte Payload-Keys: `bonsaiId`, `subEntryId`, `title`, `reminderDate`,
    `status`, `completedAt`, `snoozedUntil`.
  - Prueft Actor, Bonsai und optionalen SubEntry in derselben Transaktion.
- `save_owned_post`
  - Signatur: `(p_actor_user_id uuid, p_post_id integer,
    p_bonsai_id integer, p_text text, p_post_type post_type_enum,
    p_entry_ids integer[], p_images text[]) returns integer`; `p_post_id` ist
    fuer Create null.
  - Ein gemeinsamer Create/Update-Pfad mit optionaler Post-ID.
  - Sperrt beim Update, prueft Owner/Bonsai/SubEntries/Bilder, schreibt Snapshot
    und ersetzt Referenzen atomar.
- `toggle_post_like`
  - Signatur: `(p_actor_user_id uuid, p_post_id integer) returns table
    (liked boolean, like_count integer)`.
  - Sperrt auf Post/Actor, toggelt atomar und liefert `{ liked, like_count }`.
- `can_access_media`
  - Signatur: `(p_actor_user_id uuid, p_media_path text) returns boolean`.
  - Erlaubt Owner-Prefix, referenzierte Community-Post-Bilder und
    Profilbilder innerhalb der geschlossenen Beta.
  - Private Bonsai-/SubEntry-Bilder fremder Benutzer bleiben gesperrt.
- `can_delete_media`
  - Signatur: `(p_actor_user_id uuid, p_media_path text) returns boolean`.
  - Erlaubt nur einen Actor-eigenen Key, der in keinem Bonsai, SubEntry, Post
    oder Profil mehr referenziert ist.

Jede Funktion wirft kontrollierte SQLSTATE-Codes fuer `not_found`, `conflict`
und `invalid_input`. `lib/supabase/errors.ts` mappt diese ohne SQL-Details auf
die bestehenden API-Envelopes.

## TypeScript Architecture

### Environment boundary

`lib/config/runtime.ts` stellt getrennte Funktionen bereit:

```ts
getBrowserSupabaseConfig(): {
  url: string;
  publishableKey: string;
}

getServerSupabaseConfig(): {
  url: string;
  publishableKey: string;
  secretKey: string;
  storageBucket: string;
}
```

Regeln:

- Browser-Konfiguration liest nur `NEXT_PUBLIC_*`.
- Server-Konfiguration lebt in server-only Modulen.
- Der Secret-Key-Validator akzeptiert hosted `sb_secret_*` sowie lokale
  CLI-Service-Keys unter dem kanonischen Env-Namen, lehnt aber eindeutig
  Publishable Keys als Secret ab.
- Lokale CLI-Ausgaben wie `ANON_KEY` oder `SERVICE_ROLE_KEY` werden nur im
  Test-Orchestrator auf die kanonischen App-Env-Namen gemappt. App-Code liest
  die Legacy-Namen nicht.
- Fehlende Werte erzeugen einen klaren Fehler ohne Key-Inhalt.

### Authentication boundary

`requireUser(req, res)` in `lib/authz.ts` liefert:

```ts
interface AuthenticatedUser {
  id: string;
  email: string | null;
}
```

Ablauf:

1. Exakt einen `Authorization: Bearer <token>`-Header akzeptieren.
2. Fehlende oder syntaktisch ungueltige Header mit `401` beantworten.
3. `serverAuthClient.auth.getUser(token)` aufrufen.
4. Auth-Fehler und fehlende User-ID mit `401` beantworten.
5. UUID validieren und nur `{ id, email }` an die Route geben.
6. Token, E-Mail und komplette Auth-Fehler nicht loggen.

### Browser auth

`AuthProvider`:

- liest initial `auth.getSession()` fuer den Client-Zustand,
- abonniert `onAuthStateChange`,
- raeumt das Abo beim Unmount auf,
- exponiert `loading | authenticated | unauthenticated`,
- bietet `signOut()` und leitet danach nach `/`.

Der Sessionzustand im Browser dient nur der Navigation. Die API vertraut ihm
nicht und validiert den Access Token bei jedem Request erneut.

Login-Flow:

- Google:
  `signInWithOAuth({ provider: "google", options: { redirectTo } })`.
- Magic Link:
  erst bestehende `/api/auth/precheck`-UX, danach
  `signInWithOtp({ email, options: { emailRedirectTo, shouldCreateUser: true } })`.
- Callback:
  `exchangeCodeForSession(code)`, dann `/dashboard`.
- Abgelehnte Signups und Callback-Fehler werden auf generische deutsche Texte
  gemappt; keine E-Mail-Existenz wird offengelegt.

### API client

Verbindliche Signatur:

```ts
apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { auth?: "required" | "none" },
): Promise<Response>
```

- Default ist `required`, damit neue geschuetzte Calls nicht versehentlich
  ohne Token entstehen.
- `none` ist nur fuer Precheck und Waitlist erlaubt.
- FormData behaelt seine automatische Content-Type-Boundary.
- Ein Retry nach `401` erfolgt hoechstens einmal und erst nach erfolgreichem
  `refreshSession()`.
- `apiFetch` loggt keine Header oder Tokens.

Die Package-Scripts werden verbindlich so zugeschnitten, dass Unit- und
Integrationstests nicht versehentlich vermischt werden:

```text
supabase:start              supabase start
supabase:stop               supabase stop
supabase:reset              supabase db reset
test:db                     supabase test db
supabase:types              tsx scripts/generate-supabase-types.ts
supabase:types:check        tsx scripts/check-supabase-types.ts
test                        tsx --test tests/*.test.ts
test:integration            tsx scripts/run-supabase-integration-tests.ts
validate:local-supabase     tsx scripts/run-local-supabase-validation.ts
```

Der Integrationstest-Orchestrator startet intern
`tsx --test --test-concurrency=1 tests/integration/*.test.ts`. Die Suiten
verwenden eindeutige Fixture-E-Mails und raeumen Testdaten ueber den
Secret/Admin-Client auf; sie laufen wegen des gemeinsamen lokalen Stacks nicht
parallel.

### Repository boundary

Repository-Funktionen geben explizite Record-Typen zurueck. API Routes
importieren nie `serverDataClient` direkt. Nur Repositories und Storage duerfen
den Secret-Client verwenden.

Beispiel:

```ts
getOwnedBonsai(actorUserId: string, bonsaiId: number): Promise<BonsaiRecord | null>
updateOwnedProfile(actorUserId: string, patch: ProfilePatch): Promise<ProfileRecord>
togglePostLike(actorUserId: string, postId: number): Promise<LikeResult>
```

Leserepositories verwenden eingebettete Relationen oder eine konstante Zahl
von Requests:

- Bonsai-Liste: ein RPC-Request.
- Bonsai-Detail: ein Data-API-Request mit sortierten SubEntries.
- Feed/Post-Detail: ein Request mit Profil, Likes, Comment-Count und Referenzen.
- Profil: hoechstens ein Profil- und ein Post-Request, unabhaengig von der
  Anzahl Posts.
- Reminder: ein Request mit eingebettetem Bonsai.

Repository-Factories duerfen fuer Tests einen expliziten Client erhalten. API
Routes erhalten trotzdem nur die gebundenen fachlichen Exporte, keinen
generischen Secret-Client.

### Mapper boundary

- Mapper akzeptieren Records mit snake_case String-Zeitstempeln.
- Sie erzeugen ausschliesslich die bestehenden camelCase-DTOs.
- User-/Profile-IDs bleiben Strings; numerische IDs werden nicht in Strings
  umgewandelt.
- `mapSelfProfileToDto` erhaelt die verifizierte Auth-E-Mail separat.
- `mapPublicProfileToDto` hat keinen E-Mail-Parameter und kann sie daher nicht
  versehentlich ausgeben.

### Authenticated media

1. Upload-Keys haben die Form `<actor-uuid>/<category>/<uuid>-<filename>`.
2. DTOs behalten `/api/media/supabase/<key>` als Media-Pfad.
3. `AuthenticatedImage` verwendet fuer solche Pfade `apiFetch`, liest den Blob
   und erzeugt eine lokale Object URL.
4. `/api/media/[...key]` prueft Bearer Token und `can_access_media`.
5. Die Route verwendet `storage.download()` mit Secret Key und liefert Bytes,
   MIME-Type und `private, no-store`; es gibt keinen Browser-Redirect zu
   Supabase Storage.
6. Alle aktuellen managed `<img>`-Verwendungen werden auf die Komponente
   umgestellt.
7. Nicht verwaltete Google-/externe Profilbild-URLs bleiben normale `<img>`-
   Quellen.
8. Bei DB-Link-Fehler nach Upload wird das neue Objekt sofort geloescht.
9. Form-Flows merken neu hochgeladene, noch nicht verknuepfte Pfade und rufen
   bei Abbruch oder fehlgeschlagener Anlage den authentifizierten
   `DELETE /api/media/[...key]`-Kompensationspfad auf.
10. Der Delete-Pfad erlaubt nur Owner-Prefix und nur unreferenzierte Objekte.
    Diese Entscheidung erfolgt ueber `can_delete_media`, nicht ueber die
    allgemeinere Leseberechtigung.
11. Das Orphan-Cleanup-Skript arbeitet standardmaessig als Dry-Run und beachtet
    eine Altersgrenze, damit aktive Formulare nicht bereinigt werden.

## API Route Migration Matrix

Alle geschuetzten Routen beginnen mit `requireUser`. Alle Repository-Aufrufe
erhalten `actor.id`.

- `GET/POST /api/bonsais`
  - `listOwnedBonsais`, `createOwnedBonsai`.
  - Cursor-Vertrag bleibt unveraendert.
- `GET/PATCH/DELETE /api/bonsais/[id]`
  - Detail/Patch sowie atomarer Archive/Restore-RPC.
  - Bild-Diffs werden als Add-/Remove-Mengen geschrieben; entfernte Storage-
    Objekte erst nach erfolgreichem DB-Commit bereinigen.
- `GET/POST /api/subentries`
  - Owner-List und atomarer Create-Pfad.
  - Bei Fehler alle in diesem Request neu gespeicherten Bilder entfernen.
- `PATCH/DELETE /api/subentries/[id]`
  - Owner-RPCs und anschliessende idempotente Storage-Kompensation.
- `GET/POST /api/reminders`
  - Owner-List und `create_owned_reminder`.
- `PATCH /api/reminders/[id]`
  - Update mit `.eq(id).eq(user_id, actor.id)` und `.select().maybeSingle()`;
    kein Treffer ergibt `404`.
- `GET/POST /api/posts`
  - Feed-Read und `save_owned_post` fuer Create.
- `GET/PATCH/DELETE /api/posts/[id]`
  - Feed-Detail, `save_owned_post` fuer Update und owner-scoped Delete.
- `POST /api/posts/[id]/likes`
  - Nur `toggle_post_like`.
- `GET/POST /api/posts/[id]/comments`
  - Sichtbarer Post erforderlich; Autor ist immer `actor.id`.
- `GET/PATCH /api/profile/me`
  - Profil aus DB, E-Mail aus `AuthenticatedUser`.
- `GET /api/profiles/[id]`
  - UUID-Parser statt numerischer ID; weiterhin nur fuer eingeloggte Beta-
    Benutzer sichtbar.
- `POST /api/upload`
  - Actor-Prefix, optionaler owned Bonsai, atomarer Bild-Link und Cleanup.
- `GET/DELETE /api/media/[...key]`
  - Authentifizierter Download bzw. Kompensation.
- `POST /api/access-requests`
  - Settings, atomare Rate Limits und Waitlist-Upsert ueber Repository.
- `POST /api/auth/precheck`
  - Atomare Rate Limits und service-only Eligibility-RPC; keine Slots.
- `GET /api/health`
  - Data-API-Abfrage auf Singleton-Settings und Storage-Bucket-Check; keine
    direkte SQL-Verbindung.
- `/api/auth/[...nextauth]`
  - Vollstaendig entfernen.

Methodenfehler, Zod-Statuscodes, Erfolgs-Envelopes und vorhandene deutsche
Benutzertexte bleiben erhalten, soweit die Spec keine Auth-Ausnahme definiert.

## Implementation Steps

### Step 1: Capture the baseline and add contract tests

1. Vor Aenderungen `npm test`, `npm run typecheck` und `npm run build`
   ausfuehren und vorhandene, nicht durch dieses Feature verursachte Fehler
   dokumentieren.
2. Den aktuellen Prisma-Schemaumfang in eine Checkliste gegen die neue Baseline
   uebertragen, einschliesslich des ungetrackten RLS-Migrationsziels.
3. DTO-Contract-Tests zuerst auf die bewusst neue UUID-Darstellung umstellen.
4. Tests fuer Auth-Header, Error Mapping und snake_case-Mapper anlegen.

Exit criterion:

- Die erwarteten Vertragsaenderungen sind in Tests sichtbar; fachliche
  numerische IDs und Response-Envelopes bleiben festgeschrieben.

### Step 2: Initialize the full local Supabase project

1. Supabase CLI als Dev Dependency installieren und locken.
2. `supabase/config.toml`, Migrationen, Seed und pgTAP-Struktur anlegen.
3. App-Baseline mit allen Tabellen, Constraints, Indizes, Triggern und RLS
   schreiben.
4. Auth-Hook, Grants und Signup-RPCs schreiben.
5. Service-RPCs und Storage-Bucket-Migration schreiben.
6. `supabase start`, `supabase db reset` und `supabase test db` ausfuehren.
7. Reset erneut ausfuehren, um Reproduzierbarkeit zu beweisen.

Exit criterion:

- Eine leere lokale Instanz wird ausschliesslich aus `supabase/` aufgebaut und
  alle pgTAP-Tests sind gruen.

### Step 3: Generate types and establish client boundaries

1. Typ-Generator und Drift-Check implementieren.
2. `types/supabase.ts` aus der migrierten lokalen Instanz erzeugen.
3. Browser-, Server-Auth- und Server-Data-Clients implementieren.
4. Server-only Importgrenzen und Env-Tests hinzufuegen.
5. Zentralen Supabase-Error-Mapper implementieren.

Exit criterion:

- Typecheck erkennt Tabellen/RPC-Signaturen; Secret-Module koennen nicht aus
  Client-Code importiert werden; Type-Drift-Check ist deterministisch.

### Step 4: Replace NextAuth in the browser and API auth boundary

1. `AuthProvider`, Callback Page, `useRequireAuth` und `apiFetch` implementieren.
2. `_app.tsx`, Login, Navigation, Legal Footer und alle geschuetzten Pages auf
   den neuen Auth-Status umstellen.
3. Google- und Magic-Link-Flow mit `/auth/callback` verbinden.
4. Alle geschuetzten JSON- und Multipart-Fetches auf `apiFetch` umstellen.
5. `lib/authz.ts` auf serverseitig verifiziertes `auth.getUser(token)`
   umstellen.
6. Alte NextAuth-Route und `lib/auth.ts` erst entfernen, wenn keine Imports
   mehr existieren.

Exit criterion:

- Client-Navigation nutzt Supabase Sessions; API-Aufrufe tragen Bearer Tokens;
  ungueltige Tokens ergeben `401`; es gibt keine NextAuth-Imports mehr.

### Step 5: Implement closed-beta auth and operator flows

1. Signup-/Rate-Limit-Repositories implementieren.
2. Precheck und Waitlist-Routen umstellen; `SignupSlot`-Semantik entfernen.
3. `approve-waitlist.js` und `update-signup-settings.js` auf Secret-Key-RPCs
   umstellen.
4. Hook-Integration ueber echten lokalen Auth-Service testen:
   - Signup aus,
   - nicht auf Allowlist,
   - Capacity `0`,
   - genau ein freier Platz bei parallelen Signups,
   - bestehender Benutzer bei spaeter gesperrten Signups.
5. Pruefen, dass jeder erfolgreiche User genau ein Profil ohne E-Mail erzeugt.

Exit criterion:

- Direkter Supabase-Auth-Signup kann Precheck nicht umgehen und Capacity-Races
  erzeugen nie mehr Benutzer als erlaubt.

### Step 6: Migrate bonsai, media and storage vertical slice

1. Bonsai-Repository und die zugehoerigen RPCs implementieren.
2. Bonsai-Routen auf Supabase umstellen und Mapper anpassen.
3. Storage nur noch ueber den Secret-Client verwenden; lokale Dateisystem-
   Implementierung entfernen.
4. Actor-Prefix, `AuthenticatedImage`, Media-Download und Media-Delete
   implementieren.
5. Alle Bonsai-, Composer- und Detailbilder auf `AuthenticatedImage` umstellen.
6. Upload-Linking, Bild-Diffs und Kompensationsfaelle testen.
7. Dashboard-Suche, Filter und Cursor gegen Sonderzeichen testen.

Exit criterion:

- User A kann eigene Bonsais und Bilder vollstaendig verwalten; User B erhaelt
  fuer dieselben IDs und privaten Bilder `404`; keine N+1- oder rohe
  `.or()`-Suche existiert.

### Step 7: Migrate subentries and reminders vertical slice

1. Repositories und RPCs implementieren.
2. SubEntry- und Reminder-Routen umstellen.
3. Multipart-Uploads und Storage-Cleanup bei Validation-, Ownership- und
   DB-Fehlern pruefen.
4. Archive/Restore plus Reminder-Status parallel testen.
5. UI-Fetches und Bilder auf die neuen Helfer umstellen.

Exit criterion:

- SubEntries und Reminder bleiben owner-scoped; zusammengesetzte Constraints
  verhindern inkonsistente Bonsai-/User-/SubEntry-Zuordnungen.

### Step 8: Migrate community and profiles vertical slice

1. Post-/Profile-Repositories und `save_owned_post`/`toggle_post_like`
   implementieren.
2. Feed-, Post-, Like-, Comment- und Profile-Routen umstellen.
3. `feed.tsx`, eigene und fremde Profile auf UUIDs und `apiFetch` umstellen.
4. Post- und Profilbilder ueber `AuthenticatedImage` laden.
5. Community-Medienzugriff fuer eingeloggte Benutzer und private Bonsai-
   Medienverweigerung testen.
6. Parallele Like-Toggles und fehlschlagende Post-Referenzupdates testen.

Exit criterion:

- Feed/Profile benoetigen eine konstante Requestzahl; Post-Updates sind atomar;
  E-Mail erscheint nur im Self-Profil.

### Step 9: Remove Prisma and obsolete runtime paths

1. Healthcheck auf Data API/Storage umstellen.
2. Letzte Prisma-Typimports aus Mappern und Helfern entfernen.
3. Prisma-, NextAuth-, Resend-, Nodemailer- und Embedded-Postgres-
   Dependencies/Scripts entfernen.
4. `prisma/`, alte Types und alte Storage-/Search-Module entfernen.
5. `rg`-Checks fuer Runtime-Imports und Env-Zugriffe ausfuehren.
6. Anwendung ohne `DATABASE_URL`, NextAuth-Secrets, Google-Client-Secret im
   Next.js-Prozess und Resend-API-Key bauen und starten.

Exit criterion:

- Kein Runtime- oder Build-Pfad importiert Prisma/NextAuth oder liest direkte
  DB-Credentials; Supabase SQL-Migrationen sind die einzige Schemaquelle.

### Step 10: Replace local tooling, CI and operations docs

1. Lokale Init-/Validation-Skripte auf Supabase CLI und Docker umstellen.
2. Integrationstest-Orchestrator und CI Workflow fertigstellen.
3. Env-Beispiel, README, Datenschutz und Runbooks aktualisieren.
4. Custom-SMTP-/Google-/Redirect-/Hook-Konfiguration fuer hosted Supabase
   dokumentieren, aber nicht remote anwenden.
5. Backup-, Storage-Export-, Cutover- und Rollback-Schritte dokumentieren.
6. Guardrail dokumentieren und testen: Remote-Reset nur nach separater
   Freigabe und verifiziertem Backup.

Exit criterion:

- Ein neuer Checkout kann lokal ohne Prisma und ohne direkte DB-URL gestartet,
  migriert, getestet und gebaut werden; Operator-Dokumente beschreiben den
  Zielzustand korrekt.

### Step 11: Final verification

Die Befehle in dieser Reihenfolge ausfuehren:

```bash
npm ci
npm run supabase:start
npm run supabase:reset
npm run test:db
npm run supabase:types:check
npm test
npm run test:integration
npm run typecheck
npm run build
npm run validate:local-supabase
```

Danach die manuellen hosted Voraussetzungen anhand des Cutover-Runbooks
pruefen, ohne Remote-Aenderungen auszufuehren.

Exit criterion:

- Alle automatisierten Checks sind gruen, alle Spec-Akzeptanzkriterien sind mit
  Test oder begruendetem manuellen hosted Smoke-Test verknuepft und keine
  Mischruntime verbleibt.

## Test Strategy

### Unit and contract tests

- Bearer-Header-Parsing und `401`.
- `apiFetch` mit JSON, FormData, Refresh und maximal einem Retry.
- Env-Trennung und Secret-Leak-Schutz.
- Mapper fuer jeden DTO-Typ.
- UUID-Parser und unveraenderte numerische Domain-ID-Parser.
- Error Mapping: `23505 -> 409`, `23503/23514 -> 400`, kontrollierte RPC-
  SQLSTATEs, unerwartet -> `500`.
- Media-Pfad-/Storage-Key-Roundtrip und Owner-Prefix.
- Login-Fehlermeldungen ohne NextAuth-spezifische Codes.
- Quell- und Dokumentationschecks fuer entfernte Runtime-Abhaengigkeiten.

### pgTAP database tests

- Vollstaendiges Schema und Enum-Werte.
- Alle Foreign Keys, Kaskaden, `SET NULL`, Checks, Unique Constraints und
  benoetigten Indizes.
- `updated_at` aendert sich bei Update und nicht willkuerlich bei Read.
- RLS auf jeder Tabelle.
- Keine Policies/Grants fuer `anon`/`authenticated`.
- Nur `service_role` kann service-only RPCs ausfuehren.
- Nur `supabase_auth_admin` kann den Auth Hook ausfuehren.
- Profile-Trigger kopiert keine E-Mail.
- RPC-Owner-Checks, Rollbacks und Rueckgabewerte.
- Post-Referenzen, Archive/Restore, Reminder, Likes und Bild-Diffs.

### Full-stack integration tests

Testrollen:

- Publishable/anon ohne Session.
- User A mit gueltigem Access Token.
- User B mit gueltigem Access Token.
- Secret/Admin nur im Test-Setup.

Faelle:

- Publishable/anon und authentifizierte Clients koennen Tabellen und RPCs nicht
  direkt lesen oder mutieren.
- API ohne, mit abgelaufenem und mit manipuliertem Token ergibt `401`.
- User A CRUD fuer jede private Ressource; User B gegen dieselbe ID ergibt
  `404`.
- Community Feed/Profile sind fuer A und B lesbar, Mutationen bleiben korrekt
  autorisiert.
- Signup-Hook und Capacity-Race ueber den echten lokalen Auth-Service.
- Atomarer Rate-Limit-Verbrauch unter parallelen Requests.
- Like-Toggle unter Parallelitaet hat ein deterministisches Ergebnis und keine
  Duplikate.
- Fehler mitten im Post-Update hinterlaesst alte Referenzen unveraendert.
- Archive/Restore aendert Bonsai und Reminder gemeinsam.
- Storage Upload/Download/Delete fuer Owner, Community-Bild fuer anderen
  eingeloggten Benutzer und Ablehnung privater fremder Bilder.
- DB-Link-Fehler loescht das frisch hochgeladene Objekt.
- Feed-, Profile- und Listenabfragen haben eine datenunabhaengige Anzahl
  Data-API-Requests.

### Manual hosted smoke tests before cutover

- Hosted Publishable und Secret Key sind die neuen Key-Typen.
- Google OAuth Callback zeigt auf Supabase Auth und die App-Redirect-URL ist
  erlaubt.
- Google-Neuanlage wird vom Hook abgelehnt/erlaubt wie konfiguriert.
- Magic Link wird ueber Supabase Auth Custom SMTP und Resend zugestellt.
- Session-Refresh und Logout funktionieren auf der echten Domain.
- Secret erscheint nicht in Client-Bundle, HTML, Source Maps oder Logs.
- Privater Bucket hat keine direkten Browser-Policies.
- Backup und Restore-Weg sind vor dem Cutover nachgewiesen.

## Edge Cases and Error Handling

- Auth-Service nicht erreichbar: API antwortet `401` nur bei nachweislich
  ungueltigem Token; Infrastrukturfehler werden sanitisiert als `500`
  behandelt, damit ein Auth-Ausfall nicht als Logout-Welle maskiert wird.
- Fehlende Profilzeile trotz gueltigem Auth-User: `404` plus sanitisiertes
  Serverlog; keine automatische unsichere Reparatur im Request.
- Hook-Settings-Zeile fehlt oder ist doppelt nicht moeglich: Signup fail-closed.
- E-Mail fehlt im Auth-Hook-Event: Signup fail-closed.
- Capacity `0`: alle neuen Benutzer abgelehnt, bestehende Sessions/Logins
  bleiben moeglich.
- Zwei Signups fuer den letzten Platz: Advisory Lock serialisiert; genau einer
  wird angelegt.
- PostgREST `.maybeSingle()` liefert keine Zeile: fachlich `404`, nicht `500`.
- Gleichzeitige Bild-Append- und Patch-Requests: Row Lock plus Add-/Remove-
  Mengen verhindert Verlust unbekannter Additionen.
- Storage-Upload erfolgreich, DB fehlgeschlagen: sofortiges idempotentes
  Remove; Remove-Fehler mit storage key hash und Actor-ID loggen, nie Secret.
- Storage-Delete nach DB-Erfolg fehlgeschlagen: DB-Antwort bleibt erfolgreich,
  Cleanup wird als nachholbarer Orphan protokolliert.
- Abgebrochenes Formular: best-effort DELETE fuer unreferenzierte neue Bilder;
  Altersgrenzen-Cleanup als zweite Sicherung.
- Externe Profilbild-URL: kein Secret-Download; normale URL, vorhandene
  Validator-Laengenlimits bleiben bestehen.
- Suchbegriffe mit Komma, Prozent, Unterstrich, Klammern und Unicode werden als
  SQL-Parameter behandelt und koennen keine Filterstruktur veraendern.
- Cursor mit ungueltigem Datum oder ID bleibt `400`.
- Remote-Supabase nicht erreichbar: keine automatische Rueckkehr zu Prisma
  oder direkter PostgreSQL-Verbindung.

## Integration Points

- Supabase Auth liefert Identitaet und E-Mail; `profiles` liefert nur
  Anwendungsprofilfelder.
- Next.js API Routes bleiben die oeffentliche fachliche HTTP-Grenze.
- Supabase Data API und RPC sind nur serverseitige Implementierungsdetails.
- Supabase Storage bleibt privat und wird nur durch Next.js ausgeliefert.
- Google OAuth wird im Supabase Dashboard/Management API konfiguriert, nicht
  mehr mit Next.js-Env-Variablen.
- Resend liefert SMTP fuer Supabase Auth, nicht mehr E-Mails aus Next.js.
- Supabase CLI ist die einzige Schema-/Migrationsschnittstelle.
- Docker ist Voraussetzung fuer lokale DB-, Auth-, Storage- und pgTAP-Tests.
- CI verwendet denselben lokalen Stack und dieselben Repo-Scripts wie die
  Entwicklung.

## Technical Decisions

1. `auth.getUser(token)` wird fuer die API-Autorisierung verwendet, weil es den
   Access Token beim Auth-Service verifiziert; der Server vertraut keinem
   lokal decodierten Payload.
2. Kein Supabase SSR-Cookie-Paket: Der vereinbarte Transport ist Bearer Token
   aus einer clientseitigen Session im Pages Router.
3. Kein direkter Browser-Datenzugriff: RLS bleibt Default-deny und Next.js ist
   die fachliche Grenze.
4. Secret-Key-Client statt User-gebundener Data-Clients: Dadurch sind
   Ownership-Pruefungen in Route, Repository und RPC verpflichtend.
5. SQL-RPCs nur fuer atomare, konkurrierende oder ownership-kritische
   Mehrschrittvorgaenge; einfache owner-scoped CRUD-Queries bleiben typisierte
   Data-API-Aufrufe.
6. Vollstaendiger Supabase-Stack statt Embedded Postgres: Auth Hooks, GoTrue,
   PostgREST, Storage und RLS lassen sich sonst nicht realistisch pruefen.
7. Storage-Download wird durch Next.js gestreamt/heruntergeladen, nicht per
   Signed URL umgeleitet, damit der Browser Supabase Storage nie direkt nutzt.
8. Authenticated Images werden als Blob geladen, weil normale `<img>`-Requests
   keinen Bearer Header setzen koennen.
9. Baseline startet Signups fail-closed; Aktivierung ist ein expliziter
   Operator-Schritt.
10. Lokale Legacy-JWT-Werte der CLI duerfen unter den neuen kanonischen
    Env-Namen verwendet werden; hosted Deployment verwendet Publishable- und
    Secret-Keys.
11. Git-Historie ersetzt ein im Arbeitsbaum verbleibendes Prisma-Archiv.
12. Remote-Migration ist bewusst ein spaeterer, separat freizugebender
    Betriebsakt.

## Validation Checklist

### Architecture and security

- [ ] Kein `@prisma/client`, `prisma`, `next-auth` oder Prisma Adapter in
      Runtime, Scripts oder Package Dependencies.
- [ ] Kein `DATABASE_URL` in `.env.example`, Next.js-Code oder Build-Scripts.
- [ ] Keine direkten Google- oder Resend-Secrets im Next.js-Prozess.
- [ ] Secret-Key-Modul ist server-only und nicht aus Client-Code erreichbar.
- [ ] Alle API Routes validieren Bearer Tokens vor Datenzugriff.
- [ ] Jede benutzerbezogene Repository-Funktion verlangt Actor-UUID.
- [ ] Alle Anwendungs-Tabellen haben RLS und Default-deny fuer Browserrollen.
- [ ] Service-RPC- und Auth-Hook-Grants sind minimal und getestet.
- [ ] Browser-Bundles enthalten keinen Secret Key.

### Database and data access

- [ ] `supabase db reset` funktioniert zweimal hintereinander.
- [ ] `supabase test db` ist gruen.
- [ ] Typen sind generiert und Drift-Check ist gruen.
- [ ] User-IDs sind UUID; Domain-IDs bleiben Zahlen.
- [ ] E-Mail existiert nicht in `profiles` oder Public DTOs.
- [ ] `updated_at`-Trigger sind auf allen mutierbaren Tabellen aktiv.
- [ ] Signup-Capacity, Rate Limit, Likes, Archive/Restore, Posts und Bild-Diffs
      sind atomar getestet.
- [ ] Suche verwendet parameterisierte SQL-Argumente.
- [ ] Listen/Feed/Profile haben keine datenabhaengigen Requestzahlen.

### Auth and UI

- [ ] Google- und Magic-Link-Flows verwenden Supabase Auth.
- [ ] Auth Callback, Refresh und Logout funktionieren.
- [ ] Geschuetzte Pages redirecten erst nach abgeschlossenem Auth-Loading.
- [ ] Alle geschuetzten Fetches verwenden `apiFetch`.
- [ ] User-/Profile-Links verwenden UUID-Strings.
- [ ] Alle managed Bilder verwenden `AuthenticatedImage`.

### Storage and operations

- [ ] Bucket ist privat und besitzt keine Browser-Policies.
- [ ] Storage-Keys beginnen mit Actor-UUID.
- [ ] Fremde private Bilder sind `404`; Community-Bilder sind fuer
      eingeloggte Beta-Benutzer sichtbar.
- [ ] Upload-/DB-Fehler und Form-Abbruch haben getestete Kompensation.
- [ ] Orphan-Cleanup ist Dry-Run per Default.
- [ ] Init-, Validation-, Backup-, Cutover- und Rollback-Dokumentation ist
      aktuell.
- [ ] Keine Remote-Aenderung wurde ohne separate Freigabe ausgefuehrt.

### Final commands

- [x] `npm test`
- [x] `npm run test:db`
- [x] `npm run test:integration` (fixture tests are present but skipped until test users are provisioned)
- [x] `npm run supabase:types:check`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run validate:local-supabase`

## Plan Approval Gate

Es gibt keine offenen Implementierungsentscheidungen. Vor Produktivcode muss
dieser Plan gemaess Workflow ausdruecklich mit `PLAN-APPROVED` oder einer
gleichwertigen eindeutigen Bestaetigung freigegeben werden.
