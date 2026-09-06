# Pflegeplan als erstes Paywall-Feature

Status: COMPLETE
Last modified: 2026-09-06

## Overview

Implementiert wird ein vertikaler Pflegeplan-Paywall-Schnitt ueber Datenmodell, Domain-Logik, API und UI. Nutzer koennen eine kuratierte Pflanzenart getrennt vom vorhandenen Art-Freitext speichern, eine 12-Monats-Pflegeplan-Vorschau sehen und mit aktivem serverseitigem Entitlement explizit System-Reminder erzeugen, synchronisieren oder nach Artenwechsel ersetzen. Stripe Checkout und Stripe Customer Portal bilden den bezahlten Zugang ab; lokale Entitlements werden nur durch Webhooks oder serverseitige Subscription-Synchronisierung gesetzt, nicht durch Return-URLs.

## Reference

Spec: `dev/features/2026-09-06_pflegeplan-paywall/spec.md`

Wichtige Akzeptanzkriterien:
- Freie Nutzer sehen Vorschau und Paywall, koennen aber keine Pflegeplaene aktivieren oder synchronisieren.
- Checkout Success/Cancel erzeugt weder Entitlement noch Reminder.
- Aktives Entitlement erlaubt explizite Aktivierung fuer rolling 12 Monate ab Aktivierungsdatum.
- System-Reminder nutzen den 1. Tag des Zielmonats, enthalten Origin-Daten und werden idempotent erzeugt.
- Ersetzung storniert offene alte System-Reminder und behaelt erledigte System-Reminder als Historie.
- Nutzer-Reminder bleiben frei editierbar; System-Reminder erlauben nur done, constrained snooze und remove.
- Profil zeigt lokalen Pflegeplan-Zugang und bietet Stripe Customer Portal.
- `npm test`, `npm run typecheck` und relevante DB-/Supabase-Checks sind gruen.

## File Structure

Zu erstellen:
- `lib/care-plans/catalog.ts`
- `lib/care-plans/rules.ts`
- `lib/care-plans/generate.ts`
- `lib/care-plans/service.ts`
- `lib/care-plans/entitlements.ts`
- `lib/stripe/server.ts`
- `pages/api/care-plans/preview.ts`
- `pages/api/bonsais/[id]/care-plan.ts`
- `pages/api/billing/checkout.ts`
- `pages/api/billing/portal.ts`
- `pages/api/stripe/webhook.ts`
- `tests/care-plan-generation.test.ts`
- `tests/care-plan-service.test.ts`
- `tests/care-plan-api-source.test.ts`
- `tests/stripe-entitlement.test.ts`

Zu aendern:
- `types/supabase.ts`
- `types/database.ts`
- `types/domain.ts`
- `types/dto.ts`
- `lib/config/runtime.ts`
- `lib/validators/bonsai.ts`
- `lib/validators/reminder.ts`
- `lib/forms.ts`
- `lib/config/forms.ts`
- `lib/mappers.ts`
- `lib/repositories/bonsais.ts`
- `lib/repositories/reminders.ts`
- `lib/repositories/profiles.ts`
- `pages/api/bonsais.ts`
- `pages/api/bonsais/[id].ts`
- `pages/api/reminders.ts`
- `pages/api/reminders/[id].ts`
- `pages/api/profile/me.ts`
- `pages/api/v1/bonsais/index.ts`
- `pages/api/v1/bonsais/[id].ts`
- `pages/api/v1/reminders/index.ts`
- `pages/api/v1/reminders/[id].ts`
- `components/BonsaiForm.tsx`
- `pages/create-bonsai.tsx`
- `pages/bonsai/[id].tsx`
- `pages/bonsai/edit/[id].tsx`
- `pages/reminders.tsx`
- `pages/profile.tsx`
- `.env.example`
- `README.md`
- bestehende Tests fuer Bonsai-, Reminder-, Profil- und Runtime-Kontrakte
- `dev/features/2026-09-06_pflegeplan-paywall/spec.md`
- `dev/features/2026-09-06_pflegeplan-paywall/implementation.md`

Datenbankartefakte:
- Falls die Supabase-Migrationsquelle in diesem Checkout fehlt, vor der Implementierung klaeren oder wiederherstellen. Ohne versionierte Migration kann das Feature nicht vollstaendig ausgeliefert werden.
- Erwartete Migration: neue Bonsai-Felder, neue Reminder-Origin-Felder, Entitlement-/Stripe-Tabellen, RLS/Policies, Indizes und angepasste RPCs.

## Data Model

