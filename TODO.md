# Beta Go-Live Todo-Liste

Stand: 2026-04-07

Die Liste wurde gegen den aktuellen Code, die vorhandenen Runbooks und die Beta-Spec abgeglichen.

## Bereits erledigt

- [x] Uploads aus dem Git-Repo herausziehen und `public/uploads` ignorieren
- [x] Persistentes Storage-Konzept fuer Uploads festlegen
- [x] Backup- und Restore-Prozess fuer Uploads und Datenbank definieren
- [x] Entscheiden, ob Feed und oeffentliche Profile Teil der ersten Beta sein sollen
- [x] Sichtbarkeit, Datenschutz und Nutzerkommunikation fuer Community-Funktionen festziehen
- [x] Manuellen Freigabeprozess fuer die Closed Beta dokumentieren
- [x] Support-/Incident-Prozess fuer die Beta festlegen
- [x] Basis fuer Observability ist vorhanden: strukturierte Server-Logs und Healthcheck-Endpoint sind implementiert

Hinweis:
Die alte Alternative "Feed/Profile fuer Beta deaktivieren oder hinter Feature-Flag stellen" ist nicht mehr relevant, weil Community laut aktueller Beta-Entscheidung Teil der ersten Beta ist.

## P0

- [ ] Echte Smoke-/Integrationstests fuer Kernflows ergaenzen
- [ ] Kernflows mit belastbarer Verifikation abdecken: Login, Waitlist/Freigabe, Bonsai anlegen/bearbeiten/loeschen bzw. archivieren, Sub-Entry anlegen/bearbeiten/loeschen, Reminder
- [ ] Ownership- und API-Fehlerfaelle gezielt testen

## P1

- [ ] Operative Verifikation fuer Verfuegbarkeit/Healthcheck in Staging oder Produktion dokumentieren
- [ ] Restliche Projektdoku auf aktuellen Storage-Stand bringen (`public/uploads`- und `/uploads/*`-Legacy-Hinweise bereinigen)
- [ ] Finalen manuellen Beta-Smoke-Test einmal komplett durchlaufen
