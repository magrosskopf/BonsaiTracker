import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextApiRequest } from "next";
import {
  buildCheckoutIdempotencyKey,
  classifyStripePurchase,
  type PlusOffer,
  type StripeCheckoutSessionSummary,
  type StripePriceLike,
  type StripePurchaseState,
  type StripeSubscriptionSummary,
  toPlusOffer,
} from "@/lib/billing/plus";
import { getStripeServerConfig } from "@/lib/config/runtime";

interface StripeSession {
  id: string;
  url: string | null;
  customer: string | null;
}

interface StripeList<T> {
  data: T[];
}

export interface StripeSubscriptionLike {
  id: string;
  customer: string;
  status: string;
  current_period_end?: number | null;
}

function encodeForm(data: Record<string, string | number | null | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }
  return params;
}

async function stripeRequest<T>(
  path: string,
  body: Record<string, string | number | null | undefined> = {},
  method: "GET" | "POST" = "POST",
  idempotencyKey?: string,
): Promise<T> {
  const { secretKey } = getStripeServerConfig();
  const encoded = encodeForm(body);
  const response = await fetch(`https://api.stripe.com/v1${path}${method === "GET" && encoded.size ? `?${encoded}` : ""}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: method === "POST" ? encoded : undefined,
  });
  const json = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(json.error?.message ?? "Stripe request failed.");
  }
  return json;
}

export async function getCurrentPlusOffer(): Promise<PlusOffer> {
  const { carePlanPriceId } = getStripeServerConfig();
  const price = await stripeRequest<StripePriceLike>(`/prices/${encodeURIComponent(carePlanPriceId)}`, { "expand[]": "product" }, "GET");
  const offer = toPlusOffer(price);
  if (!offer) {
    throw new Error("The configured Stripe Price is not an active annual EUR subscription offer.");
  }
  return offer;
}

export async function createStripeCustomer(email: string | null, userId: string): Promise<string> {
  const customer = await stripeRequest<{ id: string }>("/customers", {
    email,
    "metadata[user_id]": userId,
  }, "POST", `plus-customer:${userId}`);
  return customer.id;
}

export async function getStripePurchaseState(customerId: string): Promise<StripePurchaseState> {
  const [sessions, subscriptions] = await Promise.all([
    stripeRequest<StripeList<StripeCheckoutSessionSummary>>("/checkout/sessions", { customer: customerId, limit: 10 }, "GET"),
    stripeRequest<StripeList<StripeSubscriptionSummary>>("/subscriptions", { customer: customerId, status: "all", limit: 10 }, "GET"),
  ]);
  return classifyStripePurchase(sessions.data, subscriptions.data);
}

export async function retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSessionSummary> {
  return stripeRequest<StripeCheckoutSessionSummary>(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {}, "GET");
}

export async function createCarePlanCheckoutSession(input: {
  userId: string;
  customerId: string;
  bonsaiId?: number | null;
  purchaseState: StripePurchaseState;
}): Promise<StripeSession> {
  const { appUrl, carePlanPriceId } = getStripeServerConfig();
  const contextPath = input.bonsaiId ? `/bonsai/${input.bonsaiId}` : "/profile";
  return stripeRequest<StripeSession>("/checkout/sessions", {
    mode: "subscription",
    customer: input.customerId,
    "line_items[0][price]": carePlanPriceId,
    "line_items[0][quantity]": 1,
    success_url: `${appUrl}${contextPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${contextPath}?checkout=cancelled`,
    "metadata[user_id]": input.userId,
    "metadata[bonsai_id]": input.bonsaiId ?? null,
    "subscription_data[metadata][user_id]": input.userId,
  }, "POST", buildCheckoutIdempotencyKey(input.userId, input.purchaseState));
}

export async function createCustomerPortalSession(customerId: string): Promise<StripeSession> {
  const { appUrl } = getStripeServerConfig();
  return stripeRequest<StripeSession>("/billing_portal/sessions", {
    customer: customerId,
    return_url: `${appUrl}/profile`,
  });
}

export async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function parseStripeSignature(header: string | string[] | undefined): { timestamp: string; signatures: string[] } | null {
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw) {
    return null;
  }
  const parts = raw.split(",").map((part) => part.split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  return timestamp && signatures.length ? { timestamp, signatures } : null;
}

export function verifyStripeWebhookSignature(rawBody: Buffer, signatureHeader: string | string[] | undefined): boolean {
  const { webhookSecret } = getStripeServerConfig();
  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed) {
    return false;
  }
  const expected = createHmac("sha256", webhookSecret)
    .update(`${parsed.timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  return parsed.signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature);
    return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
  });
}

export function currentPeriodEndFromStripe(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}
