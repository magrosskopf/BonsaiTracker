Status: IN_REVIEW
Last Modified: 2026-03-01

# Spec: Bonsai Studio MVP fuer bestehende Web-App

## Purpose/Goal

Die Produktdefinition beschreibt eine breite Bonsai-Plattform mit privater Dokumentation, Erinnerungen, Community-Funktionen, KI, Pro-Modell und Referral-System. Fuer diese Codebasis wird daraus ein klar abgegrenzter MVP fuer die bestehende Next.js-Web-App abgeleitet.

Ziel des MVP ist eine nutzbare, mobile-first Web-Anwendung, in der eingeloggte Nutzer ihre Bonsais verwalten, Entwicklungsschritte mit Bildern dokumentieren, Pflege-Erinnerungen erhalten und ausgewaehlte Eintraege in einen einfachen Community-Feed veroeffentlichen koennen.

## Functional Requirements

### 1. Authentifizierung und Nutzerkontext

1. Die App erfordert einen Login ueber das bestehende Auth-System, bevor irgendein Bereich der Anwendung nutzbar ist. Feed, Profile und Community-Funktionen sind ebenfalls nur fuer eingeloggte Nutzer sichtbar.
2. Jeder eingeloggte Nutzer hat ein Profil mit mindestens `name`, `email`, `profile image`, optionaler `bio` und einem oeffentlichen Profilbereich fuer eigene Posts innerhalb des eingeloggten Bereichs.
3. Alle privaten Bonsai-, Timeline- und Reminder-Daten sind strikt eigentuemergebunden und duerfen nur vom jeweiligen Besitzer gelesen oder veraendert werden.
4. Bonsais selbst sind immer privat. Oeffentlich bzw. fuer andere eingeloggte Nutzer sichtbar werden nur Inhalte, die der Nutzer aktiv als Post veroeffentlicht.

### 2. Private Bonsai-Verwaltung

1. Ein Nutzer kann mehrere Bonsais anlegen, bearbeiten, archivieren und in einer Uebersichtsliste sehen.
2. Das Erfassungsformular fuer Bonsais ist config-driven erweiterbar. Felddefinitionen, Optionen und sichtbare Labels muessen zentral gepflegt werden koennen.
3. Ein Bonsai erfasst mindestens Name, Art, Bilder, Status und freie Notizen. Kaufort, Alter, Draht, Jahreszeit und weitere bestehende Formfelder duerfen erhalten bleiben, solange sie in das Datenmodell passen.
4. Beim Erstellen und Bearbeiten koennen mehrere Bilder hochgeladen und dem Bonsai zugeordnet werden.
5. Archivierte Bonsais koennen spaeter wieder aktiviert werden.
6. Archivierte Bonsais erscheinen nicht in der Standard-Uebersicht aktiver Bonsais, bleiben aber in einem separaten Archivbereich des Nutzers erreichbar.

### 3. Timeline und Entwicklungsdokumentation

1. Jeder Bonsai besitzt eine chronologische Timeline aus Eintraegen zu Pflege- oder Entwicklungsaktionen.
2. Ein Timeline-Eintrag kann Datum, Jahreszeit oder fachlich aequivalente Zeitangabe, Massnahme, Notizen, optional verwendeten Draht und mehrere Bilder enthalten.
3. In der Bonsai-Detailansicht sind mindestens verfuegbar:
   - Bildgalerie in chronologischer Reihenfolge
   - Timeline-Liste
   - Filter nach Massnahme bzw. Entry-Typ
   - einfache Fortschrittsdarstellung ueber Bilder und Eintraege
4. Ein Slideshow-Modus fuer die Bildentwicklung ist Bestandteil des MVP, sofern er auf den vorhandenen Bilddaten ohne separate Medienpipeline umgesetzt werden kann.
5. Fuer den MVP reicht ein Filter nach Massnahme bzw. Entry-Typ; weitere Filterdimensionen wie Zeitraum sind nicht erforderlich.

### 4. Reminder-System

1. Nutzer koennen fuer einen Bonsai Erinnerungen mit Faelligkeitsdatum anlegen.
2. Reminder besitzen mindestens die Stati `pending`, `done` und `snoozed`.
3. Reminder werden ausschliesslich innerhalb der Web-App angezeigt. E-Mail- oder Push-Benachrichtigungen sind nicht Bestandteil dieses MVP.
4. Eine Erinnerung kann als erledigt markiert oder um genau 14 Tage verschoben werden.
5. Nach dem Abschliessen einer Erinnerung soll der Nutzer direkt in einen Flow zum Erfassen eines neuen Timeline-Eintrags oder zum Hochladen neuer Bilder wechseln koennen.
6. Es gibt eine globale Reminder-Uebersicht fuer den eingeloggten Nutzer sowie eine Kontextansicht pro Bonsai.
7. Archivierte Bonsais duerfen keine aktiven Reminder mehr in der Standardansicht erzeugen; bestehende Reminder muessen fachlich konsistent behandelt werden.

