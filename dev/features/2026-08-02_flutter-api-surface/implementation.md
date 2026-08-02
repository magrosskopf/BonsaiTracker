# Implementation Plan: API Surface fuer Flutter Native App

**Status**: COMPLETE  
**Created**: 2026-08-02  
**Last Modified**: 2026-08-02

## Overview

Dieses Backend-Repository stellt eine versionierte Public Client API unter
`/api/v1/...` bereit, damit die bestehende Flutter-App fachliche Daten nur noch
ueber stabile Server-DTOs, serverseitige Supabase-Auth-Validierung,
Repository-Zugriffe, Rate Limits und App-Integritaetspruefungen nutzt.

Die bestehenden Web-Routen unter `/api/...` bleiben kompatibel. Neue Mobile-
Vertraege werden als duenne `pages/api/v1/...`-Routen umgesetzt, die gemeinsame
Handler-, Validator-, Mapper- und Repository-Module verwenden. Dadurch kann die
Web-App kurzfristig unveraendert bleiben, waehrend Flutter auf `/api/v1/...`
migriert.

Dieser Plan ist der repo-spezifische Backend-Plan. Der daraus abgeleitete
Flutter-Plan wird erst nach Initialisierung der Workflow-/Planungsstruktur und
Git-Struktur im Flutter-Repository unter
`/Users/maius/Projekte/Bonsai-Tracker-Flutter-App` abgelegt.

## Reference

- **Spec**: `dev/features/2026-08-02_flutter-api-surface/spec.md`
- **ADR**: `docs/adr/0001-public-client-api.md`
- **Key Acceptance Criteria**:
  - AC 1-2: genehmigter API-Plan behandelt vorhandene und fehlende Endpunkte.
  - AC 3-4: private APIs verlangen Bearer Auth; Flutter braucht keine Secrets.
  - AC 5-6: `/api/v1/...` ist entschieden; Feed nutzt Cursor-Pagination.
  - AC 7: Upload/Media-Limits, Berechtigungen und Fehlerfaelle sind dokumentiert.
  - AC 9-10: App-Integritaet und Rate Limits sind geplant und Production-hart.
  - AC 11-13: Web-Kompatibilitaet, Community-Meldungen und Admin-Abgrenzung.
  - AC 15-18: Tests, getrennter Flutter-Plan, Flutter-Workflow/Git-Vorarbeit.

## File Structure

### Files to Create

- `lib/api/ids.ts` - gemeinsame Parser fuer positive numerische IDs und UUIDs.
- `lib/api/pagination.ts` - generische Cursor-Pagination fuer `createdAt/id` und
  `updatedAt/id`.
- `lib/api/public-client.ts` - Public-Client-Guard fuer Auth, App-Integritaet
  und Rate-Limit-Kontext.
- `lib/api/app-integrity.ts` - Header-Parsing, Environment-Konfiguration und
  Plattform-Validierungsadapter fuer iOS/Android.
- `lib/api/rate-limits.ts` - Mobile-Rate-Limit-Scopes und helper fuer
  IP/Actor/Device-Subject.
- `lib/validators/report.ts` - Zod-Schemas fuer Community-Meldungen.
- `lib/repositories/reports.ts` - idempotentes Erstellen offener
  Community-Meldungen.
- `pages/api/v1/bonsais/index.ts` - `GET`, `POST`.
- `pages/api/v1/bonsais/[id].ts` - `GET`, `PATCH`, `DELETE`.
- `pages/api/v1/subentries/index.ts` - `GET`, `POST`.
- `pages/api/v1/subentries/[id].ts` - `PATCH`, `DELETE`.
- `pages/api/v1/reminders/index.ts` - `GET`, `POST`.
- `pages/api/v1/reminders/[id].ts` - `PATCH`, inkl. `status=CANCELLED`.
- `pages/api/v1/posts/index.ts` - `GET`, `POST`, Feed-Cursor-Pagination.
- `pages/api/v1/posts/[id].ts` - `GET`, `PATCH`, `DELETE`.
- `pages/api/v1/posts/[id]/likes.ts` - `POST`.
- `pages/api/v1/posts/[id]/comments/index.ts` - `GET`, `POST`.
- `pages/api/v1/posts/[id]/comments/[commentId].ts` - `PATCH`, `DELETE`.
- `pages/api/v1/posts/[id]/reports.ts` - `POST` fuer Post-Meldungen.
- `pages/api/v1/posts/[id]/comments/[commentId]/reports.ts` - `POST` fuer
  Kommentar-Meldungen.
