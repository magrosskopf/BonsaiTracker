Status: COMPLETE
Last Modified: 2026-07-06

# Implementation Plan: Vereinfachte Bonsai-Erstellung

## Overview

Die Bonsai-Erstellung wird auf einen Schnellstart mit nur einem Pflichtfeld reduziert: `name`. Alle weiteren Angaben werden optional. Damit die gespeicherten Daten keine fachlich falschen Aussagen enthalten, werden `age` und `ownedSince` nullable, `DevelopmentStageEnum` bekommt `UNBEKANNT`, und technische Platzhalter wie `species = Unbekannt`, `location = Unbekannt` und `style = Unbekannt` werden in Anzeigeansichten als fehlende Angabe dargestellt.

Keine Umsetzung erfolgt vor Plan-Freigabe.

## Slice Progress

- 2026-07-05, Issue #8:
  - umgesetzt: Prisma-Datenmodell fuer `age` und `ownedSince` auf nullable vorbereitet, `DevelopmentStageEnum` um `UNBEKANNT` erweitert und eine Migration angelegt.
  - umgesetzt: Backend-Validatoren setzen Defaults fuer Minimal-Payloads und akzeptieren `age = null`, `ownedSince = null`, `developmentStage = UNBEKANNT` sowie `style = Unbekannt`.
  - umgesetzt: Mapper/Form-Helfer sowie Detail-, Feed- und Subentry-Seiten tolerieren `ownedSince = null` mit `createdAt`-Fallback.
  - offen fuer spaetere Slices: Wizard-/Create-UI vereinfachen, weitere `Unbekannt`-/`Nicht angegeben`-Darstellung in allen Ansichten harmonisieren, `nickname` vollstaendig entfernen.
- 2026-07-05, Issue #9:
  - umgesetzt: `nickname` aus Bonsai-Formwerten, Feldkonfiguration, DTO-Mapping sowie Dashboard- und Detailanzeige entfernt.
  - umgesetzt: Bonsai-Suche nutzt nur noch Name, Art, botanischen Namen, Standort, Notizen und `customStyle`, nicht mehr alte `nickname`-Werte.
  - umgesetzt: Tests decken DTO-/Form-Contracts ohne `nickname` und die Suchfeldliste ab.
- 2026-07-05, Issue #11:
  - umgesetzt: Detailformular markiert `species`, `age`, `style`, `ownedSince`, `healthStatus` und `developmentStage` nicht mehr als Pflichtfelder.
  - umgesetzt: `purchasePriceCents` wird im Formular als Euro-Feld mit Dezimal-Eingabe (`12`, `12,50`, `12.50`) behandelt und beim Mapping cent-kompatibel persistiert.
  - umgesetzt: `bonsaiDetailToFormValues` und `bonsaiFormValuesToPayload` behandeln nullable `age`, `ownedSince` und leeren Preis korrekt fuer Edit-PATCH und Form-Roundtrips.
- 2026-07-05, Issue #12:
  - umgesetzt: zentraler Anzeige-Helper behandelt `null`, Leerwerte sowie `Unbekannt`/`UNBEKANNT` konsistent als fehlende Angabe.
  - umgesetzt: Dashboard- und Detailansichten rendern technische Platzhalter nicht mehr als echte Fachwerte.
  - umgesetzt: Bild-Timeline fuer Feed-Composer und Detail-Slideshow nutzt gemeinsame Sortierung mit `ownedSince ?? createdAt`.
- 2026-07-06, Issue #10:
  - umgesetzt: `pages/create-bonsai.tsx` startet jetzt mit einem kompakten Schnellstart-Formular; der Bild-Upload liegt erst danach in einem klar optionalen Abschnitt.
  - umgesetzt: `BonsaiForm` unterscheidet zwischen `create`-Schnellstart und bestehendem `edit`-Wizard; im Create-Modus ist nur `name` fuer den ersten Submit blockierend.
  - umgesetzt: Render-Test deckt den initialen Schnellstart-Zustand ohne dominante Detailfelder/Wizard ab.
  - verifiziert: `npm test` und `npm run typecheck` gruen.
  - offen: `npm run build` wurde mehrfach gestartet, haengt in dieser Umgebung jedoch waehrend `next build` ohne Abschluss und braucht getrennte Nachverfolgung.

