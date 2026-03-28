# Manual Beta Smoke Checklist

## Vorbedingungen

- Produktive oder staging-nahe Konfiguration aktiv
- `/api/health` liefert `ok`
- Mindestens ein freigegebener Testnutzer vorhanden

## Checkliste

1. Magic-Link-Login für bestehenden Nutzer testen.
2. Waitlist-Anfrage stellen.
3. Nutzer per Script freigeben.
4. Bonsai mit Bild anlegen.
5. Bonsai bearbeiten.
6. Bonsai löschen oder archivieren und Rückweg prüfen.
7. Sub-Entry mit Bild anlegen.
8. Sub-Entry bearbeiten.
9. Sub-Entry löschen.
10. Reminder anlegen und Status ändern.
11. Feed öffnen.
12. Post erstellen.
13. Kommentar und Like testen.
14. Öffentliches Profil öffnen.
15. Prüfen, dass im öffentlichen Profil keine E-Mail sichtbar ist.
16. Prüfen, dass Bilder in Bonsai, Sub-Entries und Community laden.

## Abbruchkriterien

- Login scheitert
- Bilder laden nicht
- Fremde Daten sind sichtbar
- Kernflow liefert 500er ohne klaren Workaround
