# Bonsai Tracker Beta Operations

## Closed Beta

Für den Freigabeprozess nutzt du aktuell das Script:

```bash
node scripts/approve-waitlist.js --email <email>
```

## Storage-Entscheidung

- Relationale Daten bleiben in PostgreSQL via Prisma.
- Uploads liegen in der Beta produktiv in Supabase Storage.
- Lokale Entwicklung kann weiterhin lokales Dateisystem-Storage verwenden.
- Verwaltete Medien werden über `/api/media/*` ausgeliefert, damit private Bucket-Inhalte nicht direkt öffentlich werden.

## Healthcheck

- Readiness-Endpoint: `/api/health`
- Der Endpoint prüft Datenbankverbindung und notwendige Storage-Konfiguration.

## Runbooks

- [Beta approval runbook](docs/beta-approval-runbook.md)
- [Backup and restore](docs/backup-restore.md)
- [Support and incident process](docs/support-incident-process.md)
- [Community privacy](docs/community-privacy.md)
- [Manual beta smoke checklist](docs/manual-beta-smoke-checklist.md)
