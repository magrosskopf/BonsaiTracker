# Supabase Google Auth verwenden - Implementation Plan

Status: COMPLETE
Last modified: 2026-07-24

## Overview

Die bestehende Supabase-Google-Auth wird produktionsnaeher gemacht, ohne die Auth-Architektur zu wechseln. Der Login-Start bleibt auf der Startseite, der PKCE-Callback bleibt unter `/auth/callback`, der Magic-Link-Fallback bleibt per Feature-Flag erhalten. Die Arbeit fokussiert sich auf klar testbare Hilfslogik, bessere Callback-Fehlerbehandlung und konkrete Supabase-Konfigurationsdokumentation.

## Reference

Spec: `dev/features/2026-07-24_supabase-google-auth-use/spec.md`

Wichtige Akzeptanzkriterien:

- Google OAuth startet mit `provider: "google"` und Redirect `/auth/callback`.
- Erfolgreicher Callback fuehrt zu `/dashboard`.
- OAuth-/Callback-Fehler werden nutzerverstaendlich behandelt.
- E-Mail-Fallback bleibt standardmaessig versteckt.
- Supabase Redirect- und Env-Konfiguration ist dokumentiert.
- `npm test` und `npm run typecheck` laufen erfolgreich.

## File Structure

Zu aendern:

- `pages/index.tsx`
  - Google-OAuth-Optionen ueber kleine exportierte Helper isolieren.
  - E-Mail-Fallback unveraendert per `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED`.
- `pages/auth/callback.tsx`
  - Callback-Query-Auswertung ueber exportierte Helper isolieren.
  - Supabase-OAuth-Fehlerparameter verstaendlich behandeln.
- `README.md`
  - Lokale Supabase Google Auth Konfiguration dokumentieren.
- `tests/home-login.test.ts`
  - Tests fuer OAuth-Redirect-Optionen und Fallback-Flag-konforme Texte erweitern.
- Neuer Test, voraussichtlich `tests/auth-callback.test.ts`
  - Tests fuer Callback-Query-Auswertung, Erfolgsziel und Fehlerzuordnung.
- `dev/features/2026-07-24_supabase-google-auth-use/spec.md`
  - Am Ende Status auf `IMPLEMENTED` setzen.
- `dev/features/2026-07-24_supabase-google-auth-use/implementation.md`
  - Am Ende Status auf `COMPLETE` setzen.

Nicht zu aendern:

- `workflows/`
- Supabase Migrations, sofern beim Implementieren kein konkreter Hook-Mangel sichtbar wird.
- NextAuth oder App Router werden nicht eingefuehrt.

## Implementation Steps

1. Auth-Start isolieren
   - In `pages/index.tsx` eine kleine exportierte Funktion fuer Google OAuth Optionen einfuehren, z. B. `getGoogleOAuthRedirectTo(origin: string): string` oder `buildGoogleOAuthOptions(origin: string)`.
   - `handleGoogleLogin` verwendet diese Funktion, bleibt ansonsten beim bestehenden Supabase SDK Call.

2. Callback-Logik isolieren
   - In `pages/auth/callback.tsx` exportierte pure Helper einfuehren:
     - Query-Wert aus `string | string[] | undefined` normalisieren.
     - OAuth-/Callback-Fehler auf bestehende Startseiten-Error-Codes oder lokale Fehlermeldungen abbilden.
     - Erfolgsziel `/dashboard` zentral definieren.
   - Bestehenden erfolgreichen `exchangeCodeForSession(code)` Ablauf behalten.

3. Callback-Fehler behandeln
   - Wenn Supabase mit `error`, `error_code` oder `error_description` zurueckkommt, keinen Code-Exchange versuchen.
   - Bei Beta-/Access-Denied-nahen Fehlern zur Startseite mit `/?error=AccessDenied` leiten, sofern eindeutig.
   - Bei allgemeinem OAuth-Fehler eine lokale Fehlermeldung anzeigen oder zur Startseite mit generischem Fehlercode leiten.
   - Wenn kein `code` vorhanden ist und kein OAuth-Fehler vorliegt, Ladezustand nur solange zeigen, bis `router.isReady`; danach eine Fehlermeldung anzeigen.

