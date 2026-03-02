Status: IN_REVIEW
Last Modified: 2026-03-01

# Implementation Plan: Bonsai Studio MVP fuer bestehende Web-App

## Overview

Die bestehende Anwendung liefert bereits eine solide Basis fuer Auth, Bonsai-CRUD, SubEntry-CRUD, Uploads, Ownership und grundlegende Validierung. Dieser Plan erweitert die vorhandene App gezielt zum freigegebenen MVP, statt die Plattform neu aufzubauen.

Der Schwerpunkt liegt auf:
- Ausbau der privaten Bonsai-Dokumentation zu einer vollstaendigen Nutzerreise
- Einfuehrung einer eigenstaendigen Reminder-Domaene mit globaler Uebersicht
- Aufbau einer einfachen Community-Domaene mit Posts, Likes und Text-Kommentaren
- Oeffentlichen Profilen innerhalb des eingeloggten Bereichs
- UI-Verbesserungen fuer Filter, Slideshow, Empty States und mobile-first Bedienung
- Zentraler Feldkonfiguration fuer Bonsai- und Timeline-Formulare

## Reference

Spec: `/work/dev/features/2026-03-01_bonsai-studio-mvp/spec.md`

Besonders relevante Acceptance Criteria:
- AC 1-5: private Bonsai-Verwaltung, Timeline, Reminder und Anschluss-Flow
- AC 6-9: Feed, Interaktionen und Profile
- AC 10-17: Archivierung, Sichtbarkeit, Entkopplung, Login-Schutz und MVP-Grenzen

## Definition of Done

Die Arbeit ist erst abgeschlossen, wenn alle folgenden Punkte nachweisbar erfuellt sind:

1. Alle Acceptance Criteria aus der Spec sind durch Code, Tests oder dokumentierte manuelle Verifikation abgedeckt.
2. Auth, Bonsai, Timeline, Reminder, Feed und Profile funktionieren fuer den freigegebenen MVP-End-to-End.
3. Neue Ownership- und Sichtbarkeitsregeln sind auf allen Business-Routen umgesetzt.
4. Archivierung, Reaktivierung, Reminder-Sichtbarkeit und Post-Sichtbarkeit verhalten sich konsistent.
5. Snapshot- und Entkopplungslogik fuer Posts funktioniert bei geloeschten SubEntries.
6. Formulare fuer Bonsai und Timeline basieren auf zentraler Feldkonfiguration.
7. Leere Zustände, Fehlermeldungen und mobile Kernflows sind sichtbar benutzbar.
8. `npm test`, `npm run typecheck` und `npm run build` laufen erfolgreich.
9. Prisma-Schema, Migrationen und generierter Client sind konsistent.
10. Keine freigegebene MVP-Funktion bleibt nur teilweise angebunden oder hinter einem toten UI-Platzhalter.

## Current State Context

Bereits vorhanden und als Grundlage zu nutzen:
- Auth per Magic Link mit NextAuth und Resend in `/work/lib/auth.ts`
- Ownership-Absicherung in `/work/lib/authz.ts`
- API-Envelope in `/work/lib/api/response.ts`
- Bonsai-CRUD in `/work/pages/api/bonsais.ts` und `/work/pages/api/bonsais/[id].ts`
- SubEntry-CRUD in `/work/pages/api/subentries.ts` und `/work/pages/api/subentries/[id].ts`
- Dashboard, Detail, Create, Edit und Profilseiten in `/work/pages/`
- Upload-Handling fuer Bilder in `/work/lib/uploads.ts` und `/work/pages/api/upload.ts`

Nicht vorhanden bzw. nur teilweise vorhanden:
- Reminder als eigenstaendige Domaene und globale Reminder-Uebersicht
- Feed/Post/Comment/Like-Domaene
- Oeffentliche Profile mit Bio, Avatar und Post-Liste
- Slideshow-Modus und Detail-Filter
- Reaktivierung archivierter Bonsais
- echte config-driven Felddefinitionen fuer Formulare
- initialer Bonsai-Bildupload im Create-Flow

