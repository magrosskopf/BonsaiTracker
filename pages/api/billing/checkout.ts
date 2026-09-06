import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { createCarePlanCheckoutSession, createStripeCustomer } from "@/lib/stripe/server";
import { getStripeCustomer, upsertStripeCustomer } from "@/lib/repositories/profiles";

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
    const bonsaiId = req.body?.bonsaiId ? Number(req.body.bonsaiId) : null;
    if (bonsaiId !== null && (!Number.isInteger(bonsaiId) || bonsaiId <= 0)) {
      fail(res, "BAD_REQUEST", "Ungueltige Bonsai-ID.", 400);
      return;
    }
    const existing = await getStripeCustomer(actor.id);
    const customerId = existing?.stripe_customer_id ?? (await createStripeCustomer(actor.email, actor.id));
    if (!existing) {
      await upsertStripeCustomer(actor.id, customerId);
    }
    const session = await createCarePlanCheckoutSession({ userId: actor.id, customerId, bonsaiId });
    ok(res, { url: session.url });
  } catch {
    fail(res, "INTERNAL_SERVER_ERROR", "Stripe Checkout konnte nicht gestartet werden.", 500);
  }
}
