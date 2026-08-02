# API Surface fuer Flutter Native App

Status: IMPLEMENTED
Created: 2026-08-02
Last Modified: 2026-08-02

## Purpose / Goal

Die Anwendung soll so vorbereitet werden, dass die bestehende Flutter Native App
unter `/Users/maius/Projekte/Bonsai-Tracker-Flutter-App` dieselben fachlichen
Datenzugriffe wie die bestehende Next.js-Web-App nutzen kann, ohne direkt auf
relationale Supabase-Tabellen, Storage-Buckets oder service-only RPCs
zuzugreifen.

Die Planung ist cross-repository: Diese Spec beschreibt den gesamten
Backend- und Flutter-Zusammenhang. Der ausfuehrbare Implementation-Plan wird am
Ende repo-spezifisch aufgeteilt. Der Backend-Plan bleibt in diesem Repository;
der abgeleitete Flutter-Plan wird in den passenden Planungsordner der
Flutter-App uebertragen.

Die Zielarchitektur ist:

- Flutter nutzt Supabase Auth fuer Login, Signup, OAuth, Magic Link,
  Passwort-Reset und Session Refresh.
- Flutter ruft fuer fachliche App-Daten ausschliesslich die versionierte
  Public Client API auf.
- Backend APIs validieren den Supabase Access Token serverseitig und leiten
  daraus die Actor-Identitaet ab.
- Datenzugriffe laufen serverseitig ueber bestehende Repository-Module,
  validierte Payloads und service-only Supabase Data API/RPC/Storage-Zugriffe.
- Mobile-spezifischer Missbrauchsschutz wird ueber App-Integritaetsnachweise,
  Rate Limits und serverseitige Autorisierung ergaenzt.

Der wichtigste Sicherheitsgrundsatz lautet: Eine mobile App kann nicht absolut
als einziger moeglicher Client garantiert werden, weil installierte Apps
analysiert und nachgebaut werden koennen. Die API muss daher auch dann sicher
bleiben, wenn ein Angreifer HTTP-Requests manuell erzeugt. App-Integritaet ist
eine zusaetzliche Missbrauchshuerde, nicht die alleinige Sicherheitsgrenze.

## Functional Requirements

### API-Vertraege fuer Bonsais

1. Flutter kann eigene Bonsais paginiert listen.
2. Flutter kann Bonsais mit denselben Filtern wie die Web-App laden:
   `search`, `species`, `healthStatus`, `developmentStage`,
   `indoorOutdoor`, `status`, `sort`, `limit`, `cursor`.
3. Flutter kann einen Bonsai erstellen.
4. Flutter kann Bonsai-Details inklusive Pflegehistorie laden.
5. Flutter kann Bonsais bearbeiten.
6. Flutter kann Bonsais archivieren und wiederherstellen.
7. Flutter kann Bonsai-Bilder hochladen, anhaengen und entfernen.
8. Vorhandene API-Kandidaten:
   - `GET /api/bonsais`
   - `POST /api/bonsais`
   - `GET /api/bonsais/:id`
   - `PATCH /api/bonsais/:id`
   - `DELETE /api/bonsais/:id`
   - `POST /api/upload`
   - `GET /api/media/...`
   - `DELETE /api/media/...`

### API-Vertraege fuer Pflegeeintraege

1. Flutter kann Pflegeeintraege eines eigenen aktiven Bonsais laden.
2. Flutter kann Pflegeeintraege mit optionalen Bildern erstellen.
3. Flutter kann Pflegeeintraege bearbeiten und dabei bestehende Bilder behalten
   oder entfernen sowie neue Bilder hochladen.
4. Flutter kann Pflegeeintraege loeschen.
5. Vorhandene API-Kandidaten:
   - `GET /api/subentries?bonsaiId=:id`
   - `POST /api/subentries`
   - `PATCH /api/subentries/:id`
   - `DELETE /api/subentries/:id`

### API-Vertraege fuer Reminder

1. Flutter kann eigene offene Reminder laden.
2. Flutter kann Reminder optional nach `status`, `bonsaiId` und
   `includeDone` filtern.
