# Beta Approval Runbook

## Zweck

Freigabe neuer Closed-Beta-Nutzer auf Basis der bestehenden Waitlist/Allowlist-Implementierung.

## Standardablauf

1. Eingang einer Zugangsanforderung prüfen.
2. E-Mail-Adresse normalisiert übernehmen.
3. Nutzer mit dem bestehenden Script freischalten:

```bash
node scripts/approve-waitlist.js --email user@example.com
```

4. Ergebnis im Teamkanal oder im internen Tracking dokumentieren.
5. Nutzer informieren, dass der Magic-Link-Login jetzt möglich ist.

## Prüfregeln

- Nur freigeben, wenn die Adresse bewusst zur Beta zugelassen werden soll.
- Doppelte Freigaben sind unkritisch, sollten aber nicht mehrfach kommuniziert werden.
- Freigaben immer mit derselben E-Mail durchführen, die auch für den Login genutzt wird.

## Fehlerfall

- Bei Script-Fehler zuerst Datenbankverbindung und Umgebungsvariablen prüfen.
- Keine manuelle Datenbankänderung ohne Dokumentation.
- Wenn die Freigabe unklar ist, eskalieren statt raten.
