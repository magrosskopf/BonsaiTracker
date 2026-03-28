# Bonsai Tracker - Vollständige Produkt- und Technische Spezifikation (v1)

## 1. Ziel
Bonsai Tracker ist eine webbasierte Anwendung zur Verwaltung persönlicher Bonsai-Bäume pro Benutzerkonto.
Nutzer können Bonsais anlegen, bearbeiten, mit Bildern dokumentieren und Pflege-/Statusverläufe als Sub-Einträge erfassen.

Diese Spezifikation definiert ein konsistentes Soll-System auf Basis des vorhandenen Codes und schließt unklare, fehlende oder fehlerhafte Stellen.

## 2. Scope
### 2.1 Im Scope
- Authentifizierung per Magic Link (E-Mail)
- Benutzerbezogene Bonsai-Verwaltung (CRUD)
- Sub-Einträge pro Bonsai (CRUD)
- Bildupload für Bonsais und Sub-Einträge
- Dashboard, Detailseiten, Profil
- Validierung, Fehlerbehandlung, Autorisierung
- Technische Qualitätsanforderungen (Type Safety, Tests, Security)

### 2.2 Nicht im Scope (v1)
- Rollen/Rechte über "User" hinaus (Admin, Team)
- Push-Notifications
- Offline-Mode
- Native App

## 3. Ist-Analyse und erkannte Lücken
### 3.1 Funktionale Lücken
- Datenmodell-Drift: `ownedSince` ist in Migrationen/Client vorhanden, aber im aktuellen Prisma-Schema nicht.
- UI verwendet Felder ohne Backend-Vertrag (`style`, `addedDate`).
- Keine Löschfunktion für Bonsais und Sub-Einträge.
- Kein Bearbeiten/Löschen einzelner Sub-Einträge.
- Upload-Route aktualisiert Bonsai-Bilder nicht transaktional.

### 3.2 Technische Lücken
- TypeScript-Build bricht (mindestens `isUploading` und fehlender `signOut`-Import).
- Uneinheitliche Router-Logik (`pages` + app-router-artige Dateien).
- API-Autorisierung inkonsistent (Bonsai-Liste nicht auf eingeloggten User eingeschränkt).
- Besitzprüfung fehlt in mehreren API-Routen (Daten anderer User potenziell lesbar/schreibbar).
- Mehrere PrismaClient-Instanzen und inkonsistente Nutzung (`disconnect` pro Request).
- Unstrukturierte API-Responses (kein einheitliches Fehlerformat).
- Debug-Logs in produktiver Ausführung.

### 3.3 Security-Lücken
- Secrets/Schlüssel dürfen nicht versioniert sein; Rotation erforderlich, falls bereits exponiert.
- Upload-Handling benötigt klare Limits, sichere Dateinamen und Ownership-Prüfung.

## 4. Zielarchitektur
- Frontend: Next.js (Pages Router), React, Tailwind + DaisyUI
- Backend: Next.js API Routes
- Auth: NextAuth mit E-Mail-Magic-Link
- Datenbank: PostgreSQL via Prisma
- Storage: PostgreSQL bleibt für relationale Daten; Uploads liegen produktiv in Supabase Storage, lokal in der Entwicklung im Dateisystem

Architekturprinzipien:
- Eine konsistente Router-Welt: nur Pages Router in v1
- Strict Ownership: jede fachliche Ressource gehört genau einem User
- Server-seitige Validierung ist führend (Client validiert nur ergänzend)
- Einheitliche API-Verträge

## 4.1 Verbindlicher Tech-Stack
- Runtime/Framework: Next.js 15 im Pages Router
- UI: React 19
- Styling: Tailwind CSS 3
- Komponentenbibliothek: DaisyUI 5
- Sprache: TypeScript
- ORM: Prisma
- Datenbank: PostgreSQL
- Authentifizierung: NextAuth v4 mit EmailProvider
- Uploads: `multer` in Next.js API Routes
- Carousel/Galerie: `swiper`
- E-Mail-Versand: `resend`

## 4.2 Architektur- und Library-Regeln
- Keine Migration auf App Router in v1
- Keine zusätzliche State-Management-Library in v1
- Keine zusätzliche Formular-Library in v1; React State ist ausreichend
- Validierung serverseitig zentral, clientseitig ergänzend
- Falls zusätzliche Validierungsbibliothek eingeführt wird, ist `zod` der Standard
- Interne Navigation mit `next/link`
- Bilder werden über stabile App-Media-Pfade ausgeliefert; `next/image` kann verwendet werden, ist aber nicht verpflichtend

## 4.3 Laufzeit- und Umgebungsannahmen
Diese Annahmen basieren auf der aktuellen `.env.local` und sind für die Implementierung in v1 verbindlich.

- Lokale Entwicklungs-URL: `http://localhost:3000`
- Datenbankzugriff erfolgt aktuell über eine Prisma-Accelerate-kompatible `DATABASE_URL` mit `prisma+postgres://...`
- Authentifizierung verwendet `NEXTAUTH_URL` und `NEXTAUTH_SECRET`
- E-Mail-Absender wird über `EMAIL_FROM` konfiguriert
- Resend ist der aktive Versandkanal über `RESEND_API_KEY`
- `EMAIL_SERVER` ist in der aktuellen Umgebung vorhanden, wird in v1 aber nicht als primärer Versandweg verwendet
- Secrets und Tokens aus `.env.local` dürfen niemals in Code, Doku, Logs oder Beispielantworten hardcodiert werden
- `.env.example` darf nur Platzhalter enthalten, niemals produktive oder echte Schlüssel

## 5. Datenmodell (Soll)

## 5.1 User
- `id: Int` (PK, auto)
- `email: String` (unique, required)
- `name: String?`
- `emailVerified: DateTime?`
- Beziehungen zu `Bonsai`, `Account`, `Session`