3. Flutter kann Reminder erstellen.
4. Flutter kann Reminder bearbeiten, als erledigt markieren und snoozen.
5. Flutter kann Reminder entfernen, aber fachlich nicht hart loeschen.
6. Entfernen wird als Soft-Delete bzw. neuer fachlicher Status `CANCELLED`
   modelliert. Der bestehende Status-Enum enthaelt aktuell nur `PENDING`,
   `DONE` und `SNOOZED`; `CANCELLED` ist daher eine geplante Schema- und
   API-Erweiterung.
7. Vorhandene API-Kandidaten:
   - `GET /api/reminders`
   - `POST /api/reminders`
   - `PATCH /api/reminders/:id`
8. Fehlender API-Kandidat:
   - `PATCH /api/v1/reminders/:id` mit `{ "status": "CANCELLED" }`.

### API-Vertraege fuer Community Feed

1. Flutter kann den Community Feed laden.
2. Flutter kann Posts erstellen, bearbeiten und loeschen.
3. Flutter kann einzelne sichtbare Posts laden.
4. Flutter kann Posts liken bzw. entliken.
5. Flutter kann Kommentare laden, erstellen, bearbeiten und loeschen.
6. Flutter kann fuer den Composer eigene Bonsais laden und zu einem Bonsai
   Details mit verfuegbaren Bildern und Pflegeeintraegen nachladen.
7. Der Feed muss fuer Mobile paginiert werden, damit keine unbounded Response
   entsteht.
8. Feed-Pagination verwendet Cursor-Pagination:
   - Query: `limit`, `cursor`
   - Default `limit`: 20
   - Maximaler `limit`: 50
   - Sortierung: `createdAt desc`, `id desc`
   - Response: `{ items, nextCursor }`
   - Keine Offset-Pagination.
9. Kommentare muessen in Flutter vollstaendig verwaltbar sein. Dafuer braucht
   es Update-/Delete-Endpunkte fuer eigene Kommentare.
10. Vorhandene API-Kandidaten:
   - `GET /api/posts`
   - `POST /api/posts`
   - `GET /api/posts/:id`
   - `PATCH /api/posts/:id`
   - `DELETE /api/posts/:id`
   - `POST /api/posts/:id/likes`
   - `GET /api/posts/:id/comments`
   - `POST /api/posts/:id/comments`
11. Fehlende API-Kandidaten:
    - Cursor/Limit fuer `GET /api/posts`
    - `PATCH /api/posts/:id/comments/:commentId`
    - `DELETE /api/posts/:id/comments/:commentId`

### API-Vertraege fuer Community Moderation

1. Community-Inhalte muessen moderierbar sein, weil der Betreiber fuer
   veroeffentlichte Inhalte verantwortlich ist.
2. Flutter-Nutzer koennen Community-Inhalte melden, ohne dadurch
   Moderationsentscheidungen selbst auszufuehren.
3. Admin-Moderation ist in der Flutter-App fehl am Platz und wird in einer
   separaten Admin-Oberflaeche geplant.
4. Community-Meldungen sind nur fuer eingeloggte Nutzer moeglich.
5. Community-Meldungen enthalten:
   - Zieltyp `post` oder `comment`
   - Ziel-ID
   - `reason` als vordefiniertes Enum:
     - `SPAM`
     - `HARASSMENT`
     - `HATE_OR_EXTREMISM`
     - `SEXUAL_CONTENT`
     - `VIOLENCE_OR_SELF_HARM`
     - `ILLEGAL_CONTENT`
     - `PERSONAL_DATA`
     - `OTHER`
   - optionale `note` mit harter Laengenbegrenzung
   - serverseitig abgeleitete `reporterUserId`
   - serverseitigen Zeitstempel
   - Status `OPEN`
6. Community-Meldungen haben keine Anhaenge und keine freie Kategorie.
7. `OTHER` darf nur mit ausgefuellter `note` verwendet werden.
8. Mehrfache offene Meldungen desselben Nutzers fuer dasselbe Ziel werden
   idempotent behandelt.
9. Community-Meldungen werden pro Nutzer und Ziel rate-limitiert.
10. Moderationsaktionen in der separaten Admin-Oberflaeche muessen
   Rollenpruefung, Auditierbarkeit und missbrauchsarme Fehlerantworten
   beruecksichtigen.
