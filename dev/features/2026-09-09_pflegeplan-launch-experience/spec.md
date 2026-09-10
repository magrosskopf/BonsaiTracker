# Pflegeplan Launch Experience

**Status**: IMPLEMENTED
**Created**: 2026-09-09
**Last Modified**: 2026-09-10

## Purpose/Goal

Der bereits produktive Pflegeplan soll vor dem Kauf klar auffindbar und verstaendlich sein und Nutzer nach dem Checkout sicher bis zur Aktivierung ihres ersten Pflegeplans fuehren.

Die Erweiterung soll drei Luecken schliessen:

1. Nicht eingeloggte Nutzer verstehen auf der bestehenden Startseite, welchen Mehrwert der Pflegeplan bietet.
2. Nutzer ohne Bonsai-Tracker-Plus-Subscription verstehen im Bonsai-Kontext vor dem Checkout Leistung, Preis, Abrechnung und den Ablauf nach der Zahlung.
3. Rueckkehrende Nutzer erkennen nach erfolgreichem oder abgebrochenem Checkout eindeutig den naechsten Schritt.

Eine separate Pricing- oder Marketing-Route ist dafuer nicht erforderlich. Die Produktkommunikation bleibt in der bestehenden Startseite und im konkreten Bonsai-Kontext.

## Current Situation

1. Die Startseite beschreibt Sammlung, Pflegedokumentation und Bilder, nennt den Pflegeplan aber nicht.
2. Die Pflegeplan-Vorschau ist erst sichtbar, nachdem eine kuratierte Pflegeplan-Pflanzenart am Bonsai gespeichert wurde.
3. Beim Schnellstart ist die Auswahl der Pflegeplan-Pflanzenart hinter "Weitere Details anzeigen" verborgen.
4. Die aktuelle Paywall besteht im Wesentlichen aus dem Button "Pflegeplan freischalten". Preis, Abrechnungszeitraum, Leistungsumfang und Ablauf nach der Zahlung werden dort nicht erklaert.
5. Stripe leitet mit `checkout=success` oder `checkout=cancelled` in den Bonsai- beziehungsweise Profilkontext zurueck. Diese Rueckkehrzustaende werden in der UI noch nicht ausgewertet.
6. Zahlung allein aktiviert keinen Pflegeplan. Nutzer muessen nach aktivem Entitlement explizit "Pflegeplan aktivieren" ausfuehren.
7. Das aktuell konfigurierte Stripe-Produkt heisst "Bonsai Tracker Plus" und hat einen aktiven Standardpreis von 19,99 EUR pro Jahr.
8. Die lokale Variable `STRIPE_CARE_PLAN_PRICE_ID` enthaelt derzeit eine Stripe-Product-ID, waehrend Checkout eine Stripe-Price-ID benoetigt. Die produktive Laufzeitkonfiguration ist davon unabhaengig zu pruefen.
9. Das verbindliche Launch-Angebot ist "Bonsai Tracker Plus" fuer 19,99 EUR pro Jahr; die zuvor dokumentierte monatliche Subscription ist damit abgeloest.

## Functional Requirements

### Startseite und Produktauffindbarkeit

1. Die bestehende Startseite erhaelt einen kompakten Pflegeplan-Produktabschnitt; es wird keine separate Pricing-Seite angelegt.
2. Der Abschnitt erklaert den konkreten Nutzen: artspezifische Vorschau fuer die kommenden 12 Monate und automatische System-Reminder fuer typische saisonale Arbeiten.
3. Der Abschnitt nennt die Grenzen des Angebots: typische Zeitfenster statt exakter Pflegegarantie, keine Giess-Erinnerungen und weiterhin notwendige Pruefung am eigenen Baum.
4. Der Abschnitt zeigt den aktuellen Produktnamen, Preis und Abrechnungszeitraum.
5. Nicht eingeloggte Nutzer werden ueber die bestehende Registrierung zum Produkt gefuehrt; eingeloggte Nutzer erhalten einen direkten Weg zu ihren Bonsais.
6. Die Auth-Card bleibt der primaere Interaktionsbereich der Startseite und darf durch den neuen Abschnitt auf Mobile oder Desktop nicht unuebersichtlich werden.

### Auswahl und kostenlose Vorschau

