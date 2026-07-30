# Prisma-Runtime durch Supabase Platform SDK ersetzen

Status: IMPLEMENTED
Created: 2026-07-17
Last Modified: 2026-07-19

## Purpose / Goal

Die Anwendung soll Prisma und NextAuth vollstaendig durch die vorgesehenen
Supabase-Schnittstellen ersetzen. Im laufenden Next.js-Prozess darf es keine
direkte PostgreSQL-Verbindung und keine Datenbank-Zugangsdaten geben.

Die Zielarchitektur besteht aus:

- Supabase Auth fuer Google-Login, Magic Links und Sessions.
- Supabase JS im Browser ausschliesslich fuer Auth mit Publishable Key.
- Next.js API Routes als einziger Zugriffspfad auf relationale Anwendungsdaten
  und private bzw. Community-Medien.
- Einem serverseitigen Supabase-Client mit Secret Key fuer Data API, RPCs und
  Storage.
- Supabase CLI und versionierten SQL-Migrationen fuer Schemaaenderungen.
- Direktem PostgreSQL-Zugriff ausschliesslich in einem getrennten lokalen oder
  CI-Migrationsjob.

Es gibt noch keine produktiven Benutzer. Deshalb darf die bestehende lokale
oder anderweitig unproduktive Supabase-Datenbank nach einem Backup vollstaendig
zurueckgesetzt und aus einer neuen Baseline aufgebaut werden.

## Success Boundary

Die Umstellung ist erst abgeschlossen, wenn im Deployment keine Mischform aus
Prisma, NextAuth und Supabase-Datenzugriff mehr existiert. Lokale
Zwischenstaende duerfen inkrementell entstehen, werden aber nicht deployed.

Der Anwendungslaufzeit werden weder `DATABASE_URL` noch andere direkte
PostgreSQL-Zugangsdaten bereitgestellt. Diese Zugangsdaten gehoeren nur in die
explizite Migrationsumgebung.

## Functional Requirements

### Authentifizierung

1. Google-Login, E-Mail-Magic-Link, Session-Erneuerung und Logout laufen ueber
   Supabase Auth.
2. Der Browser verwendet dafuer
   `NEXT_PUBLIC_SUPABASE_URL` und
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Resend wird als Custom-SMTP-Provider von Supabase Auth konfiguriert. Next.js
   versendet keine Magic Links mehr selbst.
4. NextAuth, Prisma Adapter sowie die Tabellen `Account`, `Session`,
   `VerificationToken` und das bisherige NextAuth-`User`-Modell entfallen.
5. Die Frontend-Auth-Schicht ersetzt `SessionProvider`, `useSession`, `signIn`
   und `signOut` durch einen zentralen Supabase-Auth-Provider.
6. Der zentrale API-Client des Frontends sendet den aktuellen Access Token als
   `Authorization: Bearer <token>` an geschuetzte Next.js API Routes.
7. API Routes validieren den Token serverseitig. Ein lediglich decodierter
   JWT-Payload oder eine vom Client gesendete User-ID gilt nicht als Identitaet.
8. Abgelaufene oder ungueltige Tokens ergeben `401`; fehlende Berechtigungen
   auf benutzerbezogene Ressourcen ergeben `404`, damit deren Existenz nicht
   offengelegt wird.

### Closed-Beta-Zugang

1. Allowlist, Waitlist, globales Signup-Schalten und maximale Benutzerzahl
   bleiben erhalten.
2. Die autoritative Zulassungsentscheidung erfolgt in einem Supabase Auth
   `Before User Created` Postgres Hook.
3. Der Hook prueft unter einem Transaktions-Advisory-Lock:
   - ob Signups global freigegeben sind,
   - ob die normalisierte E-Mail auf der Allowlist steht,
   - ob die maximale Anzahl bestehender Auth-Benutzer noch nicht erreicht ist.
4. Die fuer den Hook benoetigte Konfiguration liegt in einer versionierten
   Singleton-Tabelle `signup_settings`; sie wird nicht aus Next.js-Umgebungs-
   variablen abgeleitet.