## Reference

Spec: [spec.md](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-07-03_vereinfachte-bonsai-erstellung/spec.md)

Key acceptance criteria:

1. Create flow speichert mit nur `name`.
2. `nickname` ist aus Bonsai-UI, DTOs und Suche entfernt.
3. `age` und `ownedSince` sind nullable.
4. `developmentStage` unterstuetzt `UNBEKANNT`.
5. Platzhalterwerte werden als `Nicht angegeben` bzw. `-` angezeigt.
6. Preis wird als Euro-Feld eingegeben, intern kompatibel zu `purchasePriceCents`.
7. Bestehende Bearbeitung und Bilder/Slideshow bleiben funktionsfaehig.

## File Structure

### Create/Modify

- `prisma/schema.prisma`
  - `Bonsai.age` von `Int` auf `Int?`
  - `Bonsai.ownedSince` von `DateTime` auf `DateTime?`
  - `DevelopmentStageEnum` um `UNBEKANNT` erweitern

- `prisma/migrations/<timestamp>_simplify_bonsai_creation/migration.sql`
  - DB-Migration fuer nullable Spalten und Enum-Erweiterung

- `types/domain.ts`
  - `DEVELOPMENT_STAGE_OPTIONS` und Labels um `UNBEKANNT` erweitern
  - `STYLE_OPTIONS` um `Unbekannt` erweitern

- `types/forms.ts`
  - `nickname` aus `BonsaiFormValues` entfernen
  - `age` und `ownedSince` weiter als Formularstrings halten, aber leer als `null` mappen

- `types/dto.ts`
  - `nickname` aus `BonsaiSummary` und `BonsaiDetail` entfernen
  - `age` als `number | null`
  - `ownedSince` als `string | null`

- `lib/config/forms.ts`
  - `nickname` aus Feldkonfiguration entfernen
  - bisherige Pflichtmarker fuer `species`, `age`, `style`, `ownedSince`, `healthStatus`, `developmentStage` entfernen
  - Euro-Preisfeld umbenennen/beschreiben
  - `Unbekannt` Optionen ergaenzen, wo benoetigt

- `lib/forms.ts`
  - Defaultwerte fuer Schnellstart und Detailformular anpassen
  - `bonsaiDetailToFormValues` auf nullable `age`/`ownedSince`
  - `bonsaiFormValuesToPayload` mit `age: null`, `ownedSince: null`
  - Euro-Eingabe in Cent mappen
  - `nickname` nicht mehr mappen

- `lib/validators/bonsai.ts`
  - `nickname` aus Create/Patch-Schema entfernen oder ignorieren
  - `species` und `location` mit Default `Unbekannt`
  - `age` nullable
  - `ownedSince` nullable mit `notInFuture`, wenn gesetzt
  - `style` Default `Unbekannt`
  - `developmentStage` Default `UNBEKANNT`
  - `purchasePriceCents` bleibt technische API-Einheit, falls Payload weiter Cent sendet

- `lib/mappers.ts`
  - `nickname` aus Bonsai-DTO-Mapping entfernen
  - nullable `age` und `ownedSince`
  - optional Helper fuer Anzeige-Platzhalter, falls zentral sinnvoll

- `pages/api/bonsais.ts`
  - Suche entfernt `nickname`
  - Create nutzt Validator-Defaults
  - `developmentStage=UNBEKANNT` als Filterwert akzeptieren

- `pages/api/bonsais/[id].ts`
  - PATCH-Kandidat mit nullable `age`/`ownedSince`
  - bestehende Vollvalidierung bleibt erhalten

- `components/BonsaiForm.tsx`
  - Pflichtlogik auf `name` reduzieren oder zwischen Create- und Edit-Kontext trennen
  - Detailmodus optional machen
  - `nickname` entfernen
  - Euro-Preisfeld rendern
  - leere optionale Felder erlauben

- `components/FormWizard.tsx`
  - Nur aendern, falls der bestehende Wizard fuer Detailmodus weiterverwendet wird und optionale Schritte erlauben muss