7. Der Bonsai-Schnellstart bleibt mit nur einem Namen abschliessbar.
8. Der optionale Detailbereich weist sichtbar darauf hin, dass die Pflegeplan-Pflanzenart dort gewaehlt werden kann.
9. Im Bonsai-Detail fuehrt ein Zustand ohne Pflegeplan-Pflanzenart mit einem direkten Bearbeiten-Link zur erforderlichen Auswahl, statt nur auf das Bearbeiten-Formular zu verweisen.
10. Die kostenlose 12-Monats-Vorschau bleibt vor dem Kauf sichtbar.
11. Die UI erklaert klar, dass die freie Artbeschreibung und die kuratierte Pflegeplan-Pflanzenart unterschiedliche Felder sind.

### Paywall und Kaufentscheidung

12. Nutzer ohne aktives Entitlement sehen im Pflegeplan-Kontext vor dem Checkout eine kompakte Kaufbox.
13. Die Kaufbox nennt Produktname, Preis, Abrechnungszeitraum, automatische Verlaengerung, Leistungsumfang und den Hinweis, dass das Abo im Profil verwaltet beziehungsweise gekuendigt werden kann.
14. Die Kaufbox erklaert vor dem Checkout, dass die Zahlung den Zugang freischaltet, aber noch keine Reminder erzeugt.
15. Der Checkout-CTA benennt die Zahlungspflicht und den Abrechnungszeitraum eindeutig.
16. Ein Checkout-Fehler bleibt im Pflegeplan-Kontext sichtbar und handlungsorientiert.
17. Pro Nutzer darf hoechstens eine offene Checkout Session beziehungsweise eine laufende Bonsai-Tracker-Plus-Subscription bestehen. Vor dem Anlegen einer Session prueft der Server den aktuellen Stripe-Zustand und verhindert einen parallelen oder doppelten Abschluss.
18. Bei einer bereits offenen Checkout Session zeigt die UI einen Verarbeitungszustand. Bei einer bestehenden, noch nicht endgueltig beendeten Subscription fuehrt sie statt eines neuen Checkouts zur Aboverwaltung.

### Rueckkehr und Aktivierungsfuehrung

17. Die Stripe-Erfolgs-URL enthaelt neben `checkout=success` die von Stripe eingesetzte Checkout-Session-ID. Bevor die UI einen erfolgreichen Checkout bestaetigt, prueft der Server, dass die Session abgeschlossen ist und zum eingeloggten Nutzer gehoert.
18. Nach verifiziertem Checkout zeigt der Bonsai-Kontext eine Erfolgsmeldung mit dem naechsten Schritt "Pflegeplan aktivieren".
19. Da das Entitlement asynchron per Stripe-Webhook eintreffen kann, prueft die Seite den Pflegeplan-Zugang sofort und danach alle zwei Sekunden fuer maximal 30 Sekunden aktiver Vordergrundzeit. Solange der Browser-Tab nicht sichtbar ist, pausieren die automatischen Pruefungen.
20. Solange der Checkout bestaetigt, das Entitlement aber noch nicht aktiv ist, zeigt die UI einen neutralen Verarbeitungszustand statt erneut einen Kauf anzubieten.
21. Falls das Entitlement nach dem begrenzten Aktualisierungszeitraum nicht aktiv ist, zeigt die UI eine handlungsorientierte Meldung mit erneutem Pruefen, einem Weg zur Aboverwaltung und einem `mailto:`-Supportkontakt an `info@magrosskopf.de`.
22. Ein fehlender, ungueltiger, nicht abgeschlossener oder einem anderen Nutzer zugeordneter Checkout-Nachweis darf keine Erfolgsmeldung ausloesen und veraendert weder Entitlement noch Reminder.
23. Nach `checkout=cancelled` zeigt der Bonsai-Kontext eine neutrale Abbruchmeldung. Es werden weder Entitlement noch Reminder erzeugt.
24. Nach erfolgreicher Aktivierung bestaetigt die UI, dass System-Reminder angelegt wurden, und bietet einen direkten Weg zur Reminder-Liste.
25. Verarbeitete Checkout-Query-Parameter werden aus der URL entfernt, ohne die Seite neu zu laden, damit Meldungen bei einem spaeteren Reload nicht erneut erscheinen.
26. Bei Checkout aus dem Profil werden verifizierte erfolgreiche und abgebrochene Rueckkehr ebenfalls sichtbar bestaetigt; ein erfolgreicher Kauf verweist von dort auf die Bonsai-Auswahl als naechsten Schritt.

