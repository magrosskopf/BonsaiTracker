0) Zielzustand (Definition of Done – harte Gates)

Die Arbeit gilt erst als abgeschlossen, wenn alle Punkte erfüllt sind: 

SPEC

npm run build ✅

TypeScript strict ohne Fehler ✅

Prisma Schema + Migrationen konsistent ✅

Alle APIs aus Abschnitt 7 implementiert + Ownership auf jeder Business-Route ✅

Alle Seiten/Flows aus Abschnitt 9 funktionsfähig ✅

Upload-Limits & MIME-Check serverseitig ✅

.env.example vollständig (ohne echte Secrets) ✅

Keine App-Router-Artefakte im Pages-Projekt ✅

Manuelle Kernflows geprüft: Login → Dashboard → Create → Edit → SubEntry → Delete → Logout ✅ 

SPEC

1) Arbeitsmodus (damit “first try” gelingt)

Regeln für den Assistenten (verbindlich): 

CODING_ASSISTANT_PROMPT

SPEC ist Source of Truth. Bestehender Code wird angepasst/entfernt, wenn er widerspricht. 

SPEC

Reihenfolge strikt einhalten: DB → Auth → API → UI → Upload → Tests → Build/Deploy. 

SPEC

Nach jeder Phase: Typecheck + Build-Smoke (Gate).

Kein Improvisieren bei DTOs/Statuscodes/Error-Format – exakt wie SPEC. 

SPEC

2) Phase 1 — Repo-Iststand scannen & “Kill the Drift”

Ziel: Alle Abweichungen zur SPEC sichtbar machen und App-Router-Reste eliminieren. 

SPEC

2.1 Inventur-Checkliste

Projektstruktur prüfen: nur pages/* für UI, nur pages/api/* für APIs. 

SPEC

Suche nach App-Router-Artefakten (Beispiele aus SPEC):

pages/layout.tsx, pages/**/page.tsx, app/ Ordner o. ä. → entfernen oder sauber migrieren. 

SPEC

TypeScript-Buildfehler identifizieren (im SPEC erwähnt: isUploading, signOut Import etc.) und als Tickets notieren. 

SPEC

Prisma-Drift identifizieren: Felder wie ownedSince, style, addedDate etc. abgleichen. 

SPEC

2.2 Output dieser Phase (Artefakte)

docs/IMPLEMENTATION_NOTES.md (kurz):

gefundene Abweichungen + Entscheidung „remove vs refactor“

Liste der zu ändernden Routen/Modelle/Pages

Gate

Repo kompiliert evtl. noch nicht – aber: keine neuen Änderungen ohne Plan für Schema/API-Kontrakte.

3) Phase 2 — Datenmodell & Migrationen (Prisma “Single Source of Truth”)

Ziel: Prisma Schema exakt nach SPEC, Migrationen sauber, Client generiert. 

SPEC

3.1 Prisma-Soll implementieren

Implementiere/angleiche in prisma/schema.prisma:

User + NextAuth Tabellen (Account/Session/VerificationToken) wie Adapter.

Bonsai Modell inkl.:

userId, deletedAt, alle Pflichtfelder, Enums, images String[] default [], Timestamps. 

SPEC

SubEntry Modell inkl.:

images String[] default [], performedActions String[] default [], FK, Timestamps. 

SPEC

Enums: IndoorOutdoorEnum, HealthStatusEnum, DevelopmentStageEnum, WinterHardinessEnum, SunExposureEnum, EntryTypeEnum. 

SPEC

DB-Regeln berücksichtigen:

Bonsai soft delete via deletedAt, Standardqueries filtern deletedAt = null. 

SPEC

3.2 Migrationen

Neue Migration erstellen und anwenden:

npx prisma migrate dev

npx prisma generate

Falls bestehende Migrationen kaputt/drift:

konsolidieren (notfalls reset in Dev) – aber mit sauberer Historie für Deployment.

3.3 Prisma Singleton

lib/prisma.ts erstellen/vereinheitlichen:

Singleton Pattern

kein $disconnect() pro Request. 

SPEC

Gate (hart)

