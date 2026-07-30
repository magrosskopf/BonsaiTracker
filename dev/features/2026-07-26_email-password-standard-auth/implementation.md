# Google und E-Mail-Passwort als Standard-Auth - Implementation Plan

Status: COMPLETE
Last modified: 2026-07-26

## Overview

Die bestehende Startseiten-Auth wird von Google plus optionalem Magic-Link-Fallback auf Google plus E-Mail/Passwort als Standardwege umgestellt. Magic Link bleibt im Code erhalten, wird aber in einen nachrangigen Hilfe-/Fallback-Bereich verschoben.

Die Umsetzung bleibt bewusst nahe an der bestehenden Architektur:

- `pages/index.tsx` bleibt Einstieg fuer Login, Registrierung, Passwort-Reset und Warteliste.
- `components/AuthProvider.tsx` bleibt Session-Quelle.
- `pages/auth/callback.tsx` bleibt Supabase PKCE-/Recovery-Callback.
- `/api/auth/precheck` bleibt UI-seitiger Gating-Precheck vor Registrierung.

Dieser Plan wurde umgesetzt. Die konkrete Implementierungsaufforderung hat Spec und Plan fuer die Umsetzung freigegeben.

## Reference

Spec: `dev/features/2026-07-26_email-password-standard-auth/spec.md`

Wichtige Akzeptanzkriterien:

- Google und E-Mail/Passwort sind sichtbare Standardoptionen.
- Magic Link ist nur Fallback.
- E-Mail/Passwort-Login verwendet `signInWithPassword`.
- E-Mail/Passwort-Registrierung verwendet vor `signUp` `/api/auth/precheck`.
- Passwort-Reset ist erreichbar.
- `npm test` und `npm run typecheck` laufen erfolgreich.

## File Structure

Zu aendern:

- `pages/index.tsx`
  - Auth-Modus fuer Login/Registrierung einfuehren.
  - E-Mail/Passwort-Login mit `signInWithPassword`.
  - E-Mail/Passwort-Registrierung mit `precheck` plus `signUp`.
  - Passwort-Reset-Einstieg mit `resetPasswordForEmail`.
  - Magic-Link-Fallback nachrangig platzieren.
  - Exportierte Labels/Helper fuer Tests aktualisieren.
- `pages/auth/callback.tsx`
  - Recovery-/Password-Reset-Callback beruecksichtigen, sofern Supabase Query/Hash dafuer auf dieser Route landet.
  - Bestehenden OAuth-Code-Exchange fuer Google nicht regressiv aendern.
- Neuer Page-Kandidat: `pages/auth/reset-password.tsx`
  - Nur erstellen, wenn Supabase Recovery nach Callback eine Session bereitstellt und eine separate Passwort-Setzen-Ansicht die sauberste UX ist.
  - Neues Passwort plus Bestaetigung erfassen.
  - `supabase.auth.updateUser({ password })` ausfuehren.
  - Nach Erfolg auf `/dashboard` leiten.
- `tests/home-login.test.ts`
  - Labels und Helper fuer Standard-Auth-Wege anpassen.
  - Magic-Link-Fallback-Position pruefen.
  - Passwort-Validierungshelper pruefen.
- `tests/auth-callback.test.ts`
  - Bestehende Tests erhalten.
  - Recovery-Weiterleitung oder Recovery-Fehlerfall ergaenzen, falls Callback-Logik angepasst wird.
- Neuer Test-Kandidat: `tests/reset-password.test.ts`
  - Pure Helper fuer Passwortabgleich, Fehlermeldung und Success-Redirect pruefen, falls neue Reset-Seite entsteht.
- Dokumentation:
  - Entweder `README.md` um Supabase E-Mail/Passwort-Einstellungen ergaenzen oder diese Feature-Doku als Implementierungsdoku ausreichend konkret halten.
- `dev/features/2026-07-26_email-password-standard-auth/spec.md`
  - Nach Umsetzung Status auf `IMPLEMENTED` setzen.