### Profil und Aboverwaltung

27. Das Profil ist neben der kontextuellen Pflegeplan-Paywall ein eigenstaendiger Einstieg in den Kauf von Bonsai Tracker Plus.
28. Nutzer ohne Bonsai-Tracker-Plus-Subscription sehen im Profil den aktuellen enthaltenen Vorteil, Produktname, Preis, Abrechnungszeitraum und einen eindeutigen Checkout-CTA.
29. Nutzer mit aktiver Bonsai-Tracker-Plus-Subscription sehen Produktname, Abrechnungszeitraum und das Ende der aktuellen Periode, soweit vorhanden, aber keine rohen Stripe-Statuswerte.
30. Nutzer ohne Stripe-Kundenbezug sehen keinen funktionslosen Button zur Aboverwaltung.
31. Der bestehende Stripe-Customer-Portal-Flow bleibt der Ort fuer Kuendigung, Rechnungen und Zahlungsmittel.

### Produkt- und Preisdaten

32. Sichtbare Produkt- und Preisdaten muessen aus der fuer Checkout verwendeten aktiven Stripe Price abgeleitet werden; Produkttexte duerfen keinen unabhaengig gepflegten Preis enthalten.
33. Die Serverkonfiguration validiert, dass `STRIPE_CARE_PLAN_PRICE_ID` eine verwendbare aktive Stripe Price fuer ein wiederkehrendes Abo bezeichnet.
34. Bei nicht erreichbaren, fehlenden oder ungueltigen Produkt- beziehungsweise Preisdaten bleiben Nutzen, Grenzen, Registrierung und kostenlose Funktionen sichtbar. Preis und Checkout-CTA werden durch einen neutralen Hinweis ersetzt, dass der Preis derzeit nicht verfuegbar ist und der Nutzer es spaeter erneut versuchen soll.
35. Bei fehlenden Produkt- oder Preisdaten darf weder ein fest codierter noch ein zuvor zwischengespeicherter Preis als aktuelles Angebot angezeigt werden.
36. Die bestehende Pflegeplan-Dokumentation wird auf das tatsaechliche jaehrliche Angebot und den uebergreifenden Produktbegriff abgestimmt.

## Technical Constraints

- Stack bleibt Next.js Pages Router, TypeScript, Supabase SDK und Tailwind/DaisyUI.
- Stripe bleibt Zahlungsquelle; das interne Entitlement bleibt die alleinige fachliche Autorisierung fuer bezahlte Mutationen.
- Checkout-Rueckkehrparameter duerfen niemals selbst Entitlement oder Pflegeplan-Aktivierung ausloesen.
- Eine Checkout-Erfolgsmeldung erfordert eine serverseitig abgerufene, abgeschlossene und dem eingeloggten Nutzer zugeordnete Stripe Checkout Session; ein Query-Parameter allein ist kein Erfolgsnachweis.
- Zahlung darf weiterhin keine Reminder automatisch erzeugen.
- Bestehende kostenlose manuelle Reminder und die kostenlose Pflegeplan-Vorschau bleiben unveraendert nutzbar.
- Bestehende Stripe- und Pflegeplan-Datenmodelle werden wiederverwendet; eine Datenbankmigration ist fuer diese Erweiterung nicht vorgesehen.
- Preis- und Produktabrufe muessen serverseitig erfolgen; Stripe-Geheimnisse duerfen nicht an den Browser gelangen.
- Externe Stripe-Ausfaelle muessen ohne falsche Preis- oder Zugangsversprechen behandelt werden.
- Als laufend gelten die Stripe-Subscription-Status `active`, `trialing`, `incomplete`, `past_due`, `unpaid` und `paused`; nur `canceled` und `incomplete_expired` sind fuer einen erneuten Abschluss endgueltig beendet.
- Sichtbare Texte verwenden korrektes deutsches Unicode; technische Bezeichner bleiben ASCII.
- `workflows/` wird nicht geaendert.

## Acceptance Criteria

