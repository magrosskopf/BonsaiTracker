# Pflegeplan als erstes Paywall-Feature

Status: IMPLEMENTED
Created: 2026-09-06
Last Modified: 2026-09-06

## Problem Statement

Bonsai Tracker kann heute Bonsais, Pflegeeintraege und manuelle Reminder abbilden, aber Nutzer muessen selbst wissen, wann fuer eine bestimmte Pflanzenart typische Pflegearbeiten anstehen. Gerade beim Anlegen oder Pflegen mehrerer Bonsais ist diese Planung fehleranfaellig und erzeugt wiederkehrenden manuellen Aufwand.

Das erste zahlungspflichtige Feature soll diesen konkreten Mehrwert liefern: Fuer eine kuratierte Pflanzenart zeigt Bonsai Tracker eine Pflegeplan-Vorschau und kann mit aktiver Bonsai-Tracker-Plus-Subscription automatisch System-Reminder fuer typische saisonale Arbeiten erzeugen.

## Solution

Nutzer koennen beim Anlegen eines Bonsai oder spaeter im Bonsai-Kontext eine kuratierte Pflanzenart aus dem Artenkatalog waehlen. Daraus zeigt die App eine frei sichtbare Pflegeplan-Vorschau fuer die naechsten 12 rollierenden Monate. Die Vorschau zeigt geplante Reminder mit Datum, Pflegeart und kurzem Hinweis.

Die Pflegeplan-Aktivierung ist hinter der Paywall. Nutzer ohne Entitlement sehen im Pflegeplan-Kontext eine Pflegeplan-Paywall mit Stripe-Checkout-CTA. Nach erfolgreichem Checkout fuehrt die App zurueck in den Bonsai-Kontext; die Zahlung allein veraendert keinen Bonsai. Erst ein expliziter Klick auf Pflegeplan aktivieren erzeugt System-Reminder.

Die App fuehrt fuer dieses Feature die Stripe-backed Bonsai-Tracker-Plus-Subscription ein, deren erster enthaltener Vorteil der Pflegeplan ist. Stripe ist die Zahlungsquelle; die fachliche Paywall prueft serverseitig ein internes Entitlement. Aboverwaltung laeuft im ersten Schnitt ueber Stripe Customer Portal aus dem Profilbereich.

## User Stories