`bonsais`:
- `care_plan_species_id text null`
- `care_plan_active boolean not null default false`
- `care_plan_version text null`
- `care_plan_activated_at timestamptz null`
- `care_plan_replaced_at timestamptz null`
- Keine Migration bestehender `species`-Freitexte nach `care_plan_species_id`.

`reminders`:
- `source text not null default 'USER'` mit Werten `USER`, `CARE_PLAN`
- `care_type text null`
- `care_plan_version text null`
- `care_plan_species_id text null`
- `care_plan_rule_id text null`
- `care_plan_target_month date null`
- Unique-Index fuer aktive System-Reminder: `(user_id, bonsai_id, care_plan_version, care_plan_species_id, care_plan_rule_id, care_plan_target_month)` gefiltert auf `source='CARE_PLAN'` und `status in ('PENDING','SNOOZED')`.
- Cancelled und done bleiben als Origin-Entscheidung erhalten und duerfen nicht durch Sync neu erzeugt werden.

Entitlement/Billing:
- `user_entitlements`: `user_id`, `feature`, `active`, `source`, `stripe_customer_id`, `stripe_subscription_id`, `stripe_subscription_status`, `current_period_end`, `updated_at`.
- `stripe_customers`: `user_id`, `stripe_customer_id`, `created_at`, `updated_at`.
- Optional `stripe_webhook_events`: `event_id`, `type`, `received_at` fuer idempotente Webhook-Verarbeitung.

Supabase Types:
- Nach Migration `npm run supabase:types` ausfuehren oder `types/supabase.ts` synchron halten.
- `types/database.ts` um `UserEntitlementRow` und ggf. `StripeCustomerRow` erweitern.

## Implementation Steps

1. Tests fuer die wichtigsten Seams vorziehen:
   - Pflegeplan-Generierung: Katalog, 12 Monate, erster Monatstag, Indoor/Outdoor, Outdoor-Default, kein watering.
   - Entitlement-Mapping: Stripe-Status zu aktiv/inaktiv.
   - Service/Repository-Verhalten: Aktivierung blockiert ohne Entitlement, idempotente Erzeugung, Ersetzung, keine Neuerzeugung von done/cancelled.
   - Source-/Handler-Tests fuer Return-URL-Sicherheit, System-Reminder-Patch-Restriktionen und v1-Aliase.
2. Migration und Supabase-Typen ergaenzen:
   - Tabellen/Felder/Indizes/RPCs anlegen.
   - RLS so formulieren, dass Nutzer nur eigene Bonsais, Reminder und Entitlement-Status sehen; Webhook-Updates laufen ueber Service Role.
   - Existing records behalten Defaults ohne Auto-Aktivierung.
3. Domain-Layer implementieren:
   - Katalog mit `ficus`, `chinese-elm`, `japanese-maple`, `juniper`, `pine`, `azalea`, `privet`, `hornbeam`, `beech`, `serissa`.
   - Versionierte Regelmenge, z. B. `CARE_PLAN_VERSION = '2026-09-06.v1'`.
   - Pflegearten als stabile interne Werte: `FERTILIZING`, `PRUNING`, `WIRING`, `REPOTTING`, `INSPECTION`.
   - Preview-Generator erzeugt date-only ISO-Werte fuer rolling 12 Monate; Regeln mit Placement-Constraint filtern.
4. Repositories erweitern:
   - Bonsai create/patch payload nimmt `carePlanSpeciesId` auf, aber aktiviert nie automatisch.
   - Reminder create bleibt fuer Nutzer-Reminder default `source='USER'`.
   - Neue Repository-Funktionen fuer Care-Plan-Reminder Bulk-Upsert/Skip, alte offene System-Reminder canceln, Bonsai-Aktivstatus setzen und Entitlement lesen/schreiben.
5. Service-Layer implementieren:
   - `getCarePlanPreview(input)` ohne Entitlement.
   - `activateCarePlan(userId, bonsaiId, now)` prueft eigenes Bonsai, Species-Auswahl und Entitlement, erzeugt fehlende System-Reminder, setzt Bonsai-Aktivstatus.
   - `syncCarePlan(userId, bonsaiId, now)` prueft Entitlement und ergaenzt nur fehlende zukuenftige Origin-Monate.
   - `replaceCarePlan(userId, bonsaiId, now)` prueft Entitlement, storniert offene alte System-Reminder, setzt neue Species/Version, erzeugt neue Reminder.