### 5. Community-Feed

1. Nutzer koennen eigene Bonsai-Entwicklungen als Post in einen oeffentlichen Feed veroeffentlichen.
2. Ein Post referenziert genau einen Bonsai. Timeline-Eintraege koennen optional als Kontext verknuepft werden.
3. Beim Veroeffentlichen kann der Nutzer fuer den MVP optional frei bis zu 5 Bilder aus dem gewaehlten Bonsai-Kontext auswaehlen.
4. Ein Post hat Freitext und einen Typ `showcase` oder `help`.
5. Help-Posts sind im Feed visuell klar markiert.
6. Andere Nutzer koennen Posts liken und kommentieren.
7. Nutzer koennen eigene Posts nach der Veroeffentlichung bearbeiten und loeschen.
8. Wird ein referenzierter Timeline-Eintrag spaeter geloescht, bleibt der Post bestehen und wird von der geloeschten Timeline-Referenz entkoppelt.
9. Kommentare bestehen im MVP nur aus Text. Bilder, Dateianhaenge und Thread-Antworten sind nicht Bestandteil des MVP.
10. Likes bestehen im MVP aus genau einer Reaktion pro Nutzer und Post.
11. Werden Bonsais archiviert, bleiben bereits veroeffentlichte Posts im Feed sichtbar.

### 6. Profil und oeffentliche Trennung

1. Private Bonsai-Timeline und oeffentliche Feed-Posts bleiben fachlich getrennt.
2. Auf dem oeffentlichen Profil eines Nutzers werden nur veroeffentlichte Posts gezeigt, nicht die private Vollhistorie.
3. Pro-Badges, Referral-Hinweise und AI-bezogene Hinweise duerfen im UI nicht als aktive MVP-Funktion erscheinen.

## User Perspective and UX Requirements

### 1. Einstieg und Empty States

1. Ein neuer Nutzer ohne Bonsais sieht nach dem Login eine klare leere Startansicht mit direkter CTA zum ersten Bonsai.
2. Leere Zustaende fuer Bonsai-Liste, Timeline, Reminder und Feed muessen erklaeren, was der Nutzer als Naechstes tun kann.

### 2. Sichtbarkeit und Erwartungen

1. Der Nutzer muss jederzeit klar erkennen koennen, welche Inhalte privat sind und welche explizit veroeffentlicht wurden.
2. Das Verentlichen eines Posts ist ein bewusster eigener Schritt und darf nicht automatisch beim Anlegen eines Bonsai oder Timeline-Eintrags passieren.
3. Die Feed-Seite zeigt die Post-Erstellung nicht permanent offen an. Stattdessen startet der Nutzer den Composer ueber einen kleinen klaren CTA und sieht erst danach den Erstellungs-Wizard.

### 3. Inhalts-Lifecycle

1. Ein Nutzer kann Bonsais aktiv nutzen, archivieren und spaeter reaktivieren.
2. Ein Nutzer kann Timeline-Eintraege erstellen, bearbeiten und loeschen, ohne dass bereits veroeffentlichte Posts ungueltig werden.
3. Ein Nutzer kann eigene Posts erstellen, bearbeiten und loeschen.
4. Archivierung eines Bonsai blendet den Bonsai aus den aktiven privaten Listen aus, laesst aber bereits veroeffentlichte Posts unveraendert sichtbar.

### 4. Mobile-First Bedienung

1. Die Kernflows Login, Dashboard, Bonsai-Detail, Timeline-Pflege, Reminder-Uebersicht, Feed und Profil muessen auf kleinen Screens ohne horizontales Scrollen benutzbar sein.
2. Slideshow, Galerie und Feed muessen touch-tauglich sein.

## Technical Constraints