- `pages/create-bonsai.tsx`
  - Schnellstart als Default-Ansicht
  - Bilderbereich nach dem Kernformular oder kompakter optionaler Bereich
  - optionaler Detailmodus
  - Submit mit nur `name` moeglich

- `pages/bonsai/edit/[id].tsx`
  - Weiterhin volle Bearbeitung
  - `nickname` nicht mehr anzeigen
  - nullable Felder korrekt laden/speichern

- `pages/dashboard.tsx`
  - `nickname` entfernen
  - `Unbekannt`/null-Werte als `Nicht angegeben`/`-`

- `pages/bonsai/[id].tsx`
  - `nickname` entfernen
  - `age = null`, `ownedSince = null`, `species/location/style = Unbekannt` als fehlende Angabe anzeigen
  - Slideshow-Fallback fuer initiale Bilder: `ownedSince ?? createdAt`

- `pages/api/posts.ts`, `pages/api/posts/[id].ts`
  - Snapshot mit `species = Unbekannt` bleibt erlaubt
  - keine private Datenfreigabe aendern

- Feed/Profile UI-Dateien, falls `snapshotSpecies` angezeigt wird
  - `Unbekannt` visuell als fehlende Angabe behandeln

- `lib/api/validation.ts`
  - Feldlabel `nickname` entfernen
  - Labels fuer geaenderte Felder pruefen

- Tests in `tests/*.test.ts`
  - Validator-/Form-Mapping-Tests fuer Schnellstart-Defaults
  - Tests fuer nullable `age`/`ownedSince`
  - Tests fuer `UNBEKANNT` DevelopmentStage
  - Tests fuer Euro-zu-Cent-Mapping
  - Tests fuer `nickname` Entfernung aus DTO/Suche, soweit sinnvoll isolierbar

## Implementation Steps

### Step 1: Data Model Migration

Goal: Datenmodell kann fachlich fehlende Angaben speichern.

Actions:

1. `prisma/schema.prisma` anpassen:
   - `age Int?`
   - `ownedSince DateTime?`
   - `DevelopmentStageEnum` um `UNBEKANNT`
2. Migration erstellen:
   - PostgreSQL enum um `UNBEKANNT` erweitern.
   - `Bonsai.age` nullable machen.
   - `Bonsai.ownedSince` nullable machen.
3. Prisma Client generieren.

Notes:

- Bestehende Datensaetze behalten ihre Werte.
- Kein Backfill auf `UNBEKANNT`, weil die Spec nur fehlende neue Eingaben betrifft.

### Step 2: Domain Types and DTO Contracts

Goal: TypeScript bildet neue fachliche Optionalitaet ab.

Actions:

1. `types/domain.ts`:
   - `DEVELOPMENT_STAGE_OPTIONS = ["UNBEKANNT", "ROHLING", ...]`
   - Label `UNBEKANNT: "Unbekannt"`
   - `STYLE_OPTIONS` um `"Unbekannt"` erweitern.
2. `types/dto.ts`:
   - `nickname` aus Bonsai DTOs entfernen.
   - `age: number | null`
   - `ownedSince: string | null`
3. `lib/mappers.ts`:
   - DTOs entsprechend mappen.
   - `ownedSince?.toISOString() ?? null`.

### Step 3: Form Data Mapping

Goal: Formularwerte koennen leer bleiben und werden korrekt persistiert.

Actions:

1. `types/forms.ts`:
   - `nickname` entfernen.
   - bestehende stringbasierte Eingabewerte fuer optionale Felder beibehalten.
2. `lib/forms.ts`:
   - `emptyBonsaiFormValues`:
     - `species: ""`
     - `location: ""`
     - `age: ""`
     - `style: "Unbekannt"` oder `""` mit Mapping auf `"Unbekannt"`
     - `ownedSince: ""`
     - `developmentStage: "UNBEKANNT"`
   - `bonsaiDetailToFormValues` nullable-sicher machen.
   - `bonsaiFormValuesToPayload`:
     - leere `species` -> `"Unbekannt"`
     - leere `location` -> `"Unbekannt"`
     - leere `age` -> `null`
     - leere `style` -> `"Unbekannt"`
     - leere `ownedSince` -> `null`
     - leere `developmentStage` -> `"UNBEKANNT"`
     - Euro-Preisstring nach `purchasePriceCents` konvertieren.