5. Die bestehende Precheck-Route darf die Entscheidung fuer bessere UX
   spiegeln, ist aber keine Sicherheitsgrenze. Ein direkter Aufruf von
   Supabase Auth muss am Hook dieselben Regeln durchsetzen.
6. `SignupSlot` und zeitlich reservierte Plaetze entfallen. Die atomare
   Hook-Entscheidung ersetzt dieses Modell.
7. Der Hook schlaegt geschlossen fehl: Bei Konfigurations-, Abfrage- oder
   Lock-Fehlern wird kein Benutzer angelegt.
8. Ein Trigger erzeugt nach erfolgreicher Auth-Benutzeranlage genau ein
   zugehoeriges Profil. Fehler in dieser Anlage duerfen keinen verwaisten
   Auth-Benutzer hinterlassen.
9. Bereits angelegte Auth-Benutzer koennen sich auch dann weiter anmelden, wenn
   neue Signups deaktiviert oder sie nicht mehr auf der Allowlist sind. Die
   Capacity- und Allowlist-Pruefung gilt nur fuer neue Benutzer.
10. Precheck- und Auth-Antworten vermeiden eine unnoetige Offenlegung, ob eine
    E-Mail bereits als Benutzer existiert.

### Datenzugriff

1. Browser-Code greift in diesem Vorhaben nicht direkt auf relationale Tabellen,
   Views, RPCs oder Storage-Buckets zu.
2. Next.js API Routes verwenden zwei klar getrennte Server-Helfer:
   - einen Auth-Helfer zur Validierung des Bearer Tokens,
   - einen Daten-Client mit `SUPABASE_SECRET_KEY` fuer Data API, RPCs und
     Storage.
3. Der Secret-Key-Client umgeht RLS. Deshalb prueft jede geschuetzte API Route
   die Identitaet und jede Repository- bzw. RPC-Operation den fachlichen
   Besitz oder die erforderliche Berechtigung explizit.
4. Der Server-Client darf keinen vom Browser kontrollierten Session-Header
   uebernehmen und darf niemals in einen Client-Bundle gelangen.
5. Ein einfacher Lese- oder Schreibvorgang verwendet die typisierte
   Supabase-Query-API. Mehrschrittige atomare Aenderungen werden als
   versionierte Postgres-Funktion und ueber RPC ausgefuehrt.
6. Service-only-RPCs werden fuer `public`, `anon` und `authenticated` explizit
   gesperrt. Nur die Serverrolle darf sie ausfuehren.
7. Service-only-RPCs erhalten die bereits validierte Actor-UUID explizit und
   pruefen Besitz und Invarianten innerhalb derselben Transaktion.
8. Listen- und Detailabfragen vermeiden N+1-Zugriffe. Verknuepfte Daten und
   Counts werden mit eingebetteten Relationen, Views oder gezielten RPCs in
   einer konstant begrenzten Anzahl Requests geladen.
9. Suche und Filter werden ueber typisierte Parameter aufgebaut. Ungepruefte
   Benutzereingaben duerfen nicht in rohe PostgREST-Filterstrings eingesetzt
   werden.

### Atomare Operationen

Mindestens folgende Vorgaenge benoetigen eine transaktionale Funktion oder eine
gleichwertige einzelne Datenbankoperation:

- Closed-Beta-Zulassung im Auth Hook.
- Anlegen und Aendern eines Posts zusammen mit allen Entry-Referenzen.
- Archivieren oder Wiederherstellen eines Bonsais zusammen mit dem konsistenten
  Reminder-Zustand.
- Like-Toggle mit eindeutigem Ergebnis auch bei parallelen Requests.
- Konsumieren eines Rate-Limit-Fensters ohne getrennte
  Delete/Count/Create-Race-Condition.
- Aenderungen, bei denen SubEntry- und Reminder-Zustand gemeinsam gueltig sein
  muessen.
