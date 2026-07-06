Status: IMPLEMENTED
Last Modified: 2026-07-06

# Spec: Vereinfachte Bonsai-Erstellung

## Purpose/Goal

Die initiale Bonsai-Erstellung ist aktuell zu langsam, weil Nutzer vor dem ersten Speichern einen mehrstufigen Wizard mit vielen Detailfeldern durchlaufen muessen. Fuer neue Nutzer und mobile Nutzung soll der erste Bonsai deutlich schneller angelegt werden koennen.

Ziel dieser Aenderung ist ein schlanker Schnellstart-Flow: Ein Nutzer soll einen Bonsai nur mit Namen erfassen, sofort speichern und danach optional Bilder, Art, Standort, Pflegeprofil und weitere Details ergaenzen koennen. Die bestehende Detailtiefe bleibt erhalten, darf aber den initialen Abschluss nicht blockieren.

## Functional Requirements

### 1. Schneller Standard-Flow

1. Die Seite `Bonsai anlegen` zeigt standardmaessig keinen mehrstufigen Pflicht-Wizard mehr.
2. Der Standard-Flow besteht aus einem kompakten Formular, das ohne Scroll-Last auf mobilen Geraeten erfassbar ist.
3. Fuer das initiale Speichern ist nur folgende Nutzerangabe fachlich verpflichtend:
   - Name
4. Alle weiteren fuer das Datenmodell oder die API benoetigten Werte werden mit klar definierten Defaults vorbelegt oder durch neue "Unbekannt"-Optionen sauber abgebildet.
5. Der Nutzer kann den Bonsai direkt aus dem Standard-Flow speichern, ohne vorher Art, Standort, Bilder oder optionale Pflege-, Herkunfts- und Gestaltungsdetails zu erfassen.
6. Nach erfolgreichem Speichern wird der Nutzer wie bisher zur Bonsai-Detailseite weitergeleitet.
7. Das Feld `nickname` wird aus der gesamten Bonsai-Funktion entfernt. Es darf nicht mehr angezeigt, bearbeitet, in DTOs ausgeliefert oder in der Bonsai-Suche beruecksichtigt werden.
8. Das Preisfeld wird fuer Nutzer als Euro-Betrag angezeigt und eingegeben, nicht als Cent-Betrag.

### 2. Defaults und spaetere Vervollstaendigung

1. Fuer Felder, die technisch weiterhin erforderlich bleiben, gelten beim Schnellstart folgende Defaults:
   - `species`: `Unbekannt`
   - `location`: `Unbekannt`
   - `indoorOutdoor`: `OUTDOOR`
   - `age`: `null`
   - `style`: `Unbekannt`
   - `ownedSince`: `null`
   - `healthStatus`: `UNBEKANNT`
   - `developmentStage`: `UNBEKANNT`
2. Die UI muss kenntlich machen, dass diese Werte spaeter bearbeitet werden koennen, ohne den Nutzer mit einer Erklaerwand zu bremsen.
3. Nach dem Speichern bleiben alle bisherigen Detailfelder in der bestehenden Bearbeitungsansicht verfuegbar.
4. Die Bearbeitungsansicht darf weiterhin den vollstaendigen Detailumfang anbieten.
5. Die fachliche Bedeutung der Defaults ist: unbekannt, nicht erfasst oder spaeter zu klaeren. Sie duerfen im UI nicht als bewusst vom Nutzer angegebene Fachwerte missverstanden werden.
6. `age = null` wird in Anzeigeansichten als `Nicht angegeben` bzw. `-` dargestellt.
7. `ownedSince = null` wird in Anzeigeansichten als `Nicht angegeben` bzw. `-` dargestellt.
8. Bild- und Slideshow-Sortierungen, die bisher `ownedSince` als Datum fuer initiale Bonsai-Bilder nutzen, verwenden bei `ownedSince = null` ein stabiles Ersatzdatum wie `createdAt`.
9. Die technisch gespeicherten Platzhalter `species = Unbekannt`, `location = Unbekannt` und `style = Unbekannt` werden in Anzeigeansichten als `Nicht angegeben` bzw. `-` dargestellt.

### 3. Optionaler Detailmodus