11. Fehlende API-Kandidaten:
   - `POST /api/v1/posts/:id/reports`
   - `POST /api/v1/posts/:id/comments/:commentId/reports`
   - Admin-Endpunkte und Admin-UI fuer Moderationsentscheidung und
     Inhaltsentfernung in einem separaten Vorhaben.

### API-Vertraege fuer Profile

1. Flutter kann das eigene Profil inklusive privater E-Mail lesen.
2. Flutter kann eigene Profildaten bearbeiten.
3. Flutter kann oeffentliche Profile anderer eingeloggter Beta-Nutzer lesen.
4. Flutter braucht zunaechst keinen nativen Profilbild-Upload.
5. Vorhandene API-Kandidaten:
   - `GET /api/profile/me`
   - `PATCH /api/profile/me`
   - `GET /api/profiles/:id`
6. Vertagter API-Kandidat:
   - `POST /api/v1/profile/me/avatar`

### API-Vertraege fuer Medien

1. Flutter kann Bilder hochladen, die einem Benutzer gehoeren.
2. Flutter kann geschuetzte Medien nur mit gueltigem Access Token abrufen.
3. Flutter kann Medien nur loeschen, wenn der Backend-Check Besitz oder
   Loeschberechtigung bestaetigt.
4. Medien-URLs duerfen keine dauerhaften oeffentlichen Bucket-URLs sein, wenn
   sie private oder Beta-interne Inhalte betreffen.
5. Vorhandene API-Kandidaten:
   - `POST /api/upload`
   - `GET /api/media/...`
   - `DELETE /api/media/...`

### API-Vertraege fuer Auth und Signup-Gating

1. Flutter nutzt Supabase Auth direkt fuer:
   - E-Mail/Passwort Login
   - E-Mail/Passwort Signup
   - Magic Link bzw. OTP, falls aktiviert
   - Google OAuth
   - Passwort-Reset
   - Session Refresh
   - Logout
2. Das Backend stellt keine eigene Passwort-Login-API bereit.
3. Vor Signup- oder Magic-Link-Flows kann Flutter dieselbe Precheck-API wie die
   Web-App aufrufen.
4. Wartelistenanfragen bleiben unauthentifiziert moeglich, aber streng
   rate-limitiert.
5. Vorhandene API-Kandidaten:
   - `POST /api/auth/precheck`
   - `POST /api/access-requests`

### API-Vertraege fuer Betrieb

1. `GET /api/health` bleibt fuer Monitoring vorgesehen und ist nicht Teil der
   fachlichen Flutter-App.
2. Der Healthcheck darf keine Secrets oder intern verwertbaren Details
   offenlegen.

## Technical Constraints

- Stack bleibt Next.js Pages Router, TypeScript, Supabase SDK und Tailwind fuer
  die bestehende Web-App.
- Die Flutter-App existiert bereits separat unter
  `/Users/maius/Projekte/Bonsai-Tracker-Flutter-App`.
- Die Flutter-App hat aktuell keine eigene `AGENTS.md`, kein `workflows/`
  Verzeichnis und kein `dev/` Planungsverzeichnis. Das Verzeichnis ist aktuell
  auch noch kein Git-Repository.
- Die Flutter-App soll vor der API-Migration als eigenes Git-Repository
  initialisiert werden.
- Die Flutter-App nutzt aktuell `supabase_flutter` fuer Auth, `http` fuer
  Backend-Requests und einen zentralen `RemoteApiClient` in `lib/main.dart`.
- Die Flutter-App ruft aktuell bestehende `/api/...`-Routen direkt auf. Die
  Public Client API wird daher als Migration der vorhandenen Remote-Flows
  geplant, nicht als Greenfield-Client.
- Diese Spec darf beide Repositories fachlich betrachten. Konkrete
  Implementierungsplaene und spaetere Codeaenderungen werden jedoch
  repo-spezifisch abgelegt und ausgefuehrt.
- Vor dem abgeleiteten Flutter-Implementation-Plan muss die Workflow-Struktur
  in die Flutter-App uebertragen oder dort gleichwertig initialisiert werden.
- Vor Codeaenderungen an der Flutter-App muss das Flutter-Verzeichnis als
  eigenes Git-Repository initialisiert sein.