- Paralleles Anhaengen oder Entfernen von Bildpfaden, ohne Array-Updates zu
  verlieren.

Storage und PostgreSQL koennen nicht gemeinsam transaktional schreiben. Jeder
Flow, der beides aendert, definiert deshalb eine Kompensationsstrategie und
Tests fuer teilweise fehlgeschlagene Operationen.

## Target Architecture

```text
Browser
  |-- Supabase Auth + Publishable Key --> Supabase Auth
  |
  `-- Bearer Access Token -------------> Next.js API Route
                                           |-- Token validieren
                                           |-- Besitz/Berechtigung pruefen
                                           `-- Secret Key Client
                                                 |-- Data API / RPC
                                                 `-- Storage

Lokaler/CI-Migrationsjob
  `-- direkte DB-Zugangsdaten ----------> Supabase Postgres
```

Der Publishable Key ist absichtlich oeffentlich und darf spaeter fuer weitere
geeignete Supabase-Funktionen verwendet werden. Direkter Browserzugriff auf
Anwendungsdaten oder Storage ist jedoch nicht Teil dieser Migration und setzt
eine separate Policy- und Medien-Sichtbarkeitsentscheidung voraus.

## Data Model

### Naming und IDs

1. Datenbanktabellen und Spalten werden auf lowercase `snake_case` umgestellt.
2. `auth.users.id` ist die einzige Benutzeridentitaet und hat den Typ `uuid`.
3. Alle fachlichen `user_id`-Referenzen verwenden `uuid` mit passenden
   Foreign Keys.
4. Fachliche IDs fuer Bonsais, Posts, Eintraege und Kommentare bleiben
   numerisch. Die API liefert sie weiterhin als Zahlen.
5. Oeffentliche API-DTOs bleiben camelCase. Nur User- und Profile-IDs aendern
   sich bewusst von Zahlen auf UUID-Strings.
6. Bestehende fachliche Enum-Werte und ihre API-Darstellung bleiben erhalten,
   sofern die Baseline-Migration keine dokumentierte Normalisierung enthaelt.

### Tabellen

Die neue SQL-Baseline bildet folgende fachliche Tabellen ab:

- `profiles`
- `bonsais`
- `sub_entries`
- `reminders`
- `posts`
- `post_entry_references`
- `post_likes`
- `post_comments`
- `signup_settings`
- `signup_allowlist`
- `waitlist_requests`
- `auth_rate_limit_events`

`signup_settings` enthaelt genau eine Zeile mit `signup_enabled`,
`waitlist_enabled` und `max_total_users`. Der Maximalwert muss groesser oder
gleich `0` sein; `0` sperrt neue Benutzer. Precheck und Auth Hook lesen
dieselbe Zeile.

`profiles.id` referenziert `auth.users.id` mit `ON DELETE CASCADE`. Alle direkt
benutzerbezogenen Fachdaten referenzieren `profiles.id` ebenfalls mit
`ON DELETE CASCADE`; die bestehenden fachlichen Kaskaden und `SET NULL`-Regeln
zwischen Bonsais, Eintraegen, Remindern und Community-Daten bleiben erhalten.
Damit entfernt eine ausdrueckliche Auth-Benutzerloeschung auch dessen Profil
und eigene Fachdaten. Das Profil enthaelt nur fachliche Profildaten. Die
E-Mail-Adresse bleibt ausschliesslich in `auth.users` und wird nicht in
`profiles` dupliziert. Die Self-API darf die verifizierte eigene E-Mail aus Auth
mit den Profildaten zusammenfuehren.

Alle mutierbaren Tabellen mit `updated_at` erhalten einen Datenbank-Trigger,
der das bisherige Prisma-`@updatedAt`-Verhalten unabhaengig vom Aufrufer
sicherstellt.

Notwendige Unique Constraints, Foreign Keys, Check Constraints und Indizes
werden in der Baseline explizit definiert. Dazu gehoeren insbesondere die
normalisierte Allowlist-E-Mail, eindeutige Likes pro Benutzer und Post sowie
die bisherigen fachlichen Eindeutigkeitsregeln.

