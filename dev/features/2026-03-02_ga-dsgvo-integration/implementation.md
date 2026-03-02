Status: IN_REVIEW
Last Modified: 2026-03-02

# Implementation Plan: DSGVO-konforme Google-Analytics-Integration mit Rechtstexten

## Overview

Die bestehende Next.js-Anwendung bekommt eine zentrale Consent-Schicht fuer optionales Analytics-Tracking, sichtbare Rechtslinks im UI sowie zwei statische Rechtstextseiten. Google Analytics wird nur nach aktivem Opt-in geladen und bleibt ohne konfigurierte Mess-ID vollstaendig deaktiviert.

Die Umsetzung bleibt bewusst klein und lokal:
- kein externes CMP
- kein Server-Consent-Backend
- keine automatische Rechtsberatung

## Reference

Spec: `/work/dev/features/2026-03-02_ga-dsgvo-integration/spec.md`

Besonders relevante Acceptance Criteria:
- AC 1-6: Banner, Speicherung, Opt-in/Opt-out und spaetere Aenderbarkeit
- AC 7-9: `/datenschutz`, `/impressum` und sichtbare UI-Verlinkung
- AC 10: Typecheck und Build bleiben gruen

## Definition of Done

Die Arbeit ist erst abgeschlossen, wenn alle folgenden Punkte erfuellt sind:

1. Der Cookie-Banner erscheint bei fehlender Entscheidung auf der Client-Seite.
2. Die Consent-Entscheidung wird gespeichert und bei spaeteren Seitenaufrufen wiederverwendet.
3. Google Analytics wird nur mit Opt-in und nur bei gesetzter `NEXT_PUBLIC_GA_MEASUREMENT_ID` geladen.
4. Consent kann spaeter ueber einen sichtbaren Einstieg erneut geaendert werden.
5. `/impressum` und `/datenschutz` sind statische Seiten mit den gelieferten Angaben.
6. Die Rechtslinks sind fuer anonyme und eingeloggte Nutzer sichtbar erreichbar.
7. `npm run typecheck` und `npm run build` laufen erfolgreich.

## Current State Context

Bereits vorhanden:
- globales App-Shell in `/work/pages/_app.tsx`
- oeffentliche Landingpage in `/work/pages/index.tsx`
- Bottom-Navigation fuer eingeloggte Nutzer in `/work/components/Navigation.tsx`
- globale Styles in `/work/styles/globals.css`
- `.env.example` als Vorlage fuer oeffentliche Runtime-Konfiguration

Noch nicht vorhanden:
- Consent-State und Consent-UI
- zentraler Analytics-Loader
- Footer oder andere globale Rechtslink-Flaeche
- statische Seiten fuer Impressum und Datenschutz

## File Structure

Neu zu erstellen:
- `/work/lib/consent.ts`
- `/work/components/CookieBanner.tsx`
- `/work/components/Analytics.tsx`
- `/work/components/LegalFooter.tsx`
- `/work/pages/impressum.tsx`
- `/work/pages/datenschutz.tsx`

Zu aendern:
- `/work/pages/_app.tsx`
- `/work/pages/index.tsx`
- `/work/components/Navigation.tsx`
- `/work/styles/globals.css`
- `/work/.env.example`

Optional nur falls zur sauberen Kapselung noetig:
- `/work/components/LegalLayout.tsx`

## Code Architecture

### 1. Consent-Modell

`lib/consent.ts` kapselt:
- Consent-Schluessel fuer `localStorage`
- erlaubte Werte fuer den Analytics-Status
- Lesen, Schreiben und Initialzustand

Vorgesehene Form:
- `type AnalyticsConsent = "accepted" | "rejected" | "unset"`
- Konstanten fuer Storage-Key
- kleine Browser-Guard-Utilities, damit kein Zugriff auf `window` waehrend SSR passiert

### 2. Globaler Consent- und Analytics-Flow

`pages/_app.tsx` wird zur zentralen Integrationsstelle:
- Consent-State auf Client initial laden
- `CookieBanner` rendern, wenn Consent `unset`
- `Analytics` rendern, wenn Consent `accepted`
- `LegalFooter` immer rendern, damit Rechtslinks und Consent-Neuoeffnung global verfuegbar bleiben