- `dev/features/2026-07-26_email-password-standard-auth/implementation.md`
  - Nach Umsetzung Status auf `COMPLETE` setzen.

Nicht zu aendern:

- `workflows/`
- `components/AuthProvider.tsx`, sofern die bestehenden Auth-State-Events fuer Passwort-Login und Recovery ausreichen.
- Supabase-Migrations, sofern bestehende Hooks/RPCs E-Mail/Passwort-Registrierungen bereits korrekt gaten.
- App Router oder NextAuth werden nicht eingefuehrt.

## Implementation Steps

1. Auth-Texte und UI-Zustaende vorbereiten
   - In `pages/index.tsx` neue exportierte Konstanten definieren:
     - `GOOGLE_LOGIN_LABEL = "Mit Google fortfahren"` oder bestehendes Label bewusst beibehalten, wenn Copy-Konstanz wichtiger ist.
     - `EMAIL_PASSWORD_LOGIN_LABEL = "Mit E-Mail anmelden"`.
     - `EMAIL_PASSWORD_SIGNUP_LABEL = "Mit E-Mail registrieren"`.
     - `MAGIC_LINK_FALLBACK_LABEL = "Login-Link per E-Mail senden"`.
     - `PASSWORD_RESET_LABEL = "Passwort vergessen?"`.
   - Auth-Mode als Union typisieren, z. B. `"login" | "signup" | "reset"`.
   - Bestehende `message`, `error`, `submitting` States weiterverwenden oder in eindeutig benannte States aufteilen.

2. E-Mail/Passwort-Login implementieren
   - Formularfelder fuer E-Mail und Passwort anzeigen.
   - E-Mail vor SDK-Aufruf trimmen und lowercasing ueber bestehenden Normalisierungshelper nur nutzen, wenn clientseitig vorhanden; sonst lokal `trim().toLowerCase()`.
   - `getBrowserSupabaseClient().auth.signInWithPassword({ email, password })` aufrufen.
   - Bei Erfolg auf `/dashboard` routen oder auf AuthProvider-Session-Update reagieren und bestehende Dashboard-CTA zeigen. Bevorzugt: direkt `router.push("/dashboard")`.
   - Bei Fehlern eine generische Meldung anzeigen: `E-Mail oder Passwort stimmen nicht.` Keine User-Enumeration.

3. E-Mail/Passwort-Registrierung implementieren
   - In Signup-Mode E-Mail, Passwort und Passwort-Bestaetigung erfassen.
   - Clientseitig pruefen:
     - E-Mail ist gesetzt.
     - Passwort hat mindestens 8 Zeichen.
     - Passwort und Bestaetigung stimmen ueberein.
   - Vor Supabase `signUp` bestehenden Precheck ausfuehren:
     - `POST /api/auth/precheck`
     - Body `{ email }`
     - Option `{ auth: "none" }`
   - Wenn `allowed` false ist, Meldung aus Precheck anzeigen und abbrechen.
   - Wenn erlaubt:
     - `getBrowserSupabaseClient().auth.signUp({ email, password, options: { emailRedirectTo: getAuthCallbackUrl(window.location.origin) } })`.
   - Erfolgsmeldung je nach Supabase Rueckgabe neutral formulieren:
     - `Bitte pruefe dein Postfach, um deine Registrierung abzuschliessen.`
     - Falls sofort Session vorhanden ist: auf `/dashboard` leiten.