- `pages/api/v1/profile/me.ts` - `GET`, `PATCH`.
- `pages/api/v1/profiles/[id].ts` - `GET`.
- `pages/api/v1/upload.ts` - `POST multipart/form-data`.
- `pages/api/v1/media/[...key].ts` - `GET`, `DELETE`.
- `pages/api/v1/auth/precheck.ts` - mobile-kompatibler Alias fuer Signup-
  Precheck.
- `pages/api/v1/access-requests.ts` - mobile-kompatibler Alias fuer Warteliste.
- `tests/public-client-api.test.ts` - unitnahe API-Vertrags- und Security-Tests.
- `tests/public-client-pagination.test.ts` - Cursor-Tests fuer Feed und Bonsai.
- `tests/public-client-reports.test.ts` - Report-Validator/Repository-Tests.
- `tests/public-client-app-integrity.test.ts` - Header-/Env-/Bypass-Tests.
- External Supabase project migration:
  `/Users/maius/Projekte/supabase/supabase/migrations/20260802000100_public_client_api.sql`
  - Schemaerweiterungen fuer `CANCELLED`, Reports, Rate-Limit-Scopes und ggf.
    App-Integrity-Registrierungen.

### Files to Modify

- `types/domain.ts` - `REMINDER_STATUS_OPTIONS` um `CANCELLED`; Report-Enums
  ergaenzen.
- `types/dto.ts` - DTOs fuer Feed-Pagination, Reports, App-Integrity und
  Reminder-Status aktualisieren.
- `types/database.ts` - Typ-Aliases fuer neue Tabellen wie
  `community_reports` ergaenzen.
- `types/supabase.ts` - nach Migration per `npm run supabase:types`
  regenerieren.
- `lib/api/request.ts` - vorhandene Query-Parser bei Bedarf durch gemeinsame
  Parser erweitern.
- `lib/api/cursor.ts` - Bonsai-spezifischen Cursor entweder kompatibel lassen
  oder auf generische Cursor-Helfer delegieren.
- `lib/rate-limit.ts` - `RateLimitScope` fuer Mobile-Flows erweitern.
- `lib/repositories/posts.ts` - paginierte Feed-Abfrage,
  `updateOwnedPostComment`, `deleteOwnedPostComment`, Sichtbarkeitschecks fuer
  Reports.
- `lib/repositories/reminders.ts` - `CANCELLED` in Listen-/Patch-Logik
  beruecksichtigen.
- `lib/validators/comment.ts` - Kommentar-Patch-Schema, falls noch nicht
  vorhanden.
- `lib/validators/reminder.ts` - `CANCELLED` ueber aktualisierte Domain-
  Optionen erlauben.
- `lib/uploads.ts` - Upload-Limits explizit exportieren und fuer v1
  dokumentierbar machen.
- `pages/api/posts.ts` - bestehende Web-Route optional auf gemeinsame
  Feed-Repository-Funktion umstellen, ohne Response-Form zu brechen.
- `pages/api/posts/[id]/comments.ts` - optional gemeinsame Kommentar-Logik
  wiederverwenden.
- `pages/api/reminders/[id].ts` - Web-Kompatibilitaet pruefen; `CANCELLED`
  entweder erlauben oder nur in v1 freischalten.
- `.env.example` - Public-Client-API-, App-Integrity- und Rate-Limit-Envvars
  dokumentieren.
- `docs/supabase-sdk-cutover.md` - neue Validierungsschritte und Remote-
  Guardrails fuer die Public Client API ergaenzen.
- `README.md` - kurze API-/Flutter-Konfigurationshinweise ergaenzen.

### Files Not to Modify

- `workflows/` wird nicht geaendert.
- Flutter-Code wird in diesem Backend-Plan nicht geaendert.
- Admin-Moderations-UI und Admin-Endpunkte werden nicht gebaut.
- Profilbild-Upload-Endpunkte werden nicht gebaut.

## Implementation Steps

### Step 1: Establish Shared Public Client Boundary

**Goal**: Alle `/api/v1`-Routen nutzen dieselbe Auth-, Integrity-, Rate-Limit-
und Fehlerantwort-Basis.

