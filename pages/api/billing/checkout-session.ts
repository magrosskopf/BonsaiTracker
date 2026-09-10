import type { NextApiRequest, NextApiResponse } from "next";
import { fail, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/authz";
import { isCompletedCheckoutForUser } from "@/lib/billing/plus";
import { getStripeCustomer } from "@/lib/repositories/profiles";
import { retrieveCheckoutSession } from "@/lib/stripe/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }
  const value = Array.isArray(req.query.session_id) ? req.query.session_id[0] : req.query.session_id;
  if (!value || !value.startsWith("cs_")) {
    fail(res, "BAD_REQUEST", "Der Checkout-Nachweis fehlt oder ist ungültig.", 400);
    return;
  }
  try {
    const session = await retrieveCheckoutSession(value);
    const customer = await getStripeCustomer(actor.id);
    if (!isCompletedCheckoutForUser(session, actor.id) || !customer || session.customer !== customer.stripe_customer_id) {
      fail(res, "BAD_REQUEST", "Der Checkout konnte nicht bestätigt werden.", 400);
      return;
    }
    ok(res, { confirmed: true as const });
  } catch {
    fail(res, "BAD_REQUEST", "Der Checkout konnte nicht bestätigt werden.", 400);
  }
}