### Row Level Security

1. RLS ist auf allen ueber die Data API erreichbaren Anwendungstabellen
   aktiviert.
2. Fuer `anon` und `authenticated` werden im Rahmen dieser Migration keine
   Datenzugriffs-Policies angelegt. Der Default ist deny.
3. Tabellen- und Funktionsrechte werden ebenfalls minimal vergeben; RLS ist
   nicht der einzige Schutz gegen ungewollten Direktzugriff.
4. Die fuer Supabase Auth benoetigten Hook- und Trigger-Funktionen erhalten nur
   die dokumentierten Rechte fuer die Auth-Systemrolle. Alle anderen Rollen
   werden explizit entzogen.
5. Da der Secret Key RLS umgeht, bilden diese Policies keine Tenant-Grenze fuer
   den Next.js-Server. Diese Grenze liegt in dessen Auth-, Ownership- und
   Repository-Schicht.
6. Der verwendete private Storage-Bucket erhaelt keine direkten Upload-, Read-
   oder Delete-Policies fuer `anon` oder `authenticated`. Medienzugriffe laufen
   weiterhin ueber die autorisierten Next.js-Endpunkte.

## API Contracts

1. Bestehende fachliche Pfade, HTTP-Methoden, Statuscodes und Fehler-Envelopes
   bleiben erhalten. Die einzigen Vertragsaenderungen dieser Migration sind
   die in den folgenden Punkten genannten Auth-Endpunkte, der Bearer-Transport
   und UUID-Benutzer-IDs.
2. Die bisherigen NextAuth-Endpunkte unter `/api/auth/[...nextauth]` entfallen.
   Supabase Auth uebernimmt Login, Callback, Session und Logout.
3. Die Closed-Beta-Precheck- und Waitlist-Endpunkte bleiben als Next.js API
   Routes bestehen.
4. Geschuetzte API Routes erwarten einen Supabase Access Token im
   `Authorization`-Header. NextAuth-Cookies werden nicht mehr ausgewertet.
5. User- und Profile-IDs werden als UUID-Strings validiert und ausgeliefert.
   Alle anderen vorhandenen numerischen Domain-IDs bleiben Zahlen.
6. Zeitwerte werden weiterhin als ISO-8601-Strings ausgegeben.
7. Prisma-Ergebnisse werden durch explizite, typisierte DTO-Mapper ersetzt.
   Interne `snake_case`-Felder duerfen nicht ungeplant in API-Antworten leaken.
8. Datenbank- und PostgREST-Fehler werden zentral auf stabile API-Fehler
   abgebildet. Interne SQL-, Tabellen- oder Secret-Details erscheinen weder in
   Responses noch in Logs.
9. Ein fachlicher Unique-Konflikt ergibt `409`. Eine durch validierte Eingaben
   ausgeloeste Foreign-Key- oder Check-Constraint-Verletzung ergibt `400`.
   Unerwartete Datenbankfehler ergeben `500`.

## Migration and Cutover

1. Vor jedem Reset wird ein pruefbares Backup der betroffenen unproduktiven
   Datenbank und relevanter Storage-Objekte erstellt.
2. Ein Reset-Skript besitzt einen Umgebungsschutz und beendet sich bei einem
   nicht ausdruecklich freigegebenen Ziel. Ein Remote-Reset erfordert eine
   gesonderte ausdrueckliche Freigabe.
3. Die neue Supabase-CLI-Baseline ist die einzige kanonische Quelle fuer das
   Datenbankschema.
4. Bestehende Prisma-Migrationen werden nicht mehr ausgefuehrt. Die Git-Historie
   bleibt als historische Referenz; die Prisma-Artefakte duerfen nach der
   erfolgreichen Umstellung aus dem Arbeitsbaum entfernt werden.