1. Nutzer koennen vor dem Speichern optional in einen Detailmodus wechseln.
2. Der Detailmodus bietet Zugriff auf die bisherigen erweiterten Felder aus den Bereichen Art/Standort, Masse/Stil, Herkunft, Pflegeprofil und Notizen.
3. Der Detailmodus darf den Standard-Flow nicht optisch oder interaktiv dominieren.
4. Bereits im Schnellstart eingegebene Werte bleiben beim Wechsel in den Detailmodus erhalten.
5. Der Detailmodus kann als aufklappbarer Bereich, sekundarer Abschnitt oder Wizard umgesetzt werden, solange der Schnellstart der Default bleibt.
6. Nutzer koennen den Detailmodus ueberspringen und den Bonsai trotzdem speichern.
7. Die Felder `ownedSince`, `age`, `species`, `style`, `healthStatus`, `acquiredFrom` und `developmentStage` sind im Detailmodus optional.
8. Das Preisfeld nimmt Euro-Werte entgegen, z. B. `12,50` oder `12.50`, und wird technisch weiterhin kompatibel zur bestehenden Speicherung verarbeitet.

### 4. Bilder

1. Bild-Upload ist beim initialen Erstellen optional.
2. Der Bilderbereich darf den Schnellstart nicht vor das Pflichtformular schieben.
3. Ohne Bilder muss der Bonsai speicherbar sein.
4. Falls Bilder vor dem Speichern hochgeladen werden, werden sie wie bisher dem neuen Bonsai zugeordnet.
5. Nach dem Speichern soll der Nutzer auf der Detailseite weiterhin Bilder oder Timeline-Eintraege ergaenzen koennen.

### 5. Validierung und Fehlerverhalten

1. Die UI blockiert das Speichern nur, wenn der Name fehlt oder zu kurz ist.
2. API-Validierungsfehler werden weiterhin konkret und fuer Nutzer lesbar angezeigt.
3. Technische Defaults duerfen keine Zod-Validierungsfehler erzeugen.
4. Der Schnellstart darf keine ungueltigen Kombinationen erzeugen, z. B. `customStyle` ohne Stil `Sonstiger`.
5. Optionale Felder duerfen leer bleiben, ohne dass die UI oder API den Erstellvorgang ablehnt.

## Technical Constraints

1. Implementiert wird in der bestehenden Next.js Pages Router Codebasis mit TypeScript, Prisma und Tailwind.
2. Die bestehende `POST /api/bonsais` API und das Response-Envelope mit `ok`, `data` und `error` bleiben erhalten.
3. Die bestehende zentrale Feldkonfiguration in `lib/config/forms.ts` bleibt die Quelle fuer Bonsai-Formularfelder und darf erweitert oder auf Schnellstart/Detailmodus aufgeteilt werden.
4. Das Datenmodell darf fuer diese Vereinfachung gezielt angepasst werden, wenn ein bisheriger Pflichtwert fachlich nicht korrekt als Default abbildbar ist.
5. Bestehende Bonsai-Bearbeitung und bestehende API-Payload-Felder bleiben rueckwaertskompatibel.
6. Die Validierungslogik in `lib/validators/bonsai.ts` darf nur so angepasst werden, dass der Schnellstart sauber unterstuetzt wird; bestehende Datenqualitaetsregeln duerfen nicht unbemerkt entfallen.
7. Die Loesung muss mobile-first funktionieren und darf kein horizontales Scrollen einfuehren.
8. `purchasePriceCents` kann intern erhalten bleiben, aber UI und Formularwerte muessen Euro als Eingabeformat verwenden.
9. `DevelopmentStageEnum` und die zugehoerigen TypeScript-Domain-Optionen muessen um `UNBEKANNT` erweitert werden, damit ein nicht erfasster Entwicklungsstand fachlich korrekt gespeichert werden kann.
10. `ownedSince` muss im Prisma-Datenmodell, in DTOs, Mappern, Formularwerten und Validatoren nullable werden, damit kein fachlich falsches Besitzdatum gespeichert werden muss.
11. `age` muss im Prisma-Datenmodell, in DTOs, Mappern, Formularwerten und Validatoren nullable werden, damit fehlendes Alter fachlich korrekt gespeichert werden kann.
12. `IndoorOutdoorEnum` bleibt unveraendert; nicht erfasste Haltung wird beim Schnellstart mit `OUTDOOR` vorbelegt.
13. Das bestehende DB-Feld `nickname` kann fuer Rueckwaertskompatibilitaet erhalten bleiben, darf aber in Bonsai-Erstellung, Bearbeitung, Dashboard, Detailansicht, DTOs und Bonsai-Suche nicht mehr verwendet werden.