- Die Flutter-App darf keine Supabase Secret Keys, Service Role Keys oder
  direkten Datenbank-Zugangsdaten enthalten.
- Flutter darf fuer Anwendungsdaten nicht direkt auf Supabase-Tabellen,
  service-only RPCs oder private Storage-Buckets zugreifen.
- Der Supabase Publishable Key darf in Flutter enthalten sein, aber nur fuer
  Supabase Auth und explizit erlaubte oeffentliche Client-Funktionen.
- Bestehende Web-API-Routen duerfen nicht gebrochen werden und bleiben
  vorerst getrennt von der Public Client API.
- Neue Mobile-Vertraege sollen bevorzugt dieselben DTOs und Validierungsregeln
  wie die Web-App verwenden.
- API-Antworten bleiben JSON mit dem vorhandenen Envelope:
  `{ ok: boolean, data?: unknown, error?: { code, message, details? } }`.
- Upload-Endpunkte verwenden `multipart/form-data`.
- Geschuetzte Endpunkte verlangen `Authorization: Bearer <supabase_access_token>`.
- Ohne Authentifizierung gibt es `401`.
- Bei fehlendem Besitz oder fehlender Sichtbarkeit gibt es bevorzugt `404`,
  damit fremde Ressourcen nicht bestaetigt werden.
- API-Versionierung soll vor stabiler Flutter-Nutzung eingefuehrt oder
  bewusst ausgeschlossen werden. Empfohlener Zielpfad fuer die Public Client
  API ist `/api/v1/...`.
- Der Begriff `external` wird fuer diese API-Boundary vermieden, weil er im
  Projekt bereits fuer externe Supabase-Projektdateien, externe URLs und
  externe Provider verwendet wird.

## Security Requirements

### Authentifizierung und Autorisierung

1. Jede private oder Beta-interne API validiert den Supabase Access Token
   serverseitig ueber Supabase Auth.
2. Die API vertraut keiner vom Client gesendeten User-ID.
3. Der Actor wird ausschliesslich aus dem validierten Token abgeleitet.
4. Jede Repository- oder RPC-Operation prueft Besitz, Sichtbarkeit oder
   fachliche Berechtigung explizit.
5. Service-only RPCs bleiben fuer `anon` und `authenticated` gesperrt und
   werden nur serverseitig verwendet.
6. RLS bleibt als Defense-in-Depth auf Anwendungstabellen aktiv, auch wenn der
   Server-Client mit Secret Key arbeitet.

### Mobile App Integritaet

1. Die API darf nicht davon ausgehen, dass ein statischer API-Key, Header oder
   Shared Secret eine Flutter-App verlaesslich identifiziert.
2. Fuer iOS soll Apple App Attest eingeplant werden.
3. Fuer Android soll Google Play Integrity API eingeplant werden.
4. Firebase App Check wird nicht verwendet, weil keine zusaetzliche
   Firebase-Abhaengigkeit eingefuehrt werden soll.
5. App-Integritaetsnachweise werden serverseitig validiert.
6. In Production wird App-Integritaet fuer private und schreibende Public
   Client API-Aufrufe hart erzwungen.
7. Lokale Entwicklung, Simulatoren, TestFlight und interne Testverteilungen
   duerfen App-Integritaet nur ueber einen expliziten Environment-Schalter
   lockern.
8. Authentifizierung per Supabase Access Token bleibt immer Pflicht, auch wenn
   App-Integritaet in einer Nicht-Production-Umgebung gelockert ist.
9. Normale Public Client API-Requests uebergeben App-Integritaet ueber eigene
   Header:
   - `X-Bonsai-App-Integrity: <token>`
   - `X-Bonsai-Platform: ios|android`
10. Der Supabase Access Token bleibt ausschliesslich im `Authorization`-Header.
11. App-Integritaetsdaten werden nicht mit Auth vermischt und nicht im JSON-Body
    normaler Fach-Requests uebertragen.
12. Fuer initiale Attestation bzw. Registration duerfen separate Endpunkte
    geplant werden.
13. App-Integritaet ersetzt keine Benutzer-Authentifizierung.

### Rate Limits und Missbrauchsschutz