Der State bleibt lokal im App-Root und wird per Props an Banner/Footer/Analytics weitergereicht. Fuer dieses Feature ist kein React Context noetig.

### 3. Google-Analytics-Integration

`components/Analytics.tsx`:
- liest `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`
- rendert ohne Mess-ID gar nichts
- rendert bei vorhandener Mess-ID die noetigen `next/script`-Tags erst nach Consent
- initialisiert `gtag` defensiv nur im Browser

Die Integration umfasst nur Pageview-Basisinitialisierung. Keine zusaetzlichen Custom Events in diesem Feature.

### 4. Rechtsseiten

`pages/impressum.tsx`:
- statische Anbieterkennzeichnung
- uebernommene Haftungs- und Urheberrechtsabschnitte

`pages/datenschutz.tsx`:
- verantwortliche Stelle und Kontakt
- Beschreibung technischer Datenverarbeitung in der App in allgemeiner Form
- Abschnitt zu Google Analytics nur auf Einwilligungsbasis
- Hinweis auf lokale Consent-Speicherung und Widerruf ueber den UI-Einstieg

### 5. Sichtbarkeit im UI

`components/LegalFooter.tsx`:
- Links zu `/impressum` und `/datenschutz`
- Button oder Link `Cookie-Einstellungen`
- so platziert, dass er sowohl auf der Landingpage als auch in eingeloggten Screens sichtbar bleibt

Da die App fuer eingeloggte Nutzer eine Bottom-Navigation hat, bekommt der Footer genug unteren Abstand, damit beides erreichbar bleibt.

## Technical Decisions

1. Consent wird fuer dieses Feature in `localStorage` gespeichert, weil nur clientseitige Script-Steuerung benoetigt wird.
2. Es wird bewusst kein Cookie fuer Consent gesetzt, solange keine serverseitige Consent-Auswertung gebraucht wird.
3. Google Analytics wird mit `next/script` eingebunden, weil das in Next.js fuer Dritt-Skripte sauber und kontrolliert ist.
4. Ohne `NEXT_PUBLIC_GA_MEASUREMENT_ID` bleibt `Analytics` ein No-op.
5. Die Rechtslinks werden ueber einen globalen Footer statt ueber die bestehende Bottom-Navigation geloest, damit sie auch anonymen Besuchern sichtbar sind.
6. Die Rechtstexte werden als statische React-Seiten gepflegt und nicht aus CMS oder Markdown geladen.

## Integration Points

1. `pages/_app.tsx`
   - Consent-State laden
   - `Analytics`, `CookieBanner` und `LegalFooter` einhaengen

2. `components/Navigation.tsx`
   - keine Rechtslinks aufnehmen, damit die Bottom-Navigation fokussiert bleibt
   - auf Abstaende mit Footer/Banner achten

3. `pages/index.tsx`
   - Landingpage darf durch globalen Footer/Banner nicht layouttechnisch brechen

4. `styles/globals.css`
   - Styles fuer Footer, Banner und rechtliche Textseiten ergaenzen

