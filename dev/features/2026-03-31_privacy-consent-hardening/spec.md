Status: IMPLEMENTED
Last Modified: 2026-03-31

# Spec: Datenschutz- und Consent-Hardening

## Purpose/Goal

Die Anwendung soll in zwei Punkten nachgeschaerft werden:

1. Die Datenschutzerklaerung soll die tatsaechlich im Produkt stattfindenden Datenverarbeitungen konkret und nachvollziehbar beschreiben.
2. Optionales Analytics-Tracking soll nicht nur beim Erstaufruf, sondern auch beim spaeteren Widerruf technisch konsistent an die Einwilligung des Nutzers gebunden sein.

Das Ziel ist keine anwaltliche Einzelfallpruefung, sondern eine technisch und inhaltlich saubere Angleichung von implementiertem Verhalten und bereitgestellter Datenschutzerklaerung.

## Current Situation

1. Google Analytics wird aktuell nur bei explizitem Opt-in gerendert.
2. Die Datenschutzerklaerung beschreibt vor allem allgemeine Datenverarbeitung und Google Analytics, aber nicht die weiteren realen Verarbeitungen fuer Login, Sessions, Warteliste, Rate-Limiting, nutzergenerierte Inhalte und Upload-Speicherung.
3. Beim Widerruf oder bei einer spaeteren Ablehnung von Analytics wird der Consent-Wert geaendert, aber bereits initialisierte Google-Analytics-Mechanismen werden nicht aktiv deaktiviert oder bereinigt.

## Functional Requirements

### 1. Datenschutzerklaerung muss den Ist-Zustand abbilden

Die Seite `/datenschutz` muss die tatsaechlich vorhandenen Verarbeitungen mindestens in folgenden Bloecken beschreiben:

1. technische Bereitstellung und notwendige Server-/Verbindungsdaten
2. Anmeldung und Authentifizierung per Magic Link
3. Session- und Sicherheitsfunktionen
4. Warteliste und Beta-Zugangsanfragen
5. Missbrauchsschutz und Rate-Limiting
6. nutzerbezogene Profildaten sowie vom Nutzer eingegebene Bonsai-, Reminder-, Post- und Kommentarinhalte
7. Bild-Uploads und Medienspeicherung
8. optionales Statistik-Tracking via Google Analytics

### 2. Datenschutzerklaerung muss Mindestangaben je Verarbeitung enthalten

Fuer die relevanten Verarbeitungen muessen soweit im Projekt ableitbar mindestens folgende Aspekte nachvollziehbar beschrieben werden:

1. Verarbeitungszweck
2. betroffene Datenkategorien
3. wesentliche Empfaenger bzw. Dienstleister
4. Rechtsgrundlage in allgemeiner Form
5. Speicherdauer oder Speicherkriterien
6. Hinweis auf Drittlandbezug, falls Dienste dafuer im Code erkennbar eingebunden sind

### 3. Consent-Mechanik fuer Analytics

1. Google Analytics darf weiterhin nur nach aktiver Einwilligung geladen werden.
2. Wird Analytics abgelehnt oder spaeter widerrufen, muss die Anwendung Google Analytics fuer nachfolgende Seitenaufrufe und aktuelle Runtime-Sitzungen defensiv deaktivieren.
3. Bereits gesetzte Analytics-Cookies sollen beim Widerruf bestmoeglich clientseitig entfernt werden, soweit dies mit der vorhandenen Integration ohne externe CMP umsetzbar ist.
4. Die Consent-Verwaltung ueber den bestehenden Einstieg "Cookie-Einstellungen" bleibt erhalten.

### 4. Transparente Abgrenzung

Die Datenschutzerklaerung darf nicht den Eindruck erzeugen, dass saemtliche Datenverarbeitungen nur aufgrund eines Cookie-Consents erfolgen. Notwendige oder funktionsbezogene Verarbeitungen muessen von optionalem Analytics-Tracking klar getrennt beschrieben sein.

## Technical Constraints

1. Die Umsetzung erfolgt innerhalb der vorhandenen Next.js-Pages-Router-Anwendung.
2. Es wird keine externe Consent-Management-Plattform eingefuehrt.
3. Die bestehende Consent-Speicherung in `localStorage` bleibt die zentrale Steuerung fuer Analytics.
4. Es werden nur solche Rechtstextangaben aufgenommen, die aus Code und vorhandener Konfiguration nachvollziehbar ableitbar sind.
5. Die Arbeit darf bestehende Nutzerfluesse fuer Login, Waitlist, Uploads und Navigation nicht funktional veraendern.
6. Die Aenderung soll sich auf die bestehende Google-Analytics-Integration beschraenken und keine weiteren Tracking-Tools einfuehren.

## Acceptance Criteria

1. Die Seite `/datenschutz` beschreibt die aktuell tatsaechlichen Kernverarbeitungen der Anwendung konkret statt nur allgemein.
2. Die Datenschutzerklaerung trennt klar zwischen technisch/funktional notwendigen Verarbeitungen und optionalem Analytics-Tracking.
3. Die Datenschutzerklaerung nennt fuer die wesentlichen Verarbeitungen nachvollziehbare Zwecke, Datenarten, Empfaenger/Dienstleister und Speicherkriterien.
4. Google Analytics wird weiterhin nur mit aktivem Opt-in initialisiert.
5. Beim Widerruf oder bei der Ablehnung nach vorherigem Opt-in wird Google Analytics clientseitig defensiv deaktiviert.
6. Vorhandene ga-/ga_ Cookies werden beim Widerruf bestmoeglich geloescht.
7. Die bestehende Bedienung ueber Banner und Footer-Link bleibt intakt.
8. `npm run typecheck` bleibt gruen.

## Out-of-Scope

1. Rechtsverbindliche anwaltliche Pruefung der Rechtstexte.
2. Ein vollwertiges CMP mit Vendor-Management oder Geo-Targeting.
3. Neue Tracking-Tools oder serverseitige Consent-Synchronisierung.
4. Vollstaendige Datenloeschkonzepte fuer fachliche Nutzerdaten.
5. Umfassende Aenderung der Informationsarchitektur anderer Rechtstexte ausserhalb von `/datenschutz`.

## Open Questions / Assumptions

1. Die Datenschutzerklaerung wird als technisch-inhaltliche Annaherung an den implementierten Zustand aktualisiert, nicht als individuelle Rechtsberatung.
2. Fuer Speicherdauern ohne explizite technische TTL im Code werden vernuenftige Speicherkriterien beschrieben, statt fiktive exakte Fristen zu behaupten.
