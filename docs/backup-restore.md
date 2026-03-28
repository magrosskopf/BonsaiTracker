# Backup and Restore

## Ziel

Wiederherstellung von PostgreSQL-Daten und Upload-Medien für die Closed Beta.

## Was gesichert werden muss

- PostgreSQL-Datenbank
- Supabase Storage Bucket für Beta-Medien
- Relevante Betriebsdokumentation und Umgebungsvariablen separat, aber nicht im Repo

## Backup-Reihenfolge

1. Datenbank-Snapshot oder Dump erstellen.
2. Supabase-Storage-Bucket exportieren oder synchronisieren.
3. Zeitpunkt und verantwortliche Person dokumentieren.

## Restore-Reihenfolge

1. PostgreSQL zuerst wiederherstellen.
2. Danach den zugehörigen Supabase-Storage-Stand wiederherstellen.
3. Healthcheck unter `/api/health` prüfen.
4. Stichprobe mit Bonsai-, Sub-Entry- und Feed-Bildern durchführen.

## Mindestprüfung nach Restore

- Login funktioniert
- Dashboard lädt
- Bonsai-Bilder laden
- Sub-Entry-Bilder laden
- Feed-/Profilbilder laden

## Hinweise

- Datenbank und Storage müssen zeitlich zusammenpassen.
- Medienpfade werden in der Datenbank referenziert; ein Restore nur einer Seite reicht nicht.
