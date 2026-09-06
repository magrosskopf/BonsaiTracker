import type { CarePlanServiceRepositories } from "./service";
import { getOwnedBonsai, setOwnedBonsaiCarePlanState } from "@/lib/repositories/bonsais";
import {
  cancelOpenOwnedCarePlanReminders,
  createOwnedCarePlanReminder,
  listOwnedCarePlanReminders,
} from "@/lib/repositories/reminders";
import { getUserEntitlement } from "@/lib/repositories/profiles";

export const supabaseCarePlanRepositories: CarePlanServiceRepositories = {
  async getBonsai(userId, bonsaiId) {
    return getOwnedBonsai(userId, bonsaiId);
  },
  async getEntitlement(userId, feature) {
    const entitlement = await getUserEntitlement(userId, feature);
    return entitlement
      ? {
          userId: entitlement.user_id,
          active: entitlement.active,
          source: entitlement.source,
          stripeCustomerId: entitlement.stripe_customer_id,
          stripeSubscriptionId: entitlement.stripe_subscription_id,
          stripeSubscriptionStatus: entitlement.stripe_subscription_status,
          currentPeriodEnd: entitlement.current_period_end,
          updatedAt: entitlement.updated_at,
        }
      : null;
  },
  async listCarePlanReminders(userId, bonsaiId) {
    return listOwnedCarePlanReminders(userId, bonsaiId);
  },
  async createCarePlanReminder(input) {
    return createOwnedCarePlanReminder(input.userId, {
      bonsaiId: input.bonsaiId,
      title: input.title,
      reminderDate: input.reminderDate,
      careType: input.careType,
      carePlanVersion: input.carePlanVersion,
      carePlanSpeciesId: input.carePlanSpeciesId,
      carePlanRuleId: input.carePlanRuleId,
      carePlanTargetMonth: input.carePlanTargetMonth,
    });
  },
  async cancelOpenCarePlanReminders(userId, bonsaiId, keepOrigin) {
    return cancelOpenOwnedCarePlanReminders(userId, bonsaiId, keepOrigin);
  },
  async setBonsaiCarePlanState(userId, bonsaiId, patch) {
    return setOwnedBonsaiCarePlanState(userId, bonsaiId, patch);
  },
};
