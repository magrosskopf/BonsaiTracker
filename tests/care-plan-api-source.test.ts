import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function source(...path: string[]): string {
  return readFileSync(join(process.cwd(), ...path), "utf8");
}

test("checkout endpoint only creates a Stripe session and does not grant local access", () => {
  const checkout = source("pages", "api", "billing", "checkout.ts");

  assert.match(checkout, /createCarePlanCheckoutSession/);
  assert.doesNotMatch(checkout, /upsertUserEntitlement/);
  assert.doesNotMatch(checkout, /createOwnedCarePlanReminder/);
});

test("stripe webhook disables body parser, verifies signature, and writes entitlement", () => {
  const webhook = source("pages", "api", "stripe", "webhook.ts");

  assert.match(webhook, /bodyParser:\s*false/);
  assert.match(webhook, /verifyStripeWebhookSignature/);
  assert.match(webhook, /recordStripeWebhookEvent/);
  assert.match(webhook, /upsertUserEntitlement/);
  assert.match(webhook, /stripeSubscriptionStatusGrantsCarePlan/);
});

test("care-plan mutations require entitlement and reminder patches restrict system reminders", () => {
  const service = source("lib", "care-plans", "service.ts");
  const reminderHandler = source("pages", "api", "reminders", "[id].ts");
  const v1ReminderHandler = source("pages", "api", "v1", "reminders", "[id].ts");

  assert.match(service, /assertEntitlement/);
  assert.match(service, /ENTITLEMENT_REQUIRED/);
  assert.match(reminderHandler, /existing\.source === "CARE_PLAN"/);
  assert.match(reminderHandler, /isAllowedCarePlanPatch/);
  assert.match(v1ReminderHandler, /legacyHandler/);
});
