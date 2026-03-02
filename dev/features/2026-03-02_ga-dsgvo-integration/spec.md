Status: IN_REVIEW
Last Modified: 2026-03-02

# Spec: DSGVO-konforme Google-Analytics-Integration mit Rechtstexten

## Purpose/Goal

Die Anwendung soll um eine DSGVO-konforme Web-Tracking-Integration erweitert werden. Ziel ist, Google Analytics erst nach ausdruecklicher Einwilligung zu laden, die Einwilligung fuer den Nutzer steuerbar zu machen und die dafuer notwendigen rechtlichen Seiten und Hinweise sichtbar in die Anwendung zu integrieren.

Das Feature umfasst:
- Cookie-Consent-Banner fuer optionale Tracking-Cookies
- Google Analytics nur nach Opt-in
- Datenschutzerklaerung mit Tracking- und Cookie-Hinweisen
- Impressumsseite

## Functional Requirements

### 1. Consent-Management

1. Beim ersten Besuch der Anwendung wird ein sichtbarer Cookie-Banner angezeigt, solange noch keine Consent-Entscheidung des Nutzers gespeichert ist.
2. Der Banner unterscheidet zwischen technisch notwendigen Funktionen und optionalem Statistik-/Analytics-Tracking.
3. Der Nutzer kann mindestens folgende Aktionen ausfuehren:
   - nur notwendige Cookies akzeptieren
   - Analytics aktiv zustimmen
4. Die Entscheidung wird clientseitig so gespeichert, dass der Banner bei spaeteren Seitenaufrufen konsistent reagiert.
5. Der Nutzer muss seine Entscheidung spaeter erneut aendern koennen, ohne Browserdaten manuell loeschen zu muessen.

### 2. Google-Analytics-Integration

1. Google Analytics wird nur geladen und initialisiert, wenn der Nutzer dem optionalen Analytics-Tracking aktiv zugestimmt hat.
2. Ohne Zustimmung darf kein Google-Analytics-Script eingebunden und kein Tracking-Event an Google gesendet werden.
3. Wenn eine Google-Analytics-Mess-ID nicht konfiguriert ist, bleibt das Tracking deaktiviert, ohne dass die Anwendung fehlschlaegt.
4. Die Integration erfolgt zentral auf App-Ebene, damit alle Seiten derselben Consent-Logik folgen.
5. Consent-Aenderungen muessen sich zur Laufzeit auswirken, ohne dass eine unklare Zwischenlage entsteht.

### 3. Datenschutzerklaerung

1. Es gibt eine eigenstaendige Seite `/datenschutz`.
2. Die Seite beschreibt mindestens:
   - Verantwortliche Stelle
   - Kontaktmoeglichkeit
   - allgemeine Datenverarbeitung in der Anwendung
   - Einsatz von Google Analytics
   - Hinweis auf die Einwilligungsbasis fuer optionales Tracking
   - Widerrufsmöglichkeit bzw. Aenderung der Consent-Entscheidung
3. Die Datenschutzerklaerung ist aus dem sichtbaren UI erreichbar.

### 4. Impressum

1. Es gibt eine eigenstaendige Seite `/impressum`.
2. Die Seite enthaelt die fuer das Projekt erforderlichen Anbieterkennzeichnungen.
3. Das Impressum ist aus dem sichtbaren UI erreichbar.

### 5. UI-Integration

1. Auf oeffentlichen Seiten muessen Links zu `Impressum` und `Datenschutz` sichtbar erreichbar sein.
2. Falls eingeloggte Nutzer die Bottom-Navigation sehen, muessen die Rechtstexte dennoch erreichbar bleiben, ohne versteckt oder unauffindbar zu sein.
3. Die Consent-Verwaltung muss auch nach der initialen Banner-Interaktion erneut aufrufbar sein, zum Beispiel ueber einen Footer-Link oder einen klar benannten Einstellungslink.

## Technical Constraints

