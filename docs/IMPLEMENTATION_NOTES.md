# Implementierungsnotizen

## Phase 1 Drift-Befunde
- `pages/layout.tsx` und `pages/dashboard/page.tsx` sind App-Router-artige Artefakte und widersprechen dem Pages-Router-Soll.
- Bestehende APIs liefern keine SPEC-konformen Response-Wrapper und erzwingen keine Ownership.
- Prisma-Schema ist stark untermodelliert und enthält Drift zu `ownedSince`, Enums, Soft Delete und Pflegeprofil-Feldern.
- Mehrere produktive Pfade enthalten Debug-Logs und direkte `PrismaClient`-Instanzen pro Request.
- UI-Seiten nutzen teilweise nicht existierende Felder (`addedDate`) und inkonsistente API-Verträge.

## Umsetzungsentscheidungen
- Bestehende Drift-Dateien werden refaktoriert oder entfernt, wenn sie dem Soll widersprechen.
- Prisma und API-Verträge werden zuerst vereinheitlicht; UI wird anschließend vollständig auf die stabilen DTOs umgestellt.
- Uploads bleiben lokal unter `public/uploads`, werden aber serverseitig zentral validiert und ownership-geprüft.

## Auth- und Supabase-Richtung
- Google Login wird als primärer Login über das bestehende NextAuth-Setup eingeführt.
- Magic Link bleibt vorerst nur als technischer Fallback vorgesehen und wird aus der primären Login-UI entfernt.
- Supabase Postgres ist das bevorzugte Ziel für eine spätere Datenbank-Konsolidierung; Prisma bleibt zunächst die Datenzugriffsschicht.
- Supabase Free ist für MVP/frühe Beta akzeptiert, benötigt aber dokumentierte Keepalive- und Export-Prozesse.

## Lokale Supabase-Grenze in dieser Arbeitsumgebung
- Die aktuelle Arbeitsumgebung enthält weder `supabase`-CLI noch Docker und hat keine lokale `.env.local` mit echter `DATABASE_URL`.
- Deshalb wurde Issue `#5` in diesem Repo-Slice über eine reproduzierbare Kernfluss-Checklist und Regressionstests abgesichert, nicht über eine live ausgeführte lokale Supabase-Smoke-Session.
- Eine spätere interaktive Verifikation gegen echte lokale Supabase-Postgres-Laufzeit soll die Runbook-Checklist mit konkreten `pass`-/`skip`-/`fail`-Notizen ergänzen.
