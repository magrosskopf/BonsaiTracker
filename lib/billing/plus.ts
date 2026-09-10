export interface StripePriceProductLike {
  id: string;
  active: boolean;
  name: string;
}

export interface StripePriceLike {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  type: string;
  recurring: { interval: string; interval_count: number } | null;
  product: StripePriceProductLike | string | null;
}

export interface PlusOffer {
  productName: string;
  priceLabel: string;
  billingPeriodLabel: "pro Jahr";
}

export interface StripeCheckoutSessionSummary {
  id: string;
  status: string | null;
  mode: string | null;
  customer: string | null;
  metadata: Record<string, string> | null;
  url?: string | null;
}

export interface StripeSubscriptionSummary {
  id: string;
  status: string;
}

export type StripePurchaseState =
  | { kind: "available"; marker: string }
  | { kind: "checkout_processing"; marker: string }
  | { kind: "subscription"; marker: string };

export type BillingAvailability = StripePurchaseState["kind"] | "unavailable";

export interface BillingStatus {
  offer: PlusOffer | null;
  purchaseState: BillingAvailability;
  canManage: boolean;
}

const TERMINAL_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete_expired"]);

export function formatPlusPrice(amountInCents: number, currency: string, locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase() }).format(amountInCents / 100);
}

export function toPlusOffer(price: StripePriceLike): PlusOffer | null {
  if (
    !price.id.startsWith("price_") ||
    !price.active ||
    price.currency !== "eur" ||
    price.unit_amount === null ||
    price.type !== "recurring" ||
    price.recurring?.interval !== "year" ||
    price.recurring.interval_count !== 1 ||
    !price.product ||
    typeof price.product === "string" ||
    !price.product.active ||
    !price.product.name.trim()
  ) {
    return null;
  }

  return {
    productName: price.product.name,
    priceLabel: formatPlusPrice(price.unit_amount, price.currency),
    billingPeriodLabel: "pro Jahr",
  };
}

export function classifyStripePurchase(
  checkoutSessions: readonly StripeCheckoutSessionSummary[],
  subscriptions: readonly StripeSubscriptionSummary[],
): StripePurchaseState {
  const latestSession = checkoutSessions[0];
  const latestSubscription = subscriptions[0];
  const marker = `${latestSession?.id ?? "no-session"}:${latestSession?.status ?? "none"}:${latestSubscription?.id ?? "no-subscription"}:${latestSubscription?.status ?? "none"}`;
  if (checkoutSessions.some((item) => item.status === "open")) {
    return { kind: "checkout_processing", marker };
  }
  if (subscriptions.some((item) => !TERMINAL_SUBSCRIPTION_STATUSES.has(item.status))) {
    return { kind: "subscription", marker };
  }
  return { kind: "available", marker };
}

export function buildCheckoutIdempotencyKey(userId: string, purchaseState: StripePurchaseState): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const safeMarker = purchaseState.marker.replace(/[^a-zA-Z0-9:_-]/g, "-");
  return `plus-checkout:${safeUserId}:${safeMarker}`.slice(0, 255);
}

export function isCompletedCheckoutForUser(session: StripeCheckoutSessionSummary, userId: string): boolean {
  return session.status === "complete" && session.mode === "subscription" && session.metadata?.user_id === userId;
}