1. As a Bonsai Tracker user, I want to choose a curated Pflanzenart for my bonsai, so that I can receive care-plan suggestions that match the tree type.
2. As a Bonsai Tracker user, I want the existing Art-Freitext to remain available, so that I can describe my bonsai even when no curated Pflanzenart fits.
3. As a Bonsai Tracker user, I want Art-Freitext and Pflanzenart to be separate, so that accidental text matches do not activate the wrong Pflegeplan.
4. As a Bonsai Tracker user, I want to see a Pflegeplan-Vorschau before paying, so that I understand the value of the paid feature.
5. As a Bonsai Tracker user, I want the preview to cover the next 12 months, so that I know what work is coming soon.
6. As a Bonsai Tracker user, I want preview items to show date, Pflegeart, title and a short note, so that I can judge whether the plan is useful.
7. As a Bonsai Tracker user, I want care-plan dates to be labelled as typical timing, so that I know I still need to inspect my bonsai.
8. As a Bonsai Tracker user, I want watering to stay out of system-generated plans, so that I do not receive misleading watering advice.
9. As a free user, I want to see the locked activation state in context, so that I know why I cannot activate a Pflegeplan yet.
10. As a free user, I want the Paywall to appear where I try to activate the Pflegeplan, so that I do not have to navigate to a separate pricing page.
11. As a free user, I want to start Stripe Checkout from the Pflegeplan-Paywall, so that I can subscribe without losing context.
12. As a subscribing user, I want to return from Stripe Checkout to the same bonsai context, so that I can continue activating the Pflegeplan.
13. As a user who cancels Checkout, I want to return without any Pflegeplan activation, so that no reminders are created by mistake.
14. As a user who completed payment, I want payment to grant access only, so that my bonsai changes only after I explicitly activate a Pflegeplan.
15. As a paid user, I want to activate a Pflegeplan for a bonsai, so that System-Reminder are created automatically.
16. As a paid user, I want Pflegeplan activation to generate reminders for rolling 12 months from activation, so that the plan starts from my current moment.
17. As a paid user, I want generated reminders to use the 1st day of each applicable month, so that typical monthly timing becomes concrete and predictable.
18. As a paid user, I want system-generated work to include seasonal care such as fertilizing, pruning, wiring, repotting and inspection, so that I get useful bonsai planning support.
19. As a paid user, I want the Pflegeplan to consider Indoor/Outdoor rules when available, so that suggestions can differ for placement where editorially useful.
20. As a user with no Indoor/Outdoor value set, I want the Pflegeplan to assume Outdoor, so that I still get a plan without extra setup.
21. As a user with an existing bonsai, I want to add a curated Pflanzenart later, so that old bonsais can use Pflegeplaene without migration.
22. As a user with existing bonsais, I do not want automatic migration or activation, so that existing data does not change unexpectedly.
23. As a paid user, I want to see whether a Pflegeplan is active for a bonsai, so that I understand why System-Reminder exist.
24. As a paid user, I want to replace a Pflegeplan after changing the curated Pflanzenart, so that future reminders match the new species.
25. As a paid user replacing a plan, I want open System-Reminder from the old plan to be removed, so that my active planning is not polluted by obsolete suggestions.
26. As a paid user replacing a plan, I want completed System-Reminder to remain as history, so that past care actions are not lost.
27. As a user, I want System-Reminder to be visually distinguishable from Nutzer-Reminder, so that I know which reminders came from a Pflegeplan.
28. As a user, I want Nutzer-Reminder to remain fully editable, so that free manual reminder behavior does not regress.
29. As a user, I want System-Reminder not to be freely editable, so that the Pflegeplan remains traceable to editorial rules.
30. As a user, I want to mark System-Reminder as done, so that I can complete suggested work.
31. As a user, I want to snooze System-Reminder through constrained actions, so that I can defer suggested work without breaking the plan.
32. As a user, I want to remove System-Reminder from active planning, so that I can reject suggestions that do not fit my tree.
33. As a user, I want removed System-Reminder not to return during synchronization, so that the app respects my decision.
34. As a paid user, I want repeated Pflegeplan synchronization to avoid duplicates, so that my reminder list stays clean.
35. As a paid user, I want synchronization to add only missing future reminders, so that the plan can extend without recreating handled work.
36. As a user whose Subscription ends, I want existing System-Reminder to remain visible and actionable, so that paid historical planning data is not hidden or destroyed.
37. As a user whose Subscription ends, I should not be able to activate or resynchronize Pflegeplaene, so that paid generation remains behind the Paywall.
38. As a subscribed user, I want to see my Pflegeplan access status in my profile, so that I know whether the feature is active.
39. As a subscribed user, I want to open Stripe Customer Portal from my profile, so that I can cancel or update payment details.
40. As an operator, I want Stripe webhooks to update local entitlement state, so that feature access is based on server-side truth.
41. As an operator, I want Checkout return URLs not to grant access, so that users cannot bypass payment by visiting a success URL.
42. As an operator, I want `active` and `trialing` Stripe subscriptions to grant Entitlement, so that Stripe-compatible paid access works correctly.
43. As an operator, I want `past_due`, `unpaid`, `canceled`, `incomplete`, `incomplete_expired` and `paused` to revoke Entitlement, so that unpaid or incomplete states do not keep generating paid value.
44. As an operator, I want care-plan rules to be editorial app data versioned with the code, so that the first release is reviewable and testable.
45. As an operator, I want the first Artenkatalog to stay small, so that editorial quality is manageable.
46. As an operator, I want System-Reminder to store their care-plan origin, so that duplicates, removals and replacements can be handled deterministically.

## Functional Requirements

