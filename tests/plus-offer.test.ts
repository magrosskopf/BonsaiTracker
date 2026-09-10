import assert from "node:assert/strict";
import test from "node:test";
import { formatPlusPrice, toPlusOffer } from "@/lib/billing/plus";

const validPrice = {
  id: "price_annual",
  active: true,
  currency: "eur",
  unit_amount: 1999,
  type: "recurring",
  recurring: { interval: "year", interval_count: 1 },
  product: { id: "prod_plus", active: true, name: "Bonsai Tracker Plus" },
};

test("active annual Stripe Price is the single source for the visible Plus offer", () => {
  assert.deepEqual(toPlusOffer(validPrice), {
    productName: "Bonsai Tracker Plus",
    priceLabel: "19,99 €",
    billingPeriodLabel: "pro Jahr",
  });
  assert.equal(formatPlusPrice(1999, "eur", "de-DE"), "19,99 €");
});

test("invalid or unavailable Stripe product data never yields a current offer", () => {
  assert.equal(toPlusOffer({ ...validPrice, id: "prod_wrong" }), null);
  assert.equal(toPlusOffer({ ...validPrice, active: false }), null);
  assert.equal(toPlusOffer({ ...validPrice, type: "one_time", recurring: null }), null);
  assert.equal(toPlusOffer({ ...validPrice, product: { ...validPrice.product, active: false } }), null);
  assert.equal(toPlusOffer({ ...validPrice, unit_amount: null }), null);
});

test("unsupported recurring intervals fail closed instead of inventing billing copy", () => {
  assert.equal(toPlusOffer({ ...validPrice, recurring: { interval: "month", interval_count: 1 } }), null);
  assert.equal(toPlusOffer({ ...validPrice, currency: "usd" }), null);
});