- [x] Die Startseite erklaert den Pflegeplan, seinen Nutzen, seine Grenzen sowie aktuellen Preis und Abrechnungszeitraum.
- [x] Die Startseite enthaelt einen klaren Weg zur Registrierung beziehungsweise fuer eingeloggte Nutzer zu ihren Bonsais.
- [x] Im Schnellstart ist auffindbar, dass die optionale Pflegeplan-Pflanzenart unter den weiteren Details liegt.
- [x] Ein Bonsai ohne Pflegeplan-Pflanzenart bietet im Pflegeplan-Bereich einen direkten Link zum Bearbeiten.
- [x] Eine vorhandene Pflegeplan-Vorschau bleibt fuer Nutzer ohne Entitlement vollstaendig sichtbar.
- [x] Die Paywall zeigt Produktname, Preis, Abrechnungszeitraum, automatische Verlaengerung, enthaltene Leistung, Aboverwaltung und den manuellen Aktivierungsschritt nach Zahlung.
- [x] Der Checkout-CTA ist als kostenpflichtiges Abo eindeutig beschriftet.
- [x] Parallele Checkout-Anfragen und eine bereits offene Checkout Session erzeugen keinen zweiten unabhaengigen Kaufvorgang.
- [x] Bei einer laufenden Bonsai-Tracker-Plus-Subscription kann kein weiteres Abo abgeschlossen werden; die UI zeigt stattdessen Verarbeitung oder Aboverwaltung.
- [x] Erst nach `canceled` oder `incomplete_expired` kann derselbe Nutzer eine neue Bonsai-Tracker-Plus-Subscription abschliessen.
- [x] `checkout=success` erzeugt allein weder Entitlement noch Reminder.
- [x] Eine Checkout-Erfolgsmeldung erscheint nur nach serverseitiger Pruefung einer abgeschlossenen, dem eingeloggten Nutzer zugeordneten Checkout Session.
- [x] Eine fehlende, ungueltige, nicht abgeschlossene oder fremde Checkout-Session-ID erzeugt keine Erfolgsmeldung und veraendert keine Daten.
- [x] Nach erfolgreichem Checkout wird das Entitlement sofort und danach alle zwei Sekunden fuer maximal 30 Sekunden aktiver Vordergrundzeit geprueft; in einem nicht sichtbaren Browser-Tab pausiert das Polling.
- [x] Waehrend der Zugangsverarbeitung wird kein zweiter Checkout-CTA angeboten.
- [x] Nach aktivem Zugang ist "Pflegeplan aktivieren" der eindeutige primaere naechste Schritt.
- [x] Nach Aktivierung fuehrt ein Link zu den erzeugten System-Remindern.
- [x] `checkout=cancelled` zeigt eine neutrale Meldung und veraendert keine Daten.
- [x] Verarbeitete Checkout-Parameter werden clientseitig aus der URL entfernt.
- [x] Das Profil zeigt keine rohen Stripe-Statuswerte und bietet Aboverwaltung nur an, wenn sie nutzbar ist.
- [x] Das Profil bietet Nutzern ohne Bonsai Tracker Plus einen eigenstaendigen, eindeutig beschrifteten Checkout-Einstieg mit aktuellen Produkt- und Preisdaten.
- [x] Nach verifiziertem Profil-Checkout fuehrt der naechste Schritt zur Bonsai-Auswahl, ohne automatisch einen Pflegeplan zu aktivieren.
- [x] Sichtbare Preisangaben entsprechen der aktiven Stripe Price, die Checkout verwendet.
- [x] Eine Product-ID in `STRIPE_CARE_PLAN_PRICE_ID` wird vor dem Checkout als Konfigurationsfehler erkannt.
- [x] Bei nicht erreichbaren oder ungueltigen Stripe-Produktdaten bleiben Produktnutzen, Registrierung und kostenlose Funktionen erreichbar, waehrend Preis und Checkout-CTA nicht angezeigt werden.
- [x] Bei einem Stripe-Produktdatenfehler wird kein fest codierter oder zwischengespeicherter Preis als aktuelles Angebot ausgegeben.
- [x] Tests decken Startseiten-Copy, Paywall-Zustaende, Checkout-Rueckkehr, begrenztes Entitlement-Polling und Profil-Copy ab.
- [x] `npm test`, `npm run typecheck` und `npm run build` laufen erfolgreich.
- [ ] Die Startseite bleibt auf 390 px und 1440 px Breite ohne ueberlappende oder abgeschnittene Inhalte nutzbar. *(Manuelle Browser-QA auf Nutzerwunsch ausgelassen.)*
- [ ] Startseite und Bonsai-Detail werden im Browser auf Mobile und Desktop visuell geprueft. *(Auf Nutzerwunsch ausgelassen.)*