1. The feature must introduce a Pflegeplan-Vorschau for a curated Pflanzenart.
2. The Pflegeplan-Vorschau must be visible before payment.
3. Pflegeplan-Aktivierung and System-Reminder generation must require a server-side Entitlement.
4. The existing manual Nutzer-Reminder capability must remain free and editable.
5. The app must support the single annual "Bonsai Tracker Plus" Subscription for 19,99 EUR through Stripe.
6. The app must not introduce one-time purchases, tiers or trial setup in the first release.
7. The app must support Stripe Checkout from the Pflegeplan-Paywall.
8. The app must support Stripe Customer Portal from the profile/account area.
9. The app must use Stripe subscription state to update local Entitlement state.
10. Checkout return URLs must never grant Entitlement on their own.
11. The app must allow Pflegeplan activation only after Entitlement is active.
12. Payment alone must not create System-Reminder.
13. Activation must generate System-Reminder for rolling 12 months from activation.
14. Rules must generate concrete reminder dates on the 1st day of each applicable month.
15. Rules must be based on Monatsfenster, Pflegeart, title and short guidance text.
16. Watering must not be included in generated Pflegeplan-Regeln.
17. The first Pflegeplan release must exclude weather, location, climate zones and week-number logic.
18. Pflegeplan-Regeln may be general or constrained by Indoor/Outdoor.
19. If Indoor/Outdoor is missing, Pflegeplan logic must treat the bonsai as Outdoor.
20. Existing bonsais must not be migrated or auto-activated.
21. Existing bonsais must be able to receive a curated Pflanzenart and later Pflegeplan activation.
22. If the curated Pflanzenart changes after activation, the app must offer explicit Pflegeplan-Ersetzung.
23. Pflegeplan-Ersetzung must cancel open System-Reminder from the old plan.
24. Pflegeplan-Ersetzung must retain completed System-Reminder as history.
25. Pflegeplan-Synchronisierung must be idempotent.
26. Completed or removed System-Reminder must not be recreated by synchronization.
27. System-Reminder must be distinguishable from Nutzer-Reminder in UI and data.
28. System-Reminder may be marked done, snoozed through constrained actions or removed.
29. System-Reminder must not allow free editing of title, bonsai assignment, care type or generated origin.
30. If Entitlement ends, activation and synchronization must be blocked.
31. If Entitlement ends, existing System-Reminder must remain visible and actionable.
32. The UI scope must include bonsai creation, bonsai detail, reminders and profile.
33. The UI must not add a standalone pricing page in the first release.
34. The UI must display a short Pflegeplan-Hinweis in preview and active plan contexts.

## Implementation Decisions

- Use the existing Next.js Pages Router, TypeScript, Supabase SDK and Tailwind/DaisyUI stack.
- Add a care-plan domain/application layer that owns Pflegeplan-Regeln, Artenkatalog lookup, preview generation, activation, synchronization and replacement behavior.
- Store Pflegeplan-Regeln as versioned app data in code, not in user-editable records, an admin UI or database-managed editorial tables.
- Start the Artenkatalog with Ficus, Chinesische Ulme, Japanischer Ahorn, Wacholder, Kiefer, Azalee, Liguster, Hainbuche, Buche and Serissa.
- Keep the existing Art-Freitext separate from curated Pflanzenart. The app must not infer a curated species from matching free text.
- Add persistence for the curated Pflanzenart selected for a bonsai.
- Add persistence for activated Pflegeplan state per bonsai, including the plan version/species needed to detect replacements.
- Extend Reminder persistence to distinguish Nutzer-Reminder from System-Reminder.
- Store System-Reminder origin as `source=CARE_PLAN`, `carePlanVersion`, `speciesId`, `ruleId` and `targetMonth`.
- Use origin data as the idempotency key for System-Reminder generation: bonsai, care-plan version, rule and target month.
- Record removed System-Reminder as cancelled rather than hard-deleting the origin decision.
- Allow constrained System-Reminder actions: done, snooze and remove.
- Preserve full edit behavior for Nutzer-Reminder.
- Implement an internal server-side Entitlement check for all paid Pflegeplan mutations.
- Add Stripe integration for the single annual "Bonsai Tracker Plus" Subscription for 19,99 EUR.
- Use Stripe Checkout for new Subscription purchase from Pflegeplan-Paywall.
- Use Stripe webhooks as the authoritative source for local Entitlement changes.
- Treat Stripe subscription statuses `active` and `trialing` as Entitlement-active.
- Treat `past_due`, `unpaid`, `canceled`, `incomplete`, `incomplete_expired` and `paused` as Entitlement-inactive.
- Use Stripe Customer Portal for cancellation and payment-method management.
- Display local Pflegeplan access status in the profile area.
- Keep Checkout success/cancel URLs as navigation only; they may return users to the bonsai context but must not create Entitlement or reminders directly.
- Use the existing Reminder list as the cross-cutting display and action surface for both Nutzer-Reminder and System-Reminder.
- Use existing bonsai creation and bonsai detail/edit flows as the care-plan discovery and activation surfaces.
- Add API contracts for preview, activation/synchronization/replacement, Checkout session creation, Customer Portal session creation and Stripe webhook handling.
- Keep generated dates date-only and deterministic. For a Monatsfenster inside the rolling 12-month Pflegeplan-Zeitraum, the reminder date is the first day of that target month.
- Use the existing Reminder statuses where possible: pending/snoozed/done/cancelled semantics must remain consistent with current Reminder behavior.

## Testing Decisions