4. Passwort-Reset implementieren
   - `Passwort vergessen?` schaltet in Reset-Mode oder zeigt ein schlankes Reset-Formular.
   - Reset-Formular erfasst E-Mail.
   - `supabase.auth.resetPasswordForEmail(email, { redirectTo: getAuthCallbackUrl(window.location.origin) })` aufrufen.
   - Erfolg neutral formulieren: `Wenn ein Konto existiert, senden wir dir eine E-Mail zum Zuruecksetzen.`
   - Callback pruefen/anpassen:
     - Wenn Supabase Recovery mit Session auf `/auth/callback` ankommt, zur Passwort-Setzen-Ansicht weiterleiten.
     - Wenn bestehender `exchangeCodeForSession(code)` fuer Recovery ebenfalls funktioniert, danach anhand Session/Event oder Query zur Reset-Seite routen.
   - Falls noetig `pages/auth/reset-password.tsx` erstellen und dort neues Passwort per `updateUser({ password })` setzen.

5. Magic-Link-Fallback nachrangig platzieren
   - Bestehende `signInWithOtp`-Logik nicht als normale E-Mail-Anmeldung anzeigen.
   - Den Feature-Flag `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED` weiter respektieren.
   - Wenn aktiv, Fallback unter einem nachrangigen Bereich platzieren, z. B. unter `Probleme beim Einloggen?`.
   - CTA nicht `Mit E-Mail anmelden` nennen, sondern eindeutig `Login-Link per E-Mail senden`.
   - Optional weiterhin `/api/auth/precheck` vor Magic Link nutzen, wie heute.

6. Tests aktualisieren
   - `tests/home-login.test.ts` an neue Labels anpassen.
   - Pure Helper einfuehren und testen, z. B.:
     - `normalizeAuthEmail(input)`.
     - `validatePasswordSignup(password, confirmation)`.
     - `getAuthModeTitle(mode)`.
     - `getAuthErrorMessage(code)`.
   - Tests fuer Magic-Link-Fallback:
     - Label ist Fallback-spezifisch.
     - Standard-E-Mail-Label ist E-Mail/Passwort, nicht Magic Link.
   - Callback-Tests nur erweitern, wenn Recovery-Logik angepasst wird.
   - Reset-Tests fuer neue Reset-Seite/Helper ergaenzen, falls erstellt.

7. Dokumentation aktualisieren
   - Supabase Auth Provider dokumentieren:
     - Google Provider aktiviert.
     - E-Mail Provider aktiviert.
     - Passwort-Registrierung erlaubt, aber durch bestehendes Gating begrenzt.
     - E-Mail Confirmations je nach Beta-Setup bewusst konfigurieren.
     - Redirect URL lokal: `http://localhost:3000/auth/callback`.
     - Magic-Link-Fallback optional per `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED=true`.
   - Wenn `README.md` bereits Auth-Konfiguration enthaelt, dort ergaenzen; sonst Feature-Doku genuegt fuer diese Aenderung nicht dauerhaft und README bekommt einen kurzen Abschnitt.

8. Validierung
   - `npm test`
   - `npm run typecheck`
   - Optional `npm run build`, wenn UI/Next Page Routing oder Env-Verhalten unerwartet betroffen ist.

## Code Architecture

- `pages/index.tsx` bleibt UI-Orchestrator fuer Public Auth.
- Supabase SDK Calls bleiben direkt in Event-Handlern, solange sie lokal und klein bleiben.
- Pure, exportierte Helper kapseln testbare Logik:
  - Callback-URL bauen.
  - E-Mail normalisieren.
  - Passwort-/Bestaetigungsvalidierung.
  - User-facing Fehlermeldungen mappen.
- AuthProvider bleibt unveraendert fuer Session-Erkennung und Logout.
- Gating bleibt serverseitig in `/api/auth/precheck` plus Supabase-Hooks abgesichert.

## Technical Decisions

1. E-Mail/Passwort wird als Standardweg sichtbar, weil er fuer nicht Google-affine Nutzer vertraut ist.
2. Magic Link wird nicht entfernt, aber bewusst nachrangig gemacht, um die Hauptentscheidung im Login nicht zu verwirren.
3. Passwortregeln bleiben minimal, damit die Zielgruppe nicht durch kuenstliche Komplexitaet aussteigt.
4. Fehler fuer falsche Credentials bleiben generisch, damit keine Konten ueber Fehlermeldungen erraten werden koennen.
5. Der bestehende Precheck wird vor Registrierung wiederverwendet, damit UI und Server dieselbe Beta-Logik kommunizieren.
6. Eine separate Reset-Seite wird nur gebaut, wenn die Callback-Integration dadurch klarer und robuster wird.

