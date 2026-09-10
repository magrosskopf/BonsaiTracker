# Implementation Plan: Pflegeplan Launch Experience

**Status**: VERIFY
**Created**: 2026-09-10
**Last Modified**: 2026-09-10

## Overview

Die bestehende Startseite, der Bonsai-Pflegeplan-Kontext und das Profil werden
um eine konsistente Bonsai-Tracker-Plus-Kommunikation erweitert. Aktuelle
Produkt- und Preisdaten kommen bei jedem Angebot serverseitig aus derselben
aktiven Stripe Price, die Checkout verwendet. Checkout-Duplikate werden durch
Stripe-Zustandspruefung und deterministische Idempotency Keys verhindert.
Rueckkehrparameter werden serverseitig verifiziert und fuehren durch einen
zeitlich begrenzten, sichtbarkeitsbewussten Entitlement-Abgleich, ohne selbst
Zugang oder Reminder zu erzeugen.

## Reference

- Spec: [spec.md](./spec.md)
- Domain: `CONTEXT.md`
- Stripe-/Entitlement-Entscheidung: `docs/adr/0006-stripe-backed-care-plan-entitlement.md`
- Bestehende Paywall-Spec: `dev/features/2026-09-06_pflegeplan-paywall/spec.md`
- Test-Seams laut Acceptance Criteria: Startseiten-Copy, Paywall-Zustaende,
  Checkout-Rueckkehr, begrenztes Entitlement-Polling und Profil-Copy

## File Structure

### New files

- `lib/billing/plus.ts`: gemeinsame Angebots-, Kaufzustands- und UI-Typen sowie
  Formatierung ohne Stripe-Geheimnisse
- `lib/billing/checkout-return.ts`: testbarer Controller fuer Verifikation,
  URL-Bereinigung und 2-Sekunden-Polling ueber maximal 30 Sekunden aktive
  Vordergrundzeit
- `lib/billing/use-billing.ts`: gemeinsamer Client-Hook fuer Statusabruf,
  Checkout, Portal, Fehler und lokale Kaufzustandsuebergaenge
- `components/PlusOfferCard.tsx`: kompakte wiederverwendbare Produkt-/Kaufbox
- `components/CheckoutReturnNotice.tsx`: Bonsai-/Profil-spezifische
  Rueckkehrmeldung und Aktivierungsfuehrung
- `pages/api/billing/status.ts`: authentifizierter aktueller Angebots-,
  Stripe-Kauf- und Verwaltungszustand
- `pages/api/billing/checkout-session.ts`: read-only Verifikation einer
  abgeschlossenen Checkout Session fuer den eingeloggten Nutzer
- `tests/plus-offer.test.ts`: Produktvalidierung, Formatierung und Copy-Seam
- `tests/billing-checkout.test.ts`: Checkout-Zustandsklassifikation,
  Duplikatschutz, Session-Eigentum und Success-URL
- `tests/checkout-return.test.ts`: Rueckkehrzustand, URL-Bereinigung und
  aktives/pausiertes/begrenztes Polling
- `tests/plus-ui-source.test.ts`: Startseiten-, Paywall-, Profil- und
  Schnellstart-Copy sowie relevante Navigationspfade

### Modified files

- `lib/stripe/server.ts`: GET/POST-Client, Price/Product-Abruf und -Validierung,
  Checkout-/Subscription-Inspektion, idempotente Customer-/Session-Erzeugung,
  Checkout-Session-Verifikation
- `lib/config/runtime.ts`: Price-ID-Grundvalidierung mit klarer
  Konfigurationsfehlermeldung
- `pages/api/billing/checkout.ts`: vorhandenen Kaufzustand vor Erstellung
  pruefen und strukturierte Ergebnisse (`redirect`, `processing`, `manage`)
  liefern
- `pages/index.tsx`: serverseitig geladenes Angebot, kompakter
  Pflegeplan-Produktabschnitt und kontextgerechter Registrierungs-/Bonsai-Link
- `components/BonsaiForm.tsx`, `lib/config/forms.ts`: auffindbarer Hinweis im
  Schnellstart und klare Trennung von Art-Freitext und Pflanzenart
- `pages/bonsai/[id].tsx`: direkter Bearbeiten-Link, unveraenderte Vorschau,
  Kaufbox-/Verarbeitungs-/Verwaltungszustaende, verifizierte Rueckkehr,
  Polling und Reminder-Link nach Aktivierung