## 5.2 Bonsai
- `id: Int` (PK, auto)
- `userId: Int` (FK User, required, index)
- `deletedAt: DateTime?` (Soft Delete)
- `name: String` (required, 2..80)
- `nickname: String?` (0..80), optional interner Rufname/Anzeigename
- `species: String` (required, 2..80), gebräuchlicher Artenname
- `latinName: String?` (0..120), botanischer Name
- `location: String` (required, 2..120)
- `indoorOutdoor: Enum` (required, `INDOOR | OUTDOOR | BEIDES`)
- `age: Int` (required, 0..200)
- `heightCm: Int?` (0..500)
- `widthCm: Int?` (0..500)
- `trunkDiameterMm: Int?` (0..1000)
- `style: String` (required, Auswahl aus standardisierter Liste)
- `customStyle: String?` (0..80), optional falls Stil nicht in der Liste enthalten ist
- `ownedSince: DateTime` (required)
- `acquiredFrom: String?` (0..120)
- `purchasePriceCents: Int?` (>= 0, Währung in v1 immer EUR)
- `healthStatus: Enum` (required, siehe Abschnitt 5.4)
- `developmentStage: Enum` (required, siehe Abschnitt 5.4)
- `lastRepotDate: DateTime?`
- `nextRepotDue: DateTime?`
- `winterHardiness: Enum?` (siehe Abschnitt 5.4)
- `sunExposure: Enum?` (siehe Abschnitt 5.4)
- `potType: String?` (0..80)
- `potColor: String?` (0..40)
- `wateringNotes: String?` (0..1000)
- `fertilizingNotes: String?` (0..1000)
- `pruningNotes: String?` (0..1000)
- `wiringNotes: String?` (0..1000)
- `notes: String?` (0..2000)
- `images: String[]` (default `[]`)
- `createdAt: DateTime` (default now)
- `updatedAt: DateTime` (auto-update)
- Beziehung zu `SubEntry[]`

## 5.3 SubEntry
- `id: Int` (PK, auto)
- `bonsaiId: Int` (FK Bonsai, required, index)
- `date: DateTime` (required)
- `entryType: Enum` (required, siehe Abschnitt 5.4)
- `healthObservation: Enum?` (siehe Abschnitt 5.4)
- `performedActions: String[]` (default `[]`)
- `nextAction: String?` (0..200)
- `reminderDate: DateTime?`
- `notes: String?` (0..500)
- `images: String[]` (default `[]`)
- `createdAt: DateTime` (default now)
- `updatedAt: DateTime` (auto-update)

## 5.4 Domain-Enums
Speicherwerte werden als technische Enum-Codes geführt; UI-Labels bleiben deutsch.

- `IndoorOutdoorEnum`: `INDOOR`, `OUTDOOR`, `BEIDES`
- `HealthStatusEnum`: `UNBEKANNT`, `SEHR_GUT`, `GUT`, `BEOBACHTEN`, `KRITISCH`
- `DevelopmentStageEnum`: `ROHLING`, `IN_GESTALTUNG`, `VERFEINERUNG`, `REIF`
- `WinterHardinessEnum`: `NICHT_WINTERHART`, `BEDINGT_WINTERHART`, `WINTERHART`
- `SunExposureEnum`: `VOLLE_SONNE`, `HALBSCHATTEN`, `SCHATTEN`
- `EntryTypeEnum`: `GIESSEN`, `DUENGEN`, `SCHNEIDEN`, `DRAHTEN`, `UMTOPFEN`, `KONTROLLE`, `FOTO_UPDATE`, `SONSTIGES`

## 5.5 NextAuth-Tabellen
- `Account`, `Session`, `VerificationToken` gemäß NextAuth/Prisma-Adapter

## 5.6 DB-Regeln
- Fachlich wird ein Bonsai per Soft Delete entfernt (`deletedAt: DateTime?`)
- Standardabfragen liefern nur Datensätze mit `deletedAt = null`
- Sub-Einträge gelöschter Bonsais werden standardmäßig nicht mehr angezeigt
- Jeder Query auf Bonsai/SubEntry wird über `userId` abgesichert (direkt oder über Join)
- `style = "Sonstiger"` erlaubt bzw. erfordert `customStyle`
- `style != "Sonstiger"` erzwingt `customStyle = null`
- `purchasePriceCents` wird in v1 ausschließlich als EUR-Betrag interpretiert
- `nextRepotDue` darf nicht vor `lastRepotDate` liegen
- `reminderDate` darf nicht vor `date` des zugehörigen Sub-Entries liegen

## 5.7 Datums- und Zeitkonventionen
- Alle API-Antworten verwenden ISO-8601-Strings in UTC
- Eingaben für `ownedSince` und `SubEntry.date` erfolgen als `YYYY-MM-DD`
- Eingaben für `lastRepotDate`, `nextRepotDue` und `reminderDate` erfolgen ebenfalls als `YYYY-MM-DD`
- Der Server normalisiert diese Datumswerte auf `T00:00:00.000Z`
- Vergleichs- und Filterlogik basiert ausschließlich auf den normalisierten UTC-Werten

## 6. Authentifizierung und Autorisierung
### 6.1 Auth-Flow
- Startseite zeigt Login (Magic Link)
- Nach erfolgreichem Login Redirect auf `/dashboard`
- Session enthält mindestens `user.id`, `user.email`

### 6.2 API-Autorisierung
- Alle Business-APIs erfordern gültige Session
- Ausnahme: NextAuth-Routen unter `/api/auth/*`

### 6.3 Ownership-Regeln
- User sieht nur eigene Bonsais
- User kann nur eigene Bonsais ändern/löschen
- User kann Sub-Einträge nur für eigene Bonsais anlegen/lesen/ändern/löschen

