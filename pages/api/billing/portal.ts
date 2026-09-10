import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { getStripeCustomer } from "@/lib/repositories/profiles";
import { createCustomerPortalSession } from "@/lib/stripe/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  try {
    const customer = await getStripeCustomer(actor.id);
    if (!customer) {
      fail(res, "NOT_FOUND", "Kein Stripe-Kunde für dieses Konto vorhanden.", 404);
      return;
    }
    const session = await createCustomerPortalSession(customer.stripe_customer_id);
    ok(res, { url: session.url });
  } catch {
    fail(res, "INTERNAL_SERVER_ERROR", "Das Stripe Customer Portal konnte nicht geöffnet werden.", 500);
  }
}
