# Master Prompt Fuer Einen KI Coding Assistenten

Du arbeitest im Repository `Bonsai-Tracker` und sollst die Anwendung auf Basis der Datei `SPEC.md` vollstaendig implementieren bzw. refaktorieren.

## Verbindliche Quelle
- Die Datei `SPEC.md` ist die fachlich und technisch massgebliche Quelle.
- Wenn bestehender Code der SPEC widerspricht, hat die SPEC Vorrang.
- Wenn Migrationen, Prisma-Schema, API-Vertraege, UI oder bestehende Seiten inkonsistent sind, bringe sie in einen konsistenten Zustand gemaess SPEC.

## Ziel
Erzeuge eine vollstaendig lauffaehige, koharente Anwendung ohne offensichtliche funktionale, technische oder typbezogene Fehler.

## Arbeitsregeln
- Implementiere, nicht nur beschreiben.
- Arbeite systematisch von Datenmodell und APIs bis zur UI.
- Halte dich an den festgelegten Tech-Stack und fuehre keine neue UI-Bibliothek ein.
- Verwende den Pages Router, nicht den App Router.
- Halte API-Responses, DTOs, Statuscodes und Validierungsregeln exakt gemaess SPEC ein.
- Stelle Ownership und Authentifizierung auf allen Business-Endpunkten sicher.
- Bevorzuge minimal-komplexe Loesungen, wenn mehrere technische Varianten moeglich sind.

## Verbindlicher Tech-Stack
- Next.js 15 mit Pages Router
- React 19
- TypeScript
- Tailwind CSS 3
- DaisyUI 5
- Prisma
- PostgreSQL
- NextAuth v4 mit EmailProvider
- Resend fuer E-Mail-Versand
- multer fuer Uploads
- swiper fuer Bildgalerien

## Verbindliche Umgebungsannahmen
- Lokale Entwicklungsbasis: `NEXTAUTH_URL=http://localhost:3000`
- `DATABASE_URL` folgt aktuell dem Prisma-Accelerate-Schema `prisma+postgres://...`
- Aktiver Mailversand in v1: `RESEND_API_KEY` + `EMAIL_FROM`
- `EMAIL_SERVER` kann vorhanden sein, ist in v1 aber nicht der primaere Versandweg
- Niemals echte Secret-Werte aus `.env.local` in Code, Doku, Tests oder Platzhalterdateien uebernehmen

## Verbindliche Produktentscheidungen
- Sprache nur Deutsch
- Login nur per Magic Link
- Bonsais werden soft-deleted
- Sub-Entries werden physisch geloescht
- Dashboard nutzt Infinite Scroll mit Cursor-Pagination
- Uploads bleiben lokal in `public/uploads`
- `style` ist eine feste Auswahlliste
- `customStyle` nur bei `style = "Sonstiger"`

## Konkreter Arbeitsauftrag
1. Lies `SPEC.md` vollstaendig.
2. Analysiere den Bestandscode und identifiziere Abweichungen zur SPEC.
3. Harmonisiere Prisma-Schema, Migrationen und Datentypen.
4. Stabilisiere Auth und Session-Nutzung.
5. Implementiere oder refaktoriere alle API-Routen gemaess SPEC.
6. Implementiere oder refaktoriere alle Seiten gemaess SPEC.
7. Stelle ein konsistentes UI mit DaisyUI-Komponenten sicher.
8. Behebe Build- und TypeScript-Fehler.
9. Fuehre Build und relevante Tests aus.
10. Dokumentiere am Ende kurz:
   - welche Dateien geaendert wurden
   - welche Kernentscheidungen umgesetzt wurden
   - ob noch Risiken oder offene technische Punkte bestehen

## Nicht erlaubt
- Keine Abweichung vom Datenmodell ohne zwingenden Grund
- Keine anderen Response-Formate als in der SPEC
- Keine Mischung aus Pages Router und neuer App-Router-Architektur
- Keine neue UI-Library
- Keine Annahmen, die der SPEC widersprechen

## Definition of Done
Die Arbeit ist erst abgeschlossen, wenn:
- `npm run build` erfolgreich ist
- TypeScript keine Fehler mehr hat
- die in der SPEC definierten Kernflows funktionieren
- API und UI konsistent zueinander sind
- keine kritischen Ownership- oder Validierungsluecken offen bleiben

Beginne mit einer kurzen Bestandsanalyse gegen `SPEC.md` und setze anschliessend die Implementierung um.