### 6.4 Verbindliches Mail-/Login-Verhalten
- Login ausschließlich per E-Mail-Magic-Link, kein Passwort-Login in v1
- Technische Basis: NextAuth `EmailProvider`
- Versandkanal in v1: Resend
- Erforderliche Umgebungsvariablen:
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `EMAIL_FROM`
  - `RESEND_API_KEY`
- Aktuelle lokale Entwicklungsbasis laut `.env.local`: `NEXTAUTH_URL=http://localhost:3000`
- SMTP-Konfiguration kann in `.env` vorhanden sein, wird in v1 aber nicht aktiv verwendet
- Fehler beim Mailversand führen zu keiner Session-Erstellung und zu einer UI-Fehlermeldung

## 7. API-Spezifikation (Soll)
Einheitliche Antwortstruktur:
- Erfolg: `{ ok: true, data: ... }`
- Fehler: `{ ok: false, error: { code: string, message: string, details?: any } }`

Allgemeine Statuscode-Regeln:
- `200` für erfolgreiche Lese- und Update-Operationen
- `201` für erfolgreiche Create-Operationen
- `204` für erfolgreiche Delete-Operationen ohne Body
- `400` für syntaktisch ungültige Requests
- `401` wenn keine gültige Session vorliegt
- `404` wenn Ressource nicht existiert, dem User nicht gehört oder soft-deleted ist
- `409` für fachliche Konflikte
- `413` wenn Upload-Größenlimits überschritten werden
- `415` bei nicht unterstütztem Dateityp
- `422` für fachlich/inhaltlich ungültige Nutzdaten
- `500` nur für unerwartete Serverfehler

Standardwerte für `error.code`:
- `BAD_REQUEST`
- `UNAUTHENTICATED`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `PAYLOAD_TOO_LARGE`
- `UNSUPPORTED_MEDIA_TYPE`
- `INTERNAL_SERVER_ERROR`

Cursor-Konvention für Listen:
- Sortierung: `updatedAt DESC, id DESC`
- `cursor` ist ein Base64URL-kodiertes JSON-Objekt: `{ "updatedAt": "<ISO-String>", "id": <number> }`
- `limit` Default: `20`
- `limit` Minimum: `1`
- `limit` Maximum: `50`
- `nextCursor = null`, wenn keine weitere Seite existiert

## 7.0 DTO-Definitionen
### `BonsaiSummary`
- `id: number`
- `name: string`
- `nickname: string | null`
- `species: string`
- `latinName: string | null`
- `location: string`
- `indoorOutdoor: "INDOOR" | "OUTDOOR" | "BEIDES"`
- `age: number`
- `heightCm: number | null`
- `widthCm: number | null`
- `style: string`
- `customStyle: string | null`
- `ownedSince: string` (ISO-8601 UTC)
- `healthStatus: "UNBEKANNT" | "SEHR_GUT" | "GUT" | "BEOBACHTEN" | "KRITISCH"`
- `developmentStage: "ROHLING" | "IN_GESTALTUNG" | "VERFEINERUNG" | "REIF"`
- `coverImage: string | null`
- `imageCount: number`
- `subEntryCount: number`
- `updatedAt: string` (ISO-8601 UTC)
- `coverImage` ist `images[0]`, falls mindestens ein Bild vorhanden ist, sonst `null`
- `subEntryCount` zählt nur Sub-Einträge nicht gelöschter Bonsais

### `SubEntryDto`
- `id: number`
- `bonsaiId: number`
- `date: string` (ISO-8601 UTC)
- `entryType: "GIESSEN" | "DUENGEN" | "SCHNEIDEN" | "DRAHTEN" | "UMTOPFEN" | "KONTROLLE" | "FOTO_UPDATE" | "SONSTIGES"`
- `healthObservation: "UNBEKANNT" | "SEHR_GUT" | "GUT" | "BEOBACHTEN" | "KRITISCH" | null`
- `performedActions: string[]`
- `nextAction: string | null`
- `reminderDate: string | null`
- `notes: string | null`
- `images: string[]`
- `createdAt: string` (ISO-8601 UTC)
- `updatedAt: string` (ISO-8601 UTC)

### `BonsaiDetail`
- `id: number`
- `name: string`
- `nickname: string | null`
- `species: string`
- `latinName: string | null`
- `location: string`
- `indoorOutdoor: "INDOOR" | "OUTDOOR" | "BEIDES"`
- `age: number`
- `heightCm: number | null`
- `widthCm: number | null`
- `trunkDiameterMm: number | null`
- `style: string`
- `customStyle: string | null`
- `ownedSince: string` (ISO-8601 UTC)
- `acquiredFrom: string | null`
- `purchasePriceCents: number | null`
- `healthStatus: "UNBEKANNT" | "SEHR_GUT" | "GUT" | "BEOBACHTEN" | "KRITISCH"`
- `developmentStage: "ROHLING" | "IN_GESTALTUNG" | "VERFEINERUNG" | "REIF"`
- `lastRepotDate: string | null`
- `nextRepotDue: string | null`
- `winterHardiness: "NICHT_WINTERHART" | "BEDINGT_WINTERHART" | "WINTERHART" | null`
- `sunExposure: "VOLLE_SONNE" | "HALBSCHATTEN" | "SCHATTEN" | null`
- `potType: string | null`
- `potColor: string | null`
- `wateringNotes: string | null`
- `fertilizingNotes: string | null`
- `pruningNotes: string | null`
- `wiringNotes: string | null`
- `notes: string | null`
- `images: string[]`
- `createdAt: string` (ISO-8601 UTC)
- `updatedAt: string` (ISO-8601 UTC)
- `subEntries: SubEntryDto[]`