5. Lokale Entwicklung startet den vollstaendigen Supabase-Stack per CLI und
   Docker, fuehrt alle Migrationen auf einer leeren Datenbank aus und seeded nur
   klar gekennzeichnete Testdaten.
6. Supabase-Datenbanktypen werden aus der lokalen, vollstaendig migrierten
   Instanz generiert und eingecheckt.
7. CI prueft, dass Migrationen auf einer leeren Datenbank funktionieren und
   dass die eingecheckten Typen nicht vom generierten Ergebnis abweichen.
8. Prisma-, NextAuth- und alte Migrationsskripte, Dependencies, Build-Hooks und
   Umgebungsvariablen werden vor dem Cutover entfernt.
9. Der Deployment-Cutover erfolgt in einem Schritt: neue Datenbank-Baseline,
   Supabase-Auth-Konfiguration, Secrets und neue Anwendung werden gemeinsam
   aktiviert.
10. Ein Rollback benoetigt die vorherige Anwendungsversion und das dazu passende
    Datenbank-Backup. Eine alte Anwendung darf nicht gegen die neue Baseline
    gestartet werden.

Die tatsaechliche Aenderung oder Zuruecksetzung einer Remote-Supabase-Instanz
ist nicht durch die Spec-Freigabe allein autorisiert und erfordert vor der
Ausfuehrung eine separate Bestaetigung.

## Technical Constraints

- Next.js Pages Router und TypeScript bleiben bestehen.
- Die Supabase JS Major-Version bleibt im von der Anwendung unterstuetzten
  Versionsbereich.
- Es werden die neuen Supabase Publishable- und Secret-Keys verwendet, nicht
  neue Abhaengigkeiten von den Legacy-Namen `anon` und `service_role` aufgebaut.
- `SUPABASE_SECRET_KEY` ist ausschliesslich serverseitig und besitzt nie ein
  `NEXT_PUBLIC_`-Praefix.
- Die Anwendung muss ohne `DATABASE_URL` starten, bauen und ihre Runtime-Tests
  ausfuehren koennen.
- Direkte SQL-Ausfuehrung ist auf versionierte Supabase-CLI-Migrationen,
  pgTAP-Tests und explizite Migrations-/Wartungsjobs begrenzt.
- Generierte Supabase-Typen und handgeschriebene Domain-/DTO-Typen haben eine
  klare Grenze; generierte Dateien werden nicht manuell editiert.
- Bestehende Request-Validierung bleibt erhalten und wird bei UUIDs und neuen
  Auth-Flows angepasst.

## Security Requirements

1. Der Secret Key darf weder in Browser-Code, HTML, Source Maps, API-Antworten
   noch Client-Logs gelangen.
2. Server-only-Module werden so abgegrenzt, dass ein versehentlicher
   Client-Import beim Build auffaellt.
3. Jede benutzerbezogene Query enthaelt einen aus dem validierten Token
   abgeleiteten Ownership-Filter oder verwendet eine RPC mit gleichwertiger
   Actor-Pruefung.
4. Generische Secret-Key-Datenhelfer ohne Ownership-Kontext werden nicht aus
   API Routes aufgerufen.
5. Fremde Ressourcen werden in automatisierten User-A/User-B-Tests abgedeckt.
6. Direkter Data-API-Zugriff mit Publishable Key oder Benutzer-Token kann keine
   fachlichen Tabellen lesen oder veraendern.
7. Service-only-RPCs sind fuer Publishable-Key- und Benutzerrollen nicht
   ausfuehrbar.
8. Rate Limits werden atomar in der Datenbank konsumiert und koennen durch
   parallele Requests nicht ueberschritten werden.
9. Auth Hook, Profil-Trigger und administrative Funktionen verwenden eine
   feste `search_path`, voll qualifizierte Objekte und minimale Grants.
10. Normalisierte E-Mail-Adressen und andere sensible Werte werden nur soweit
    fuer Zulassung und Betrieb erforderlich gespeichert und nicht unnoetig
    geloggt.
