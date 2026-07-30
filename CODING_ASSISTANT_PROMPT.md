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
- Supabase CLI, Auth, Data API, RPC und Storage
- PostgreSQL ueber versionierte Supabase-Migrationen
- Supabase Auth mit Google und Magic Link
- Resend als Supabase Auth Custom SMTP
- multer fuer Uploads
- swiper fuer Bildgalerien

## Verbindliche Umgebungsannahmen
- Lokale Entwicklungsbasis: `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- App-Runtime liest keine direkte PostgreSQL-URL.
- Supabase Runtime-Keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- Aktiver Magic-Link-Mailversand laeuft ueber Supabase Auth Custom SMTP.
- Niemals echte Secret-Werte aus `.env.local` in Code, Doku, Tests oder Platzhalterdateien uebernehmen

## Verbindliche Produktentscheidungen
- Sprache nur Deutsch
- Login per Google und Magic Link
- Bonsais werden soft-deleted
- Sub-Entries werden physisch geloescht
- Dashboard nutzt Infinite Scroll mit Cursor-Pagination
- Uploads laufen ueber privaten Supabase Storage und Next.js Media-Routen
- `style` ist eine feste Auswahlliste
- `customStyle` nur bei `style = "Sonstiger"`

## Konkreter Arbeitsauftrag
1. Lies `SPEC.md` vollstaendig.
2. Analysiere den Bestandscode und identifiziere Abweichungen zur SPEC.
3. Harmonisiere Supabase-Migrationen, generierte Typen und DTOs.
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
