import type { NextApiRequest, NextApiResponse } from "next";
import { CARE_PLAN_FEATURE, stripeSubscriptionStatusGrantsCarePlan } from "@/lib/care-plans/entitlements";
import { fail, ok } from "@/lib/api/response";
import {
  currentPeriodEndFromStripe,
  readRawBody,
  verifyStripeWebhookSignature,
  type StripeSubscriptionLike,
} from "@/lib/stripe/server";
import {
  getStripeCustomerByCustomerId,
  recordStripeWebhookEvent,
  upsertUserEntitlement,
} from "@/lib/repositories/profiles";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: { object: unknown };
}

function isSubscriptionEvent(type: string): boolean {
  return type === "customer.subscription.created" || type === "customer.subscription.updated" || type === "customer.subscription.deleted";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  const rawBody = await readRawBody(req);
  if (!verifyStripeWebhookSignature(rawBody, req.headers["stripe-signature"])) {
    fail(res, "BAD_REQUEST", "Ungueltige Stripe-Signatur.", 400);
    return;
  }

  const event = JSON.parse(rawBody.toString("utf8")) as StripeWebhookEvent;
  const isNewEvent = await recordStripeWebhookEvent(event.id, event.type);
  if (!isNewEvent) {
    ok(res, { received: true, duplicate: true });
    return;
  }

  if (isSubscriptionEvent(event.type)) {
    const subscription = event.data.object as StripeSubscriptionLike;
    const customer = await getStripeCustomerByCustomerId(subscription.customer);
    if (customer) {
      await upsertUserEntitlement({
        user_id: customer.user_id,
        feature: CARE_PLAN_FEATURE,
        active: stripeSubscriptionStatusGrantsCarePlan(subscription.status),
        source: "stripe",
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
        current_period_end: currentPeriodEndFromStripe(subscription.current_period_end),
        updated_at: new Date().toISOString(),
      });
    }
  }

  ok(res, { received: true });
}
