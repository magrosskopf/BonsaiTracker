import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  buildCheckoutIdempotencyKey,
  classifyStripePurchase,
  isCompletedCheckoutForUser,
  type StripeCheckoutSessionSummary,
} from "@/lib/billing/plus";

const session = (patch: Partial<StripeCheckoutSessionSummary> = {}): StripeCheckoutSessionSummary => ({
  id: "cs_latest",
  status: "complete",
  mode: "subscription",
  payment_status: "paid",
  customer: "cus_1",
  metadata: { user_id: "user-1" },
  line_items: { data: [{ price: { id: "price_annual" } }] },
  ...patch,
});

test("an open Checkout Session blocks a second purchase", () => {
  const result = classifyStripePurchase([session({ status: "open" })], [], "price_annual");
  assert.equal(result.kind, "checkout_processing");
});

test("only terminal subscriptions permit another checkout", () => {
  for (const status of ["active", "trialing", "incomplete", "past_due", "unpaid", "paused", "unknown"]) {
    const kind = status === "active" || status === "trialing" ? "subscribed" : "subscription_processing";
    assert.equal(classifyStripePurchase([], [{ id: `sub_${status}`, status, items: { data: [{ price: { id: "price_annual" } }] } }], "price_annual").kind, kind, status);
  }
  for (const status of ["canceled", "incomplete_expired"]) {
    const subscriptions = [{ id: `sub_${status}`, status, items: { data: [{ price: { id: "price_annual" } }] } }];
    assert.equal(classifyStripePurchase([], subscriptions, "price_annual").kind, "available", status);
  }
});

test("checkout idempotency changes only after the observed Stripe purchase state changes", () => {
  const first = classifyStripePurchase([], [], "price_annual");
  const terminal = classifyStripePurchase([session({ id: "cs_old", status: "expired" })], [{ id: "sub_old", status: "canceled", items: { data: [{ price: "price_annual" }] } }], "price_annual");
  assert.equal(buildCheckoutIdempotencyKey("user-1", first), buildCheckoutIdempotencyKey("user-1", first));
  assert.notEqual(buildCheckoutIdempotencyKey("user-1", first), buildCheckoutIdempotencyKey("user-1", terminal));
});

test("checkout confirmation requires a complete subscription session owned by the user", () => {
  assert.equal(isCompletedCheckoutForUser(session(), "user-1"), true);
  assert.equal(isCompletedCheckoutForUser(session({ status: "open" }), "user-1"), false);
  assert.equal(isCompletedCheckoutForUser(session({ mode: "payment" }), "user-1"), false);
  assert.equal(isCompletedCheckoutForUser(session({ payment_status: "unpaid" }), "user-1"), false);
  assert.equal(isCompletedCheckoutForUser(session({ metadata: { user_id: "user-2" } }), "user-1"), false);
});

test("unrelated Stripe products do not block the Plus checkout", () => {
  const unrelatedSession = session({ status: "open", metadata: { user_id: "user-1", price_id: "price_other" }, line_items: { data: [{ price: "price_other" }] } });
  const unrelatedSubscription = { id: "sub_other", status: "active", items: { data: [{ price: { id: "price_other" } }] } };
  assert.equal(classifyStripePurchase([unrelatedSession], [unrelatedSubscription], "price_annual").kind, "available");
});

test("Stripe checkout source includes the session proof and idempotent creation", () => {
  const source = readFileSync(join(process.cwd(), "lib", "stripe", "server.ts"), "utf8");
  assert.match(source, /session_id=\{CHECKOUT_SESSION_ID\}/);
  assert.match(source, /Idempotency-Key/);
  assert.match(source, /buildCheckoutIdempotencyKey/);
  assert.match(source, /has_more/);
  assert.match(source, /starting_after/);
  assert.match(source, /\/line_items/);
});