### `StyleEnum`
- `Chokkan`
- `Moyogi`
- `Shakan`
- `Kengai`
- `Han-Kengai`
- `Bunjingi`
- `Fukinagashi`
- `Sokan`
- `Kabudachi`
- `Yose-ue`
- `Hokidachi`
- `Ishitsuki`
- `Neagari`
- `Sonstiger`

### `IndoorOutdoorEnum`
- `INDOOR`
- `OUTDOOR`
- `BEIDES`

### `HealthStatusEnum`
- `UNBEKANNT`
- `SEHR_GUT`
- `GUT`
- `BEOBACHTEN`
- `KRITISCH`

### `DevelopmentStageEnum`
- `ROHLING`
- `IN_GESTALTUNG`
- `VERFEINERUNG`
- `REIF`

### `WinterHardinessEnum`
- `NICHT_WINTERHART`
- `BEDINGT_WINTERHART`
- `WINTERHART`

### `SunExposureEnum`
- `VOLLE_SONNE`
- `HALBSCHATTEN`
- `SCHATTEN`

### `EntryTypeEnum`
- `GIESSEN`
- `DUENGEN`
- `SCHNEIDEN`
- `DRAHTEN`
- `UMTOPFEN`
- `KONTROLLE`
- `FOTO_UPDATE`
- `SONSTIGES`

## 7.1 `GET /api/bonsais`
- Zweck: Liste aller nicht gelöschten Bonsais des eingeloggten Users
- Query optional: `search`, `species`, `healthStatus`, `developmentStage`, `indoorOutdoor`, `sort`, `cursor`, `limit`
- Sortierung standardmäßig: `updatedAt DESC`
- Pagination-Modell: Cursor-basiert für Infinite Scroll
- 200: `{ ok: true, data: { items: BonsaiSummary[], nextCursor: string | null } }`
- `search` durchsucht `name`, `nickname`, `species`, `latinName`, `location`, `notes`, `customStyle`
- `species` filtert per exaktem Match
- `healthStatus`, `developmentStage` und `indoorOutdoor` filtern per exaktem Enum-Match
- `sort` erlaubt in v1 nur `updatedAt_desc`
- Fehlercodes: `401`, `400`, `500`

## 7.2 `POST /api/bonsais`
- Zweck: Bonsai erstellen
- Body:
  - `name`, `species`, `location`, `indoorOutdoor`, `age`, `style`, `ownedSince`, `healthStatus`, `developmentStage`
  - optional `nickname`, `latinName`, `heightCm`, `widthCm`, `trunkDiameterMm`, `customStyle`, `acquiredFrom`, `purchasePriceCents`, `lastRepotDate`, `nextRepotDue`, `winterHardiness`, `sunExposure`, `potType`, `potColor`, `wateringNotes`, `fertilizingNotes`, `pruningNotes`, `wiringNotes`, `notes`
- 201: `{ ok: true, data: { id: number } }`
- Regeln:
  - `style` muss aus Abschnitt 18 stammen
  - `customStyle` ist nur erlaubt, wenn `style = "Sonstiger"`
  - `images` werden beim Erstellen nicht mitgegeben; Startwert ist `[]`
- Fehlercodes: `401`, `400`, `422`, `500`

## 7.3 `GET /api/bonsais/:id`
- Zweck: Detailansicht inkl. Sub-Einträge
- 200: `{ ok: true, data: BonsaiDetail }`
- 404 wenn nicht vorhanden, gelöscht oder kein Zugriff
- Sub-Einträge sind nach `date DESC, id DESC` sortiert
- Fehlercodes: `401`, `404`, `500`

## 7.4 `PATCH /api/bonsais/:id`
- Zweck: Bonsai bearbeiten
- Erlaubte Felder: `name`, `nickname`, `species`, `latinName`, `location`, `indoorOutdoor`, `age`, `heightCm`, `widthCm`, `trunkDiameterMm`, `style`, `customStyle`, `ownedSince`, `acquiredFrom`, `purchasePriceCents`, `healthStatus`, `developmentStage`, `lastRepotDate`, `nextRepotDue`, `winterHardiness`, `sunExposure`, `potType`, `potColor`, `wateringNotes`, `fertilizingNotes`, `pruningNotes`, `wiringNotes`, `notes`, `images`
- 200: `{ ok: true, data: BonsaiDetail }`
- PATCH ist partiell: nicht gesendete Felder bleiben unverändert
- Leeren optionaler Felder erfolgt explizit über `null`
- `images` ersetzt den vollständigen Bildpfad-Array des Bonsais
- Wenn `style != "Sonstiger"` gesetzt wird, muss der Server `customStyle = null` speichern
- Fehlercodes: `401`, `404`, `400`, `422`, `500`

## 7.5 `DELETE /api/bonsais/:id`
- Zweck: Bonsai soft-deleten
- 204 ohne Body
- Verhalten: setzt `deletedAt`, löscht Datensatz nicht physisch
- Zugehörige `SubEntry`-Datensätze bleiben in der Datenbank erhalten, sind aber über Business-APIs nicht mehr erreichbar
- Es gibt in v1 keinen Restore-Endpunkt
- Upload-Dateien werden in v1 beim Soft Delete nicht automatisch von der Festplatte entfernt
- Fehlercodes: `401`, `404`, `500`

## 7.6 `GET /api/subentries?bonsaiId=...`
- Zweck: Sub-Einträge für einen nicht gelöschten Bonsai
- Ownership-Check über Bonsai
- Sortierung: `date DESC, id DESC`
- Response: `{ ok: true, data: { items: SubEntryDto[] } }`
- Fehlercodes: `401`, `400`, `404`, `500`

