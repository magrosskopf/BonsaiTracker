Status: COMPLETE
Last Modified: 2026-03-31

# Implementation Plan: Datenschutz- und Consent-Hardening

## Overview

Die Umsetzung besteht aus zwei zusammenhaengenden Teilen:

1. Die Datenschutzerklaerung in `pages/datenschutz.tsx` wird vom allgemeinen Kurztext zu einer produktnahen Uebersicht der realen Verarbeitungen erweitert.
2. Die Google-Analytics-Integration wird um eine explizite Opt-out-/Widerrufsbehandlung erweitert, damit ein spaeterer Widerruf nicht nur den Render-Pfad aendert, sondern die laufende Browserumgebung defensiv zuruecksetzt.

## Reference

Spec: `/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-31_privacy-consent-hardening/spec.md`

Besonders relevante Acceptance Criteria:
- AC 1-3: Datenschutzerklaerung bildet reale Datenverarbeitungen ab
- AC 4-6: Analytics bleibt Consent-gesteuert und wird bei Widerruf defensiv deaktiviert
- AC 7-8: bestehende Bedienung bleibt erhalten, Typecheck bleibt gruen

## File Structure

Zu aendern:
- `/Users/maius/Projekte/Bonsai-Tracker/pages/datenschutz.tsx`
- `/Users/maius/Projekte/Bonsai-Tracker/pages/_app.tsx`
- `/Users/maius/Projekte/Bonsai-Tracker/components/Analytics.tsx`
- `/Users/maius/Projekte/Bonsai-Tracker/lib/consent.ts`

Optional zu aendern, nur falls fuer klare Trennung hilfreich:
- `/Users/maius/Projekte/Bonsai-Tracker/components/CookieBanner.tsx`

Keine Aenderungen geplant:
- Datenmodelle
- API-Handler fuer Login, Waitlist, Uploads
- Footer-/Navigationsstruktur

## Current State Context

Relevanter Ist-Zustand:

1. Consent wird lokal in `localStorage` unter `bonsai.analytics-consent` gespeichert.
2. `Analytics` rendert `gtag.js` nur bei `enabled === true` und vorhandener Measurement-ID.
3. Das Opt-out entfernt aktuell nur die React-Komponente, fuehrt aber keine explizite GA-Deaktivierung oder Cookie-Bereinigung aus.
4. Die Datenschutzerklaerung nennt Google Analytics, aber nicht die weiteren im Code offensichtlichen Datenfluesse fuer Auth, Warteliste, Rate-Limiting, Inhalte und Uploads.

## Code Architecture

### 1. Consent-Utilities ausbauen

`lib/consent.ts` wird um kleine Hilfsfunktionen erweitert:

1. defensive Deaktivierung von Google Analytics ueber `window['ga-disable-<measurementId>']`
2. best-effort-Loeschung ga-bezogener Cookies auf der aktuellen Host-Domain und mit Root-Pfad
3. zentrale Hilfsfunktion, die nach Ablehnung/Widerruf aufgerufen werden kann

Die Utilities bleiben browserseitig und tolerieren fehlende `window`-/`document`-APIs.

### 2. App-Root als Consent-Schaltstelle

`pages/_app.tsx` bleibt die zentrale Stelle fuer Consent-Aenderungen.

Bei `accept`:
1. Consent speichern
2. eventuelle Opt-out-Flags zuruecksetzen
3. Analytics wieder renderbar machen

Bei `reject`:
1. Consent speichern
2. clientseitige Opt-out-/Cleanup-Funktion aufrufen
3. Banner schliessen

Optional wird dieselbe Cleanup-Logik auch beim initialen Laden eines bereits gespeicherten `rejected`-Status ausgefuehrt, damit eine laufende Session nach einem frueheren Widerruf sauber bleibt.

### 3. Analytics-Komponente defensiver machen

`components/Analytics.tsx` bleibt fuer das Laden des Scripts zustaendig, beachtet aber zusaetzlich:

1. vor der Initialisierung eventuell gesetzte `ga-disable-*` Flags rueckgaengig machen, wenn Consent aktiv ist
2. keine Initialisierung bei fehlender Measurement-ID

Das Ziel ist ein klarer, idempotenter Wechsel zwischen Opt-in und Opt-out.

### 4. Datenschutzerklaerung in produktnahe Abschnitte strukturieren

`pages/datenschutz.tsx` wird in inhaltlich klare Sektionen gegliedert:

1. Verantwortliche Stelle
2. Hosting/technische Bereitstellung
3. Authentifizierung per E-Mail/Magic Link inklusive Sessions und Verification-Token
4. Warteliste, Beta-Freigabe und Missbrauchsschutz
5. fachliche Nutzungsdaten innerhalb der Anwendung
6. Bild-Uploads und Speicherdienstleister
7. optionales Google Analytics mit Consent und Widerruf
8. Betroffenenrechte und Kontakt