3. Hilfsfunktionen fuer Euro-Parsing ergaenzen:
   - Akzeptiert `12`, `12,50`, `12.50`.
   - Leere Eingabe -> `null`.
   - Ungueltige Eingaben muessen Validierungsfehler erzeugen oder vom Number-Input verhindert werden.

### Step 4: Validation

Goal: API akzeptiert Schnellstart, schuetzt aber weiterhin Datenqualitaet.

Actions:

1. `lib/validators/bonsai.ts`:
   - `name` bleibt required.
   - `nickname` wird nicht mehr Bestandteil des erlaubten Create-/Patch-Schemas.
   - `species` und `location` optional/default `"Unbekannt"`.
   - `age` nullable integer `0..200`, leer/null erlaubt.
   - `style` default `"Unbekannt"`.
   - `ownedSince` nullable date mit `notInFuture`, wenn gesetzt.
   - `developmentStage` default `"UNBEKANNT"`.
2. `bonsaiPersistedSchema.superRefine`:
   - `customStyle` nur fuer `style === "Sonstiger"`.
   - Bei `style === "Unbekannt"` darf `customStyle` nicht gesetzt sein.
   - `nextRepotDue >= lastRepotDate` bleibt unveraendert.
3. `lib/api/validation.ts`:
   - `nickname` Label entfernen.
   - Preislabel auf Euro-UI pruefen.

### Step 5: API Integration

Goal: REST-Endpunkte bleiben kompatibel und setzen neue Regeln durch.

Actions:

1. `pages/api/bonsais.ts`:
   - `nickname` aus Such-OR entfernen.
   - Create-Parsing unveraendert ueber `bonsaiCreateSchema`, aber Schema setzt Defaults.
   - Filtervalidierung akzeptiert `developmentStage=UNBEKANNT`.
2. `pages/api/bonsais/[id].ts`:
   - Merge von `existing` und `patch` nullable-sicher machen.
   - Bei Patch ohne `age`/`ownedSince` bestehende Werte erhalten.
   - Bei Patch mit `age: null` oder `ownedSince: null` Werte loeschen.
   - `nickname` Patch wird abgelehnt, falls strict Schema verwendet wird.

### Step 6: Create UI

Goal: Schnellstart ist Standard und wirklich schnell.

Actions:

1. `pages/create-bonsai.tsx` umbauen:
   - Kernformular zuerst: Name, Submit.
   - Optionaler Detailmodus per sekundarem Button/Disclosure.
   - Bilderbereich nach Kernformular oder in optionalem Abschnitt.
2. `components/BonsaiForm.tsx` anpassen oder neue create-spezifische Komponente einfuehren:
   - Falls bestehende Komponente geteilt bleibt: Props fuer `mode="create" | "edit"`.
   - Create-Modus: nur Name validiert Pflicht.
   - Edit-/Detailmodus: alle Felder optional, keine Step-Sperre durch leere optionale Felder.
3. UX-Regel:
   - Kein langer Wizard beim ersten Laden.
   - Detailmodus darf nicht dominant sein.
   - Submit-Button sichtbar ohne Scroll-Orgie auf mobilen Viewports.

### Step 7: Edit UI

Goal: Vollstaendige Bearbeitung bleibt erhalten, aber neue Optionalitaet wird respektiert.

Actions:

1. `pages/bonsai/edit/[id].tsx`:
   - `nickname` nicht anzeigen.
   - Formular initialisiert nullable Werte als leere Eingaben.
2. `components/BonsaiForm.tsx`:
   - `age` und `ownedSince` optional.
   - `developmentStage` kann `UNBEKANNT`.
   - `style` kann `Unbekannt`.
   - Preisfeld zeigt Euro statt Cent.

### Step 8: Display UI and Placeholders

Goal: Technische Platzhalter wirken nicht wie bewusste Nutzerangaben.

Actions:

1. Helper definieren, z. B. lokal oder in `lib/forms.ts`/neuem UI Helper:
   - `displayText(value)` fuer `null`, `""`, `"Unbekannt"` -> `Nicht angegeben` oder `-`.
   - `displayAge(age)` fuer `null` -> `Nicht angegeben`, sonst `${age} Jahre`.