11. Fehlende oder inkonsistente Auth-/Supabase-Konfiguration fuehrt beim
    Serverstart oder ersten Zugriff zu einem klaren Fail-fast-Fehler, nicht zu
    einem stillen Fallback auf unsicheren Zugriff.

## Error Scenarios

- Ungueltiger, fehlender oder abgelaufener Access Token: `401`.
- Gueltiger Benutzer greift auf fremde Ressource zu: `404`.
- Closed-Beta-Hook kann nicht sicher entscheiden: Signup wird abgelehnt.
- Profilanlage nach Signup scheitert: Auth-Anlage wird konsistent
  zurueckgerollt oder der gesamte Signup gilt als fehlgeschlagen.
- Fachlicher Unique-Constraint verletzt: `409` ohne Datenbankdetails.
- Foreign-Key- oder Check-Constraint durch ungueltige Eingabe verletzt: `400`
  ohne Datenbankdetails.
- Data API, Auth oder Storage nicht erreichbar: kontrollierter `500`-Fehler
  und serverseitiges Log ohne Tokens oder Secrets.
- Storage-Upload erfolgreich, DB-Verknuepfung fehlgeschlagen: hochgeladenes
  Objekt wird kompensierend geloescht oder als bereinigbarer Zustand erfasst.
- DB-Verknuepfung entfernt, Storage-Loeschung fehlgeschlagen: Fehler wird
  sichtbar protokolliert und idempotent nachholbar gemacht.
- Parallel ausgefuehrte Likes, Limits, Bildaenderungen oder Archivierungen:
  Datenbankinvarianten bleiben erhalten und das Ergebnis ist deterministisch.

## Test Strategy

### Datenbank

- pgTAP prueft Tabellen, Typen, Foreign Keys, Unique- und Check-Constraints,
  Indizes, RLS-Aktivierung, Grants sowie Funktionsrechte.
- pgTAP prueft `updated_at`-Trigger, Profil-Trigger und alle transaktionalen RPCs.
- Parallelitaetstests pruefen Signup-Capacity, Like-Toggle, Rate Limit und
  konflikttraechtige Mehrschritt-Aenderungen.
- Die Baseline wird wiederholt auf einer leeren lokalen Supabase-Instanz
  angewendet.

### Integration

- Tests laufen gegen den vollstaendigen lokalen Supabase-Stack.
- Die Rollen Publishable/anon, User A, User B und Secret/Admin werden getrennt
  getestet.
- Publishable- und Benutzerrollen erhalten direkt ueber die Data API keinen
  Tabellenzugriff.
- User A kann eigene Ressourcen ueber Next.js APIs verwalten, aber keine von
  User B. User B kann umgekehrt keine Daten von User A mutieren.
- Closed-Beta-Precheck und direkter Auth-Signup werden gegen dieselben
  Allowlist-, Disable- und Capacity-Faelle getestet.
- Lokale E-Mail-Tests verwenden den Supabase-Mail-Catcher. Google OAuth und die
  Resend-Custom-SMTP-Konfiguration erhalten vor Remote-Cutover einen manuellen
  Smoke-Test mit dokumentiertem Ergebnis.
- Storage-Tests decken Auth, Ownership, MIME-/Groessenvalidierung und
  Kompensationsfaelle ab.

### Application

- Bestehende Unit- und API-Vertragstests bleiben erhalten oder werden auf UUIDs
  und Bearer Auth angepasst.
- Mapper-Tests pruefen camelCase-DTOs, UUID-User-IDs, numerische Domain-IDs,
  Datumswerte und den Ausschluss interner Felder.
- Tests pruefen, dass Listen- und Feed-Routen keine datenabhaengige Zahl von
  Data-API-Requests erzeugen.
- `npm test`, `npm run typecheck` und `npm run build` muessen erfolgreich sein.

## Acceptance Criteria

- [ ] Supabase Auth ersetzt NextAuth fuer Google, Magic Link, Session und
      Logout.