6. API-Handler hinzufuegen/aendern:
   - `GET /api/care-plans/preview?speciesId=&indoorOutdoor=&from=` fuer freie Vorschau.
   - `GET /api/bonsais/:id/care-plan` liefert Bonsai-Kontext, Vorschau, Aktivstatus, Entitlement und Replacement-Hinweis.
   - `POST /api/bonsais/:id/care-plan` mit `action: 'activate' | 'sync' | 'replace'`.
   - `POST /api/billing/checkout` erstellt Stripe Checkout Session mit Bonsai-Kontext in Success/Cancel-URLs und optional Metadata.
   - `POST /api/billing/portal` erstellt Stripe Customer Portal Session.
   - `POST /api/stripe/webhook` verifiziert Stripe-Signatur und aktualisiert lokale Entitlements.
7. Reminder-API absichern:
   - `POST /api/reminders` erzeugt weiterhin nur Nutzer-Reminder.
   - `PATCH /api/reminders/:id` erlaubt fuer `source='CARE_PLAN'` nur `status=DONE`, `status=CANCELLED` und `snoozeDays`.
   - Freie Felder wie `title`, `bonsaiId`, `reminderDate`, `careType` und Origin bleiben fuer System-Reminder unveraenderbar.
8. UI integrieren:
   - `BonsaiForm` bekommt ein curated-species Select getrennt von `species`.
   - Create/Edit senden `carePlanSpeciesId`; bestehender Freitext bleibt unveraendert.
   - Detailseite zeigt Vorschau, typischen Timing-Hinweis, Aktivstatus, Replacement-Hinweis, Paywall mit Checkout-CTA oder Aktivieren/Synchronisieren/Ersetzen.
   - Reminders-Seite zeigt System-Reminder visuell unterscheidbar und blendet freie Edit-Felder fuer System-Reminder aus.
   - Profil zeigt Pflegeplan-Zugang und Portal-Button.