5. `.env.example`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID=""` dokumentieren

## Implementation Steps

### Step 1: Consent-Utility und globale Integration vorbereiten

Ziel:
- zentrale Consent-Logik schaffen und im App-Root verankern

Arbeiten:
- `lib/consent.ts` anlegen
- Consent-State in `pages/_app.tsx` initialisieren
- Handler fuer `accept analytics`, `reject analytics` und `open settings` definieren

Ergebnis:
- App kennt den aktuellen Consent-Zustand konsistent

### Step 2: Cookie-Banner und Einstellungszugriff bauen

Ziel:
- Erstentscheidung und spaetere Aenderung im UI ermoeglichen

Arbeiten:
- `components/CookieBanner.tsx` erstellen
- `components/LegalFooter.tsx` mit `Impressum`, `Datenschutz` und `Cookie-Einstellungen` erstellen
- Banner nur bei `unset` zeigen
- Footer-Einstieg oeffnet Banner oder Settings-Ansicht erneut

Ergebnis:
- Consent ist fuer Erstbesucher sichtbar und spaeter aenderbar

### Step 3: Analytics sauber an Consent koppeln

Ziel:
- GA nur nach Opt-in und nur mit Mess-ID laden

Arbeiten:
- `components/Analytics.tsx` erstellen
- `next/script` fuer `gtag.js` und Initialisierung nutzen
- Guard fuer leere oder fehlende `NEXT_PUBLIC_GA_MEASUREMENT_ID`

Ergebnis:
- kein Analytics ohne Zustimmung
- kein Laufzeitfehler ohne Konfiguration

### Step 4: Rechtstextseiten anlegen

Ziel:
- statische Pflichtseiten mit gelieferten Angaben verfuegbar machen

Arbeiten:
- `/impressum` erstellen
- `/datenschutz` erstellen
- gelieferte Kontaktdaten und Rechtstextbausteine integrieren
- Hinweis auf spaetere manuelle Pflege der Texte im Code belassen

Ergebnis:
- beide Seiten sind direkt aufrufbar und verlinkbar

### Step 5: Styling und Layout absichern

Ziel:
- Banner, Footer und rechtliche Seiten in die vorhandene Bonsai-Optik integrieren

Arbeiten:
- Styles in `styles/globals.css` ergaenzen
- auf mobile Lesbarkeit, Sticky-Banner-Verhalten und Footer-Abstand achten
- pruefen, dass Bottom-Navigation nicht mit Footer/Banner kollidiert

Ergebnis:
- Feature wirkt integriert und bleibt auf kleinen Screens bedienbar

### Step 6: Konfiguration und Abschlusschecks

Ziel:
- Konfiguration dokumentieren und Build-Sicherheit pruefen

Arbeiten:
- `.env.example` erweitern
- `npm run typecheck`
- `npm run build`

Ergebnis:
- technische Vorbereitung fuer spaetere Mess-ID ist dokumentiert

## Edge Cases & Error Handling

1. `localStorage` ist im SSR nicht verfuegbar:
   - Consent erst im Client lesen
   - defensiver Fallback auf `unset`

2. `localStorage` wirft Fehler oder ist blockiert:
   - Fehler still behandeln
   - Banner bei Bedarf erneut anzeigen statt App zu brechen

3. Keine Mess-ID gesetzt:
   - Analytics rendert nichts
   - keine Exception, keine Script-Einbindung

4. Nutzer widerruft spaeter Consent:
   - App entfernt den aktiven Analytics-Loader bei naechstem Render
   - fuer dieses Feature erfolgt keine weitergehende Cookie-Loeschung durch Google-spezifische APIs

5. Eingerahmte Bottom-Navigation auf mobilen Screens:
   - Footer und Banner erhalten ausreichend `padding-bottom`

## Test Strategy

Automatisierte Verifikation:
- primär `npm run typecheck`
- `npm run build` fuer Next.js-Integration und SSR-Sicherheit

Manuelle Checks:
- Erstaufruf ohne gespeicherten Consent: Banner sichtbar
- Klick auf Ablehnen: Banner verschwindet, kein Analytics
- Klick auf Akzeptieren mit leerer Mess-ID: kein Fehler
- Footer-Links von Landingpage und eingeloggter Ansicht erreichbar
- `Cookie-Einstellungen` oeffnet die Consent-Auswahl erneut
- `/impressum` und `/datenschutz` in mobiler Breite lesbar

## Validation Checklist

1. Consent-Status ist zentral und SSR-sicher implementiert.
2. Analytics wird nur nach aktivem Opt-in geladen.
3. Fehlende Mess-ID fuehrt zu keinem Fehler.
4. Footer zeigt Rechtslinks und Cookie-Einstellungen sichtbar an.
5. Impressum enthaelt die gelieferten Anbieterangaben inklusive `info@magrosskopf.de`.
6. Datenschutz nennt Verantwortliche, Kontakt, Analytics-Einwilligung und Widerruf.
7. `.env.example` dokumentiert `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
8. `npm run typecheck` ist gruen.
9. `npm run build` ist gruen.

