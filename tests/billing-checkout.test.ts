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
  customer: "cus_1",
  metadata: { user_id: "user-1" },
  ...patch,
});

test("an open Checkout Session blocks a second purchase", () => {
  const result = classifyStripePurchase([session({ status: "open" })], []);
  assert.equal(result.kind, "checkout_processing");
});

test("only terminal subscriptions permit another checkout", () => {
  for (const status of ["active", "trialing", "incomplete", "past_due", "unpaid", "paused", "unknown"]) {
    assert.equal(classifyStripePurchase([], [{ id: `sub_${status}`, status }]).kind, "subscription", status);
  }
  for (const status of ["canceled", "incomplete_expired"]) {
    assert.equal(classifyStripePurchase([], [{ id: `sub_${status}`, status }]).kind, "available", status);
  }
});

test("checkout idempotency changes only after the observed Stripe purchase state changes", () => {
  const first = classifyStripePurchase([], []);
  const terminal = classifyStripePurchase([session({ id: "cs_old", status: "expired" })], [{ id: "sub_old", status: "canceled" }]);
  assert.equal(buildCheckoutIdempotencyKey("user-1", first), buildCheckoutIdempotencyKey("user-1", first));
  assert.notEqual(buildCheckoutIdempotencyKey("user-1", first), buildCheckoutIdempotencyKey("user-1", terminal));
});

test("checkout confirmation requires a complete subscription session owned by the user", () => {
  assert.equal(isCompletedCheckoutForUser(session(), "user-1"), true);
  assert.equal(isCompletedCheckoutForUser(session({ status: "open" }), "user-1"), false);
  assert.equal(isCompletedCheckoutForUser(session({ mode: "payment" }), "user-1"), false);
  assert.equal(isCompletedCheckoutForUser(session({ metadata: { user_id: "user-2" } }), "user-1"), false);
});

test("Stripe checkout source includes the session proof and idempotent creation", () => {
  const source = readFileSync(join(process.cwd(), "lib", "stripe", "server.ts"), "utf8");
  assert.match(source, /session_id=\{CHECKOUT_SESSION_ID\}/);
  assert.match(source, /Idempotency-Key/);
  assert.match(source, /buildCheckoutIdempotencyKey/);
});