- `pages/profile.tsx`: eigenstaendiger Plus-Upsell oder aktive
  Abozusammenfassung, Portal nur bei Kundenbezug, verifizierte Rueckkehr mit
  Bonsai-Auswahl als naechstem Schritt
- `dev/features/2026-09-06_pflegeplan-paywall/spec.md` und
  `docs/adr/0006-stripe-backed-care-plan-entitlement.md`: Jahresangebot und
  uebergreifenden Produktbegriff konsistent halten, soweit noch erforderlich
- `dev/features/2026-09-09_pflegeplan-launch-experience/spec.md`: Status und
  Acceptance Criteria nach erfolgreicher Verifikation aktualisieren

## Code Architecture

1. `lib/stripe/server.ts` bleibt der einzige Stripe-Adapter. Er gibt interne,
   schmale Typen zurueck und validiert `STRIPE_CARE_PLAN_PRICE_ID` gegen eine
   aktive wiederkehrende Price samt aktivem Product.
2. `lib/billing/plus.ts` bildet Stripe-Daten auf browser-sichere DTOs und einen
   endlichen Kaufzustand ab: `available`, `checkout_processing`,
   `subscription_processing`, `subscribed`. Laufende Stripe-Status folgen der
   Spec; das `CARE_PLAN`-Entitlement bleibt davon getrennt.
3. `pages/api/billing/status.ts` verbindet Nutzer, Stripe-Kunde, aktuelles
   Angebot und Kaufzustand. Schlaegt Stripe fehl, wird kein Preis geliefert.
4. `pages/api/billing/checkout.ts` prueft unmittelbar vor Session-Erzeugung
   offene Sessions und laufende Subscriptions. Deterministische Idempotency Keys
   basieren auf Nutzer und zuletzt beobachtetem Stripe-Kaufzustand, sodass
   parallele Requests dieselbe Session erhalten, ein spaeterer terminaler
   Vorgang aber einen neuen Checkout erlaubt.
5. `pages/api/billing/checkout-session.ts` bestaetigt nur Sessions mit
   `status=complete` und passender `metadata.user_id`; die Route mutiert weder
   Entitlement noch Bonsai oder Reminder.
6. `CheckoutReturnNotice` verarbeitet `success`/`cancelled`, entfernt danach
   `checkout` und `session_id` per shallow `router.replace` und startet nach
   bestaetigtem Erfolg den Controller. Der Controller zaehlt nur sichtbare
   Vordergrundzeit, prueft sofort und dann alle zwei Sekunden bis maximal 30
   Sekunden und pausiert bei `document.hidden`.
7. `PlusOfferCard` rendert Nutzen und Grenzen auch ohne Preis. Nur bei aktuellem
   validem Angebot und erlaubtem Kaufzustand erscheint der zahlungspflichtige
   CTA.
8. `useBilling` kapselt die auf Profil und Bonsai-Detail identischen Client-
   Ablaeufe fuer Status, Checkout, Portal und Fehler. Der vorhandene
   Stripe-Kundenbezug kommt damit aus `billing/status`; das Profil-DTO bleibt
   bewusst frei von zusaetzlichen Billing-Transportdetails.

## Implementation Refinements

- Der Kundenbezug wird ausschliesslich ueber `pages/api/billing/status.ts`
  transportiert. Dadurch waren die im ersten Dateientwurf genannten Aenderungen
  an `pages/api/profile/me.ts`, `lib/mappers.ts` und `types/dto.ts` nicht
  erforderlich.
- Die zunaechst duplizierten Client-Aktionen wurden im Review in `useBilling`
  zusammengezogen.
- Stripe-Listen werden vollstaendig paginiert und anhand der konfigurierten
  Price gefiltert, damit weder alte Plus-Vorgaenge uebersehen noch fremde
  Produkte als Plus behandelt werden.

## Implementation Steps (vertical TDD slices)

1. **Stripe-Angebot**: failing tests fuer Price-ID, aktive recurring Price,
   aktives Product und EUR/Jahr-Formatierung; minimale Adapter-/Domainlogik;
   anschliessend Homepage-Angebotsabschnitt und Fehlerfallback.
2. **Kaufzustand und Duplikatschutz**: failing tests fuer offene Session,
   laufende/terminale Subscription und Idempotency; Stripe-Inspektion und
   Checkout-API implementieren; Paywall/Profile auf strukturierte Zustaende
   umstellen.
