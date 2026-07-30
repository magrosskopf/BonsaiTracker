# Supabase Google Auth verwenden

Status: IMPLEMENTED
Last modified: 2026-07-24

## Purpose/Goal

Die Anwendung soll die in Supabase konfigurierte Google-Authentifizierung als primaeren Login-Weg verwenden. Nutzer sollen sich ueber Google anmelden, nach erfolgreichem OAuth-Callback in der bestehenden Supabase-Session landen und danach die geschuetzten App-Bereiche nutzen koennen.

Die bestehende App enthaelt bereits Supabase Auth Bausteine:

- `components/AuthProvider.tsx` verwaltet Supabase Sessions im Browser.
- `lib/supabase/browser.ts` nutzt PKCE und persistente Browser-Sessions.
- `pages/index.tsx` startet `signInWithOAuth({ provider: "google" })`.
- `pages/auth/callback.tsx` tauscht den OAuth-Code per `exchangeCodeForSession` gegen eine Session.
- Supabase Signup-Gating ist ueber `before_user_created` und `precheck_signup` vorbereitet.

Ziel dieser Arbeit ist deshalb nicht ein kompletter Auth-Neubau, sondern die produktionsnahe Nutzung, Fehlerbehandlung, Konfigurationsklarheit und Testabdeckung fuer Google Auth.

## Functional Requirements

1. Die Startseite bietet Google Login als primaere Login-Aktion an.
2. Klick auf Google Login startet Supabase OAuth mit `provider: "google"` und leitet auf `/auth/callback` zurueck.
3. `/auth/callback` verarbeitet erfolgreiche Supabase PKCE-Callbacks und leitet eingeloggte Nutzer auf `/dashboard`.
4. OAuth-Fehler aus Supabase muessen nutzerverstaendlich angezeigt oder zur Startseite mit passender Meldung geleitet werden.
5. Der bestehende E-Mail-Magic-Link-Login bleibt nur als optionaler Fallback ueber `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED=true` aktivierbar.
6. Bereits bestehende geschuetzte Bereiche nutzen weiterhin `AuthProvider`, `useRequireAuth` und tokenbasiertes `apiFetch`.
7. Geschlossene-Beta-Gating bleibt erhalten: Neue Nutzer ohne Freigabe duerfen nicht unkontrolliert per Google in die App gelangen.
8. Die fuer Supabase Google Auth notwendigen Redirect-URLs und Umgebungsvariablen muessen dokumentiert sein.

## Technical Constraints

- Stack bleibt Next.js Pages Router, TypeScript, Supabase SDK und Tailwind/DaisyUI.
- Kein Wechsel zu NextAuth.
- Supabase Browser Auth bleibt PKCE-basiert.
- Keine Aenderungen am zentralen `workflows/` Verzeichnis.
- Datenschutz-/Legal-Texte sollen nur geaendert werden, wenn die technische Aenderung neue Aussagen erfordert.
- Datenbankschema soll nur geaendert werden, wenn sich beim Review ein konkreter Gating- oder Hook-Mangel zeigt.

## Acceptance Criteria

1. `npm test` laeuft erfolgreich.
2. `npm run typecheck` laeuft erfolgreich.
3. Google-Login-Start ist per Test oder stabiler Export-/Mock-Pruefung abgedeckt.
4. Callback-Verhalten fuer Erfolg und OAuth-Fehler ist per Test oder klar isolierter Logik abgedeckt.
5. Die App dokumentiert die erforderlichen Supabase Einstellungen:
   - Google Provider in Supabase Auth aktiviert.
   - Site URL passend zur App-URL gesetzt.
   - Redirect URL fuer lokale Entwicklung: `http://localhost:3000/auth/callback`.
   - Redirect URL fuer Produktion wird ergaenzt, sobald eine Produktionsdomain existiert.
   - `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` gesetzt.
6. E-Mail-Fallback bleibt standardmaessig versteckt, sofern `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED` nicht `true` ist.
7. Bestehende Auth-, API- und Waitlist-Tests werden nicht regressiv gebrochen.

## Out-of-Scope

- Google Cloud Console Einrichtung.
- Supabase Dashboard Klickstrecken ausser dokumentierten Einstellwerten.
- Vollstaendige E2E-Ausfuehrung gegen echtes Google OAuth.
- Abschaffung der Warteliste oder Beta-Freigabe.
- Migration zu App Router.
- UI-Redesign der Landingpage.

## Open Questions

Keine offenen Fragen.

## Decisions

1. Es gibt aktuell noch keine Produktionsdomain; dokumentiert wird zunaechst nur die lokale Redirect URL und der Hinweis, die Produktions-Redirect-URL spaeter zu ergaenzen.
2. Der E-Mail-Magic-Link-Fallback bleibt im Code und bleibt weiterhin nur ueber `NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED=true` sichtbar.