1. Bestehende Rate Limits fuer Signup und Warteliste bleiben erhalten.
2. Mobile APIs mit hohem Missbrauchspotenzial bekommen zusaetzliche Limits,
   mindestens fuer:
   - Login-/Signup-Precheck
   - Wartelistenanfrage
   - Upload
   - Post-Erstellung
   - Kommentar-Erstellung
   - Community-Meldung
   - Like-Toggle
   - Medienabruf bei auffaelligem Request-Muster
3. Rate Limits beruecksichtigen mindestens IP, Actor-ID und, falls vorhanden,
   App-Integritaets-/Device-Subject.
4. Uploads behalten Dateityp-, Dateigroessen- und Anzahl-Limits.
5. Fehlerantworten duerfen keine sensiblen Interna, SQL-Details oder Storage
   Keys preisgeben.

### Transport und Plattform

1. Produktion nutzt ausschliesslich HTTPS.
2. CORS wird bewusst fuer die Web-App konfiguriert; Native Apps sind nicht auf
   Browser-CORS als Sicherheitsmechanismus angewiesen.
3. API-URLs, Bundle IDs, Package Names und Redirect URLs werden je Umgebung
   dokumentiert.
4. Supabase Auth Redirect URLs muessen fuer iOS und Android Deep Links passend
   konfiguriert werden.

## Current API Inventory

### Bestehende Flutter-App Ist-Zustand

Die vorhandene Flutter-App ist derzeit ein eigenstaendiges Projekt mit nur
einem fachlichen Dart-File:

- `/Users/maius/Projekte/Bonsai-Tracker-Flutter-App/lib/main.dart`
- `/Users/maius/Projekte/Bonsai-Tracker-Flutter-App/test/widget_test.dart`

Die App konfiguriert Remote-Zugriff ueber Dart Defines:

- `API_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Der vorhandene `RemoteApiClient` sendet bereits Supabase Bearer Tokens an das
Backend und nutzt aktuell diese Legacy-Web-API-Pfade:

- `POST /api/auth/precheck`
- `GET /api/profile/me`
- `PATCH /api/profile/me`
- `GET /api/bonsais`
- `POST /api/bonsais`
- `GET /api/bonsais/:id`
- `POST /api/subentries`
- `GET /api/reminders`
- `PATCH /api/reminders/:id`
- `GET /api/posts`
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/likes`
- `POST /api/posts/:id/comments`

Diese vorhandenen Aufrufe sind die konkrete Migrationsbasis fuer
`/api/v1/...`.

### Bereits vorhanden und direkt Flutter-relevant

| Bereich | Endpunkt | Methoden | Auth | Mobile-Eignung |
| --- | --- | --- | --- | --- |
| Bonsais | `/api/bonsais` | `GET`, `POST` | Required | Ja |
| Bonsais | `/api/bonsais/:id` | `GET`, `PATCH`, `DELETE` | Required | Ja |
| Pflegeeintraege | `/api/subentries` | `GET`, `POST` | Required | Ja |
| Pflegeeintraege | `/api/subentries/:id` | `PATCH`, `DELETE` | Required | Ja |
| Reminder | `/api/reminders` | `GET`, `POST` | Required | Ja |
| Reminder | `/api/reminders/:id` | `PATCH` | Required | Teilweise |
| Feed | `/api/posts` | `GET`, `POST` | Required | Teilweise, Pagination fehlt |
| Feed | `/api/posts/:id` | `GET`, `PATCH`, `DELETE` | Required | Ja |
| Likes | `/api/posts/:id/likes` | `POST` | Required | Ja |
| Kommentare | `/api/posts/:id/comments` | `GET`, `POST` | Required | Teilweise |
| Community-Meldung | Noch nicht vorhanden | `POST` | Required | Nein |
| Eigenes Profil | `/api/profile/me` | `GET`, `PATCH` | Required | Ja |
| Oeffentliches Profil | `/api/profiles/:id` | `GET` | Required | Ja |
| Upload | `/api/upload` | `POST` | Required | Ja fuer Bonsai-/Pflegebilder |
| Medien | `/api/media/...` | `GET`, `DELETE` | Required | Ja |
| Auth Precheck | `/api/auth/precheck` | `POST` | None | Ja |
| Warteliste | `/api/access-requests` | `POST` | None | Ja |
| Health | `/api/health` | `GET` | None, wenn aktiviert | Betrieb, nicht Flutter-Fachflow |