## File Structure

Zu erstellen:
- `/work/dev/features/2026-03-01_bonsai-studio-mvp/tests/`
- `/work/lib/config/forms.ts`
- `/work/lib/validators/reminder.ts`
- `/work/lib/validators/post.ts`
- `/work/lib/validators/comment.ts`
- `/work/pages/reminders.tsx`
- `/work/pages/feed.tsx`
- `/work/pages/profile/[id].tsx`
- `/work/pages/api/reminders.ts`
- `/work/pages/api/reminders/[id].ts`
- `/work/pages/api/posts.ts`
- `/work/pages/api/posts/[id].ts`
- `/work/pages/api/posts/[id]/likes.ts`
- `/work/pages/api/posts/[id]/comments.ts`

Wahrscheinlich zu aendern:
- `/work/prisma/schema.prisma`
- `/work/prisma/seed.ts`
- `/work/types/dto.ts`
- `/work/types/domain.ts`
- `/work/types/forms.ts`
- `/work/lib/mappers.ts`
- `/work/lib/authz.ts`
- `/work/lib/forms.ts`
- `/work/components/BonsaiForm.tsx`
- `/work/components/FormWizard.tsx`
- `/work/components/Navigation.tsx`
- `/work/pages/create-bonsai.tsx`
- `/work/pages/bonsai/edit/[id].tsx`
- `/work/pages/bonsai/[id].tsx`
- `/work/pages/bonsai/[id]/subentries.tsx`
- `/work/pages/profile.tsx`
- `/work/tests/*.test.ts`

Optional zusaetzlich zu erstellen, falls die UI sauberer kapselbar ist:
- `/work/components/ReminderList.tsx`
- `/work/components/PostComposer.tsx`
- `/work/components/PostCard.tsx`
- `/work/components/CommentList.tsx`
- `/work/components/BonsaiSlideshow.tsx`
- `/work/components/EmptyState.tsx`

## Code Architecture

### 1. Datenmodell

Bestehende Modelle `User`, `Bonsai` und `SubEntry` bleiben erhalten und werden erweitert.

Neue Modelle:
- `Reminder`
  - relation zu `User`
  - relation zu `Bonsai`
  - optional relation zu `SubEntry` fuer Anschluss-Flow und Nachvollziehbarkeit
  - Felder: `id`, `userId`, `bonsaiId`, `subEntryId?`, `title?`, `reminderDate`, `status`, `createdAt`, `updatedAt`, `completedAt?`, `snoozedUntil?`
- `Post`
  - relation zu `User`
  - relation zu `Bonsai`
  - snapshot-basierte Felder fuer entkoppelte Darstellung
  - Felder: `id`, `userId`, `bonsaiId`, `text`, `postType`, `snapshotName`, `snapshotSpecies`, `images`, `createdAt`, `updatedAt`, `archivedAt?`
- `PostEntryReference`
  - relation `postId`, optional `subEntryId`
  - entkoppelbare Referenzliste
  - wenn referenzierter SubEntry geloescht wird: `subEntryId` auf `null`, Snapshot im Post bleibt erhalten
- `PostLike`
  - unique auf `postId + userId`
- `PostComment`
  - text-only Kommentar
  - relation zu `Post` und `User`

User-Erweiterungen:
- `bio: String?`
- `profileImageUrl: String?`

Bonsai-Erweiterungen:
- keine neue Sichtbarkeitslogik auf Bonsai-Ebene; Bonsais bleiben privat
- Archivierung bleibt via `deletedAt`, es kommt eine Reaktivierung ueber `PATCH` hinzu

### 2. API-Ebenen

Beibehalten:
- `ok`/`fail` Envelope
- serverseitige Zod-Validierung
- Ownership-Guards

