import { getServerDataClient } from "@/lib/supabase/server-data";
import { normalizeEmail } from "@/lib/repositories/converters";

export interface SignupSettings {
  signupEnabled: boolean;
  waitlistEnabled: boolean;
  maxTotalUsers: number;
}

export async function getSignupSettings(): Promise<SignupSettings> {
  const { data, error } = await getServerDataClient().from("signup_settings").select("*").eq("id", true).single();
  if (error) {
    throw error;
  }
  return {
    signupEnabled: Boolean(data.signup_enabled),
    waitlistEnabled: Boolean(data.waitlist_enabled),
    maxTotalUsers: Number(data.max_total_users),
  };
}

export async function precheckSignup(email: string): Promise<{ allowed: boolean; reason: string; waitlistEnabled: boolean }> {
  const { data, error } = await getServerDataClient().rpc("precheck_signup", { p_email: normalizeEmail(email) });
  if (error) {
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    reason: String(row?.reason ?? "unknown"),
    waitlistEnabled: Boolean(row?.waitlist_enabled),
  };
}

export async function upsertWaitlistRequest(email: string, sourceIp: string, userAgent: string | null): Promise<void> {
  const normalized = normalizeEmail(email);
  const { error } = await getServerDataClient()
    .from("waitlist_requests")
    .upsert({ email: normalized, source_ip: sourceIp, user_agent: userAgent } as never, { onConflict: "email" });
  if (error) {
    throw error;
  }
}

export async function approveWaitlist(email: string, note: string | null = null): Promise<void> {
  const { error } = await getServerDataClient().rpc("approve_waitlist", { p_email: normalizeEmail(email), p_note: note });
  if (error) {
    throw error;
  }
}
