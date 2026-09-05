# Auth UI vereinfachen und Waitlist entfernen

Status: COMPLETE
Last modified: 2026-09-05

## Overview

Die Startseite wird auf drei klare Auth-Wege reduziert: Google-Anmeldung/-Registrierung, E-Mail-Anmeldung und E-Mail-Registrierung. Die E-Mail-/Passwort-Felder werden in einer ruhigen, konsistent ausgerichteten Formulargruppe dargestellt. Waitlist-UI, Web-Signup-Gating, Waitlist-APIs, v1-Aliase, Operator-Skripte und aktive Betriebsdokumentation werden aus der Anwendungsschicht entfernt. Bestehende Supabase Auth-Flows fuer Google, E-Mail/Passwort, Passwort-Reset und der env-gesteuerte Magic-Link-Fallback bleiben erhalten.

## Reference

Spec: `dev/features/2026-09-05_auth-ui-simplification/spec.md`

Wichtige Akzeptanzkriterien:
- Startseite importiert oder rendert kein `WaitlistRequestForm`.
- Startseite zeigt keine Wartelisten-CTA und keine Beta-/Freigabe-Kommunikation fuer unauthentifizierte Nutzer.
- Registrierung ruft Supabase `signUp` direkt auf und verwendet keinen `/api/auth/precheck`.
- `/waitlist` existiert nicht mehr als Page.
- Tests, Doku und Skripte enthalten keine aktiven Waitlist-/Beta-Freigabe-Betriebsablaeufe mehr.
- Auth-Formularfelder sind konsistent beschriftet, vollbreit ausgerichtet und im Registrierungsmodus geordnet gruppiert.

## File Structure

Zu aendern:
- `pages/index.tsx`
- `pages/api/health.ts`
- `components/Navigation.tsx`
- `tests/home-login.test.ts`
- `tests/navigation.test.ts`
- `tests/public-client-api.test.ts`
- `tests/supabase-runtime-docs.test.ts`
- `README.md`
- `docs/community-privacy.md`
- `docs/backup-restore.md`
- `docs/manual-beta-smoke-checklist.md`
- `docs/support-incident-process.md`
- `pages/datenschutz.tsx`
- `package.json`
- `dev/features/2026-09-05_auth-ui-simplification/spec.md`

Zu entfernen:
- `pages/waitlist.tsx`
- `components/WaitlistRequestForm.tsx`
- `pages/api/access-requests.ts`
- `pages/api/auth/precheck.ts`
- `pages/api/v1/access-requests.ts`
- `pages/api/v1/auth/precheck.ts`
- `lib/signup-gating.ts`
- `lib/repositories/signup.ts`
- `scripts/approve-waitlist.js`
- `scripts/update-signup-settings.js`
- `tests/waitlist-page.test.ts`

## Implementation Steps

1. Tests auf neue Zielsemantik umstellen: Auth-Labels, kein Waitlist-Import/Render, kein Signup-Precheck, entfernte `/waitlist`-Page und entfernte mobile Aliase.
2. `pages/index.tsx` vereinfachen: Waitlist-Import und Renderpfade entfernen, Copy anpassen, Google-Button unter der Modus-Auswahl anzeigen, Google-Label je nach Modus zu `Mit Google anmelden` oder `Mit Google registrieren` aendern, E-Mail-/Passwort-Felder mit gemeinsamer Feldstruktur und stabilem Grid ausrichten, Signup direkt ueber Supabase ausfuehren, Magic-Link-Fallback ohne Precheck lassen.
3. Waitlist-/Gating-Anwendungscode entfernen und Healthcheck von `signup_settings` entkoppeln.
4. Navigation und Tests auf entfernte `/waitlist`-Route anpassen.
5. Aktive README-/Docs-/Datenschutz-Texte bereinigen, ohne historische `dev/features`-Specs umzuschreiben.
6. Feature-Dokumente auf `IMPLEMENTED`/`COMPLETE` setzen.
7. Validieren mit gezielten Tests, `npm run typecheck`, `npm test`.
8. Code-Review ausfuehren und danach committen.