4. Dokumentation ergaenzen
   - In `README.md` unter Local Development oder Runtime Architecture einen kurzen Abschnitt "Supabase Google Auth" ergaenzen.
   - Dokumentieren:
     - Google Provider in Supabase Auth aktivieren.
     - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, serverseitige Keys wie bisher setzen.
     - Local redirect: `http://localhost:3000/auth/callback`.
     - Produktion: Redirect URL nach Domain-Entscheidung nachtragen.
     - Magic-Link-Fallback: `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED=true`.

5. Tests ergaenzen
   - `tests/home-login.test.ts` erweitert:
     - Google-Label bleibt primaer.
     - OAuth-Redirect-Helper baut `${origin}/auth/callback`.
   - `tests/auth-callback.test.ts` neu:
     - Query-Normalisierung nimmt erstes Array-Element.
     - Success target ist `/dashboard`.
     - Access-/Denied-Fehler wird passend gemappt.
     - Fehlender Code nach Router-Ready fuehrt zu Fehlerzustand.

6. Validierung
   - `npm test`
   - `npm run typecheck`
   - Wenn Typecheck oder Tests fehlschlagen, Implementierung nachbessern und erneut laufen lassen.

## Code Architecture

- React-Komponenten behalten ihre Verantwortung fuer UI und Supabase SDK Interaktion.
- Pure Helper in Page-Dateien sind exportiert, damit Node-Tests ohne Browser-/React-Rendering stabile Logik pruefen koennen.
- Supabase Session-Verwaltung bleibt zentral im `AuthProvider`.
- API-Requests bleiben tokenbasiert ueber `apiFetch`.

## Technical Decisions

- Kein neues Auth-Modul, solange die Hilfslogik klein bleibt. Das reduziert Umbau und passt zu den bestehenden Page-Tests.
- Kein echter Google-OAuth-E2E-Test, weil Google/Supabase Dashboard-Konfiguration extern ist und nicht stabil in `npm test` laeuft.
- Dokumentation nennt noch keine Produktionsdomain, weil es keine gibt.
- Magic-Link-Fallback bleibt als versteckter Fallback im Code.

## Integration Points

- `pages/index.tsx` integriert mit `getBrowserSupabaseClient().auth.signInWithOAuth`.
- `pages/auth/callback.tsx` integriert mit `getBrowserSupabaseClient().auth.exchangeCodeForSession`.
- `components/AuthProvider.tsx` uebernimmt Session-Aktualisierung nach erfolgreichem Code-Exchange.
- Supabase Signup-Gating bleibt ueber vorhandene Hooks/RPCs angebunden.

## Test Strategy

- Unit-/Contract-Tests mit `node:test` und `tsx --test tests/*.test.ts`.
- Keine Browser-Automation notwendig, da Verhalten ueber pure Helper und bestehende Exporte pruefbar ist.
- TypeScript-Check validiert Page-/Helper-Signaturen.

## Edge Cases & Error Handling

- Query-Parameter koennen Arrays sein; erstes Element wird verwendet.
- Callback kann ohne `code` geladen werden.
- Supabase kann `error`, `error_code` und `error_description` senden.
- Google-OAuth-Start kann synchron/asynchron mit Supabase SDK Error fehlschlagen.
- Nutzer kann waehrend `submitting` erneut klicken; Button bleibt disabled.

## Validation Checklist

- [x] Spec ist approved.
- [x] Implementierungsplan ist approved.
- [x] Google OAuth Redirect Helper ist implementiert und getestet.
- [x] Callback Helper sind implementiert und getestet.
- [x] README dokumentiert lokale Supabase Google Auth Einstellungen.
- [x] `npm test` erfolgreich.
- [x] `npm run typecheck` erfolgreich.
- [x] Spec Status auf `IMPLEMENTED`.
- [x] Implementation Status auf `COMPLETE`.

## Post-Verification Fix

Nach Browser-Test trat ein Client-Bundle-Fehler auf, weil `getBrowserSupabaseConfig()` die `NEXT_PUBLIC_*` Variablen dynamisch ueber `process.env[name]` gelesen hat. Next.js ersetzt Public-Env-Werte im Browser nur bei statischem Zugriff.

Ergaenzung:

- `lib/config/runtime.ts` liest `process.env.NEXT_PUBLIC_SUPABASE_URL` und `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` jetzt statisch.
- `tests/supabase-runtime-docs.test.ts` enthaelt einen Regressionstest gegen dynamischen Browser-Env-Zugriff.
- Validierung nach Fix: `npm test` mit 64/64 Tests erfolgreich, `npm run typecheck` erfolgreich.
