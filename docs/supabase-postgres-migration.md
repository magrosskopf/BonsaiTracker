# Supabase Postgres Migration

## Zielbild

Supabase Postgres soll bei Bedarf die eine autoritative Produktionsdatenbank für Bonsai Tracker werden. Supabase ersetzt dabei nicht Postgres, sondern hostet Postgres.

## Architekturentscheidung

1. Prisma bleibt zunächst die Datenzugriffsschicht.
2. Prisma Migrations bleiben die Schema-Quelle.
3. Es gibt nur eine autoritative Produktionsdatenbank.
4. Supabase Storage bleibt unabhängig von der Auth-Entscheidung.
5. Supabase Auth ist ein späterer separater Migrationsschritt.

## Migrationsablauf

1. Supabase-Projekt anlegen.
2. Postgres-Verbindungsdaten für Runtime und Migrationen erfassen.
3. Zielumgebung mit `DATABASE_URL` auf Supabase Postgres vorbereiten.
4. Prisma-Migrationen gegen Supabase Postgres ausführen.
5. Bestandsdaten aus der bisherigen Datenbank exportieren.
6. Bestandsdaten in Supabase Postgres importieren.
7. Stichproben prüfen:
   - Nutzer
   - Bonsais
   - Subentries
   - Reminders
   - Profile
   - Posts, Likes und Kommentare
8. Upload-/Storage-Konfiguration prüfen.
9. Anwendung mit Supabase-Datenbank in Preview/Staging testen.
10. Produktionsumgebung auf die Supabase-Verbindung umstellen.

## Rollback

Vor dem Umschalten muss ein aktueller Export der bisherigen Produktionsdatenbank existieren.

Rollback-Schritte:

1. Anwendung stoppen oder Schreibzugriffe unterbinden.
2. `DATABASE_URL` wieder auf die bisherige Datenbank setzen.
3. Deployment neu starten.
4. Datenstand prüfen.
5. Ursache der Migration abbrechen oder beheben.

## Nicht enthalten

1. Wechsel von Prisma auf direkte Supabase-Client-Zugriffe.
2. Einführung von Row Level Security als primäres App-Sicherheitsmodell.
3. Migration von NextAuth zu Supabase Auth.