9. Runtime-Konfiguration:
   - Ergaenze Server-Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CARE_PLAN_PRICE_ID`, `NEXT_PUBLIC_APP_URL`.
   - Stripe-Client nur serverseitig importieren; Public Client bleibt stripe-frei.
10. Status/Doku aktualisieren:
   - Spec am Ende auf `IMPLEMENTED`, Plan auf `COMPLETE`.
   - README/.env.example um Stripe/Pflegeplan-Betrieb ergaenzen.

## Code Architecture

- `lib/care-plans/catalog.ts` enthaelt nur Arten-Metadaten und Labels.
- `lib/care-plans/rules.ts` enthaelt versionierte Rule-Definitionen als readonly App-Daten.
- `lib/care-plans/generate.ts` ist pure TypeScript-Logik ohne Supabase/Stripe und der primaere TDD-Seam.
- `lib/care-plans/entitlements.ts` kapselt Feature-Konstante, Stripe-Status-Mapping und Repository-DTOs.
- `lib/care-plans/service.ts` orchestriert Repositories, Entitlement und Generator. API-Handler halten nur Auth, Validation und Response-Mapping.
- `lib/stripe/server.ts` initialisiert Stripe serverseitig und kapselt Checkout/Portal/Webhook-Helfer.
- Bestehende `/api/v1/*` Bonsai-/Reminder-Aliase importieren weiterhin die Web-Handler; neue Care-Plan-Endpoints erhalten nur dann v1-Aliase, wenn mobile API-Kompatibilitaet in der Implementierung bewusst mitgezogen wird.

## Technical Decisions

- Die erste Umsetzung bleibt bei code-versionierten Regeln statt DB-Editorialdaten.
- `care_plan_species_id` ist nullable, damit bestehende Bonsais unveraendert bleiben.
- Payment Success-URL navigiert zur Bonsai-Detailseite mit Query-Status, aber UI fordert weiterhin explizit `activate`.
- Entitlement ist eine interne Feature-Berechtigung; Stripe-Status wird nur in Billing/Webhook-Code uebersetzt.
- `trialing` wird fachlich als aktiv behandelt, auch wenn keine First-Party-Trial-UI gebaut wird.
- System-Reminder werden nicht hard-deleted; remove entspricht `status='CANCELLED'`.
- Bei `SNOOZED` bleibt die Origin unveraendert; Synchronisierung betrachtet den Reminder als vorhanden.
- Date-only Zielmonate werden als `YYYY-MM-01` gespeichert; DTOs duerfen ISO strings liefern, UI formatiert lokal.

## Integration Points

- Supabase Server Client in `lib/supabase/server-data.ts` fuer Repositories.
- Auth-Grenze `requireUser` in allen nutzerbezogenen API-Handlern.
- Stripe Webhook nutzt Raw Body; Next.js Body Parser muss fuer `pages/api/stripe/webhook.ts` deaktiviert werden.
- Profil: `pages/api/profile/me.ts` oder neues Billing-Status-API liefert lokalen Entitlement-Status an `pages/profile.tsx`.
- Bonsai Detail/Edit/Create verwenden bestehende `apiFetch`-Konventionen.
- Reminders-Seite verwendet vorhandene `GET /api/reminders` und `PATCH /api/reminders/:id` Oberflaeche.

## Test Strategy

- `tests/care-plan-generation.test.ts`
  - Preview fuer jede Katalogart gibt nur bekannte Pflegearten aus.
  - Rolling 12 Monate ab fixem Datum, alle Treffer auf Tag `01`.
  - Indoor/Outdoor-Filter und fehlendes Placement als Outdoor.
  - Kein Rule-Titel oder Care Type enthaelt watering/Giessen.
- `tests/stripe-entitlement.test.ts`
  - `active` und `trialing` aktiv.
  - `past_due`, `unpaid`, `canceled`, `incomplete`, `incomplete_expired`, `paused` inaktiv.
  - Unbekannte/fehlende Status sind defensiv inaktiv.
- `tests/care-plan-service.test.ts`
  - Fake-Repositories pruefen ohne DB: kein Entitlement -> Fehler und keine Reminder.
  - Aktivierung erzeugt erwartete Origin-Keys.
  - Zweiter Lauf erzeugt keine Duplikate.
  - Done/Cancelled Origin wird nicht wiederhergestellt.
  - Replace storniert offene alte System-Reminder, belaesst done.
- Bestehende Bonsai-/Reminder-Tests erweitern:
  - Validatoren akzeptieren `carePlanSpeciesId`.
  - Mapper geben Species/Aktivstatus und Reminder-Origin aus.
  - System-Reminder-Patch-Restriktion per Handler- oder Source-Test.
- UI-Source/SSR-Tests:
  - `BonsaiForm` rendert Freitext und curated-species Select getrennt.
  - Detailseite enthaelt Preview/Paywall/Aktivstatus-Texte.
  - Reminders-Seite unterscheidet System-Reminder und zeigt keine freie Bearbeitung.
- Vollverifikation:
  - gezielte neue Testdateien regelmaessig mit `npx tsx --test tests/<file>.test.ts`
  - `npm run typecheck`
  - `npm test`
  - `npm run test:db` nur wenn die Supabase-Migrationsquelle vorhanden und lokale Supabase lauffaehig ist.

## Edge Cases & Error Handling

- Kein `carePlanSpeciesId`: Preview leer bzw. klarer 400 bei Aktivierung.
- Unbekannter `speciesId`: 400 mit validierbarer Fehlermeldung.
- Bonsai gehoert anderem Nutzer: 404, nicht 403 mit Datenleck.
- Entitlement inaktiv: 402/403 mit Paywall-freundlichem Fehlercode, keine Reminder-Schreiboperation.
- Checkout ohne Bonsai-Kontext: erlaubt Profil-/generischer Return, aber keine Aktivierung.
- Webhook-Duplikat: anhand `event.id` idempotent ignorieren.
- Stripe API-Konfigurationsfehler: 500 mit Log, keine lokalen Entitlement-Aenderungen.
- Species-Aenderung bei aktivem Plan: Detailseite bietet Ersetzung statt stiller Sync.
- Entitlement-Ende: vorhandene System-Reminder bleiben in Listen und erlaubten Aktionen nutzbar.
- Abgelaufene/snoozed Reminder: Sync erzeugt nur zukuenftige Zielmonate und respektiert bestehende Origin-Datensaetze.

## Validation Checklist

- [x] Spec steht vor Implementierungsstart auf `APPROVED`.
- [x] Plan ist durch Nutzer mit `PLAN-APPROVED` oder expliziter Zustimmung bestaetigt.
- [x] Supabase-Migrationsquelle ist vorhanden oder das Fehlen ist vor Code geklaert.
- [x] Katalog enthaelt genau die zehn Startarten.
- [x] Vorschau ist vor Zahlung sichtbar.
- [x] Aktivierung/Synchronisierung/Ersetzung pruefen serverseitiges Entitlement.
- [x] Stripe Webhook ist die einzige automatische Entitlement-Quelle.
- [x] Success/Cancel-URLs erzeugen keine lokalen Berechtigungen oder Reminder.
- [x] Nutzer-Reminder bleiben frei editierbar.
- [x] System-Reminder sind unterscheidbar und nur constrained editierbar.
- [x] Idempotenz und Replacement-Verhalten sind getestet.
- [x] Profil zeigt lokalen Status und Portal-CTA.
- [x] Keine Standalone-Pricing-Page wurde angelegt.
- [x] `npm run typecheck` erfolgreich.
- [x] `npm test` erfolgreich.
- [x] DB-Tests erfolgreich oder begruendet nicht ausfuehrbar.
- [x] Code-Review durchgefuehrt.
- [x] Commit erstellt.