**Actions**:
1. `lib/api/public-client.ts` mit `requirePublicClient(req, res, options)`
   erstellen.
2. `requirePublicClient` ruft fuer private Endpunkte `requireUser(req, res)` auf
   und gibt `{ actor, integrity, rateLimitSubject }` zurueck.
3. App-Integritaet fuer private und schreibende v1-Endpunkte ueber
   `lib/api/app-integrity.ts` pruefen.
4. Non-Production-Ausnahmen nur ueber explizite Envvars erlauben; Production
   fail-closed, wenn Header fehlen oder Provider-Validierung fehlschlaegt.
5. Einheitliche Rate-Limit-Subjekte aus IP, Actor-ID und optionalem
   Integrity-/Device-Subject ableiten.

**Files involved**:
`lib/api/public-client.ts`, `lib/api/app-integrity.ts`,
`lib/api/rate-limits.ts`, `lib/authz.ts`, `.env.example`.

### Step 2: Add Generic Cursor and ID Helpers

**Goal**: Feed- und Bonsai-Pagination validieren Cursors konsistent und
verhindern unbounded Responses.

**Actions**:
1. `lib/api/ids.ts` mit `parsePositiveId`, `parseOptionalPositiveId` und
   UUID-Helfern erstellen oder aus vorhandenen lokalen Handlern extrahieren.
2. `lib/api/pagination.ts` mit `parseLimit`, `encodeCreatedAtCursor`,
   `decodeCreatedAtCursor`, `encodeUpdatedAtCursor`, `decodeUpdatedAtCursor`
   erstellen.
3. Bonsai-Listen koennen den bestehenden `updatedAt/id`-Cursor behalten.
4. Feed nutzt `createdAt desc, id desc`, Default `limit=20`, Maximum `50`.
5. Ungueltige Limits oder Cursor ergeben `400 BAD_REQUEST` ohne interne Details.

**Files involved**:
`lib/api/ids.ts`, `lib/api/pagination.ts`, `lib/api/cursor.ts`,
`pages/api/v1/bonsais/index.ts`, `pages/api/v1/posts/index.ts`.

### Step 3: Build v1 Bonsai, Subentry, Reminder, Profile, Upload and Media Routes

**Goal**: Flutter bekommt stabile v1-Vertraege fuer die vorhandenen fachlichen
Flows, ohne bestehende Web-Routen zu brechen.

**Actions**:
1. Fuer jeden vorhandenen Web-Endpunkt eine v1-Route mit gleichem fachlichem
   DTO und Envelope `{ ok, data?, error? }` anlegen.
2. Gemeinsame Repository- und Mapper-Module verwenden statt direkte
   Supabase-Zugriffe in neuen Routen zu duplizieren.
3. Upload v1 mit `multipart/form-data`, `MAX_UPLOAD_BYTES = 5 MB` und erlaubten
   MIME Types `image/jpeg`, `image/png`, `image/webp` dokumentiert umsetzen.
4. Media v1 mit `GET`/`DELETE` ueber `canAccessMedia` bzw. `canDeleteMedia`
   absichern und bei fehlender Berechtigung `404` liefern.
5. Profile v1 mit `GET/PATCH /profile/me` und `GET /profiles/:id` bereitstellen;
   private E-Mail nur bei `me`.

**Files involved**:
`pages/api/v1/bonsais/*`, `pages/api/v1/subentries/*`,
`pages/api/v1/reminders/*`, `pages/api/v1/profile/me.ts`,
`pages/api/v1/profiles/[id].ts`, `pages/api/v1/upload.ts`,
`pages/api/v1/media/[...key].ts`, relevante Repositories und Validatoren.

### Step 4: Add Reminder Cancellation Semantics

**Goal**: Flutter kann Reminder fachlich entfernen, ohne hart zu loeschen.

**Actions**:
1. Externe Supabase-Migration erstellen, die den Reminder-Status `CANCELLED`
   in Schema/Constraints erlaubt.
2. `REMINDER_STATUS_OPTIONS` und Labels erweitern.
3. `reminderPatchSchema` laesst `status: "CANCELLED"` zu.
4. `PATCH /api/v1/reminders/:id` setzt `status=CANCELLED`, `completed_at=null`
   und `snoozed_until=null`.
5. `GET /api/v1/reminders` blendet `CANCELLED` standardmaessig aus, ausser ein
   expliziter `status=CANCELLED`-Filter oder `includeDone=true` ist definiert.