3. **Sichere Rueckkehr**: failing tests fuer fehlende, fremde und nicht
   abgeschlossene Session sowie bestaetigte Session; read-only API und Success-
   URL mit `{CHECKOUT_SESSION_ID}` implementieren.
4. **Polling**: failing Fake-Timer-Tests fuer Sofortpruefung, Zwei-Sekunden-
   Intervall, Pause im versteckten Tab, 30 Sekunden aktive Zeit und manuellen
   Retry; Controller und wiederverwendbare Rueckkehranzeige integrieren.
5. **Bonsai-Fuehrung**: failing Copy-/Source-Test fuer direkten Edit-Link,
   Feldtrennung, Kaufbox, Verarbeitung, Aktivierungs- und Reminder-Link;
   Bonsai-Detail und Schnellstart implementieren.
6. **Profil-Fuehrung**: failing Copy-/Source-Test fuer eigenstaendigen Checkout,
   Jahres-/Periodenanzeige, fehlende rohe Statuswerte, bedingtes Portal und
   Bonsai-Folgeschritt; Profil/API-DTO implementieren.
7. **Dokumentation und responsive QA**: Angebotsdokumentation angleichen,
   Status/Checklisten aktualisieren, Startseite und Bonsai-Detail bei 390 px und
   1440 px im Browser pruefen und visuelle Probleme beheben.

Nach jedem Slice laufen die betroffene Testdatei und `npm run typecheck`.

## Integration Points

- Supabase Auth bleibt Eigentumsquelle fuer jede Billing-API.
- `stripe_customers` und `user_entitlements` werden unveraendert wiederverwendet.
- Stripe Webhooks bleiben die einzige Quelle, die das `CARE_PLAN`-Entitlement
  schreibt.
- Pflegeplan-POST und Reminder-Erzeugung bleiben hinter dem bestehenden
  Entitlement-Check.
- Stripe Customer Portal bleibt der einzige Verwaltungsort.

## Edge Cases & Error Handling

- Fehlende/Product-ID statt Price-ID/inaktive/einmalige Price, inaktives oder
  expandierbares Product, fehlender Betrag oder Stripe-Ausfall: Nutzen bleibt,
  aber kein Preis und kein Checkout-CTA.
- Gleichzeitige Checkout-Requests: identischer Stripe Idempotency Key;
  vorhandene offene Session: neutraler Verarbeitungszustand.
- `active`, `trialing`, `incomplete`, `past_due`, `unpaid`, `paused`: kein neuer
  Checkout; bei Subscription wird zur Verwaltung gefuehrt.
- `canceled`, `incomplete_expired`: erneuter Checkout erlaubt.
- Fehlende/falsche/unvollstaendige/fremde Session-ID: keine Erfolgsmeldung,
  keine Mutation, handlungsorientierter neutraler Fehler.
- Checkout bestaetigt, Webhook verzoegert: Kaufbox ausgeblendet, maximal 30
  Sekunden aktive Vordergrundzeit; danach Retry, Aboverwaltung und Support.
- Abbruch: neutrale Meldung, URL-Bereinigung, keine Polling-/Mutationsaktion.
- Kein Stripe-Kundenbezug: kein Portal-Button.

## Validation Checklist

- [ ] Einzeltests jedes TDD-Slices sind rot vor und gruen nach Implementierung.
- [ ] `npm run typecheck` laeuft regelmaessig und abschliessend erfolgreich.
- [ ] `npm test` laeuft einmal am Ende erfolgreich.
- [ ] `npm run build` laeuft erfolgreich.
- [ ] Startseite und Bonsai-Detail sind bei 390 px und 1440 px visuell geprueft.
- [ ] Checkout-Erfolg schreibt kein Entitlement und erzeugt keine Reminder.
- [ ] Product-ID und ungueltige/inaktive Stripe-Angebote werden fail-closed
  behandelt.
- [ ] Keine fest codierte sichtbare Preisangabe dient als aktuelles Angebot.
- [ ] Bestehende nutzereigene Arbeitsbaum-Aenderungen bleiben erhalten.
- [ ] Abschliessender Zwei-Achsen-Code-Review gegen den Start-Commit ist ohne
  offene relevante Findings oder Findings wurden behoben und erneut geprueft.
- [ ] Spec ist `IMPLEMENTED`, Plan ist `COMPLETE`, Feature-Commit ist erstellt.