## Code Architecture

- `pages/index.tsx` bleibt der zentrale UI- und Handler-Ort fuer die Startseiten-Auth.
- `getAuthModeTitle`, `getGoogleLoginLabel`, Labels und Auth-Helper bleiben exportiert, damit die bestehenden Source-Tests stabile UI-Kontrakte pruefen koennen.
- `AuthField` kapselt die lokale Label-/Hint-Struktur der Auth-Card; `AUTH_INPUT_CLASS` haelt alle E-Mail- und Passwort-Inputs visuell konsistent.
- Signup verwendet nur `getBrowserSupabaseClient().auth.signUp(...)`.
- Magic Link bleibt hinter `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED=true`, erstellt aber keine Nutzer mehr automatisch ueber Gating; es bleibt ein nachrangiger Login-Fallback.
- Healthcheck prueft Supabase Storage als reale Server-Client-Abhaengigkeit, nicht mehr Signup-Gating-Tabellen.

## Technical Decisions

- Keine Datenbankmigration und keine Aenderung an `types/supabase.ts`.
- Historische `dev/features`-Dokumente bleiben als Projektgeschichte bestehen; bereinigt werden aktive Betriebsdokumente.
- Entfernte Routen laufen ueber die normale Next.js-404.
- `lib/rate-limit.ts` kann Waitlist-Scopes als Typwerte behalten, falls historische DB-/API-Typen noch darauf referenzieren; nicht erreichbarer Waitlist-Code wird entfernt.

## Integration Points

- Supabase Browser Auth: `signInWithOAuth`, `signInWithPassword`, `signUp`, `resetPasswordForEmail`, optional `signInWithOtp`.
- Next.js Pages Router: Entfernen von Page-/API-Dateien entfernt Routen automatisch.
- Public mobile API: Auth-Precheck und Access-Request-Aliase verschwinden aus der aktiven v1-Oberflaeche.

## Test Strategy

- `tests/home-login.test.ts` prueft Labels, Modus-Titel, Fehlertexte, direkte Supabase-Aufrufe, konsistente Auth-Feldstruktur und Abwesenheit von Waitlist-/Precheck-Code in `pages/index.tsx`.
- `tests/public-client-api.test.ts` prueft, dass entfernte v1-Aliase nicht mehr existieren.
- `tests/supabase-runtime-docs.test.ts` prueft, dass Waitlist-Operator-Skripte und npm-Script entfernt sind.
- `tests/navigation.test.ts` prueft nur noch die Startseite als versteckte Route.
- `tests/waitlist-page.test.ts` wird entfernt, weil die Page nicht mehr existiert.

## Edge Cases & Error Handling

- Signup-Validierung fuer Passwortlaenge und Passwortbestaetigung bleibt clientseitig erhalten.
- Supabase Signup-Fehler werden generisch und ohne Gating-Begriffe angezeigt.
- Passwort-Reset bleibt nur im Login-Modus erreichbar.
- Magic-Link-Fallback bleibt in der Standard-UI unsichtbar und darf bei Aktivierung keine Waitlist-/Freigabe-Meldungen anzeigen.

## Validation Checklist

- [x] `WaitlistRequestForm` wird auf der Startseite weder importiert noch gerendert.
- [x] `/waitlist`-Page und Waitlist-APIs sind entfernt.
- [x] Signup-Precheck wird nicht mehr von der Startseite verwendet.
- [x] Aktive Doku und Skripte beschreiben keine Waitlist-/Beta-Freigabe-Betriebsablaeufe.
- [x] `npm run typecheck` erfolgreich.
- [x] `npm test` erfolgreich.
- [x] Code-Review durchgefuehrt.
- [x] Commit erstellt.
- [x] Auth-Formularfelder sind konsistent ausgerichtet und per Source-Test abgesichert.