6. Web-Kompatibilitaet bewusst entscheiden: Wenn die bestehende Web-Route
   `CANCELLED` akzeptiert, muss die UI nicht sofort eine Cancel-Aktion anzeigen.

**Files involved**:
External migration, `types/domain.ts`, `types/supabase.ts`,
`lib/validators/reminder.ts`, `lib/repositories/reminders.ts`,
`pages/api/v1/reminders/[id].ts`.

### Step 5: Harden Community Feed and Comments

**Goal**: Flutter kann Feed und Kommentare vollstaendig und paginiert verwalten.

**Actions**:
1. `listFeedPosts(actorUserId, options)` auf Cursor-Pagination umstellen:
   `limit + 1`, Sortierung `created_at desc`, `id desc`, Cursorbedingung
   `(created_at < cursor.createdAt) OR (created_at = cursor.createdAt AND id < cursor.id)`.
2. `GET /api/v1/posts` gibt `{ items, nextCursor }` zurueck.
3. Bestehende `GET /api/posts` Web-Route entweder unveraendert lassen oder so
   auf die neue Repository-Funktion setzen, dass ihr bisheriges Response-Shape
   kompatibel bleibt.
4. `PATCH /api/v1/posts/:id/comments/:commentId` mit
   `commentPatchSchema` und Ownership-Check implementieren.
5. `DELETE /api/v1/posts/:id/comments/:commentId` mit Ownership-Check
   implementieren; fremde oder nicht sichtbare Ziele ergeben bevorzugt `404`.
6. Kommentar-Listen duerfen zunaechst unpaginiert bleiben, sofern sie fachlich
   klein sind; bei Bedarf optional `limit/cursor` fuer Kommentare vorbereiten,
   aber nicht gegen die Spec als Pflicht ausweiten.

**Files involved**:
`lib/repositories/posts.ts`, `lib/validators/comment.ts`,
`pages/api/v1/posts/*`, `types/dto.ts`, `tests/public-client-pagination.test.ts`.

### Step 6: Add Community Report API

**Goal**: Eingeloggte Flutter-Nutzer koennen Posts und Kommentare melden;
Moderationsentscheidungen bleiben out-of-scope.

**Actions**:
1. Externe Supabase-Migration fuer `community_reports` erstellen mit Feldern:
   `id`, `target_type`, `target_post_id`, `target_comment_id`, `reporter_user_id`,
   `reason`, `note`, `status`, `created_at`, `updated_at`.
2. Constraints anlegen:
   - Zieltyp `post` oder `comment`.
   - Status initial mindestens `OPEN`.
   - Reason-Enum laut Spec.
   - `OTHER` erfordert nicht-leere `note`.
   - Pro Reporter/Ziel hoechstens eine offene Meldung.
3. RLS aktivieren; direkte Client-Rollen duerfen keine Moderationsdaten lesen.
   Serverzugriff laeuft ueber Secret-Key-Data-Client.
4. `reportCreateSchema` mit `reason` und optionaler `note` erstellen.
5. `createOrReturnOpenReport` idempotent implementieren.
6. `POST /api/v1/posts/:id/reports` und
   `POST /api/v1/posts/:id/comments/:commentId/reports` bauen.
7. Rate Limit pro Actor, IP und Ziel anwenden.
8. Response minimal halten, z. B. `{ reported: true, status: "OPEN" }`.

**Files involved**:
External migration, `types/domain.ts`, `types/database.ts`, `types/supabase.ts`,
`lib/validators/report.ts`, `lib/repositories/reports.ts`,
`pages/api/v1/posts/[id]/reports.ts`,
`pages/api/v1/posts/[id]/comments/[commentId]/reports.ts`.

### Step 7: Add Mobile Rate Limits

**Goal**: Schreibende und missbrauchsanfaellige Mobile-Flows sind begrenzt.

**Actions**:
1. `RateLimitScope` in `lib/rate-limit.ts` erweitern, mindestens:
   `mobile_upload`, `mobile_post_create`, `mobile_comment_create`,
   `mobile_report`, `mobile_like_toggle`, `mobile_media_read`.
2. Externe Supabase-Migration/RPC-Constraint pruefen, damit neue Scopes in
   `auth_rate_limit_events` zugelassen sind.