npx prisma validate ✅

npx prisma generate ✅

TypeScript darf hier schon laufen (noch ohne vollständige UI).

4) Phase 3 — Auth Foundation (NextAuth Magic Link + Resend)

Ziel: verlässliche Session-Beschaffung und ein zentraler Helper, den alle APIs nutzen. 

SPEC

4.1 Implementationspunkte

NextAuth Config in pages/api/auth/[...nextauth].ts

EmailProvider mit Resend als Transport (gemäß env Vars). 

SPEC

lib/auth.ts

getServerAuthSession(req, res) helper

Session muss user.id liefern (Adapter korrekt + Type Augmentation, z. B. types/next-auth.d.ts). 

SPEC

4.2 Environment

.env.example anlegen/aktualisieren:

DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, EMAIL_FROM, RESEND_API_KEY 

SPEC

Gate

Login Flow lokal testbar (Magic Link Versand kann in Dev “stubbed” werden, aber Konfiguration darf nicht brechen).

Minimaler Auth-Smoke: /api/auth/session liefert Session nach Login.

5) Phase 4 — API Layer (einheitliche Response-Form + Ownership überall)

Ziel: Alle Endpunkte aus SPEC Abschnitt 7 implementieren; konsistente DTOs & Fehlerformat. 

SPEC

5.1 Fundament: Response Helper + Error Codes

lib/api/response.ts:

ok(res, data, status=200) → { ok: true, data }

fail(res, code, message, status, details?) → { ok:false, error:{...}} 

SPEC

5.2 Zod Validatoren

lib/validators/bonsai.ts, lib/validators/subentry.ts, lib/validators/upload.ts

Datum-Normalisierung: Eingabe YYYY-MM-DD → Server speichert T00:00:00.000Z in UTC. 

SPEC

5.3 Ownership Helper

lib/authz.ts (oder lib/api/authz.ts):

requireUser(req,res) → liefert userId oder 401

getOwnedBonsaiOr404(bonsaiId,userId) filtert auch deletedAt=null

getOwnedSubEntryOr404(subEntryId,userId) via Join auf Bonsai.userId + Bonsai.deletedAt=null 

SPEC

5.4 Endpunkte implementieren (exakte Reihenfolge)

Implementiere exakt diese Routen: 

SPEC

GET /api/bonsais (Cursor Pagination, Filter, updatedAt DESC, id DESC)

POST /api/bonsais (validieren, create, 201)

GET /api/bonsais/:id (Detail + subEntries sortiert)

PATCH /api/bonsais/:id (partial update, customStyle Regeln, images replace)

DELETE /api/bonsais/:id (soft delete, 204)

GET /api/subentries?bonsaiId=...

POST /api/subentries (multipart/form-data + images max 5)

PATCH /api/subentries/:id (keepImages[] + newImages[] max 5 total)

DELETE /api/subentries/:id (physical delete, 204)

POST /api/upload (Legacy, nur file speichern + Ownership, gibt filePath zurück)

5.5 DTOs zentralisieren

types/domain.ts (Enums)

types/dto.ts (BonsaiSummary, BonsaiDetail, SubEntryDto, Cursor Types)

Alle APIs geben DTOs exakt so zurück wie in SPEC. 

SPEC

Gate (hart)

Minimal Integrationtests oder Script-Tests:

Unauth → 401

Fremdzugriff → 404

Validation → 422

Upload >5MB → 413

falsches MIME → 415 

SPEC

6) Phase 5 — Upload Handling (multer, Limits, sichere Namen)

Ziel: Upload sicher, deterministisch, kompatibel mit public/uploads. 

SPEC

6.1 Technische Umsetzung