## 7.7 `POST /api/subentries`
- Zweck: Sub-Eintrag erstellen
- `multipart/form-data`
  - `bonsaiId` (required)
  - `date` (required)
  - `entryType` (required)
  - `healthObservation` (optional)
  - `performedActions[]` (optional)
  - `nextAction` (optional)
  - `reminderDate` (optional)
  - `notes` (optional)
  - `images[]` (optional, max 5)
- 201: angelegter Sub-Eintrag
- Response: `{ ok: true, data: SubEntryDto }`
- Fehlercodes: `401`, `400`, `404`, `413`, `415`, `422`, `500`

## 7.8 `PATCH /api/subentries/:id`
- Zweck: Notizen/Datum/Bilder eines Sub-Eintrags anpassen
- Ownership-Check erforderlich
- 200: `{ ok: true, data: SubEntryDto }`
- Request ist `multipart/form-data`
- Erlaubte Felder:
  - `date` optional
  - `entryType` optional
  - `healthObservation` optional
  - `performedActions[]` optional
  - `nextAction` optional
  - `reminderDate` optional
  - `notes` optional
  - `keepImages[]` optional; enthält bestehende Bildpfade, die erhalten bleiben sollen
  - `newImages[]` optional; enthält neu hochzuladende Bilddateien, max 5 Dateien total nach dem Update
- Finale Bildliste wird serverseitig aufgebaut als `keepImages + neu gespeicherte Dateien`
- `notes` darf durch leeren String geleert werden
- `performedActions[]` ersetzt vollständig die bisher gespeicherte Liste
- Wenn `keepImages[]` fehlt, werden standardmäßig keine bestehenden Bilder übernommen
- Fehlercodes: `401`, `404`, `400`, `413`, `415`, `422`, `500`

## 7.9 `DELETE /api/subentries/:id`
- Zweck: Sub-Eintrag löschen
- 204 ohne Body
- Sub-Einträge werden in v1 physisch gelöscht
- Zugehörige verwaltete Upload-Dateien werden beim Löschen eines Sub-Entries mit entfernt
- Fehlercodes: `401`, `404`, `500`

## 7.10 `POST /api/upload`
- Zweck: Einzelbildupload für Bonsai (Legacy-kompatibel)
- `multipart/form-data`: `file`, `bonsaiId`
- Speicherung über den konfigurierten Upload-Storage; produktiv Supabase Storage, lokal Dateisystem
- Ownership-Check für `bonsaiId`
- 200: `{ ok: true, data: { filePath } }`
- Wenn `bonsaiId` mitgegeben wird, wird der Bildpfad direkt an den Bonsai-Datensatz angehängt
- Hinweis: Für neue Entwicklung bevorzugt in Bonsai-Endpoint integrieren
- `filePath` ist ein stabiler Media-Pfad der App, z. B. `/api/media/local/1735689600000-mein-bild.jpg`
- Fehlercodes: `401`, `400`, `404`, `413`, `415`, `500`

## 7.11 Beispiel-Requests und -Responses
### `POST /api/bonsais` Request
```json
{
  "name": "Ahorn Wald",
  "nickname": "Waldprojekt",
  "species": "Acer palmatum",
  "latinName": "Acer palmatum",
  "location": "Terrasse Nord",
  "indoorOutdoor": "OUTDOOR",
  "age": 8,
  "heightCm": 42,
  "widthCm": 55,
  "style": "Yose-ue",
  "ownedSince": "2024-05-29",
  "healthStatus": "GUT",
  "developmentStage": "IN_GESTALTUNG",
  "sunExposure": "HALBSCHATTEN",
  "notes": "Im Frühjahr umgetopft"
}
```

### `POST /api/bonsais` Response
```json
{
  "ok": true,
  "data": {
    "id": 42
  }
}
```

### `GET /api/bonsais` Response
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": 42,
        "name": "Ahorn Wald",
        "nickname": "Waldprojekt",
        "species": "Acer palmatum",
        "latinName": "Acer palmatum",
        "location": "Terrasse Nord",
        "indoorOutdoor": "OUTDOOR",
        "age": 8,
        "heightCm": 42,
        "widthCm": 55,
        "style": "Yose-ue",
        "customStyle": null,
        "ownedSince": "2024-05-29T00:00:00.000Z",
        "healthStatus": "GUT",
        "developmentStage": "IN_GESTALTUNG",
        "coverImage": "/uploads/1735689600000-ahorn.jpg",
        "imageCount": 3,
        "subEntryCount": 5,
        "updatedAt": "2026-02-28T12:00:00.000Z"
      }
    ],
    "nextCursor": null
  }
}
```

### Fehler-Response Beispiel
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "style muss aus der standardisierten Stilliste stammen"
  }
}
```

## 8. Validierung
### 8.1 Feldregeln Bonsai
- `name`: required, trimmed, 2..80
- `nickname`: optional, trimmed, 1..80
- `species`: required, 2..80
- `latinName`: optional, trimmed, 2..120
- `location`: required, 2..120
- `indoorOutdoor`: required, `IndoorOutdoorEnum`
- `age`: Integer 0..200
- `heightCm`: optional, Integer 0..500
- `widthCm`: optional, Integer 0..500
- `trunkDiameterMm`: optional, Integer 0..1000
- `style`: required, muss aus der vordefinierten Liste kommen
- `customStyle`: optional, max 80, nur erlaubt wenn `style = "Sonstiger"`
- `ownedSince`: gültiges Datum, nicht in der Zukunft
- `acquiredFrom`: optional, max 120
- `purchasePriceCents`: optional, Integer >= 0
- `healthStatus`: required, `HealthStatusEnum`
- `developmentStage`: required, `DevelopmentStageEnum`
- `lastRepotDate`: optional, gültiges Datum, nicht in der Zukunft
- `nextRepotDue`: optional, gültiges Datum, nicht vor `lastRepotDate`
- `winterHardiness`: optional, `WinterHardinessEnum`
- `sunExposure`: optional, `SunExposureEnum`
- `potType`: optional, max 80
- `potColor`: optional, max 40
- `wateringNotes`: optional, max 1000
- `fertilizingNotes`: optional, max 1000
- `pruningNotes`: optional, max 1000
- `wiringNotes`: optional, max 1000
- `notes`: optional, max 2000