2. `pages/dashboard.tsx`:
   - `nickname` entfernen.
   - Art/Standort/Stil/Status mit Platzhalterlogik.
3. `pages/bonsai/[id].tsx`:
   - `nickname` entfernen.
   - Alter und Besitzdatum nullable-sicher.
   - `species`, `location`, `style` Platzhalterlogik.
   - Slideshow-Datum `ownedSince ?? createdAt`.
4. Feed/Profile UI:
   - `snapshotSpecies === "Unbekannt"` als fehlende Angabe anzeigen oder ausblenden.

### Step 9: Community Snapshot Compatibility

Goal: Schnellerstellte Bonsais koennen geteilt werden, ohne falsche Art prominent zu machen.

Actions:

1. `pages/api/posts.ts` und `pages/api/posts/[id].ts` pruefen:
   - Snapshot darf `snapshotSpecies: "Unbekannt"` behalten.
   - Keine Validator-Aenderung noetig, wenn Post-Schema keine Art prueft.
2. Feed/Profile Anzeige:
   - `snapshotSpecies = "Unbekannt"` nicht als konkrete Art hervorheben.

### Step 10: Tests

Goal: Akzeptanzkriterien werden automatisiert abgesichert.

Actions:

1. `tests/validators.test.ts` erweitern:
   - `bonsaiCreateSchema` akzeptiert Payload mit nur `name`.
   - Defaults:
     - `species = "Unbekannt"`
     - `location = "Unbekannt"`
     - `indoorOutdoor = "OUTDOOR"`
     - `age = null`
     - `style = "Unbekannt"`
     - `ownedSince = null`
     - `healthStatus = "UNBEKANNT"`
     - `developmentStage = "UNBEKANNT"`
   - gesetztes `ownedSince` wird weiter normalisiert und Zukunft verboten.
   - `customStyle` Regeln bleiben gueltig.
2. Neue oder bestehende Form-Mapping-Tests:
   - Euro-Preis `12,50` -> `1250`.
   - Leerer Preis -> `null`.
   - nullable `age`/`ownedSince` aus Detail zu Formular.
3. Mapper-/DTO-Tests, falls bestehende Teststruktur passt:
   - `nickname` wird nicht gemappt.
   - nullable `ownedSince` wird `null`.
4. Optional UI-Utility-Tests:
   - `"Unbekannt"` -> `Nicht angegeben`.
   - `age null` -> `Nicht angegeben`.

## Code Architecture

### Data Layer

Prisma bleibt Quelle fuer Persistenz. Zwei bestehende Bonsai-Spalten werden nullable, ein Enum wird erweitert. `nickname` bleibt in der DB, wird aber von API/UI nicht mehr verwendet, damit die Aenderung risikoarm bleibt.

### Validation Layer

`lib/validators/bonsai.ts` ist die zentrale Grenze fuer Create/Patch. Schnellstart-Defaults sollten bevorzugt dort oder in `lib/forms.ts` gesetzt werden. Empfehlung:

- Client setzt Defaults fuer vorhersehbare UX.
- API-Validator setzt dieselben Defaults als Sicherheitsnetz.

### Form Layer

`lib/forms.ts` bleibt die Mapping-Schicht zwischen UI-Strings und API-Payload. Euro-Preislogik gehoert hierhin, nicht in JSX.

### UI Layer

Create und Edit duerfen dieselbe Feldkonfiguration nutzen, aber unterschiedliche Einstiegserlebnisse haben:

- Create: Schnellstart zuerst.
- Edit/Detailmodus: voller Feldumfang.

Falls die bestehende `BonsaiForm` dadurch zu viele Modus-Abzweige bekommt, ist eine kleine `QuickBonsaiCreateForm` Komponente sinnvoller als eine schwer lesbare generische Komponente.

## Technical Decisions

1. `age` wird nullable statt `0` als Platzhalter.
2. `ownedSince` wird nullable statt automatisches heutiges Datum.
3. `developmentStage` bekommt `UNBEKANNT`, weil `ROHLING` fachlich zu stark waere.
4. `indoorOutdoor` bleibt `OUTDOOR`, weil der Nutzer diese Vorgabe explizit bestaetigt hat.
5. `species`, `location`, `style` speichern `"Unbekannt"`, werden aber in Anzeigen als fehlende Angabe behandelt.
6. `nickname` wird nicht migriert oder geloescht, aber aus Bonsai-Funktion entfernt.
7. Preis bleibt intern `purchasePriceCents`, UI arbeitet mit Euro.