pages/api/* Routen mit multer:

Storage: public/uploads

Filename: ${Date.now()}-${slug(originalname)}.ext

Limits: 5MB pro Datei, max 5 Dateien

MIME allowlist: jpeg/png/(optional webp) 

SPEC

Rückgabe: immer relativer Public-Pfad /uploads/...

6.2 Konsistenzregeln

POST /api/upload aktualisiert Bonsai nicht (Legacy) 

SPEC

POST/PATCH subentries und PATCH bonsai können images setzen/ersetzen wie beschrieben.

Gate

Upload “happy path” + invalid path (size/type) getestet.

7) Phase 6 — UI (Pages Router) + DaisyUI konsistent

Ziel: Alle Routen aus SPEC Abschnitt 9 funktionieren, UI konsistent, deutsch, mobile-first. 

SPEC

7.1 UI-Grundlagen

Gemeinsame Layout-Hülle per Komponenten (Pages Router):

components/Layout.tsx

components/BottomNav.tsx (DaisyUI Dock)

components/Alert.tsx, components/Loader.tsx, components/ConfirmModal.tsx

7.2 Seiten in Implementationsreihenfolge

/ Landing/Login (Session-Status, Login CTA, Logout)

/dashboard

Infinite Scroll + Cursor

States: loading/empty/error

/create-bonsai

Formular, Live-Validierung, Style → Sonstiger zeigt customStyle

/bonsai/[id] Detail

Anzeige + Galerie (swiper)

Aktionen: Edit, SubEntry, Delete (Modal)

/bonsai/edit/[id]

Prefill, Bilder hinzufügen/entfernen (Form state)

/bonsai/[id]/subentries

Timeline/List + Create (multipart)

Edit/Delete pro SubEntry (Modal oder inline)

/profile (Name/E-Mail, Logout) 

SPEC

7.3 UI ↔ API Contract

Jede Seite nutzt nur API-DTO Felder aus SPEC, keine “phantom fields” wie addedDate. 

SPEC

Client-seitige Validierung ergänzend, aber Server ist führend.

Gate

Manuelle UI-Flows (mindestens einmal end-to-end) funktionieren ohne Console Errors.

8) Phase 7 — Tests (minimal aber zielgerichtet) + Build Gates

Ziel: Schutz gegen Regressionen (Ownership, Validierung, Cursor, Upload). 

SPEC

8.1 Unit Tests

Zod Schemas: Bonsai/SubEntry/Upload

Cursor encode/decode (Base64URL JSON) 

SPEC

8.2 API Integrationtests

CRUD Bonsai

CRUD SubEntry (inkl. keepImages/newImages semantics)

Ownership enforcement (User A kann User B nicht lesen/schreiben → 404)

Upload size/type checks 

SPEC

8.3 E2E (optional, wenn Setup vorhanden)

Login → Create → Detail → SubEntry → Delete → Logout 

SPEC

Gate (hart)

npm test (oder npm run test) ✅

npm run build ✅

9) Phase 8 — Deployment Readiness (ohne Überraschungen)

Ziel: Projekt ist “drop-in deployable”: env, migrations, start, filesystem. 

SPEC

9.1 Produktions-Checkliste

.env.example korrekt (keine echten Werte) 

SPEC

NEXTAUTH_URL muss in Prod korrekt gesetzt sein (Domain)

NEXTAUTH_SECRET gesetzt

DB Migration Runbook:

npx prisma migrate deploy

npx prisma generate (falls nötig im Build)

Upload-Verzeichnis:

sicherstellen, dass public/uploads in der Deployment-Umgebung beschreibbar ist

(wenn Plattform read-only FS hat: klar dokumentieren als Constraint) 

SPEC

9.2 “No debug logs”

Entferne console.log in Production Pfaden. 

SPEC

9.3 Finaler Smoke

Fresh install:

npm ci

npm run build

npm start

Kernseiten aufrufen, 401/404/422 Verhalten stichprobenartig prüfen.

10) Abschluss-Dokumentation (kurz, aber vollständig)

Ziel: Nachvollziehbarkeit für dich und jeden Reviewer. 

CODING_ASSISTANT_PROMPT

Erstelle/aktualisiere docs/CHANGELOG_IMPLEMENTATION.md mit:

Liste geänderter/neu angelegter Dateien

Welche SPEC-Kapitel dadurch erfüllt wurden

Offene Risiken (z. B. Upload-Filesystem Constraints in Prod)

Genaue Commands für Build/Deploy:

npm run build

npx prisma migrate deploy

npm start

