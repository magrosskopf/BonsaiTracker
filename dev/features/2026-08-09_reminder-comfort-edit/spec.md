# Reminder komfortabel anlegen und bearbeiten

Status: IMPLEMENTED
Created: 2026-08-09
Last Modified: 2026-08-09

## Purpose/Goal

Die globale Reminder-Seite soll ein komfortabler Arbeitsort fuer offene Pflegeaufgaben werden. Nutzer sollen Reminder nicht nur anlegen, erledigen oder verschieben, sondern bestehende Reminder direkt bearbeiten koennen, ohne ueber Pflegeeintraege oder separate technische Umwege gehen zu muessen.

## Functional Requirements

1. Auf `/reminders` koennen eingeloggte Nutzer fuer aktive eigene Bonsais einen eigenstaendigen Reminder mit Bonsai, Faelligkeitsdatum und optionalem Titel anlegen.
2. Die Anlage bleibt auf der Seite, zeigt Validierungs- und Serverfehler sichtbar an und fuegt erfolgreiche neue Reminder sofort sortiert in die Liste ein.
3. Jeder offene oder verschobene Reminder kann direkt auf der Reminder-Seite bearbeitet werden.
4. Bearbeitbar sind Titel, Bonsai-Zuordnung und Faelligkeitsdatum.
5. Bearbeiten muss abbrechbar sein, ohne die bestehende Liste zu veraendern.
6. Erfolgreich gespeicherte Aenderungen aktualisieren den Reminder sofort in der Liste und halten die Sortierung nach Faelligkeitsdatum und ID ein.
7. Bestehende Schnellaktionen bleiben erhalten: als erledigt markieren, um 14 Tage verschieben und zum Pflegeeintrag-Flow wechseln.
8. Fehler beim Aktualisieren werden am betroffenen Reminder angezeigt, ohne die gesamte Seite zu blockieren.
9. Die UI bleibt auf kleinen und grossen Viewports bedienbar, ohne horizontales Scrollen oder ueberlappende Texte.

## Technical Constraints

1. Stack bleibt Next.js Pages Router, React, TypeScript, Supabase SDK, Tailwind/DaisyUI.
2. Es wird kein Datenbankschema geaendert.
3. Die bestehende Reminder-API wird wiederverwendet:
   - `POST /api/reminders` fuer Anlage.
   - `PATCH /api/reminders/:id` fuer Aktualisierung.
4. Der API-Patch-Validator muss `bonsaiId`, `title`, `reminderDate`, `status` und `snoozeDays` fachlich erlauben, soweit die UI sie braucht.
5. Die bestehende Authentifizierung und Owner-Pruefung bleiben unveraendert.
6. Bestehende uncommitted Aenderungen zur Pflegeeintrag-Wortwahl und Standalone-Reminder-Anlage werden nicht zurueckgesetzt.

## Acceptance Criteria

1. `/reminders` laedt offene und verschobene Reminder sowie aktive Bonsais.
2. Ein Nutzer kann einen neuen Reminder mit Bonsai und Datum anlegen.
3. Ein Nutzer kann bei einem bestehenden Reminder den Titel aendern, leeren oder setzen.
4. Ein Nutzer kann bei einem bestehenden Reminder das Faelligkeitsdatum aendern.
5. Ein Nutzer kann bei einem bestehenden Reminder den Bonsai wechseln.
6. Nach erfolgreichem Speichern wird der Reminder direkt aktualisiert und korrekt sortiert angezeigt.
7. Beim Abbrechen einer Bearbeitung bleiben die vorherigen Werte sichtbar.
8. API-Validierungsfehler beim Bearbeiten werden beim betroffenen Reminder angezeigt.
9. `npm test` und `npm run typecheck` laufen erfolgreich oder Abweichungen sind dokumentiert.

## Out-of-Scope

1. Push-, E-Mail- oder Kalenderbenachrichtigungen.
2. Wiederkehrende Reminder oder Reminder-Templates.
3. Bulk-Bearbeitung mehrerer Reminder.
4. Anzeige erledigter oder entfernter Reminder in der Web-UI.
5. Aenderungen an Supabase-Migrationen oder RLS-Policies.
6. Neue externe UI-Bibliotheken.