## Integration Points

- Dashboard nutzt `BonsaiSummary`; DTO-Aenderungen muessen dort synchron landen.
- Detailseite nutzt `BonsaiDetail`; nullable Daten duerfen keine `new Date(null)` oder `.slice()` Fehler erzeugen.
- Slideshow nutzt aktuell `ownedSince`; Fallback auf `createdAt` ist Pflicht.
- Posts speichern `snapshotSpecies`; Anzeige muss `"Unbekannt"` als fehlende Angabe behandeln.
- API-Filter fuer `developmentStage` nutzt `DEVELOPMENT_STAGE_OPTIONS`; Enum-Erweiterung reicht dort aus.

## Edge Cases & Error Handling

1. Create mit leerem Namen:
   - UI blockiert.
   - API gibt konkreten Validierungsfehler zurueck.
2. Create mit nur Name:
   - API speichert Defaults/nulls.
   - Redirect auf Detail.
3. Edit setzt `ownedSince` von Datum auf leer:
   - API speichert `null`.
   - Detail zeigt nicht angegeben.
4. Edit setzt `age` von Zahl auf leer:
   - API speichert `null`.
5. `style = Sonstiger` ohne `customStyle`:
   - Weiterhin Validierungsfehler.
6. `style = Unbekannt` mit `customStyle`:
   - `customStyle` wird entfernt oder abgelehnt; Plan empfiehlt ablehnen/normalisieren analog bestehender Logik.
7. Initiale Bilder ohne `ownedSince`:
   - Slideshow sortiert mit `createdAt`, keine Invalid-Date Anzeige.
8. Alte Bonsais mit `nickname`:
   - DB-Werte bleiben, werden aber nicht mehr angezeigt/gesucht/ausgeliefert.
9. Feed-Post mit unbekannter Art:
   - Anzeige behandelt Art als fehlende Angabe.

## Test Strategy

Run after implementation:

```bash
npm test
npm run typecheck
npm run build
```

Focused automated coverage:

- Validator tests for minimal create payload.
- Validator tests for nullable `age` and `ownedSince`.
- Form mapping tests for Euro price conversion.
- Mapper tests or TypeScript coverage for DTO shape without `nickname`.
- UI utility tests for placeholder display, if helper is extracted.

Manual verification:

1. Login and open `/create-bonsai`.
2. Confirm only name is required on first view.
3. Create with only a name.
4. Confirm detail page loads and shows missing values as `Nicht angegeben`/`-`.
5. Edit the Bonsai and add age, ownedSince, species, location, style, developmentStage.
6. Confirm saved values display correctly.
7. Upload initial image and confirm slideshow works when `ownedSince` is empty.
8. Confirm dashboard no longer shows nickname and handles unknown placeholders.

## Validation Checklist

- [x] Spec status is `APPROVED`.
- [x] Implementation plan status is approved before coding.
- [x] Prisma migration exists and is reviewed.
- [x] Prisma client regenerated.
- [x] `nickname` removed from Bonsai DTOs, UI and search.
- [x] Create flow accepts only name.
- [x] Full edit flow remains available.
- [x] `age` and `ownedSince` nullable across DB, DTO, mapper, forms and validators.
- [x] `DevelopmentStageEnum.UNBEKANNT` works in DB, domain types, filters and UI labels.
- [x] Euro price input maps correctly to `purchasePriceCents`.
- [x] Placeholder display covers null and `"Unbekannt"` values.
- [x] Slideshow handles `ownedSince = null`.
- [x] `npm test` passes.
- [x] `npm run typecheck` passes.
- [x] `npm run build` passes.

## Non-Goals

- No implementation before `PLAN-APPROVED`.
- No deletion of the physical `nickname` DB column in this feature.
- No changes to auth, reminders, timeline entry model, storage backend or community permissions.
- No AI, onboarding tutorial or import feature.