## Integration Points

- `getBrowserSupabaseClient().auth.signInWithOAuth` fuer Google.
- `getBrowserSupabaseClient().auth.signInWithPassword` fuer E-Mail/Passwort-Login.
- `getBrowserSupabaseClient().auth.signUp` fuer E-Mail/Passwort-Registrierung.
- `getBrowserSupabaseClient().auth.resetPasswordForEmail` fuer Reset-Mail.
- `getBrowserSupabaseClient().auth.updateUser` fuer neues Passwort nach Recovery.
- `/api/auth/precheck` fuer Beta-/Signup-Gating vor Registrierung.
- `pages/auth/callback.tsx` fuer OAuth, Signup-Confirmation und Recovery-Links.
- `components/AuthProvider.tsx` fuer Session-Status nach erfolgreichem Login.

## Test Strategy

- Unit-/Contract-Tests mit `node:test` ueber `npm test`.
- Fokus auf pure Helper statt Browser-E2E:
  - Labels und Auth-Modi.
  - Callback URL.
  - Passwortvalidierung.
  - Fehlermeldungen.
  - Gating-Abbruchlogik, soweit isolierbar.
- Bestehende Auth-Callback-Tests bleiben erhalten und werden nur zielgerichtet erweitert.
- TypeScript-Check validiert Page-Komponenten, Supabase SDK Calls und Helper-Typen.

## Edge Cases & Error Handling

- Nutzer klickt mehrfach: Buttons sind waehrend `submitting` disabled.
- E-Mail hat Leerzeichen oder Grossbuchstaben: vor Auth-Calls normalisieren.
- Passwort ist zu kurz: Client zeigt konkrete Mindestlaengenmeldung.
- Passwort und Bestaetigung stimmen nicht ueberein: kein Supabase Call.
- Precheck nicht erlaubt: kein `signUp`, Meldung aus Precheck anzeigen.
- Supabase `signUp` liefert Nutzer ohne Session wegen E-Mail-Confirmation: Postfach-Hinweis anzeigen.
- Supabase `signInWithPassword` scheitert: generische Credentials-Meldung anzeigen.
- Reset-Mail fuer unbekannte E-Mail: neutrale Erfolgsmeldung anzeigen.
- OAuth-Callback ohne Code oder mit Fehler: bestehende Callback-Fehlerlogik bleibt erhalten.
- Recovery-Link fuehrt ohne gueltige Session zur Reset-Seite: Fehler anzeigen und zur erneuten Reset-Mail auffordern.

## Validation Checklist

- [x] Spec wurde reviewed und approved.
- [x] Implementation Plan wurde reviewed und approved.
- [x] Google Login funktioniert weiterhin.
- [x] E-Mail/Passwort-Login ist sichtbar und nutzt `signInWithPassword`.
- [x] E-Mail/Passwort-Registrierung ist sichtbar und nutzt vor `signUp` den Precheck.
- [x] Passwort-Reset ist erreichbar und nutzt Supabase Reset Flow.
- [x] Magic Link ist nur Fallback und nicht Standard-CTA.
- [x] Bestehende Wartelisten-/Beta-Kommunikation bleibt sichtbar.
- [x] Tests fuer Labels, Helper und neue Auth-Logik sind angepasst/ergaenzt.
- [x] `npm test` erfolgreich.
- [x] `npm run typecheck` erfolgreich.
- [x] Dokumentation aktualisiert.
- [x] Spec Status auf `IMPLEMENTED` gesetzt.
- [x] Implementation Status auf `COMPLETE` gesetzt.