Erweitern:
- Reminder-API
- Feed/Post-API
- Kommentare/Likes-API
- Profil-API fuer Self-Service-Update und oeffentliche Nutzerdaten innerhalb des eingeloggten Bereichs

### 3. UI-Ebenen

Private Domäne:
- Dashboard
- Bonsai Create/Edit/Detail
- SubEntry-Verwaltung
- Reminder-Liste

Community-Domäne:
- Feed
- Post-Erstellung und -Bearbeitung
- Profilseiten

Cross-Cutting:
- Navigation
- Empty States
- Slideshow
- Form-Konfiguration

## Technical Decisions

1. Keine neue Formular-Bibliothek. Die vorhandenen React-Formen werden auf zentrale Felddefinitionen umgestellt.
2. Keine neue State-Management-Library. Lokaler State plus `fetch` bleibt ausreichend.
3. Posts speichern benoetigte Darstellungsdaten als Snapshot, damit Feed-Inhalte auch nach Archivierung oder Loeschung der Ursprungsdaten stabil bleiben.
4. Kommentare bleiben text-only, um Scope und Missbrauchsoberflaeche klein zu halten.
5. Likes werden als Toggle mit Unique-Constraint umgesetzt.
6. Reminder werden als eigenes Modell eingefuehrt, nicht nur als `reminderDate` am `SubEntry`, damit globale Listen, Statuswechsel und Snooze fachlich sauber abbildbar sind.
7. Die bestehende `SubEntry.reminderDate` wird als historische/unterstuetzende Eingabe behandelt und bei der Migration in echte Reminder ueberfuehrt oder im UI abgeloest.
8. Feed und Profile sind nur bei gueltiger Session erreichbar; es gibt keine oeffentlichen Anonymous-Routen.
9. Deutsch-only bedeutet: keine i18n-Infrastruktur in diesem Feature.
10. Kommentare erhalten ein serverseitiges Laengenlimit von 1 bis 1000 Zeichen.
11. Die globale Reminder-Ansicht zeigt standardmaessig nur aktive Reminder (`pending`, ueberfaellige `pending`, `snoozed`) in aufsteigender Faelligkeitsreihenfolge; `done` ist nur ueber einen expliziten Filter sichtbar.
12. Beim Archivieren eines Bonsai werden offene Reminder nicht geloescht, sondern fachlich auf `snoozed` mit Ausblendung aus den Default-Listen gesetzt; bei Reaktivierung koennen sie wieder sichtbar werden.
13. Der Slideshow-Modus ist auf der Bonsai-Detailseite erreichbar und verwendet fuer die chronologische Entwicklung sowohl Bonsai-Bilder als auch Bilder aus SubEntries, sortiert nach fachlichem Datum und Fallback `createdAt`.
14. Der aktive Publishing-Flow im MVP verwendet eine optionale freie Bildauswahl von bis zu 5 Bildern.
15. Die Feed-Seite zeigt zunaechst nur einen kompakten CTA; der eigentliche Post-Wizard oeffnet sich erst nach Nutzerinteraktion in einem Modal oder vergleichbaren Overlay.

## Integration Points

1. Navigation erweitert um `Feed` und `Reminder`.
2. Profilseite `/profile` bleibt Self-Service-Bereich; zusaetzlich kommt `/profile/[id]` fuer andere Nutzerprofile.
3. Bonsai-Detailseite erhaelt:
   - Timeline-Filter nach Entry-Typ
   - Slideshow fuer Bildentwicklung
   - Reminder-Kontext fuer den Bonsai
   - CTA zum Verentlichen als Post
4. SubEntry-Flow erhaelt optionales Erzeugen/Aktualisieren eines Reminders ueber das Reminder-Modell.
5. Archivierte Bonsais muessen in Dashboard-Logik und Ownership-Helpern sauber differenziert werden.
6. `/profile/[id]` und zugehoerige Profil-APIs werden mit derselben Session-Pflicht abgesichert wie Feed und Reminder.

