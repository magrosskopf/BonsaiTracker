# Bonsai Tracker Context

Dieser Kontext beschreibt die fachliche Sprache fuer Bonsai Tracker. Er trennt
Produkt- und Community-Begriffe von technischen API- oder Frameworkdetails.

## Language

**Community-Inhalt**:
Ein von einem eingeloggten Nutzer veroeffentlichter Inhalt, der innerhalb der
geschlossenen Beta fuer andere Nutzer sichtbar ist und moderierbar sein muss.
_Avoid_: Feed-Daten, externer Inhalt

**Admin-Moderation**:
Die Betreiberverantwortung, gemeldete oder problematische Community-Inhalte zu
pruefen und bei Bedarf deren Sichtbarkeit oder Verbleib zu steuern.
_Avoid_: Admin-Loeschung, Content Cleanup, Flutter-Moderation

**Community-Meldung**:
Ein Hinweis eines normalen Nutzers auf einen potenziell problematischen
Community-Inhalt; sie ist keine Moderationsentscheidung und wird fuer
dasselbe Ziel pro Nutzer nur einmal offen gefuehrt.
_Avoid_: Report, Moderationsaktion

**Meldegrund**:
Ein vordefinierter Grund, warum ein Community-Inhalt gemeldet wird; freie
Kategorien gibt es nicht.
_Avoid_: Report-Typ, Beschwerdegrund

**Registrierung**:
Die Erstellung eines neuen Nutzerkontos durch eine Person, die Bonsai Tracker
verwenden moechte; sie ist keine Zugangsanfrage und keine Wartelistenmeldung.
_Avoid_: Freigabeanfrage, Wartelistenanfrage, Beta-Zugang

**Reminder**:
Eine einzelne faellige Pflegeaufgabe fuer einen Bonsai, die ein Nutzer manuell
oder aus einem Pflegeplan heraus erhalten kann.
_Avoid_: Pflegeplan, Aufgabe

**Nutzer-Reminder**:
Ein vom Nutzer selbst angelegter Reminder, den der Nutzer frei bearbeiten,
verschieben, erledigen oder entfernen kann.
_Avoid_: Manueller Termin, eigener Reminder

**System-Reminder**:
Ein aus einem aktivierten Pflegeplan erzeugter Reminder, den der Nutzer nicht
frei bearbeiten, aber erledigen, fachlich entfernen oder per Snooze verschieben
kann.
_Avoid_: Nutzer-Reminder, automatisch bearbeitbarer Reminder

**Entfernter System-Reminder**:
Ein System-Reminder, den der Nutzer aus seiner aktiven Pflegeplanung entfernt
hat; er bleibt als fachliche Entscheidung erhalten und wird nicht automatisch
wiederhergestellt.
_Avoid_: Geloeschter Reminder, erledigter Reminder

**Pflegeplan**:
Ein artbasierter Vorschlag fuer typische Bonsai-Pflegezeitpunkte, aus dem fuer
einen konkreten Bonsai automatisch Reminder entstehen koennen.
_Avoid_: Reminder-Vorlage, Kalender, Pflegeprofil

**Pflegeplan-Vorschau**:
Die sichtbare 12-Monats-Liste geplanter Pflegezeitpunkte fuer eine Pflanzenart;
sie erklaert den Nutzen vor der bezahlten Aktivierung.
_Avoid_: Aktivierter Pflegeplan, versteckter Premium-Inhalt, Artenbeschreibung

**Pflegeplan-Hinweis**:
Der kurze Produkthinweis, dass Pflegeplan-Termine typische Zeitpunkte sind und
der Nutzer den Zustand seines Bonsai pruefen soll.
_Avoid_: Rechtsbelehrung, Garantie, Warnblock

**Aktivierter Pflegeplan**:
Ein vom Nutzer bestaetigter Pflegeplan fuer einen konkreten Bonsai, dessen
vorgeschlagene Pflegezeitpunkte als Reminder angelegt werden.
_Avoid_: Automatischer Pflegeplan, stiller Pflegeplan

**Pflegeplan-Aktivierung**:
Der explizite Nutzerentschluss, einen vorgeschlagenen Pflegeplan fuer einen
konkreten Bonsai zu uebernehmen; erst diese Aktion erzeugt System-Reminder.
_Avoid_: Zahlung, Checkout-Erfolg, automatische Anlage

**Pflegeplan-Zeitraum**:
Die rollierenden 12 Monate ab Pflegeplan-Aktivierung, fuer die beim Aktivieren
System-Reminder erzeugt werden.
_Avoid_: Kalenderjahr, Saison, unbegrenzter Plan

**Pflegeplan-Synchronisierung**:
Die erneute Erzeugung fehlender zukuenftiger System-Reminder fuer einen
aktivierten Pflegeplan; sie erzeugt keine Duplikate und stellt erledigte oder
entfernte System-Reminder nicht wieder her.
_Avoid_: Neuaktivierung, automatische Reparatur, Reminder-Kopie

**Nachtraegliche Pflegeplan-Aktivierung**:
Die Aktivierung eines Pflegeplans fuer einen bereits bestehenden Bonsai nach
Auswahl einer kuratierten Pflanzenart; sie passiert nie automatisch durch eine
Migration.
_Avoid_: Auto-Migration, rueckwirkender Pflegeplan, automatische Aktivierung

**Pflegeplan-Ersetzung**:
Der explizite Nutzerentschluss, einen aktivierten Pflegeplan nach Aenderung der
kuratierten Pflanzenart durch einen neuen Pflegeplan zu ersetzen; offene
System-Reminder des alten Plans werden fachlich entfernt, erledigte bleiben als
Historie erhalten.
_Avoid_: Automatische Neuberechnung, stille Synchronisierung, Historienloeschung