3. `consumePublicClientRateLimit` in `lib/api/rate-limits.ts` bauen.
4. Limits ueber Envvars steuerbar machen, mit konservativen Defaults.
5. Bei Limit-Verstoss `429 RATE_LIMITED` mit generischer Nachricht liefern.

**Files involved**:
`lib/rate-limit.ts`, `lib/api/rate-limits.ts`, `.env.example`, v1-Routen,
external migration.

### Step 8: Document API Contracts and Runtime Configuration

**Goal**: Backend- und Flutter-Migration haben eine eindeutige Vertragsbasis.

**Actions**:
1. In `README.md` die Public Client API Boundary und benoetigte Flutter-
   Konfiguration dokumentieren:
   `API_BASE_URL`, Supabase URL, Publishable Key, Deep-Link Redirects.
2. In `.env.example` App-Integrity- und Rate-Limit-Variablen ergaenzen, z. B.:
   `PUBLIC_CLIENT_APP_INTEGRITY_MODE`, `PUBLIC_CLIENT_APP_INTEGRITY_ALLOW_DEV_BYPASS`,
   `APPLE_APP_ATTEST_*`, `GOOGLE_PLAY_INTEGRITY_*`,
   `MOBILE_*_RATE_LIMIT_*`.
3. `docs/supabase-sdk-cutover.md` um Public-Client-API-Checks ergaenzen.
4. Keine Secrets oder konkreten privaten Keys dokumentieren.

**Files involved**:
`README.md`, `.env.example`, `docs/supabase-sdk-cutover.md`.

### Step 9: Prepare the Derived Flutter Implementation Plan

**Goal**: Die cross-repository Planung endet mit getrennten, repo-spezifischen
Plaenen.

**Actions**:
1. Pruefen, ob `/Users/maius/Projekte/Bonsai-Tracker-Flutter-App` inzwischen
   ein Git-Repository ist; falls nicht, vor Flutter-Codeaenderungen
   initialisieren lassen.
2. Workflow-/Planungsstruktur in der Flutter-App gleichwertig initialisieren:
   `AGENTS.md`, `workflows/`, `dev/features/`.
3. Dort einen separaten Flutter-Plan ablegen, der `RemoteApiClient` von
   `/api/...` auf `/api/v1/...` migriert und Supabase Auth unveraendert direkt
   nutzt.
4. Flutter-Plan darf keine Backend-Codeaenderungen mehr enthalten.

**Files involved**:
Flutter-Repository, nicht dieses Backend-Repository.

## Code Architecture

### Key Components

#### Public Client Guard

- **Purpose**: Eine einheitliche Boundary fuer v1-Requests.
- **Location**: `lib/api/public-client.ts`
- **Key Functions**:
  - `requirePublicClient(req, res, options)` - validiert Auth, Integrity und
    liefert Request-Kontext.
  - `getPublicClientRateLimitSubject(context)` - kombiniert IP, Actor und
    Device-Subject.
- **Dependencies**: `lib/authz.ts`, `lib/api/app-integrity.ts`,
  `lib/api/rate-limits.ts`, `lib/api/response.ts`.

#### App Integrity Adapter

- **Purpose**: Plattformtoken getrennt von Auth aus Headern lesen und pruefen.
- **Location**: `lib/api/app-integrity.ts`
- **Key Functions**:
  - `parseAppIntegrityHeaders(req)` - liest `X-Bonsai-App-Integrity` und
    `X-Bonsai-Platform`.
  - `verifyAppIntegrity(headers, options)` - prueft iOS/Android oder Dev-Bypass.
  - `isAppIntegrityRequired(options)` - Production/schreibend/private Logik.
- **Dependencies**: Runtime-Env, Fetch/API-Adapter fuer Apple App Attest und
  Google Play Integrity.

#### Pagination Helpers

- **Purpose**: Stabile Cursor-DTOs ohne Offset-Pagination.
- **Location**: `lib/api/pagination.ts`
- **Key Functions**:
  - `parseLimit(value, { defaultLimit: 20, maxLimit: 50 })`
  - `encodeCreatedAtCursor({ createdAt, id })`
  - `decodeCreatedAtCursor(value)`
  - `encodeUpdatedAtCursor({ updatedAt, id })`
  - `decodeUpdatedAtCursor(value)`

#### Community Repository Extensions