1. Implementiert wird in der vorhandenen Codebasis, nicht als neue Mobile-App. Verbindlicher MVP-Stack ist Next.js Pages Router, React, TypeScript, Prisma, PostgreSQL und Tailwind/DaisyUI.
2. Bestehende Bonsai- und SubEntry-Domaenen werden erweitert, nicht parallel neu aufgebaut. Neue Modelle fuer Reminder, Posts, Comments und Likes muessen daran anschliessen.
3. API-Endpunkte bleiben REST-basiert und verwenden das etablierte Response-Envelope mit `ok`, `data` und `error`.
4. Das MVP muss mobile-first im bestehenden Web-Frontend funktionieren. Native Push, React Native, Flutter, Supabase-Migration und S3-Pflicht sind nicht Teil dieser Spec.
5. Uploads duerfen im MVP weiterhin ueber die bestehende Projektstrategie erfolgen, muessen aber so gekapselt sein, dass spaeter auf externen Storage gewechselt werden kann.
6. Erinnerungen muessen ohne externe Queue und ohne externen Versandkanal in einer ersten Version darstellbar und bearbeitbar sein.
7. Der Form-Aufbau fuer Bonsai-Erfassung und Timeline-Eingaben muss zentral konfigurierbar sein; Feldkonfiguration darf nicht nur verstreut in JSX-Komponenten liegen.
8. Alle neuen Datenmodelle und Queries muessen Ownership, Sichtbarkeit und Archivierungsregeln explizit abbilden.
9. Widersprueche in der PO-Spec werden fuer diesen MVP wie folgt aufgeloest:
   - Follow-System ist nicht Bestandteil dieses MVP, obwohl es spaeter erwaehnt wird.
   - AI Assistant, Pro-Modell, Referral-System und Pflegeplan-Subscription sind nicht Bestandteil dieses MVP.
   - In-App-Reminder sind Pflicht; Push und E-Mail sind nicht Bestandteil des ersten Release.
   - Die Anwendung ist deutsch-only; Mehrsprachigkeit wird in diesem MVP nicht vorbereitet.
   - Der Feed ist nicht oeffentlich im Web, sondern nur fuer eingeloggte Nutzer sichtbar.

## Acceptance Criteria

1. Ein authentifizierter Nutzer kann mindestens einen Bonsai erstellen, bearbeiten, archivieren und in der persoenlichen Uebersicht sehen.
2. Ein Bonsai-Detail zeigt Bilder und Timeline-Eintraege chronologisch, bietet einen Filter nach Entry-Typ/Massnahme und erlaubt das Erfassen weiterer Eintraege mit Bildern.
3. Die Eingabeformulare fuer Bonsai und Timeline basieren erkennbar auf einer zentralen Feldkonfiguration statt auf ausschliesslich hartcodierten Einzel-Inputs.
4. Ein Nutzer kann fuer einen eigenen Bonsai Reminder anlegen, in einer Liste offener Reminder sehen, als `done` markieren und per `snooze` um 14 Tage verschieben.
5. Nach `done` einer Erinnerung ist ein direkter Anschluss-Flow verfuegbar, um einen neuen Timeline-Eintrag oder Bilder zu erfassen.
6. Ein Nutzer kann aus vorhandenen Bonsai-Daten ueber einen explizit gestarteten Erstellungs-Wizard einen Feed-Post vom Typ `showcase` oder `help` erstellen und veroeffentlichen.
7. Der Feed zeigt Posts anderer Nutzer mit Bildvorschau, Post-Typ, Text, Like-Anzahl und Kommentar-Anzahl; Help-Posts sind visuell hervorgehoben.
8. Andere authentifizierte Nutzer koennen Posts liken und kommentieren, ohne private Bonsai-Daten des Post-Erstellers sehen zu koennen.
9. Oeffentliche Profile zeigen veroeffentlichte Posts und Basis-Profilinformationen, aber keine private Bonsai-Vollhistorie.
10. Archivierte Bonsais sind separat sichtbar und koennen reaktiviert werden.
11. Wird ein in einem Post genutzter Timeline-Eintrag spaeter geloescht, bleibt der Post weiter sichtbar.
12. Der Feed, Profile und Community-Bereiche sind ohne Login nicht erreichbar.
13. AI-, Pro-, Referral- und Pflegeplan-Funktionen sind im Code und UI nicht als fertige MVP-Features nutzbar, sondern hoechstens als spaetere Erweiterung vorbereitet.
14. Die Anwendung ist fuer den ersten Release deutsch-only.
15. Kommentare unter Posts erlauben im MVP nur Text.
16. Ein Nutzer kann einen Post hoechstens einmal liken.
17. Ein Post kann im MVP ohne Bilder oder mit einer freien Bildauswahl von bis zu 5 Bildern erstellt werden.
18. Bereits veroeffentlichte Posts bleiben sichtbar, auch wenn der zugrunde liegende Bonsai archiviert wurde.

## Out-of-Scope

1. KI-gestuetzte Problemanalyse, Bilddiagnose und automatische Pflegeempfehlungen.
2. Bezahlmodell, Pro-Berechtigungen, Referral-Codes und Pro-Verlaengerungslogik.
3. Follow-System, Push-Benachrichtigungen an aktive Nutzer und virale Community-Mechaniken.
4. Export als PDF, erweiterte Statistiken und sonstige Pro-only Features.
5. Migration auf React Native, Flutter, Supabase Auth/Storage oder S3-only Storage.
6. Vollautomatischer saisonaler Pflegeplan-Versand.