## Implementation Steps

### Step 1: Datenmodell fuer MVP-Erweiterungen

Ziel:
- Prisma-Schema fuer Reminder, Posts, Likes, Comments, Referenzen und User-Profilfelder erweitern

Arbeiten:
- `prisma/schema.prisma` erweitern
- benoetigte Enums fuer `ReminderStatus` und `PostType` einfuehren
- Migrationsstrategie an vorhandene Dev-Situation anpassen
- `types/dto.ts` um Reminder-, Post-, Kommentar- und Profil-DTOs erweitern
- `lib/mappers.ts` fuer neue Domaenen erweitern

Wichtige Regeln:
- `PostLike` mit `@@unique([postId, userId])`
- `PostComment` text-only, Laengenlimit in Validator
- Posts bleiben sichtbar, auch wenn Bonsai archiviert ist
- geloeschte SubEntries duerfen Posts nicht brechen
- Reminder-Statuswechsel beim Archivieren/Reaktivieren eines Bonsai muessen fachlich reproduzierbar sein

### Step 2: Ownership, Sichtbarkeit und Authz-Helfer erweitern

Ziel:
- vorhandene Security-Basis fuer neue Domaenen nutzbar machen

Arbeiten:
- `lib/authz.ts` um Helper fuer Reminder, Posts und Profilsicht erweitern
- Helper fuer aktive vs archivierte Bonsais unterscheiden
- Helper fuer Post-Bearbeitung nur fuer Eigentumer
- Helper fuer eingeloggten-only Zugriff auf Feed/Profile
- Helper fuer Profil-Self-Update vs Fremdprofil-Lesen sauber trennen

### Step 3: Config-driven Form-Struktur einfuehren

Ziel:
- Bonsai- und Timeline-Formen zentral definierbar machen

Arbeiten:
- zentrale Feldkonfiguration in `lib/config/forms.ts`
- `components/BonsaiForm.tsx` auf Konfiguration umstellen
- SubEntry-Form im Bonsai-SubEntry-Screen ebenfalls aus Konfiguration ableiten oder mindestens ueber zentrale Felddefinitionen strukturieren
- bestehende Labels/Optionen aus `types/domain.ts` weiterverwenden

Ergebnis:
- Felder, Labels, Typen, Optionen, Sichtbarkeitsregeln und Gruppierungen sind an einer Stelle gepflegt

### Step 4: Bonsai-Flows vervollstaendigen

Ziel:
- bestehende Bonsai-Funktionen auf MVP-Niveau anheben

Arbeiten:
- Create-Flow fuer mehrere Bonsai-Bilder ergaenzen
- Edit-Flow weiterverwenden und fuer Bildreihenfolge/Entfernen stabilisieren
- Dashboard um Archivbereich oder Archivfilter erweitern
- Reaktivierungs-Flow fuer archivierte Bonsais ergaenzen
- Bonsai-Detail um Entry-Type-Filter erweitern
- Slideshow-Komponente fuer Bildentwicklung implementieren
- klare Empty States fuer keine Bilder, keine Timeline und kein Archiv

Verbindliche Slideshow-Regeln:
- Einstiegspunkt auf der Bonsai-Detailseite
- Datenbasis: Bonsai-Bilder plus SubEntry-Bilder
- Sortierung: erst nach fachlichem Datum, dann `createdAt`
- bei einem Bild keine Navigationselemente erzwingen
- bei null Bildern sichtbarer Empty State statt defekter Galerie

### Step 5: Reminder-Domaene implementieren

Ziel:
- globale Reminder-Uebersicht plus Bonsai-Kontextansicht

Arbeiten:
- `pages/api/reminders.ts`
  - `GET`: globale Liste des eingeloggten Nutzers, Filter nach Status/Bonsai
  - `POST`: Reminder anlegen
- `pages/api/reminders/[id].ts`
  - `PATCH`: `done`, `snoozed`, Bearbeitung, Reaktivierung falls noetig