### 8.2 Feldregeln SubEntry
- `date`: gültiges Datum, Bereich 1900..2200
- `entryType`: required, `EntryTypeEnum`
- `healthObservation`: optional, `HealthStatusEnum`
- `performedActions[]`: optional, max 10 Einträge, je Eintrag 1..80 Zeichen
- `nextAction`: optional, max 200
- `reminderDate`: optional, gültiges Datum, nicht vor `date`
- `notes`: optional, max 500
- `images`: max 5 pro Eintrag

### 8.3 Upload-Regeln
- MIME: `image/jpeg`, `image/png`, optional `image/webp`
- Dateigröße: max 5 MB pro Datei
- Dateiname: serverseitig generierter eindeutiger Name
- Interner Dateiname besteht aus Timestamp + slugifiziertem Originalnamen
- Entfernen eines Bildpfads aus einem Datensatz löscht die Datei in v1 nicht physisch

## 9. UI/Seiten-Spezifikation
## 9.0 Verbindliches UI-System
- Bestehender UI-Stack bleibt maßgeblich: Tailwind CSS + DaisyUI
- Neue UI-Elemente sollen bevorzugt mit DaisyUI-Komponenten und Tailwind-Utilities umgesetzt werden
- Keine Einführung einer weiteren UI-Bibliothek wie Material UI, Chakra UI, Ant Design oder shadcn/ui in v1
- Visuelle Sprache: mobile-first, klar, leichtgewichtig, deutschsprachig
- Theme: DaisyUI-Theme `light` als Standard
- Bottom-Navigation bleibt ein zentrales Navigationselement auf mobilen Ansichten

### 9.0.1 Verbindliche Komponenten-Mappings
- Buttons: DaisyUI `btn`
- Formularfelder: DaisyUI `input`, `textarea`, `select`, `file-input`
- Karten: DaisyUI `card`
- Ladeindikatoren: DaisyUI `loading` oder konsistente Tailwind-Loader
- Bestätigungsdialoge: DaisyUI `modal`
- Status-/Fehlermeldungen: DaisyUI `alert`
- Navigation unten: DaisyUI `dock`
- Leere Zustände: eigene Section auf Basis von `card` + `btn`

### 9.0.2 Komponenten-Regeln
- Interaktive Elemente müssen visuelle Hover-, Focus- und Disabled-Zustände haben
- Formulare verwenden konsistente Abstände, Label-Logik und Fehlertexte
- Primäre Aktionen verwenden `btn-primary`
- Sekundäre Aktionen verwenden `btn-secondary` oder `btn-outline`
- Destruktive Aktionen verwenden `btn-error`
- Erfolgsmeldungen verwenden `alert-success`
- Fehlermeldungen verwenden `alert-error`
- Kartenlisten auf Dashboard und Detailseiten verwenden ein einheitliches Card-Layout

## 9.1 `/` (Landing/Login)
- Nicht eingeloggt: Login-CTA
- Eingeloggt: Begrüßung + CTA zum Dashboard + Logout
- Nach Login Redirect auf `/dashboard`

## 9.2 `/dashboard`
- Zeigt nur eigene Bonsais als Karten
- Zustände: Loading, Empty, Error
- Lädt weitere Bonsais per Infinite Scroll nach
- Aktionen pro Karte: Details öffnen
- CTA: Bonsai anlegen
- Karten zeigen: Coverbild, Name, optional `nickname`, Art, Standort, Indoor/Outdoor-Status, Gesundheitsstatus, Stil, letztes Update
- Nachlade-Trigger bei 300 px Abstand zum Listenende
- Während Nachladen wird ein Inline-Loader am Listenende angezeigt

## 9.3 `/create-bonsai`
- Formular mit Live-Validierung
- Feld `style` als Select
- Bei Auswahl `Sonstiger` wird zusätzlich `customStyle` eingeblendet
- Erfolgreiches Speichern: Redirect zu Detailseite
- Formularfelder in Reihenfolge: `name`, `nickname`, `species`, `latinName`, `location`, `indoorOutdoor`, `age`, `heightCm`, `widthCm`, `trunkDiameterMm`, `style`, `customStyle`, `ownedSince`, `acquiredFrom`, `purchasePriceCents`, `healthStatus`, `developmentStage`, `lastRepotDate`, `nextRepotDue`, `winterHardiness`, `sunExposure`, `potType`, `potColor`, `wateringNotes`, `fertilizingNotes`, `pruningNotes`, `wiringNotes`, `notes`
- Submit ist deaktiviert, solange Pflichtfelder ungültig sind
- Das Formular ist in logische Abschnitte gruppiert:
  - Grunddaten
  - Maße und Gestaltung
  - Herkunft und Entwicklung
  - Pflegeprofil
  - Freitextnotizen

## 9.4 `/bonsai/[id]`
- Stammdaten anzeigen
- Galerie (Bonsai-Bilder)
- Letzte Sub-Einträge
- Aktionen: Bearbeiten, Sub-Eintrag hinzufügen, Löschen
- Zeigt vollständige Bonsai-Metadaten inklusive Stil, `customStyle`, Besitzdatum, Maße, Pflegeprofil, Gesundheitsstatus und Entwicklungsstand
- Löschaktion verlangt Bestätigungsdialog
- Detailansicht ist in Bereiche gegliedert:
  - Übersicht
  - Maße und Stil
  - Pflegeprofil
  - Herkunft und Anschaffung
  - Bilder
  - Pflegehistorie