- **Purpose**: Feed, Kommentare, Likes und Reports kapseln Supabase-Zugriffe.
- **Location**: `lib/repositories/posts.ts`, `lib/repositories/reports.ts`
- **Key Functions**:
  - `listFeedPosts(actorUserId, options)`
  - `updateOwnedPostComment(actorUserId, postId, commentId, text)`
  - `deleteOwnedPostComment(actorUserId, postId, commentId)`
  - `createOrReturnOpenReport(actorUserId, target, payload)`

### Data Models

```typescript
interface PublicClientContext {
  actor: { id: string; email: string | null };
  integrity: {
    platform: "ios" | "android" | null;
    subject: string | null;
    verified: boolean;
    devBypass: boolean;
  };
  clientIp: string;
}

interface CreatedAtCursor {
  createdAt: string;
  id: number;
}

interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

type CommunityReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "HATE_OR_EXTREMISM"
  | "SEXUAL_CONTENT"
  | "VIOLENCE_OR_SELF_HARM"
  | "ILLEGAL_CONTENT"
  | "PERSONAL_DATA"
  | "OTHER";

interface CommunityReportDto {
  reported: true;
  status: "OPEN";
}
```

### Module Interactions

```text
Flutter --Bearer/App-Integrity--> pages/api/v1/*
pages/api/v1/* --requires--> requirePublicClient
requirePublicClient --calls--> requireUser
requirePublicClient --calls--> verifyAppIntegrity
pages/api/v1/* --validates--> lib/validators/*
pages/api/v1/* --calls--> lib/repositories/*
repositories --use--> getServerDataClient
handlers --map--> lib/mappers -> types/dto.ts
handlers --respond--> ok/fail envelope
```

## Technical Decisions

### Framework/Library Choices

- **Next.js Pages Router**: bleibt bestehen, v1-Routen werden unter
  `pages/api/v1/...` angelegt.
- **Zod**: bleibt fuer Payload-Validierung.
- **Supabase Auth SDK**: `requireUser` validiert Access Tokens serverseitig.
- **Supabase service Data Client**: bleibt serverseitige Data-Boundary fuer
  Repositories und service-only RPCs.
- **Cursor-Pagination**: Feed nach `createdAt desc, id desc`; Bonsai weiter
  nach `updatedAt desc, id desc`.

### Patterns & Approaches

- **Thin Route Handlers**: Routen parsen HTTP, validieren Auth/Integrity,
  delegieren an Repositories und mappen DTOs.
- **404 for Forbidden Resources**: fehlende Sichtbarkeit/Besitz wird bevorzugt
  als `404 NOT_FOUND` beantwortet.
- **No User-ID Trust**: Actor-ID kommt nur aus Supabase Access Token.
- **Fail Closed in Production**: fehlende App-Integritaet blockiert private und
  schreibende v1-Requests in Production.
- **Web Compatibility First**: bestehende `/api/...` Routen bleiben im
  Verhalten kompatibel; gemeinsame Module duerfen nur ohne Response-Bruch
  eingefuehrt werden.

### Configuration

- **Environment Variables**:
  - `PUBLIC_CLIENT_APP_INTEGRITY_MODE=off|enforce`
  - `PUBLIC_CLIENT_APP_INTEGRITY_ALLOW_DEV_BYPASS=true|false`
  - `PUBLIC_CLIENT_APP_INTEGRITY_DEV_TOKEN_HASH`
  - `APPLE_APP_ATTEST_TEAM_ID`
  - `APPLE_APP_ATTEST_BUNDLE_ID`
  - `GOOGLE_PLAY_INTEGRITY_PACKAGE_NAME`
  - `GOOGLE_PLAY_INTEGRITY_PROJECT_NUMBER`
  - `MOBILE_UPLOAD_RATE_LIMIT_WINDOW_SECONDS`
  - `MOBILE_UPLOAD_RATE_LIMIT_MAX`
  - `MOBILE_POST_RATE_LIMIT_WINDOW_SECONDS`
  - `MOBILE_POST_RATE_LIMIT_MAX`
  - `MOBILE_COMMENT_RATE_LIMIT_WINDOW_SECONDS`
  - `MOBILE_COMMENT_RATE_LIMIT_MAX`
  - `MOBILE_REPORT_RATE_LIMIT_WINDOW_SECONDS`
  - `MOBILE_REPORT_RATE_LIMIT_MAX`
  - `MOBILE_LIKE_RATE_LIMIT_WINDOW_SECONDS`
  - `MOBILE_LIKE_RATE_LIMIT_MAX`