1. Die Umsetzung erfolgt in der vorhandenen Next.js-Pages-Router-Anwendung mit TypeScript und Tailwind/DaisyUI.
2. Es wird keine externe Consent-Management-Plattform eingefuehrt. Das Feature wird mit vorhandenen Projektmitteln umgesetzt.
3. Google Analytics wird ueber eine oeffentliche Environment-Variable konfigurierbar gemacht, z. B. `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
4. Tracking-Code darf nicht serverseitig voraussetzen, dass Browser-APIs verfuegbar sind.
5. Der Consent-Zustand muss fuer die Client-Anwendung zentral lesbar sein, damit Banner, Einstellungszugriff und Analytics-Initialisierung konsistent bleiben.
6. Die vorhandene Navigation und das App-Shell-Layout in `/work/pages/_app.tsx` duerfen fuer die rechtlichen Links und den Banner erweitert werden.
7. Rechtstexte werden als statische Seiten innerhalb der Anwendung gepflegt.
8. Die Google-Analytics-Integration wird in diesem Feature nur technisch vorbereitet; die konkrete Mess-ID wird spaeter ueber die Environment-Variable gesetzt.

## Provided Legal Content Inputs

### Impressum / Anbieterkennzeichnung

- Anbieter: Marius Grosskopf Software- und Webentwicklung
- Verantwortliche Person: Marius Grosskopf
- Anschrift: Buergstrasse, 74834 Elztal-N, Germany
- Vertreten durch: Marius Grosskopf
- Telefon: 015117641450
- E-Mail: info@magrosskopf.de
- Umsatzsteuernummer: DE323651794
- Verantwortlich fuer den Inhalt: Marius Grosskopf, Buergstrasse, 74834 Elztal-N, Germany

### Datenschutzerklaerung

- Verantwortliche Stelle entspricht den Impressumsangaben
- Kontaktangaben entsprechen den Impressumsangaben
- Analytics nur technisch vorbereiten; Mess-ID wird spaeter manuell hinterlegt

### Rechtstext-Bausteine

Die folgenden gelieferten Textbausteine werden als inhaltliche Grundlage fuer die statischen Seiten verwendet:
- Haftung fuer Links
- Haftung fuer Inhalte
- Urheberrecht

## Acceptance Criteria

1. Ein Erstbesucher sieht vor der Consent-Entscheidung einen Cookie-Banner.
2. Waehlt der Nutzer "nur notwendige Cookies", bleibt Google Analytics komplett deaktiviert.
3. Waehlt der Nutzer Analytics-Zustimmung, wird Google Analytics mit der konfigurieren Mess-ID geladen.
4. Fehlt die Mess-ID, fuehrt auch eine Analytics-Zustimmung nicht zu einem Laufzeitfehler.
5. Die Consent-Entscheidung bleibt zwischen Seitenwechseln und erneuten Besuchen erhalten.
6. Der Nutzer kann seine Consent-Entscheidung spaeter ueber einen sichtbaren UI-Einstieg erneut aendern.
7. Eine Seite `/datenschutz` existiert und beschreibt Einwilligung, Tracking und Widerruf in Bezug auf Google Analytics.
8. Eine Seite `/impressum` existiert und enthaelt die noetigen Anbieterangaben.
9. `Impressum` und `Datenschutz` sind im UI erreichbar, auch wenn die Standard-Navigation fuer eingeloggte Nutzer ausgeblendet bzw. ersetzt wird.
10. Die Implementierung bricht `npm run typecheck` und `npm run build` nicht.

## Out-of-Scope

1. Ein vollwertiges Third-Party Consent-Management-System mit Kategorien, Vendor-Liste und Geo-Targeting.
2. Rechtliche Einzelfallpruefung durch einen Anwalt.
3. Mehrsprachige Rechtstexte.
4. Weitere Tracking- oder Marketing-Tools neben Google Analytics.
5. A/B-Testing, Tag-Manager-Container oder Consent-Synchronisierung mit externen CMPs.

## Open Questions / Blocking Points

1. Die angegebene Anschrift enthaelt keine Hausnummer. Falls die Angabe so bewusst erfolgen soll, wird sie exakt uebernommen; rechtliche Vollstaendigkeit wird durch dieses Feature nicht validiert.