- `pages/reminders.tsx`
  - globale Liste offener und snoozed Reminder
  - Aktionen `Done` und `+14 Tage`
- Bonsai-Detailseite um kontextuelle Reminder-Liste erweitern
- Nach `done` CTA/Modal/Inline-Flow zu neuem SubEntry oder Bilderfassung

Offene technische Umsetzung, aber im Plan verbindlich:
- `snooze` bedeutet exakt `reminderDate + 14 Tage`
- Archivierte Bonsais liefern keine aktiven Reminder in Default-Listen
- Default-Sortierung global: faellig zuerst, dann naechstes Faelligkeitsdatum aufsteigend
- `done` wird nicht geloescht, sondern historisiert und standardmaessig ausgeblendet
- beim Archivieren eines Bonsai werden offene Reminder aus der Standardansicht entfernt, ohne ihre Historie zu verlieren

### Step 6: Feed-Domaene implementieren

Ziel:
- eingeloggter Community-Feed mit Posts, Likes und Text-Kommentaren

Arbeiten:
- `pages/api/posts.ts`
  - `GET`: Feed aller veroeffentlichten Posts
  - `POST`: Post erstellen aus Bonsai + Eintragsreferenzen/Bildauswahl
- `pages/api/posts/[id].ts`
  - `GET`: optional fuer Detail/Editing
  - `PATCH`: eigenen Post bearbeiten
  - `DELETE`: eigenen Post loeschen
- `pages/api/posts/[id]/likes.ts`
  - Toggle- oder Create/Delete-Mechanik fuer genau ein Like pro Nutzer
- `pages/api/posts/[id]/comments.ts`
  - `GET`/`POST` fuer Text-Kommentare
- `pages/feed.tsx`
  - Feed-Liste
  - Help-Badge
  - Like-/Kommentar-Interaktionen
- Post-Erstell-Flow aus Bonsai-Detail oder SubEntry-Kontext

Snapshot-Anforderungen:
- Post speichert benoetigte Bilder und Basis-Textdaten unabhaengig vom spaeteren Zustand des Bonsai
- geloeschte Referenzen werden logisch entkoppelt, nicht hart im Feed sichtbar als Fehler

Verbindliche Publishing-Regeln:
- der Nutzer startet den Composer ueber einen kleinen CTA auf der Feed-Seite
- der Composer oeffnet sich erst danach als eigener Wizard/Overlay-Flow
- der Nutzer kann null bis 5 Bilder auswaehlen
- Timeline-Referenzen sind optionaler Kontext und steuern die Bildverfuegbarkeit nicht
- Persistiert werden immer die final im Post sichtbaren Snapshot-Bilder

### Step 7: Profile implementieren

Ziel:
- eigenes Konto und fremde Nutzerprofile sauber trennen

Arbeiten:
- `pages/profile.tsx` als Self-Service-Seite ausbauen:
  - Name
  - E-Mail
  - Bio
  - Profilbild
  - eigene Posts
- `pages/profile/[id].tsx` fuer andere Profile:
  - Basisprofil
  - veroeffentlichte Posts
- API verbindlich ergaenzen:
  - `GET /api/profile/me`
  - `PATCH /api/profile/me`
  - `GET /api/profiles/:id`

Profilregeln:
- `/api/profile/me` und `/api/profiles/:id` verlangen Session
- Fremdprofile zeigen keine privaten Bonsai-Daten
- Self-Service-Update erlaubt nur Profilfelder, keine administrativen Felder

### Step 8: Empty States, Sichtbarkeitskommunikation und Navigation

Ziel:
- Nutzerfluss klar machen, besonders fuer neue Nutzer

Arbeiten:
- leere Zustaende fuer Dashboard, Timeline, Reminder, Feed
- klare CTA-Texte fuer naechste sinnvolle Aktion
- UI-Hinweise fuer `privat` vs `veroeffentlicht`
- Navigation um Feed und Reminder erweitern
- leerer Erstnutzerzustand nach Login fuehrt direkt zur Bonsai-Erstellung