## Out-of-Scope

- Separate Pricing-, Feature- oder Marketing-Routen.
- Vollstaendiges Redesign der Startseite oder der Bonsai-Detailseite.
- Mehrere Tarife, Monats-/Jahres-Umschalter, Rabatte, Gutscheine oder Trials.
- Automatische Aktivierung eines Pflegeplans nach Zahlung.
- In-App-Kuendigung, Rechnungsverwaltung oder Zahlungsmittelverwaltung ausserhalb des Stripe Customer Portal.
- E-Mail-, Push- oder Kalender-Benachrichtigungen.
- Support-Ticket-System oder In-App-Chat.
- Erweiterung des Artenkatalogs oder Aenderung redaktioneller Pflegeplan-Regeln.
- Datenbankmigrationen.

## Dependencies

- Bestehende Spec: `dev/features/2026-09-06_pflegeplan-paywall/spec.md`
- Bestehende Pflegeplan- und Entitlement-APIs
- Stripe Product, Price, Checkout, Webhooks und Customer Portal
- Bestehende Startseite, Bonsai-Formular-, Bonsai-Detail- und Profiloberflaechen

## Resolved Product Decisions

1. Der oeffentliche Produktname lautet "Bonsai Tracker Plus"; der Pflegeplan ist die aktuell enthaltene bezahlte Funktion.
2. Das Angebot kostet 19,99 EUR pro Jahr entsprechend der derzeit aktiven Stripe Price.
3. Es gibt keine separate Marketing- oder Pricing-Seite; die bestehende Startseite und die kontextuelle Paywall tragen die Kommunikation.
4. Nach erfolgreicher Zahlung bleibt die Pflegeplan-Aktivierung bewusst ein separater Nutzerklick.
5. Preis und Abrechnungszeitraum werden serverseitig aus Stripe gelesen, damit Anzeige und Checkout nicht auseinanderlaufen.
6. Bei ausbleibendem Entitlement nach erfolgreichem Checkout ist `info@magrosskopf.de` der Supportkontakt; dies entspricht dem bestehenden zentralen Support-Kanal und den oeffentlichen Kontaktdaten.
7. `checkout=success` ist nur ein Navigationshinweis. Die UI bestaetigt einen erfolgreichen Checkout erst nach serverseitiger Pruefung der von Stripe uebergebenen Checkout-Session-ID; das Entitlement bleibt davon unabhaengig und wird weiterhin ausschliesslich aus Stripe-Webhook-Ereignissen abgeleitet.
8. Bonsai Tracker Plus ist das uebergreifende Subscription-Produkt und kann spaeter weitere Vorteile enthalten. Deshalb ist das Profil ein eigenstaendiger Upsell- und Checkout-Einstieg; der Pflegeplan bleibt zusaetzlich ein kontextueller Einstieg am konkreten Bonsai.
9. Pro Nutzer darf hoechstens eine offene Checkout Session beziehungsweise eine laufende Bonsai-Tracker-Plus-Subscription existieren. Ein neuer Checkout ist erst zulaessig, wenn kein offener Kaufvorgang und nur endgueltig beendete fruehere Subscriptions vorhanden sind.
10. Nach bestaetigtem Checkout prueft die UI das Entitlement sofort und danach alle zwei Sekunden fuer maximal 30 Sekunden aktiver Vordergrundzeit; bei verborgenem Browser-Tab pausiert das Polling.
11. Wenn aktuelle Stripe-Produkt- oder Preisdaten nicht sicher geladen werden koennen, bleibt die Produktkommunikation sichtbar, aber Preis und Checkout-CTA werden nicht angeboten. Es gibt keinen fest codierten oder als aktuell ausgegebenen Cache-Fallback.

## Resolved Entitlement Decision

Die Bonsai-Tracker-Plus-Subscription bleibt das uebergreifende Kaufprodukt. Die
Anwendung verwendet weiterhin das bestehende feature-spezifische `CARE_PLAN`-
Entitlement als fachliche Autorisierung fuer Pflegeplan-Mutationen. Das folgt
der bestehenden ADR 0006, vermeidet eine Datenbankmigration und laesst spaetere
Plus-Vorteile als eigene Entitlements zu.