## 9.5 `/bonsai/edit/[id]`
- Vorbefülltes Formular
- Feld `style` als Select
- Bei Auswahl `Sonstiger` wird zusätzlich `customStyle` eingeblendet
- Bilder hinzufügen/entfernen
- Speichern mit Erfolgs-/Fehlerfeedback
- Entfernen von Bildern wirkt sofort auf den lokalen Formularzustand und erst nach Speichern persistent
- Die gleiche Feldreihenfolge und Abschnittsstruktur wie in `/create-bonsai` wird wiederverwendet

## 9.6 `/bonsai/[id]/subentries`
- Timeline/Liste der Sub-Einträge
- Neuer Eintrag inkl. Mehrfachbild-Upload
- Bearbeiten/Löschen bestehender Einträge
- Formularfelder für neue Sub-Einträge: `date`, `entryType`, `healthObservation`, `performedActions[]`, `nextAction`, `reminderDate`, `notes`, `images[]`
- Bearbeiten eines Sub-Eintrags erfolgt inline oder in einem Modal; Entscheidung technisch frei, Verhalten fachlich identisch
- Jede Timeline-Karte zeigt mindestens: Datum, Typ, Gesundheitsbeobachtung, ausgeführte Maßnahmen, nächste Aktion, Erinnerung, Notizen, Bilder

## 9.7 `/profile`
- Anzeige von Name/E-Mail
- Logout

## 9.8 Navigation
- Konsistente Bottom-Navigation
- Aktiver Zustand pro Route korrekt