### Fehlende oder zu haertende API-Vertraege

1. `GET /api/posts` braucht Cursor/Limit und ggf. Filter.
2. Kommentare brauchen eigene Update-/Delete-Endpunkte.
3. Reminder brauchen `PATCH status=CANCELLED`.
4. Profilbild-Uploads sind vorerst nicht Teil dieses Vorhabens.
5. API-Versionierung muss fuer Flutter stabilisiert werden.
6. App-Integritaetspruefung muss als Middleware oder Endpunkt-Familie
   spezifiziert werden.
7. Community-Meldungen und Admin-Moderation muessen als eigener Scope
   spezifiziert werden.

## Data Access Inventory

### Tabellen

Die relevanten Anwendungstabellen sind:

- `bonsais`
- `sub_entries`
- `reminders`
- `posts`
- `post_entry_references`
- `post_likes`
- `post_comments`
- `profiles`
- `signup_settings`
- `waitlist_requests`
- `auth_rate_limit_events`

### RPCs

Die relevanten serverseitigen RPCs sind:

- `append_bonsai_image`
- `can_access_media`
- `can_delete_media`
- `consume_auth_rate_limit`
- `create_owned_reminder`
- `create_owned_sub_entry`
- `delete_owned_sub_entry`
- `patch_owned_bonsai`
- `patch_owned_sub_entry`
- `precheck_signup`
- `save_owned_post`
- `set_bonsai_archived`
- `toggle_post_like`

Administrative RPCs wie `approve_waitlist` sind nicht Teil der Flutter-App.

## Acceptance Criteria

1. Es existiert ein genehmigter API-Plan fuer Flutter, der alle oben genannten
   vorhandenen und fehlenden Endpunkte behandelt.
2. Fuer jeden Flutter-Fachflow ist klar, ob ein vorhandener Endpunkt reicht
   oder ein neuer bzw. gehaerteter Endpunkt benoetigt wird.
3. Alle privaten fachlichen APIs verlangen Bearer Auth und validieren den
   Supabase Token serverseitig.
4. Kein Flutter-Code benoetigt Supabase Secret Keys, Service Role Keys oder
   direkte Datenbank-Zugangsdaten.
5. API-Versionierung ist entschieden und dokumentiert.
6. Feed-Pagination ist spezifiziert und verhindert unbounded Responses.
7. Upload- und Medienendpunkte haben dokumentierte Limits,
   Berechtigungspruefungen und Fehlerfaelle.
8. Profilbild-Uploads sind explizit out-of-scope.
9. App-Integritaetspruefung fuer iOS und Android ist als Security-Layer
   geplant und wird in Production hart erzwungen; Nicht-Production-Ausnahmen
   sind explizit konfiguriert.
10. Rate-Limits fuer unauthentifizierte und schreibende Mobile-Flows sind
    spezifiziert.
11. Bestehende Web-Flows bleiben kompatibel oder bekommen eine dokumentierte
    Migrationsstrategie.
12. Community-Meldungen fuer normale Flutter-Nutzer sind spezifiziert.
13. Admin-Moderation ist als separates Admin-Oberflaechen-Vorhaben abgegrenzt.
14. Die bestehende Flutter-App unter
    `/Users/maius/Projekte/Bonsai-Tracker-Flutter-App` ist als
    Migrationskonsument der Public Client API beruecksichtigt.
15. Tests fuer Auth, Autorisierung, Pagination, Upload-Limits und
    Fehlerantworten sind im Implementation-Plan vorgesehen.
16. Aus der cross-repository Gesamtplanung existieren am Ende getrennte,
    repo-spezifische Implementation-Plaene fuer Backend und Flutter-App.
17. Die Flutter-App hat vor ihrem eigenen Implementation-Plan eine uebertragene
    oder gleichwertig initialisierte Workflow-/Planungsstruktur.
18. Die Flutter-App ist vor Codeaenderungen als eigenes Git-Repository
    initialisiert.

## Out-of-Scope