- Tests should verify external behavior at the highest useful seam: API contracts and repository/application operations, not internal helper implementation details.
- Care-plan generation tests should cover preview output, rolling 12-month windows, 1st-of-month dates, Indoor/Outdoor filtering, default Outdoor assumption and watering exclusion.
- Activation tests should cover Entitlement-required behavior, successful System-Reminder creation and no reminder creation from payment alone.
- Idempotency tests should cover repeated activation/synchronization without duplicate active System-Reminder.
- Replacement tests should cover old open System-Reminder cancellation and completed System-Reminder retention.
- Reminder API/UI behavior tests should cover System-Reminder restrictions and allowed actions while preserving Nutzer-Reminder editing.
- Stripe webhook tests should cover the subscription-status-to-Entitlement mapping.
- Checkout tests should cover success/cancel URL behavior as navigation only.
- Profile/API tests should cover local access status display and Customer Portal session creation.
- Existing prior art includes API/repository contract tests for bonsai mapping and reminder behavior, plus page-level tests for auth and reminder UI flows.
- Full verification should include `npm test`, `npm run typecheck` and any DB tests required by schema changes.

## Acceptance Criteria

1. A free user can select a curated Pflanzenart and see a 12-month Pflegeplan-Vorschau.
2. A free user cannot activate a Pflegeplan or generate System-Reminder.
3. A free user can start Stripe Checkout from the contextual Pflegeplan-Paywall.
4. A cancelled Checkout returns without Entitlement and without System-Reminder creation.
5. A successful Stripe subscription updates local Entitlement through server-side Stripe state.
6. Checkout return URL handling cannot grant Entitlement by itself.
7. A user with Entitlement can explicitly activate a Pflegeplan for a bonsai.
8. Activation creates System-Reminder for rolling 12 months from activation.
9. Generated System-Reminder dates use the first day of applicable months.
10. Generated System-Reminder include origin data sufficient for idempotency and replacement.
11. Repeated activation or synchronization does not create duplicate active System-Reminder.
12. Completed or removed System-Reminder are not recreated by synchronization.
13. A user can mark a System-Reminder done.
14. A user can snooze a System-Reminder through constrained actions.
15. A user can remove a System-Reminder from active planning.
16. A user cannot freely edit System-Reminder title, bonsai assignment, care type or origin.
17. A user can still freely create and edit Nutzer-Reminder without subscription.
18. If Subscription access ends, existing System-Reminder remain visible and actionable.
19. If Subscription access ends, Pflegeplan activation and synchronization are blocked.
20. Existing bonsais are not automatically migrated or activated.
21. Existing bonsais can later receive a curated Pflanzenart and activate a Pflegeplan.
22. If the curated Pflanzenart changes after activation, the app offers explicit Pflegeplan-Ersetzung.
23. Pflegeplan-Ersetzung cancels open System-Reminder from the old plan and keeps completed ones.
24. Profile shows Pflegeplan access status and offers Stripe Customer Portal access.
25. The first UI scope covers bonsai creation, bonsai detail, reminders and profile.
26. No standalone pricing page is added.
27. Pflegeplan-Hinweis appears in preview and active plan contexts.
28. `npm test` passes.
29. `npm run typecheck` passes.
30. Required database tests pass if schema migrations are added.

## Out of Scope

- User-created Pflegeplan-Regeln.
- Admin UI for Artenkatalog or Pflegeplan-Regel editing.
- Botanical database completeness or automatic species recognition.
- Inferring curated Pflanzenart from Art-Freitext.
- Watering reminders in the system-generated Pflegeplan.
- Weather, Standort, region, climate zone, week-number or exact horticultural timing logic.
- Push notifications, email reminders or calendar integrations.
- A standalone pricing page.
- Multiple subscription tiers, a monthly plan, one-time purchase or first-party trial setup.
- A first-party billing management UI beyond local status display and Stripe Customer Portal link.
- Auto-activation for existing bonsais.
- Hiding or deleting existing System-Reminder when Entitlement ends.

## Further Notes

- Relevant glossary terms are captured in `CONTEXT.md`.
- Relevant architectural decisions are recorded in ADR 0004, ADR 0005 and ADR 0006.
- This spec intentionally describes product behavior and testable contracts. Exact file paths, component names and schema names belong in the follow-up `implementation.md`.
- The `$to-spec` skill also asks to publish to an issue tracker with label `ready-for-agent`, but this repository only documents Sandcastle/GitHub issues with label `Sandcastle`; the required triage label vocabulary for `ready-for-agent` is not available in the repo.
