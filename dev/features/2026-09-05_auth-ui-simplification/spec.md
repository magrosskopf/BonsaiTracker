# Auth UI vereinfachen und Waitlist entfernen

Status: IMPLEMENTED
Last modified: 2026-09-05

## Purpose/Goal

Die aktuelle Login-/Registrierungsseite ist fuer nicht eingeloggte Nutzer zu voll. Google-Anmeldung, E-Mail-Anmeldung, E-Mail-Registrierung, Passwort-Reset, optionaler Magic-Link-Fallback und Warteliste stehen sehr nah beieinander. Dadurch ist nicht klar genug, welcher Weg fuer bestehende Nutzer, neue Nutzer und Google-Nutzer gedacht ist.

Ziel ist eine deutlich ruhigere Auth-UI, die drei Begriffe sauber trennt:

1. **Login**: Bestehende Nutzer melden sich mit E-Mail und Passwort an.
2. **Registrierung**: Neue Nutzer erstellen ein Konto mit E-Mail und Passwort.
3. **Google-Anmeldung/-Registrierung**: Nutzer verwenden Google als alternativen Auth-Weg fuer Anmeldung oder Kontoerstellung, passend zum ausgewaehlten Modus.

Die Warteliste beziehungsweise Whitelist-Kommunikation soll aus der Anwendungsschicht verschwinden. Neue Nutzer sollen sich grundsaetzlich registrieren koennen; eine vorgelagerte Freigabepruefung ist fuer den Web-Registrierungsflow nicht mehr Teil des Produkts.

## Current Situation

1. `pages/index.tsx` zeigt nicht eingeloggten Nutzern aktuell einen Link zur oeffentlichen Warteliste.
2. Die Auth-Card in `pages/index.tsx` enthaelt dauerhaft ein eingebettetes `WaitlistRequestForm`.
3. Die Card-Ueberschrift und Beschreibung sprechen weiterhin von `Login und Beta-Zugang`.
4. Fehlertexte wie `AccessDenied` und Signup-Precheck-Meldungen sprechen von geschlossener Beta, Warteliste oder Freigabe.
5. E-Mail-Login und E-Mail-Registrierung sind per Segment-Control getrennt, aber die gleichzeitige Praesenz von Google-Button, Segment-Control und Waitlist-Form macht die Entscheidung unnötig schwer.
6. `tests/home-login.test.ts` erwartet derzeit teilweise noch Gating-/Precheck-/Waitlist-nahe Auth-Texte und Implementierungsdetails.
7. Operative Dokumente, npm-Skripte und Public-Client-Aliase beschreiben beziehungsweise exponieren weiterhin Waitlist-/Signup-Gating-Funktionen.

## Functional Requirements

1. Die Startseite zeigt nicht eingeloggten Nutzern keine Wartelisten-CTA und kein eingebettetes Wartelistenformular mehr.
2. Die Startseiten-Auth-Card verwendet keine Begriffe wie `Beta-Zugang`, `Warteliste`, `Whitelist`, `Freigabe` oder `geschlossene Beta` in sichtbar gerenderten Texten.
3. Google wird als eigener, klar benannter Auth-Weg fuer Anmeldung oder Kontoerstellung dargestellt.
4. E-Mail-Login wird klar als Weg fuer bestehende Konten dargestellt.
5. E-Mail-Registrierung wird klar als Weg fuer neue Konten dargestellt.
6. E-Mail-Login und E-Mail-Registrierung duerfen nicht optisch wie derselbe Vorgang wirken; aktive Auswahl, Ueberschrift und Submit-Button muessen eindeutig zum Modus passen.
7. Passwort-Reset bleibt fuer E-Mail-Login-Nutzer erreichbar, aber nachrangig.
8. Der optionale Magic-Link-Fallback bleibt im Code und darf weiterhin ueber `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED=true` aktivierbar sein, soll aber in der Standard-UI nicht sichtbar sein.
9. E-Mail-Registrierung ruft Supabase `signUp` direkt auf und wird nicht mehr durch `/api/auth/precheck`, Signup-Gating, Allowlist, Kapazitaetsgrenze oder Waitlist-Zustand vorab blockiert.
10. Anwendungsschicht-Code fuer Waitlist-Anfragen und Signup-Gating wird entfernt, sofern er nicht fuer bestehende Auth-, Daten- oder DB-Validierungsgrenzen noetig ist.
11. Bereits eingeloggte Nutzer sehen weiterhin die bestehenden Dashboard- und Logout-Aktionen.
12. Die UI bleibt auf Mobile und Desktop klar lesbar, ohne ueberlappende Texte und ohne eine ueberladene Card.
13. E-Mail- und Passwort-Felder sind innerhalb der Auth-Card konsistent ausgerichtet, vollbreit im Login-Modus und im Registrierungsmodus sauber als geordnete Formulargruppe dargestellt.

