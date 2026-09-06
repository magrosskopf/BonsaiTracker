export const CARE_PLAN_FEATURE = "CARE_PLAN";

export interface CarePlanEntitlement {
  userId: string;
  active: boolean;
  source: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  updatedAt: string;
}

export function stripeSubscriptionStatusGrantsCarePlan(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}
