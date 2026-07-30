# Google und E-Mail-Passwort als Standard-Auth

Status: IMPLEMENTED
Last modified: 2026-07-26

## Purpose/Goal

Bonsai Tracker richtet sich an Bonsai-Liebhaber, die nicht zwingend technisch affin sind. Login und Registrierung sollen deshalb vertraut, direkt und fehlertolerant sein.

Die Anwendung soll zwei gleichwertig verstaendliche Standardwege anbieten:

- Google Login fuer Nutzer, die den schnellsten Weg bevorzugen.
- E-Mail und Passwort fuer Nutzer, die keinen Google-Login nutzen wollen oder diesem nicht vertrauen.

Magic Link bleibt erhalten, wird aber als letzter Fallback fuer Login-Probleme behandelt und nicht mehr als normale Standard-Anmeldeoption dargestellt.

## Functional Requirements

1. Die Startseite zeigt nicht eingeloggten Nutzern eine Auth-Card mit den Standardoptionen Google und E-Mail/Passwort.
2. Google bleibt als prominente Auth-Aktion sichtbar und startet weiterhin Supabase OAuth mit `provider: "google"`.
3. E-Mail/Passwort ist als normaler Standardweg sichtbar und unterstuetzt Anmeldung bestehender Nutzer.
4. E-Mail/Passwort unterstuetzt Registrierung neuer Nutzer, sofern das bestehende Beta-/Signup-Gating die E-Mail zulaesst.
5. Vor einer E-Mail/Passwort-Registrierung wird `/api/auth/precheck` verwendet, damit nicht freigegebene Nutzer eine verstaendliche Meldung erhalten, bevor Supabase Sign-up gestartet wird.
6. E-Mail/Passwort-Anmeldung verwendet keine Registrierung im Hintergrund. Wenn die Credentials nicht passen, wird eine verstaendliche Fehlermeldung angezeigt.
7. Passwortregeln bleiben einfach und nutzerfreundlich:
   - Mindestens 8 Zeichen auf der Client-Seite.
   - Keine Pflicht fuer Sonderzeichen, Zahlen, Gross-/Kleinschreibungskombinationen.
   - Server-/Supabase-Regeln bleiben massgeblich, falls Supabase strengere Regeln konfiguriert.
8. Die Registrierung zeigt ein Passwort-Bestaetigungsfeld und verhindert offensichtlich unterschiedliche Passwoerter bereits im UI.
9. Es gibt einen gut sichtbaren `Passwort vergessen?`-Weg fuer E-Mail/Passwort-Nutzer.
10. Passwort-Reset verwendet Supabase Auth und fuehrt Nutzer nach dem Reset-Link in einen Zustand, in dem sie ein neues Passwort setzen koennen.
11. Magic Link ist nicht mehr die normale E-Mail-Auth-Aktion. Er ist nur ueber einen nachrangigen Hilfe-/Fallback-Bereich erreichbar, z. B. `Probleme beim Einloggen?`.
12. Die bestehende Wartelisten- und Beta-Kommunikation bleibt erhalten.
13. Bereits eingeloggte Nutzer sehen weiterhin Dashboard- und Logout-Aktionen statt der Auth-Form.
14. Auth-Fehler werden auf Deutsch, kurz und handlungsorientiert angezeigt.
15. Die Umsetzung bleibt mit Tastatur und Screenreadern nutzbar: Formularlabels, Button-Texte, disabled/loading states und Fehlermeldungen muessen eindeutig sein.

## Technical Constraints

- Stack bleibt Next.js Pages Router, TypeScript, Supabase SDK, Tailwind/DaisyUI.
- Kein Wechsel zu NextAuth.
- Supabase Browser Auth bleibt PKCE-basiert.
- Bestehende Session-Verwaltung in `components/AuthProvider.tsx` bleibt die zentrale Browser-Quelle fuer Auth-Status.
- Bestehender OAuth-Callback unter `pages/auth/callback.tsx` bleibt erhalten.
- Bestehendes Signup-Gating in `pages/api/auth/precheck.ts` und Supabase-Hooks/RPCs bleibt massgeblich.
- `workflows/` wird nicht geaendert.
- Keine Supabase-Migration, sofern fuer E-Mail/Passwort keine konkrete Datenmodell-Luecke sichtbar wird.
- Keine echte Google-OAuth- oder E-Mail-Zustellungs-E2E in `npm test`; externe Provider-Konfiguration wird nicht in Unit-Tests abgebildet.

## Acceptance Criteria

1. `npm test` laeuft erfolgreich.
2. `npm run typecheck` laeuft erfolgreich.
3. Die Startseite exportiert stabile Labels/Helper, sodass die Auth-UX per Node-Test pruefbar ist.
4. Ein Test bestaetigt, dass Google und E-Mail/Passwort als Standardoptionen beschrieben sind.
5. Ein Test bestaetigt, dass Magic Link als Fallback-Text/Option behandelt wird und nicht als primaerer E-Mail-Login-CTA.
6. E-Mail/Passwort-Login ruft Supabase `signInWithPassword` mit normalisierter E-Mail und Passwort auf.
7. E-Mail/Passwort-Registrierung ruft vor `signUp` den bestehenden `/api/auth/precheck` auf.
8. Bei nicht erlaubter Registrierung wird kein Supabase `signUp` gestartet und die bestehende Gating-Meldung wird angezeigt.
9. Passwort-Bestaetigung verhindert Client-seitig unterschiedliche Passwoerter.
10. Passwort-Reset ist fuer E-Mail/Passwort-Nutzer erreichbar und verwendet Supabase `resetPasswordForEmail`.
11. Callback-/Recovery-Logik deckt den Passwort-Reset-Link ab oder leitet verstaendlich auf eine passende Passwort-Setzen-Ansicht.
12. Bestehende Google-OAuth-, Callback-, AuthProvider-, API- und Waitlist-Tests bleiben gruen.
13. Die UI bleibt auf Mobile und Desktop ohne ueberlappende Texte oder unklare Button-Zustaende nutzbar.
14. README oder Feature-Doku beschreibt die relevanten Supabase Auth Einstellungen fuer Google, E-Mail/Passwort und optionalen Magic-Link-Fallback.

## Out-of-Scope

- Abschaffung der geschlossenen Beta, Warteliste oder Signup-Freigabe.
- Einrichtung der Google Cloud Console.
- Supabase Dashboard-Klickstrecken ausser dokumentierten Einstellwerten.
- Neue Social Provider neben Google.
- Passkeys.
- Vollstaendiges Landingpage-Redesign.
- Migration auf Next.js App Router.
- Aenderungen an Datenschutz-/Legal-Seiten, ausser es wird bei der Umsetzung eine konkrete Aussage noetig.

## Open Questions

Keine offenen Produktfragen fuer die Spec.

## Decisions

1. Google und E-Mail/Passwort sind die beiden Standardwege fuer Login und Registrierung.
2. Magic Link bleibt nur als letzter Fallback fuer Login-Probleme.
3. E-Mail/Passwort soll bewusst vertraut wirken und nicht durch komplexe Passwortregeln erschwert werden.
4. Das bestehende Beta-/Signup-Gating bleibt auch fuer E-Mail/Passwort-Registrierungen verbindlich.
5. Passwort-Reset gehoert zum Mindestumfang, weil E-Mail/Passwort ohne Reset fuer die Zielgruppe nicht robust genug ist.