- **Config Files**:
  - `.env.example` documents names only.
  - External Supabase project under `/Users/maius/Projekte/supabase/supabase`
    receives migrations.

## Integration Points

### Existing Code Integration

- **Auth**: `lib/authz.ts` remains the authoritative Supabase token validation.
- **Responses**: all v1 JSON responses use `ok` and `fail` from
  `lib/api/response.ts`.
- **Repositories**: v1 routes use `lib/repositories/*`; direct Supabase calls
  stay inside repositories.
- **DTOs**: v1 routes use `lib/mappers.ts` and `types/dto.ts`.
- **Storage**: upload/media v1 reuse `lib/uploads.ts`, `lib/storage/*` and
  `lib/repositories/media.ts`.
- **Rate Limits**: existing `consume_auth_rate_limit` RPC is reused if it can
  accept new scopes; otherwise migration adjusts scope constraints.

### Database Changes

- **Reminder status**: allow `CANCELLED`.
- **Community reports**: create `community_reports` with idempotent open-report
  uniqueness and RLS.
- **Rate limit scopes**: allow mobile scopes in the existing rate-limit table or
  enum/constraint.
- **App integrity storage**: only create persistence if provider validation
  requires device registration state. Otherwise keep validation stateless for
  this phase.
- **Type generation**: run `npm run supabase:types` after local migration.

## Test Strategy

### Unit / Contract Tests

- **File**: `tests/public-client-api.test.ts`
- **Coverage**:
  - v1 route files exist for all planned public client endpoints.
  - v1 route sources use `requirePublicClient` for private Fach-APIs.
  - v1 routes use `ok/fail` envelope.
  - no v1 route reads user IDs from request body as authority.
  - legacy `/api/...` routes remain present.

### Pagination Tests

- **File**: `tests/public-client-pagination.test.ts`
- **Coverage**:
  - feed default limit is `20`.
  - feed max limit is `50`.
  - invalid limit/cursor returns validation failure.
  - nextCursor encodes last visible item using `createdAt` and `id`.
  - repository query orders by `created_at desc`, then `id desc`.

### Reminder Tests

- **File**: `tests/api-validation.test.ts` or `tests/public-client-api.test.ts`
- **Coverage**:
  - `reminderPatchSchema` accepts `CANCELLED`.
  - `CANCELLED` resets snooze/completion fields in v1 patch behavior.
  - default reminder list excludes `DONE` and `CANCELLED`.

### Report Tests

- **File**: `tests/public-client-reports.test.ts`
- **Coverage**:
  - allowed reasons pass.
  - `OTHER` without note fails.
  - note max length is enforced.
  - duplicate open report is idempotent.
  - report response does not expose moderation internals.

### App Integrity Tests

- **File**: `tests/public-client-app-integrity.test.ts`
- **Coverage**:
  - missing headers fail when enforcement is on.
  - invalid platform fails.
  - dev bypass works only outside Production and only with explicit env.
  - Supabase Bearer Auth is still required when dev bypass is active.

### Integration / DB Tests

- **Files**:
  - `tests/integration/supabase-api.test.ts`
  - `tests/integration/supabase-storage.test.ts`
- **Coverage**:
  - local Supabase migration applies.
  - RLS remains enabled on application tables.
  - service-only RPCs are not exposed to `anon`/`authenticated`.
  - upload/media permission checks return `404` for foreign media.
  - community reports cannot be read directly by normal client roles.

### Test Data

- Existing integration seed users, bonsais, subentries, reminders, posts and
  comments are reused where possible.
- Add one owned post, one foreign post, one owned comment and one foreign
  comment for authorization tests.
- Add report fixtures with duplicate reporter/target pairs.

## Edge Cases & Error Handling

### Edge Cases

1. **Malformed Authorization header**: `401 UNAUTHENTICATED`.
2. **Valid user, missing app integrity in Production**: `401` or `403` with
   generic `APP_INTEGRITY_REQUIRED`.
3. **Invalid ID path segment**: `400 BAD_REQUEST`.
4. **Foreign resource**: `404 NOT_FOUND`.
5. **Archived bonsai referenced by subentry/reminder**: preserve existing
   repository ownership semantics; do not leak foreign state.
6. **Feed cursor points to deleted item**: cursor remains valid because it
   contains sort values, not a lookup requirement.