## Acceptance Criteria

1. Ein authentifizierter Nutzer kann auf `Bonsai anlegen` mit nur dem Namen einen Bonsai erstellen.
2. Ein Bonsai kann ohne Bilder gespeichert werden.
3. Der Standard-Flow zeigt beim ersten Laden maximal den Namen, die Speicheraktion und einen optionalen Zugang zu weiteren Details.
4. Die bisherigen Detailfelder bleiben vor oder nach dem Speichern erreichbar, blockieren aber den Standard-Flow nicht.
5. Beim Schnellstart werden die definierten Defaults an die API uebergeben oder serverseitig ergaenzt, sodass `POST /api/bonsais` erfolgreich validiert.
6. Nach erfolgreicher Erstellung landet der Nutzer auf `/bonsai/[id]`.
7. Ein fehlender oder zu kurzer Name verhindert das Speichern mit einer sichtbaren Fehlermeldung.
8. API-Validierungsfehler werden weiterhin mit konkreter Feld- oder Formularmeldung angezeigt.
9. Die bestehende Bearbeitungsansicht kann einen Bonsai mit allen Detailfeldern weiterhin speichern.
10. Automatisierte Tests decken mindestens die Payload-/Default-Erzeugung fuer den Schnellstart und die Pflichtfeldvalidierung ab.
11. Bestehende Tests fuer Bonsai-Validierung und API-Response bleiben gruen.
12. Der Flow ist auf mobilen Viewports ohne horizontales Scrollen bedienbar.
13. `nickname` ist in der Bonsai-Erstellung, Bonsai-Bearbeitung, Dashboard-Karten und Bonsai-Detailansicht nicht mehr sichtbar und wird nicht mehr ueber Bonsai-DTOs ausgeliefert.
14. Das Preisfeld ist in der UI als Euro-Feld beschriftet und akzeptiert Euro-Eingaben.
15. `ownedSince`, `age`, `species`, `style`, `healthStatus`, `acquiredFrom` und `developmentStage` koennen beim Erstellen leer bzw. unangetastet bleiben.
16. Wird beim Erstellen kein Entwicklungsstand ausgewaehlt, wird `UNBEKANNT` gespeichert und in UI-Labels als `Unbekannt` angezeigt.
17. Wird beim Erstellen kein Stil ausgewaehlt, wird `Unbekannt` gespeichert und angezeigt.
18. Wird beim Erstellen keine Art oder kein Standort angegeben, wird `Unbekannt` gespeichert.
19. Wird beim Erstellen kein Besitzdatum angegeben, wird `ownedSince` als `null` gespeichert und in der UI als nicht angegeben angezeigt.
20. Wird beim Erstellen kein Alter angegeben, wird `age` als `null` gespeichert und in Anzeigeansichten als nicht angegeben angezeigt.
21. Initiale Bonsai-Bilder bleiben auch bei `ownedSince = null` in Galerie und Slideshow sichtbar; ihre Sortierung und Datumsanzeige nutzen dann einen definierten Fallback.
22. Die Bonsai-Suche findet keine Bonsais mehr ueber alte `nickname`-Werte.
23. Werden Bonsais mit `species = Unbekannt` in Community-Posts verwendet, darf der Snapshot diesen Wert speichern; Feed und Profilansichten behandeln ihn visuell als fehlende Angabe statt als konkrete Art.

## Out-of-Scope

1. Allgemeine Umbauten am Prisma-Datenmodell ausser der gezielten Erweiterung von `DevelopmentStageEnum` um `UNBEKANNT` und der Umstellung von `ownedSince` und `age` auf nullable.
2. Neues Onboarding, Tutorial oder mehrstufige Nutzerfuehrung ausserhalb der Bonsai-Erstellung.
3. KI-gestuetzte Artenerkennung, Bildanalyse oder automatische Pflegeempfehlungen.
4. Pflicht-Upload eines Startbilds.
5. Aenderungen an Timeline-, Reminder-, Feed- oder Community-Funktionen.
6. Aenderungen am Login- oder Berechtigungssystem.
7. Import aus externen Apps oder CSV-Dateien.