Die Texte werden auf den im Code verifizierbaren Datenfluss abgestimmt. Wo keine harte TTL im Code existiert, werden Speicherkriterien statt kuenstlicher exakter Fristen genannt.

## Technical Decisions

1. Cookie-Loeschung fuer GA erfolgt best effort per `document.cookie` fuer ga-relevante Namen und Domain-Varianten der aktuellen Host-Domain.
2. Die Loeschung wird nicht als rechtsverbindliche Vollgarantie formuliert, sondern als technische Opt-out-Massnahme.
3. Die Datenschutzerklaerung beschreibt Resend und optional Supabase als Empfaenger/Dienstleister, weil diese direkt im Code eingebunden sind.
4. Session-/Login-bezogene Cookies und Tokens werden als notwendige Verarbeitung beschrieben, nicht als Consent-basierte Verarbeitung.
5. Es werden keine neuen Environment-Variablen eingefuehrt.

## Integration Points

1. `pages/_app.tsx`
   - bindet erweiterte Consent-Utilities in Accept/Reject und Initialisierung ein

2. `components/Analytics.tsx`
   - respektiert Opt-out-Flags und Measurement-ID

3. `pages/datenschutz.tsx`
   - bildet die reale Datenverarbeitung aus `lib/auth.ts`, `pages/api/access-requests.ts`, `pages/api/auth/precheck.ts`, `lib/rate-limit.ts`, `pages/api/upload.ts`, `lib/storage/local.ts` und `lib/storage/supabase.ts` textlich ab

## Implementation Steps

### Step 1: Consent-Utility erweitern

Arbeiten:
- Browser-Helper fuer GA-Disable-Flag anlegen
- best-effort Cookie-Cleanup fuer `_ga`, `_gid`, `_gat` und praefixbasierte GA-Cookies anlegen
- Reset-/Enable-Helfer fuer Measurement-ID kapseln

Ergebnis:
- Widerruf kann zentral und wiederverwendbar ausgefuehrt werden

### Step 2: App-Root an Cleanup/Enable koppeln

Arbeiten:
- `pages/_app.tsx` so erweitern, dass Reject und initial gespeicherter `rejected`-Status Cleanup triggern
- Accept-Pfad so erweitern, dass fruehere Disable-Flags aufgehoben werden

Ergebnis:
- Consent-Wechsel wirkt nicht nur ueber Rendern/Nicht-Rendern, sondern auch ueber Runtime-Cleanup

### Step 3: Analytics defensiv nachschaerfen

Arbeiten:
- `components/Analytics.tsx` um kleine Enable-/Reset-Absicherung erweitern
- Script-Initialisierung idempotent halten

Ergebnis:
- stabiler Wechsel zwischen Opt-in und Opt-out

### Step 4: Datenschutzerklaerung aktualisieren

Arbeiten:
- bestehende knappe Texte durch konkrete Abschnitte ersetzen
- reale Verarbeitungen, Rechtsgrundlagen in allgemeiner Form, Empfaenger und Speicherkriterien aufnehmen
- klare Trennung zwischen notwendigen Verarbeitungen und optionalem Analytics-Tracking herstellen

Ergebnis:
- Datenschutzerklaerung passt zum tatsaechlichen Produktverhalten

### Step 5: Verifikation

Arbeiten:
- Typecheck ausfuehren
- bei Bedarf gezielte Sichtpruefung der betroffenen Komponenten

Ergebnis:
- technische Sicherheit der Aenderung

## Edge Cases & Error Handling

1. Browser blockiert `localStorage`:
   - bestehendes Fallback-Verhalten bleibt erhalten

2. Measurement-ID fehlt:
   - Analytics bleibt deaktiviert, Cleanup-Funktionen werden no-op

3. Cookie-Loeschung ist auf Browser-/Domain-Ebene nicht vollstaendig garantiert:
   - deshalb best effort und zusaetzliches `ga-disable-*` Flag

4. Nutzer oeffnet Cookie-Einstellungen mehrfach:
   - bestehende Banner-Logik bleibt unveraendert

5. Upload-Storage ist lokal oder Supabase:
   - Datenschutzerklaerung beschreibt beide moeglichen technischen Faelle ohne das Runtime-Verhalten zu aendern

## Test Strategy

1. Statischer Review der geaenderten Rechtstexte gegen den verifizierten Codepfad
2. `npm run typecheck`
3. Manuelle Plausibilitaetspruefung:
   - kein Analytics ohne Opt-in
   - Reject nach vorherigem Accept setzt Cleanup/Disable aus
   - `/datenschutz` bleibt renderbar und lesbar

## Validation Checklist

1. `/datenschutz` beschreibt Auth, Waitlist, Rate-Limit, Produktdaten, Uploads und Analytics
2. notwendige Verarbeitungen und Consent-basierte Verarbeitung sind klar getrennt
3. Opt-out setzt GA-Disable-Flag
4. Opt-out versucht vorhandene GA-Cookies zu loeschen
5. bestehende Consent-Bedienung bleibt intakt
6. Typecheck ist erfolgreich