- [ ] Resend ist als Supabase Auth Custom SMTP dokumentiert und getestet.
- [ ] Closed-Beta-Regeln werden autoritativ und atomar im Before-User-Created-
      Hook durchgesetzt.
- [ ] `SignupSlot` und das Reservierungsmodell sind entfernt.
- [ ] `auth.users.id` und alle Benutzerreferenzen verwenden UUID.
- [ ] `profiles` enthaelt keine duplizierte E-Mail-Adresse.
- [ ] Alle fachlichen API-DTOs bleiben camelCase; nur User-/Profile-IDs sind
      bewusst UUID-Strings.
- [ ] Browserzugriff auf Anwendungsdaten und Storage erfolgt ausschliesslich
      ueber Next.js API Routes.
- [ ] Jede geschuetzte Route validiert den Bearer Token und prueft Ownership.
- [ ] Der Secret Key ist nur serverseitig und in keinem Client-Artefakt
      enthalten.
- [ ] RLS ist auf allen exponierten Anwendungstabellen aktiv und fuer `anon`
      sowie `authenticated` default-deny.
- [ ] Service-only-RPCs sind nicht mit Publishable Key oder Benutzer-Token
      aufrufbar.
- [ ] Alle definierten Mehrschritt-Aenderungen sind atomar und gegen Race
      Conditions getestet.
- [ ] Listen-, Detail- und Feed-Routen haben keine N+1-Zugriffe und verwenden
      keine ungeprueften rohen Filterstrings.
- [ ] Die SQL-Baseline baut das komplette Schema auf einer leeren lokalen
      Supabase-Instanz auf.
- [ ] Generierte Datenbanktypen sind aktuell und werden in CI auf Drift
      geprueft.
- [ ] Die Anwendung baut und startet ohne direkte PostgreSQL-Zugangsdaten.
- [ ] Direkte DB-Zugangsdaten existieren nur in lokalen oder CI-
      Migrationsjobs.
- [ ] Prisma, Prisma Client, Prisma Adapter, NextAuth, deren Runtime-Imports,
      Scripts, Build-Hooks und Dependencies sind entfernt.
- [ ] Kein deploybarer Zwischenstand kombiniert die alte Prisma/NextAuth-
      Runtime mit dem neuen Datenmodell.
- [ ] Backup-, Cutover- und Rollback-Schritte sind dokumentiert und vor einem
      Remote-Eingriff validiert.
- [ ] pgTAP-, Integrations-, Unit-, Typecheck- und Build-Pruefungen sind gruen.

## Dependencies

- Supabase-Projekt mit Auth, Data API, Postgres und Storage.
- Supabase CLI und Docker fuer den vollstaendigen lokalen Stack.
- Google OAuth Client fuer Supabase Auth.
- Resend-Zugang und verifizierte Absenderdomain fuer Custom SMTP.
- Eine getrennte Secret-Verwaltung fuer Next.js Runtime und Migrationsjobs.
- Ein Backup-Ziel und ein getesteter Restore-Weg vor Remote-Cutover.

## Out of Scope

- Direkter Browserzugriff auf relationale Anwendungsdaten.
- Direkter Browserzugriff auf Storage oder eine neue Medien-Sichtbarkeitslogik.
- Benutzerbasierte Data-API-RLS-Policies als primaere Tenant-Grenze.
- Realtime, Edge Functions oder eine Umstellung auf den Next.js App Router.
- Migration realer produktiver Benutzer oder ihrer bestehenden NextAuth-
  Sessions; derzeit existieren keine solchen Benutzer.
- Paralleler produktiver Betrieb von Prisma und Supabase Data API.
- Ausfuehrung eines Remote-Resets oder Remote-Cutovers ohne separate
  Bestaetigung.
- Fachliche UI-Neugestaltung ausserhalb der notwendigen Supabase-Auth-
  Integration und UUID-Anpassungen.

## Open Questions

Keine offenen Produkt- oder Architekturfragen. Die Implementierungsplanung darf
nach ausdruecklicher Freigabe dieser Spec beginnen.
