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
  payment_status: string | null;
  customer: string | null;
  metadata: Record<string, string> | null;
  line_items?: { data: Array<{ price: { id: string } | string | null }> } | null;
  url?: string | null;
}

export interface StripeSubscriptionSummary {
  id: string;
  status: string;
  items: { data: Array<{ price: { id: string } | string }> };
}

export type StripePurchaseState =
  | { kind: "available"; marker: string }
  | { kind: "checkout_processing"; marker: string }
  | { kind: "subscription_processing"; marker: string }
  | { kind: "subscribed"; marker: string };

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
  priceId: string,
): StripePurchaseState {
  const plusSessions = checkoutSessions.filter((item) => {
    if (item.metadata?.price_id) return item.metadata.price_id === priceId;
    return item.line_items?.data.some((lineItem) => (typeof lineItem.price === "string" ? lineItem.price : lineItem.price?.id) === priceId) === true;
  });
  const plusSubscriptions = subscriptions.filter((item) =>
    item.items.data.some((lineItem) => (typeof lineItem.price === "string" ? lineItem.price : lineItem.price.id) === priceId),
  );
  const latestSession = plusSessions[0];
  const latestSubscription = plusSubscriptions[0];
  const marker = `${latestSession?.id ?? "no-session"}:${latestSession?.status ?? "none"}:${latestSubscription?.id ?? "no-subscription"}:${latestSubscription?.status ?? "none"}`;
  if (plusSessions.some((item) => item.status === "open")) {
    return { kind: "checkout_processing", marker };
  }
  const running = plusSubscriptions.find((item) => !TERMINAL_SUBSCRIPTION_STATUSES.has(item.status));
  if (running) {
    return { kind: running.status === "active" || running.status === "trialing" ? "subscribed" : "subscription_processing", marker };
  }
  return { kind: "available", marker };
}

export function buildCheckoutIdempotencyKey(userId: string, purchaseState: StripePurchaseState): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const safeMarker = purchaseState.marker.replace(/[^a-zA-Z0-9:_-]/g, "-");
  return `plus-checkout:${safeUserId}:${safeMarker}`.slice(0, 255);
}

export function isCompletedCheckoutForUser(session: StripeCheckoutSessionSummary, userId: string): boolean {
  return session.status === "complete" && session.payment_status === "paid" && session.mode === "subscription" && session.metadata?.user_id === userId;
}