### Step 9: Tests und Verifikation

Ziel:
- neue Domaenen durch Unit- und API-nahe Tests absichern

Arbeiten:
- Validator-Tests fuer Reminder/Post/Comment
- Tests fuer Like-Unique-Logik
- Tests fuer Snapshot-/Entkopplungslogik auf Mapper- oder Service-Ebene
- Tests fuer Reaktivierung archivierter Bonsais
- Tests fuer API-Envelope neuer Routen
- Tests fuer Reminder-Sortierung und Default-Filter
- Tests fuer optionale freie Bildauswahl und Maximalgrenze von 5 Bildern
- Tests fuer Session-Pflicht auf Feed-, Reminder- und Profil-Routen bzw. deren Guard-Logik
- Tests fuer Profil-DTO-Sichtbarkeit ohne private Bonsai-Daten
- bestehende Tests ggf. erweitern

### Step 10: Final Validation

Ziel:
- harte Workflow-Gates fuer das Feature erfuellen

Arbeiten:
- `npm test`
- `npm run typecheck`
- `npm run build`
- Prisma-Checks:
  - `npx prisma validate`
  - `npx prisma generate`
- manuelle Kernflows pruefen:
  - Login
  - erster Bonsai
  - Bonsai bearbeiten
  - Bilder hochladen
  - Timeline-Eintrag anlegen/bearbeiten/loeschen
  - Reminder global ansehen, done, snooze
  - Bonsai archivieren und reaktivieren
  - Post erstellen, bearbeiten, loeschen
  - Like/Kommentar
  - fremdes Profil aufrufen
  - Post ueber CTA/Wizard erstellen
  - Post ohne Bilder erstellen
  - Post mit bis zu 5 Bildern erstellen
  - Post bleibt nach Bonsai-Archivierung sichtbar
  - Post bleibt nach SubEntry-Loeschung sichtbar
  - Slideshow mit 0, 1 und mehreren Bildern pruefen

## Acceptance Criteria Verification Matrix

1. AC 1 wird verifiziert durch Dashboard-, Create-, Edit-, Archive- und Reaktivierungsflow sowie API-Tests fuer aktive/archivierte Bonsais.
2. AC 2 wird verifiziert durch Detailseite, Timeline-Filter, SubEntry-CRUD und Slideshow-Manual-Test.
3. AC 3 wird verifiziert durch zentrale Feldkonfigurationsdatei und reduzierte Hartcodierung in Bonsai-/Timeline-Formen.
4. AC 4 wird verifiziert durch Reminder-API, globale Reminder-Seite und Tests fuer `done`/`snooze`.
5. AC 5 wird verifiziert durch Reminder-`done`-Flow mit direkter Weiterleitung oder CTA zu SubEntry/Bildern.
6. AC 6 wird verifiziert durch CTA-gestarteten Post-Wizard mit optionaler Bildauswahl und `POST /api/posts`.
7. AC 7 wird verifiziert durch Feed-UI inklusive Help-Badge, Like-/Kommentarzaehler und Bildvorschau.
8. AC 8 wird verifiziert durch Ownership-Guards, Fremdprofil-Sicht und fehlende private Bonsai-Daten im Feed.
9. AC 9 wird verifiziert durch `/profile/[id]` und Profil-DTOs ohne private Historie.
10. AC 10 wird verifiziert durch Archivansicht und Reaktivierungsflow.
11. AC 11 wird verifiziert durch Entkopplungs-Tests fuer geloeschte SubEntries.
12. AC 12 wird verifiziert durch Session-Pflicht in Page-Guards und API-Guards.
13. AC 13 wird verifiziert durch Nichtvorhandensein produktiver AI/Pro/Referral/Pflegeplan-Flows im UI und Routing.
14. AC 14 wird verifiziert durch deutschsprachige UI-Texte und fehlende Mehrsprachigkeitsumschaltung.
15. AC 15 wird verifiziert durch Kommentar-Validator und UI ohne Medien-/Thread-Funktion.
16. AC 16 wird verifiziert durch Unique-Constraint und Like-Tests.
17. AC 17 wird verifiziert durch Feed-Sichtbarkeitstests nach Bonsai-Archivierung.

