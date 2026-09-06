import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextApiRequest } from "next";
import { getStripeServerConfig } from "@/lib/config/runtime";

interface StripeSession {
  id: string;
  url: string | null;
  customer: string | null;
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

async function stripeRequest<T>(path: string, body: Record<string, string | number | null | undefined>): Promise<T> {
  const { secretKey } = getStripeServerConfig();
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeForm(body),
  });
  const json = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(json.error?.message ?? "Stripe request failed.");
  }
  return json;
}

export async function createStripeCustomer(email: string | null, userId: string): Promise<string> {
  const customer = await stripeRequest<{ id: string }>("/customers", {
    email,
    "metadata[user_id]": userId,
  });
  return customer.id;
}

export async function createCarePlanCheckoutSession(input: {
  userId: string;
  customerId: string;
  bonsaiId?: number | null;
}): Promise<StripeSession> {
  const { appUrl, carePlanPriceId } = getStripeServerConfig();
  const contextPath = input.bonsaiId ? `/bonsai/${input.bonsaiId}` : "/profile";
  return stripeRequest<StripeSession>("/checkout/sessions", {
    mode: "subscription",
    customer: input.customerId,
    "line_items[0][price]": carePlanPriceId,
    "line_items[0][quantity]": 1,
    success_url: `${appUrl}${contextPath}?checkout=success`,
    cancel_url: `${appUrl}${contextPath}?checkout=cancelled`,
    "metadata[user_id]": input.userId,
    "metadata[bonsai_id]": input.bonsaiId ?? null,
    "subscription_data[metadata][user_id]": input.userId,
  });
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