## 10. Technische Implementierungsregeln
- TypeScript `strict: true`
- Keine `any` in Kernpfaden (außer klar begründete Grenzstellen)
- Zentrale Prisma-Instanz (`lib/prisma.ts`) mit Singleton-Pattern
- Keine `prisma.$disconnect()` pro Request
- Keine `console.log` in Production
- Nutzung von `next/link` statt nackter `<a>` für interne Navigation
- Einheitliche DTO-Typen für API-Requests/Responses
- `.env.example` muss mindestens `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `EMAIL_FROM`, `RESEND_API_KEY` enthalten
- `.env.example` soll für `DATABASE_URL` den zur aktuellen Umgebung passenden Platzhalter für `prisma+postgres` dokumentieren
- Der Code darf nicht voraussetzen, dass `EMAIL_SERVER` aktiv genutzt wird

## 11. Projektstruktur (Soll)
- `pages/*` für UI-Routen
- Keine Mehrsprachigkeit in v1; alle UI-Texte, Fehlertexte und E-Mails auf Deutsch
- `pages/api/*` für API
- `lib/auth.ts` mit `getServerAuthSession()`
- `lib/validators/*` für Zod-Schemas
- `lib/api/*` für Response-Helper (`ok`, `fail`)
- `types/*` für Domain-/DTO-Typen

Bereinigung:
- App-Router-Artefakte im `pages`-Pfad entfernen oder migrieren (`pages/layout.tsx`, `pages/dashboard/page.tsx`).

## 12. Sicherheitsanforderungen
- Keine Secrets im Repository
- Falls Secrets bereits exponiert sind: sofortige Rotation
- Session/Ownership auf jeder mutierenden und lesenden Business-API prüfen
- Soft-deleted Bonsais dürfen weder in Listen noch per direkter URL sichtbar sein
- Uploads nur mit erlaubten MIME-Typen und Größen
- Fehlerantworten ohne interne Stacktraces

## 13. Performance und UX
- Dashboard-Antwortzeit Ziel: < 500 ms bei <= 200 Bonsais/User
- Dashboard nutzt Infinite Scroll mit Cursor-basiertem Nachladen
- Detailseite lädt Bonsai + SubEntries in einem Request
- Bilder lazy laden
- Saubere Empty States statt leerer Flächen

## 14. Tests und Qualitätssicherung
## 14.1 Unit-Tests
- Validatoren (Bonsai, SubEntry, Upload)
- Mapper/Response-Helper

## 14.2 API-Integrationstests
- Auth required
- Ownership enforcement
- CRUD-Flow Bonsai
- CRUD-Flow SubEntry
- Upload happy/invalid path
- Validierung aller neuen Enum- und Datumsfelder
- Korrekte Behandlung von `customStyle`, `nextRepotDue` und `reminderDate`

## 14.3 E2E-Tests
- Login -> Dashboard
- Bonsai erstellen -> Detail
- SubEntry mit Bild erstellen -> sichtbar
- Bonsai bearbeiten -> Änderungen sichtbar
- Bonsai löschen -> nicht mehr sichtbar
- Pflegeprofil-Felder werden korrekt gespeichert und angezeigt
- Timeline zeigt `entryType`, Maßnahmen und Erinnerungsdatum korrekt an

## 14.4 Build-Gates
- `npm run build` muss erfolgreich sein
- Typecheck fehlerfrei
- Keine ungefangenen Promise-Rejections

## 15. Migrations- und Umsetzungsplan
1. Schema harmonisieren (`ownedSince`, `style`, Timestamps, `deletedAt`, Query-Filter)
2. Prisma Client neu generieren und Migrations anwenden
3. Auth-Helper + Ownership-Middleware einführen
4. API-Verträge auf einheitliches Format umbauen
5. Seiten auf neue Verträge anpassen
6. Upload robust machen (Validation + Ownership)
7. Lösch- und Edit-Funktionen vollständig implementieren
8. Tests ergänzen und Build stabilisieren

## 16. Akzeptanzkriterien (Definition of Done)
- Alle Seiten/Flows aus Abschnitt 9 funktionsfähig
- Alle APIs aus Abschnitt 7 implementiert
- Keine TypeScript-Fehler
- Zugriff auf fremde Daten technisch ausgeschlossen
- Upload-Limits/Dateitypen serverseitig durchgesetzt
- Secrets nicht im Repo, `.env.example` vorhanden
- Build und Tests laufen lokal durch

## 17. Festgelegte Produktentscheidungen
- Relationale Daten bleiben in PostgreSQL; Bilder liegen produktiv in Supabase Storage.
- Sub-Einträge erhalten in v1 keine zusätzlichen Kategorien.
- Bonsais werden per Soft Delete entfernt (`deletedAt`).
- Die Anwendung ist in v1 ausschließlich auf Deutsch.
- Das Dashboard nutzt Infinite Scroll mit Cursor-Pagination.
- Authentifizierung erfolgt per NextAuth Email Magic Link; Versand in v1 ausschließlich über Resend.
- Keine Export-Funktion in v1.
- `style` ist eine feste Auswahlliste standardisierter Bonsai-Gestaltungsstile.
- Wenn kein Standardstil passt, wird `Sonstiger` gewählt und `customStyle` befüllt.

## 18. Standardisierte Stilliste
- `Chokkan`
- `Moyogi`
- `Shakan`
- `Kengai`
- `Han-Kengai`
- `Bunjingi`
- `Fukinagashi`
- `Sokan`
- `Kabudachi`
- `Yose-ue`
- `Hokidachi`
- `Ishitsuki`
- `Neagari`
- `Sonstiger`

## 19. AI Implementation Contract
Dieser Abschnitt ist die verbindliche Arbeitsanweisung für einen Coding-Assistenten, der die Anwendung implementiert oder refaktoriert.

### 19.1 Ziel des Implementierungsauftrags
- Implementiere die Anwendung vollständig auf Basis dieser SPEC.
- Behebe bestehende Inkonsistenzen im aktuellen Projekt, wenn sie dieser SPEC widersprechen.
- Wenn bestehender Code und diese SPEC voneinander abweichen, ist diese SPEC maßgeblich.

### 19.2 Nicht selbst entscheiden
Die folgenden Punkte sind bereits entschieden und dürfen nicht eigenständig anders umgesetzt werden:
- Pages Router statt App Router
- Tailwind CSS + DaisyUI als UI-System
- NextAuth Email Magic Link mit Resend
- PostgreSQL + Prisma
- Soft Delete nur für Bonsais
- Physisches Delete für Sub-Entries
- Infinite Scroll mit Cursor-Pagination
- Deutsch als einzige Sprache in v1
- `style` als feste Liste mit `customStyle` nur bei `Sonstiger`
- PostgreSQL für relationale Daten, Supabase Storage für Uploads

### 19.3 Pflicht bei Abweichungen im Bestandscode
- Entferne oder migriere app-router-artige Artefakte im `pages`-basierten Projekt.
- Vereinheitliche Prisma-Schema, Migrationen, DTOs und Frontend-Felder.
- Entferne oder ersetze alle Felder, Verträge oder UI-Elemente, die nicht mehr zur SPEC passen.
- Stelle sicher, dass bestehende inkonsistente Routen am Ende entweder kompatibel oder entfernt sind.

### 19.4 Verbindliche Deliverables
Der Coding-Assistent muss am Ende mindestens liefern:
- lauffähige Seiten für alle in Abschnitt 9 beschriebenen Routen
- implementierte API-Routen gemäß Abschnitt 7
- konsistentes Prisma-Schema inklusive benötigter Migrationen
- `.env.example` mit allen erforderlichen Variablen
- bereinigte Navigation und konsistente UI
- Build ohne TypeScript-Fehler
- Tests oder mindestens eine dokumentierte Testbasis gemäß Abschnitt 14

### 19.5 Verbindliche Reihenfolge
1. Bestehenden Code analysieren und gegen diese SPEC abgleichen.
2. Datenmodell und Migrationen harmonisieren.
3. Auth- und Ownership-Basis stabilisieren.
4. API-Verträge implementieren.
5. UI-Routen implementieren oder refaktorieren.
6. Upload- und Bildflüsse konsistent machen.
7. Tests ergänzen.
8. Build, Typecheck und zentrale User-Flows verifizieren.

### 19.6 Verbindliche Qualitätsgrenzen
- Keine TypeScript-Fehler
- Keine nicht autorisierten Datenzugriffe
- Keine ungenutzten Parallelarchitekturen (`pages` plus App-Router-Reste)
- Keine neuen Libraries ohne klare Begründung
- Keine stillschweigende Abweichung von API-Verträgen
- Keine Annahmen über Response-Formate außerhalb dieser SPEC
- Keine Secret-Werte aus `.env.local` in Sourcecode, Tests, Fixtures oder Dokumentation übernehmen

### 19.7 Umgang mit Unklarheiten
- Wenn eine Implementierungsfrage durch diese SPEC eindeutig beantwortet ist, darf nicht improvisiert werden.
- Wenn eine rein technische Entscheidung offen ist, ist die minimal-komplexe Lösung zu bevorzugen.
- Wenn eine Stelle trotz SPEC unklar bleibt, ist die bestehende Architektur des Projekts nur dann maßgeblich, wenn sie dieser SPEC nicht widerspricht.

### 19.8 Abschlusskriterien
- `npm run build` erfolgreich
- TypeScript fehlerfrei
- Kernflows manuell oder automatisiert geprüft:
  - Login
  - Dashboard laden
  - Bonsai erstellen
  - Bonsai bearbeiten
  - Sub-Entry erstellen
  - Bonsai soft-deleten
  - Logout
