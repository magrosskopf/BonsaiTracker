import type { NextApiRequest, NextApiResponse } from "next";
import { fail, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/authz";
import { getStripeCustomer } from "@/lib/repositories/profiles";
import { getCurrentPlusOffer, getStripePurchaseState } from "@/lib/stripe/server";
import type { BillingStatus } from "@/lib/billing/plus";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  const customer = await getStripeCustomer(actor.id);
  let offer: BillingStatus["offer"] = null;
  let purchaseState: BillingStatus["purchaseState"] = customer ? "unavailable" : "available";
  try {
    offer = await getCurrentPlusOffer();
  } catch {
    // The UI deliberately keeps product value visible without presenting stale price data.
  }
  if (customer) {
    try {
      purchaseState = (await getStripePurchaseState(customer.stripe_customer_id)).kind;
    } catch {
      purchaseState = "unavailable";
    }
  }
  ok(res, { offer, purchaseState, canManage: customer !== null } satisfies BillingStatus);
}