## Test Strategy

1. Bestehende Node-Teststruktur mit `tsx --test` weiterverwenden.
2. Reine Validierungslogik und Hilfsfunktionen isoliert testen.
3. Response-Helfer und Sichtbarkeits-/Entkopplungslogik mit kleinen unit-nahen Tests absichern.
4. Wo API-Handler reine Utilities nutzen, Schwerpunkt auf testbarer Fachlogik ausserhalb der Handler legen.
5. Manuelle Verifikation fuer die wichtigsten UI-Flows dokumentieren.
6. Abschluss erfolgt erst, wenn technische Checks, API-/Validator-Tests und dokumentierte manuelle Kernflows gemeinsam gruen sind.

## Edge Cases & Error Handling

1. Nicht eingeloggte Nutzer duerfen keine Feed-, Profil-, Reminder- oder Bonsai-Seiten sehen.
2. Ein Nutzer darf nur eigene Bonsais, Reminder und Posts bearbeiten.
3. Archivierte Bonsais duerfen in Default-Listen nicht als aktiv erscheinen.
4. Posts zu archivierten Bonsais bleiben sichtbar.
5. Geloeschte Timeline-Eintraege duerfen bestehende Posts nicht unlesbar machen.
6. Doppelte Likes muessen technisch verhindert werden.
7. Kommentare mit leerem oder zu langem Text muessen validiert abgelehnt werden.
8. Reminder fuer archivierte Bonsais muessen aus aktiven Listen verschwinden oder auf nicht-aktiv gesetzt werden.
9. Upload-Fehler, ungueltige MIME-Typen und Groessenlimits muessen weiter als klare Fehlermeldungen erscheinen.
10. Slideshow muss auch dann funktionieren, wenn nur ein Bild vorhanden ist; bei null Bildern wird ein sinnvoller Empty State gezeigt.
11. Profil-Endpunkte duerfen keine privaten Bonsai-Daten an Fremdnutzer leaken.
12. Die freie Bildauswahl muss auch dann stabil sein, wenn null, ein oder mehrere Bilder verfuegbar sind.

## Validation Checklist

- Spec-Referenz stimmt und alle freigegebenen Produktentscheidungen sind enthalten
- Bestehende Bonsai-/SubEntry-Funktionen bleiben erhalten
- Formulare sind zentral konfigurierbar
- Reminder existieren als eigene Domaene mit globaler Uebersicht
- Feed, Likes, Kommentare und Profile funktionieren nur fuer eingeloggte Nutzer
- Archivierung und Reaktivierung sind konsistent
- Posts bleiben bei Bonsai-Archivierung sichtbar
- Post-Referenzen ueberleben SubEntry-Loeschung fachlich sauber
- Kommentare sind text-only
- Likes sind einmalig pro Nutzer und Post
- Profil-APIs fuer Self-Service und Fremdprofil sind implementiert und abgesichert
- globale Reminder-Defaults sind wie spezifiziert umgesetzt
- Post-Wizard wird ueber CTA gestartet
- freie optionale Bildauswahl bis maximal 5 Bilder funktioniert
- Slideshow ist von der Detailseite erreichbar und stabil
- Empty States fuer Erstnutzer, Feed, Timeline und Reminder sind vorhanden
- `npx prisma validate` erfolgreich
- `npx prisma generate` erfolgreich
- `npm test` erfolgreich
- `npm run typecheck` erfolgreich
- `npm run build` erfolgreich