## Technical Constraints

- Stack bleibt Next.js Pages Router, TypeScript, Supabase SDK und Tailwind/DaisyUI.
- Kein Auth-Neubau und kein Wechsel zu NextAuth.
- Bestehende Supabase Browser Auth, `AuthProvider`, OAuth-Callback und Passwort-Reset-Mechanik bleiben erhalten.
- Waitlist-/Whitelist-/Signup-Gating wird aus der Anwendungsschicht entfernt.
- `workflows/` wird nicht geaendert.
- Keine Datenbankmigration ist Teil dieser Aenderung.
- Die aktive Datenbank-Baseline liegt extern in `../supabase/supabase/migrations/`; DB-Objekte wie `signup_settings`, `waitlist_requests`, `precheck_signup` oder `approve_waitlist` werden in dieser Spec nicht geloescht.
- Generierte Supabase-Typen in `types/supabase.ts` bleiben unveraendert, bis die externe DB-Baseline separat geaendert wird.
- Die bestehende `/waitlist`-Route wird entfernt. Alte `/waitlist`-URLs duerfen auf die normale Next.js-404 laufen; es wird kein Redirect benoetigt.

## Acceptance Criteria

1. `npm test` laeuft erfolgreich.
2. `npm run typecheck` laeuft erfolgreich.
3. Die Startseite importiert und rendert `WaitlistRequestForm` nicht mehr.
4. Die Startseite zeigt keinen Link zur Wartelisten-Seite fuer nicht eingeloggte Nutzer.
5. Sichtbare Startseiten-Texte enthalten keine Wartelisten-/Whitelist-/Beta-Freigabe-Kommunikation.
6. Google-Anmeldung/-Registrierung, E-Mail-Anmeldung und E-Mail-Registrierung sind anhand ihrer Labels und Modus-Ueberschriften eindeutig unterscheidbar.
7. Der aktive Auth-Modus ist visuell und semantisch klar erkennbar.
8. E-Mail-Registrierung verwendet keinen Signup-Precheck mehr und zeigt keine Gating-, Waitlist-, Whitelist-, Beta- oder Freigabe-Blockademeldungen.
9. Passwort-Reset bleibt im Login-Modus erreichbar und funktioniert unveraendert ueber Supabase `resetPasswordForEmail`.
10. Bestehende Auth-Handler fuer Google, E-Mail/Passwort, Signup und Reset bleiben funktional.
11. Tests decken ab, dass Waitlist-UI von der Startseite entfernt ist, `/waitlist` nicht mehr als Page existiert und die Auth-Labels weiterhin eindeutig sind.
12. Anwendungsschicht-Tests und Doku enthalten keine aktiven Waitlist-/Beta-Freigabe-Betriebsablaeufe mehr.
13. Auth-Formularfelder verwenden eine einheitliche Feldstruktur mit klaren Labels, konsistenter Input-Breite und stabiler Ausrichtung fuer Login, Registrierung, Reset und optionalen Magic-Link-Fallback.

## Out-of-Scope

- Entfernen oder Migrieren bestehender Datenbanktabellen, RPCs oder generierter Supabase-Typen fuer Signup-Freigaben.
- Neues Onboarding nach erfolgreicher Registrierung.
- Neue Auth-Provider neben Google.
- Veraenderung der Supabase Provider-Konfiguration.
- Vollstaendiges Landingpage-Redesign ausserhalb der Auth-Card und der betroffenen Wartelisten-CTA.

## Proposed Implementation Plan Draft

Dieser Abschnitt ist ein Planentwurf. Der verbindliche `implementation.md` wird nach Spec-Freigabe gemaess Workflow erstellt.

1. `pages/index.tsx` vereinfachen:
   - `WaitlistRequestForm`-Import entfernen.
   - Wartelisten-Link und erklaerenden Wartelisten-Text aus der Landing-Copy entfernen.
   - Eingebettetes `WaitlistRequestForm` aus der Auth-Card entfernen.
   - Card-Copy auf klare Auth-Auswahl umstellen: Google als schneller Weg fuer Anmeldung oder Kontoerstellung, E-Mail-Login fuer bestehende Konten, Registrierung fuer neue Konten.