7. **Upload has no file**: `400 BAD_REQUEST`.
8. **Upload too large**: `413 PAYLOAD_TOO_LARGE`.
9. **Unsupported upload MIME type**: `415 UNSUPPORTED_MEDIA_TYPE`.
10. **Report reason `OTHER` without note**: `422 VALIDATION_ERROR`.
11. **Duplicate open report**: `200` or `201` with same minimal success DTO; no
    duplicate row.
12. **Rate limited write**: `429 RATE_LIMITED`.

### Error Scenarios

1. **Supabase Auth validation error**: return `401`, no provider details.
2. **Supabase DB/RPC error**: log server-side; return generic `500`.
3. **Storage resolve/delete error**: return `404` for media, log server-side.
4. **App Integrity provider outage**: fail closed in Production; allow only
   explicit Non-Production bypass.
5. **Migration/type mismatch**: stop implementation until `types/supabase.ts`
   is regenerated and typecheck passes.

## Performance Considerations

- Feed uses cursor pagination and never returns an unbounded result set.
- Feed fetches `limit + 1` rows to derive `nextCursor`.
- Media responses keep existing cache-control behavior from storage resolver.
- Rate-limit checks should run before expensive write operations and uploads
  where possible.
- Avoid N+1 additions in Post/Comment DTO mapping; keep Supabase select joins
  explicit.

## Security Considerations

- Flutter receives only Supabase publishable key, never service role, secret key
  or direct database credentials.
- Access token remains only in `Authorization: Bearer`.
- App integrity remains separate in `X-Bonsai-App-Integrity` and
  `X-Bonsai-Platform`.
- Direct table, private Storage and service-only RPC access from Flutter remains
  forbidden.
- RLS stays enabled as defense-in-depth.
- Community report data is not readable by normal users.
- Error responses avoid SQL, Storage keys, provider internals and moderation
  internals.
- Production HTTPS and Supabase redirect/deep-link configuration must be
  verified outside code before release.

## Rollback Plan

If implementation fails:
1. Revert application-code changes for `/api/v1` routes and helper modules.
2. If local-only migration was applied, reset local Supabase from the external
   project after confirming no needed local data will be lost.
3. Do not run remote Supabase reset/push without separate explicit approval and
   a named backup artifact.
4. Existing Web-App routes under `/api/...` remain the fallback client surface.
5. Flutter migration must not proceed until backend v1 verification is green.

## Validation Checklist

Before marking as complete:

- [x] `implementation.md` is `PLAN-APPROVED` before coding starts.
- [x] All v1 routes listed above exist.
- [x] Existing `/api/...` Web routes are still present and compatible.
- [x] All private Fach-APIs require Bearer Auth through Supabase token
  validation.
- [x] Production app-integrity enforcement is fail-closed.
- [x] Non-Production integrity bypass is explicit and documented.
- [x] Feed pagination uses cursor, default `20`, max `50`, no offset.
- [x] Reminder `CANCELLED` is represented in DB, domain types, validators and
  v1 route behavior.
- [x] Community report endpoints exist, are auth-only, idempotent and
  rate-limited.
- [x] Upload/media v1 routes document and enforce limits/authorization.
- [x] Native profile image upload remains absent/out-of-scope.
- [x] Admin moderation remains absent/out-of-scope.
- [x] `npm test` passes.
- [x] `npm run typecheck` passes.
- [x] `npm run build` passes.
- [x] `npm run supabase:start` and `npm run supabase:reset` pass locally if DB
  changes are implemented.
- [x] `npm run test:db` passes if DB changes are implemented.
- [x] `npm run supabase:types:check` passes after type generation.
- [x] `npm run test:integration` passes or any environment blocker is
  documented.
- [x] Flutter repository has its own Git/workflow/plan structure before Flutter
  code changes.
- [x] Derived Flutter implementation plan exists in the Flutter repository.

## Notes

- The Bonsai repository intentionally does not contain `supabase/`; Supabase CLI
  scripts target the external project via `scripts/supabase-project.ts`.
- Remote Supabase operations require separate explicit approval and backup per
  `docs/supabase-sdk-cutover.md`.
- App Integrity is a misuse barrier, not the security boundary. Every v1 route
  must remain safe against manually crafted HTTP requests.
- `PLAN-APPROVED` is required before moving to implementation.