**Inaktiver Pflegeplan-Zugang**:
Der Zustand, in dem ein Nutzer keine aktive Bonsai-Tracker-Plus-Subscription mehr hat;
neue oder aktualisierte Pflegeplan-Generierung ist gesperrt, bereits erzeugte
System-Reminder bleiben aber nutzbar.
_Avoid_: Geloeschter Pflegeplan, gesperrte Reminder, verlorene Premium-Daten

**Pflanzenart**:
Eine kuratierte Art-Auswahl fuer Bonsai, die als fachliche Grundlage fuer einen
Pflegeplan dient; sie ist enger gefasst als ein beliebiger Freitext im Art-Feld.
_Avoid_: Species-Text, botanischer Name, Sorte

**Art-Freitext**:
Die bestehende frei eingegebene Art-Beschreibung eines Bonsai; sie dient nicht
als Grundlage fuer Pflegeplan-Aktivierung oder automatische Arten-Erkennung.
_Avoid_: Pflanzenart, Artenkatalog-Eintrag, Pflegeplan-Auswahl

**Artenkatalog**:
Die kleine kuratierte Liste von Pflanzenarten, fuer die Bonsai Tracker einen
Pflegeplan anbieten kann.
_Avoid_: Pflanzendatenbank, botanischer Katalog, Arten-Wiki

**Pflegeplan-Regel**:
Eine redaktionell gepflegte Produktregel, die fuer eine Pflanzenart einen
typischen Pflegezeitraum und eine Pflegeart beschreibt; sie kann allgemein oder
fuer Indoor/Outdoor eingegrenzt sein.
_Avoid_: Nutzerregel, Reminder-Template, Pflegehinweis, Giessplan

**Pflegeplan-Standortannahme**:
Die fachliche Annahme, dass ein Bonsai ohne gesetzte Indoor/Outdoor-Eigenschaft
fuer Pflegeplan-Regeln als Outdoor-Bonsai behandelt wird.
_Avoid_: Standortbestimmung, Klimaannahme, Nutzerangabe

**Monatsfenster**:
Ein oder mehrere Kalendermonate, in denen eine Pflegeplan-Regel typischerweise
faellig wird; daraus erzeugt die App konkrete Reminder-Termine am 1. Tag des
jeweiligen Monats.
_Avoid_: Exaktes Datum, Kalenderwoche, regionaler Pflegekalender

**Paywall**:
Die Produktgrenze, die zahlungspflichtige Funktionen von frei nutzbaren
Kernfunktionen trennt; manuelle Reminder gehoeren nicht zur Paywall.
_Avoid_: Feature-Sperre, Premium-Sperre

**Bonsai-Tracker-Plus-Subscription**:
Das einzelne jaehrliche Abo-Angebot "Bonsai Tracker Plus" fuer 19,99 EUR, das
aktuell den Pflegeplan und spaeter weitere Produktvorteile enthalten kann.
_Avoid_: Pflegeplan-Subscription, Stripe-Status, Abo-Flag, Premium-Stufe, Einmalkauf, Trial

**Laufende Bonsai-Tracker-Plus-Subscription**:
Eine Plus-Subscription, die aktiv ist oder noch bezahlt, fortgesetzt oder
reaktiviert werden kann; sie schliesst eine zweite parallele Subscription aus.
_Avoid_: Zweitabo, endgueltig beendete Subscription, neuer Checkout

**Entitlement**:
Das serverseitig gepruefte Recht eines Nutzers, eine Premium-Funktion zu nutzen;
es kapselt Zahlungsdetails und ist die fachliche Grundlage der Paywall-Pruefung.
_Avoid_: Stripe-Checkout, Client-Flag, UI-Sperre

**Stripe-Anbindung**:
Die Zahlungsintegration, ueber die ein Nutzer eine Bonsai-Tracker-Plus-Subscription erwerben und
deren Zahlungsstatus aktualisiert werden kann.
_Avoid_: Entitlement, Paywall, Pflegeplan-Zugang

**Pflegeplan-Paywall**:
Der kontextuelle Hinweis beim Aktivieren eines Pflegeplans ohne Entitlement,
der den Nutzer zum Stripe Checkout fuehrt und danach zum Bonsai-Kontext
zurueckbringt.
_Avoid_: Pricing-Seite, allgemeine Premium-Seite, Checkout

**Aboverwaltung**:
Der Zugang eines Nutzers zur Verwaltung seiner Bonsai-Tracker-Plus-Subscription; im
ersten Schnitt fuehrt sie aus dem Profilbereich in das Stripe Customer Portal.
_Avoid_: Eigene Rechnungsverwaltung, Profilbearbeitung, Paywall

**Abgebrochener Checkout**:
Ein Stripe-Checkout, der ohne aktivierte Bonsai-Tracker-Plus-Subscription endet; er aktiviert keinen
Pflegeplan und erzeugt keine System-Reminder.
_Avoid_: Fehlgeschlagene Zahlung, inaktiver Pflegeplan, Rueckkehr mit Zugang

**Bestaetigter Checkout**:
Ein serverseitig verifizierter, abgeschlossener Stripe-Checkout des eingeloggten
Nutzers; er bestaetigt den Kaufvorgang, ist aber noch kein Entitlement.
_Avoid_: Erfolgsparameter, Pflegeplan-Zugang, Pflegeplan-Aktivierung