2. Web-Registrierung entblocken:
   - `handleEmailPasswordSignup` ruft Supabase `signUp` direkt auf.
   - `/api/auth/precheck` wird nicht mehr aus der Startseite importiert oder aufgerufen.
   - Precheck-/Allowlist-/Kapazitaetsmeldungen werden aus der Auth-UI entfernt.
3. Sichtbare Auth-Texte bereinigen:
   - `getAuthErrorMessage("AccessDenied")` ohne Beta-/Waitlist-Verweis formulieren.
   - Auth-Fehlermeldungen bleiben deutsch und handlungsorientiert, aber ohne Gating-Begriffe.
4. UI-Struktur schaerfen:
   - Segment-Control fuer `Anmelden` und `Registrieren` vor den Auth-Aktionen anzeigen.
   - Google-Button als separaten Auth-Weg unterhalb der Modus-Auswahl anzeigen und je nach Modus mit `Mit Google anmelden` oder `Mit Google registrieren` beschriften.
   - Segment-Control fuer `Anmelden` und `Registrieren` beibehalten, aber mit klarer Headline und knapper Hilfskopie pro Modus.
   - E-Mail- und Passwortfelder mit gemeinsamer Feldkomponente, voller Breite und sauberem Grid fuer Registrierungs-Passwortfelder ausrichten.
   - Passwort-Reset nur im Login-Modus nachrangig anzeigen.
5. Anwendungsschicht-Waitlist/Gating entfernen:
   - `pages/waitlist.tsx`, `components/WaitlistRequestForm.tsx`, `pages/api/access-requests.ts`, `pages/api/auth/precheck.ts` und die v1-Aliase entfernen.
   - `lib/signup-gating.ts` und `lib/repositories/signup.ts` entfernen, sofern keine verbleibenden Anwendungspfade sie benoetigen.
   - `scripts/approve-waitlist.js`, `scripts/update-signup-settings.js` und den `approve-waitlist`-npm-Script-Eintrag entfernen.
   - `pages/api/health.ts` darf nicht mehr von `signup_settings` abhaengen.
   - Waitlist-/Beta-Freigabe-Dokumente und Smoke-Checklisten bereinigen.
6. Tests aktualisieren:
   - `tests/home-login.test.ts` auf neue Labels und entfernte Waitlist-UI anpassen.
   - Einen Source-Test oder Helper-Test ergaenzen, der sicherstellt, dass `WaitlistRequestForm` nicht mehr in `pages/index.tsx` importiert oder gerendert wird.
   - Auth-Flow-Erwartungen fuer `signInWithPassword`, `signUp`, `resetPasswordForEmail` und optionalen Magic-Link-Fallback erhalten.
   - Tests fuer entfernte `/waitlist`-Page, entfernte Public-Client-Aliase und entfernte Betriebs-Skripte anpassen oder loeschen.
7. Validieren:
   - `npm test`
   - `npm run typecheck`
   - Optional bei UI-Unsicherheit: lokale Ansicht im Browser pruefen.

## Review Checklist

- [x] Anforderungen sind eindeutig formuliert.
- [x] Akzeptanzkriterien sind testbar.
- [x] Der Wunsch, Whitelist/Waitlist aus der Anwendungsschicht zu entfernen, aber DB-Objekte unveraendert zu lassen, ist abgebildet.
- [x] Bestehende Auth-Mechanik bleibt erhalten.
- [x] Keine offene Produktfrage blockiert die Implementation.

## Open Questions

- Keine blockierenden Fragen.

## Decisions

1. Wartelisten-/Whitelist-Kommunikation wird aus der Anwendungsschicht entfernt.
2. Registrierung soll grundsaetzlich moeglich sein und nicht mehr per Signup-Gating vorab blockiert werden.
3. Die externe DB-Baseline und `types/supabase.ts` bleiben in dieser Spec unveraendert.
4. Die `/waitlist`-Route wird entfernt; alte URLs duerfen als 404 enden.
5. Docs und Betriebsskripte fuer Waitlist-/Beta-Freigabe werden entfernt oder bereinigt.
6. Die Auth-Seite soll keine neue Informationsarchitektur bekommen, sondern gezielt entlastet werden.
7. Google und E-Mail/Passwort bleiben die Standard-Auth-Wege.
8. Google wird als kombinierter Auth-Weg fuer Anmeldung oder Kontoerstellung verstanden; das Button-Label folgt dem ausgewaehlten Modus.
