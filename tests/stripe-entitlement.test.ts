import assert from "node:assert/strict";
import test from "node:test";
import { stripeSubscriptionStatusGrantsCarePlan } from "@/lib/care-plans/entitlements";

test("stripe status mapping grants care-plan entitlement only for active subscription states", () => {
  for (const status of ["active", "trialing"]) {
    assert.equal(stripeSubscriptionStatusGrantsCarePlan(status), true, status);
  }

  for (const status of ["past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused", undefined, null, "mystery"]) {
    assert.equal(stripeSubscriptionStatusGrantsCarePlan(status), false, String(status));
  }
});
