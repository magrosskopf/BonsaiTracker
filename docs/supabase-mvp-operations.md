# Supabase MVP Operations

## Zweck

Bonsai Tracker darf in der MVP- und frühen Beta-Phase Supabase Free nutzen, solange die damit verbundenen Betriebsrisiken bewusst akzeptiert werden.

## Free-Tier-Entscheidung

1. Supabase Free ist für MVP, interne Tests und frühe geschlossene Beta akzeptiert.
2. Supabase Free ist keine finale Produktionsstrategie.
3. Ein Upgrade auf Supabase Pro wird fällig, sobald eines der folgenden Kriterien erfüllt ist:
   - öffentliche Beta oder Launch
   - zahlende Nutzer
   - relevante Menge echter Nutzerdaten
   - Pausierung oder eingeschränkte Verfügbarkeit ist nicht mehr akzeptabel
   - Wiederherstellung und Backup-Anforderungen steigen

## Keepalive

Ein kleiner Keepalive ist für MVP/Beta zulässig, aber nur als Übergangslösung.

Empfohlene Form:

1. alle 5-6 Tage ausführen
2. nur eine harmlose Aktion ausführen, zum Beispiel Healthcheck oder leichte Datenbankabfrage
3. keine geschäftsrelevanten Daten verändern
4. Fehler operational loggen

Mögliche Ausführungsorte:

1. Deployment-Plattform-Cron
2. externer Uptime-Monitor
3. GitHub Actions, falls das Repository dafür vorgesehen ist

## Backups und Exporte

Bevor echte Beta-Daten ausschließlich in Supabase Free liegen, muss ein Exportprozess genutzt werden.

Mindestanforderung:

1. vor manuellen Migrationen exportieren
2. vor größeren Releases exportieren
3. während aktiver Beta mindestens wöchentlich exportieren
4. Export sicher außerhalb des Supabase-Projekts ablegen

## Auth und Datenbank

Supabase Storage ist bereits als Upload-Backend vorgesehen. Supabase Postgres kann später die zentrale relationale Datenbank werden. Prisma bleibt dabei zunächst die Schema- und Datenzugriffsschicht.

Supabase Auth wird nicht automatisch mit Supabase Postgres eingeführt. Eine Migration von NextAuth zu Supabase Auth benötigt eine separate Spec.

## Google OAuth

Für Google Login müssen in der Deployment-Umgebung gesetzt sein:

1. `GOOGLE_CLIENT_ID`
2. `GOOGLE_CLIENT_SECRET`
3. `NEXTAUTH_URL`
4. `NEXTAUTH_SECRET`

Google Cloud Console:

1. OAuth Consent Screen konfigurieren
2. Support-E-Mail setzen
3. lokale Redirect URI eintragen: `http://localhost:3000/api/auth/callback/google`
4. produktive Redirect URI eintragen: `https://<domain>/api/auth/callback/google`
5. sicherstellen, dass `NEXTAUTH_URL` exakt zur produktiven Domain passt