- Implementierung der Flutter Native App.
- Refactoring der bestehenden Flutter-App-Struktur in dieser Spec-Phase.
- Implementierung neuer API-Routen in dieser Spec-Phase.
- UI- oder Navigationsaenderungen an der Web-App.
- Migration zu Next.js App Router.
- Abschaffung von Supabase Auth.
- Eigene Passwort-Authentifizierung im Next.js Backend.
- Oeffentliche, unauthentifizierte Community-APIs.
- Administrative Waitlist-Oberflaechen.
- Admin-Moderationsoberflaeche und Admin-Moderationsworkflows.
- Native Profilbild-Uploads.
- Firebase App Check.
- Endgueltige Auswahl eines konkreten Flutter State-Management-Frameworks.

## Open Questions

Keine offenen Fragen.

## Decisions

Final geklaerte Entscheidungen:

1. Die stabile Boundary fuer eigene veroeffentlichte Clients heisst
   `Public Client API`.
2. Der Begriff `external` wird fuer diese Boundary vermieden.
3. Die bestehende Web-App bleibt kurzfristig auf ihren aktuellen `/api/...`
   Routen. Eine spaetere Web-Migration auf `/api/v1/...` wird vertagt.
4. Die Flutter-App soll den Community Feed vollstaendig unterstuetzen, nicht
   nur lesend und nicht nur als reduzierten MVP.
5. Community-Inhalte muessen moderierbar sein; reine Eigenloeschung durch
   Autoren reicht nicht aus.
6. Admin-Moderation gehoert nicht in die Flutter-App, sondern in eine separate
   Admin-Oberflaeche. Die Flutter-App stellt nur Meldefunktionen fuer normale
   Nutzer bereit.
7. Community-Meldungen sind minimal, eingeloggte Nutzer-only, idempotent und
   rate-limitiert.
8. Flutter kann Reminder entfernen; fachlich ist das ein Cancel/Soft-Delete
   und kein harter Delete.
9. Die API modelliert Reminder-Entfernen explizit als
   `PATCH /api/v1/reminders/:id` mit Status `CANCELLED`, nicht als `DELETE`.
10. Native Profilbild-Uploads sind vorerst nicht Teil dieses Vorhabens.
11. App-Integritaet wird in Production fuer private und schreibende Public
    Client API-Aufrufe hart erzwungen. Nicht-Production-Ausnahmen muessen
    explizit konfiguriert sein.
12. Firebase App Check wird nicht eingefuehrt. App-Integritaet wird direkt ueber
    Apple App Attest und Google Play Integrity geplant.
13. Es gibt eine cross-repository Gesamtplanung. Daraus werden am Ende getrennte
    Implementation-Plaene fuer dieses Backend-Repository und die bestehende
    Flutter-App abgeleitet.
14. Die Workflow- und Planungsstruktur muss in die Flutter-App uebertragen
    werden, bevor dort ein eigener Flutter-Implementation-Plan abgelegt wird.
15. Die Flutter-App wird vor der API-Migration als eigenes Git-Repository
    initialisiert.
16. Community-Meldungen verwenden initial die Gruende `SPAM`, `HARASSMENT`,
    `HATE_OR_EXTREMISM`, `SEXUAL_CONTENT`, `VIOLENCE_OR_SELF_HARM`,
    `ILLEGAL_CONTENT`, `PERSONAL_DATA` und `OTHER`; `OTHER` erfordert eine
    `note`.
17. Feed-Pagination verwendet Cursor-Pagination mit Default-Limit 20,
    Maximal-Limit 50 und stabiler Sortierung nach `createdAt desc, id desc`.
18. App-Integritaetsnachweise werden bei normalen Public Client API-Requests
    ueber `X-Bonsai-App-Integrity` und `X-Bonsai-Platform` uebergeben.

Empfohlene Ausgangsentscheidungen fuer den Implementation-Plan:

1. Neue stabile API-Vertraege unter `/api/v1/...` einfuehren, ohne die
   bestehenden Web-Routen in diesem Vorhaben umzuziehen.
2. Supabase Auth in Flutter direkt nutzen und Access Tokens an das Backend
   senden.
3. App-Integritaet als zusaetzlichen Schutz einplanen, aber alle Endpunkte so
   bauen, dass sie auch gegen manuell erzeugte HTTP-Requests sicher bleiben.
4. Feed-Pagination vor dem ersten Flutter-Release klaeren.
