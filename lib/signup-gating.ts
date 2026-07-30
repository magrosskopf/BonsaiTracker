import { normalizeEmail } from "@/lib/repositories/converters";
import { getSignupSettings, precheckSignup } from "@/lib/repositories/signup";

export type SignupEligibilityReason = "NOT_APPROVED" | "CAPACITY_REACHED" | "SIGNUP_DISABLED";

export interface SignupConfig {
  signupEnabled: boolean;
  waitlistEnabled: boolean;
  maxTotalUsers: number;
}

export { normalizeEmail };

export async function getSignupConfig(): Promise<SignupConfig> {
  return getSignupSettings();
}

export async function evaluateSignupEligibility(
  email: string,
): Promise<{ allowed: true } | { allowed: false; reason: SignupEligibilityReason; waitlistEnabled: boolean }> {
  const result = await precheckSignup(email);
  if (result.allowed) {
    return { allowed: true };
  }
  const reason =
    result.reason === "capacity_reached"
      ? "CAPACITY_REACHED"
      : result.reason === "signup_disabled"
        ? "SIGNUP_DISABLED"
        : "NOT_APPROVED";
  return { allowed: false, reason, waitlistEnabled: result.waitlistEnabled };
}
