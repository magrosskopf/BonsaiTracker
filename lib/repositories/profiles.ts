import { getServerDataClient } from "@/lib/supabase/server-data";
import type { ProfileRecord } from "@/lib/mappers";
import type { ProfileRow, StripeCustomerRow, UserEntitlementRow } from "@/types/database";

const PROFILE_SELECT = "*, posts(*, profiles(name, profile_image_url), post_likes(user_id), post_comments(*, profiles(name, profile_image_url)), post_entry_references(sub_entry_id))";

export async function getProfile(profileId: string): Promise<ProfileRecord | null> {
  const { data, error } = await getServerDataClient()
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", profileId)
    .order("created_at", { referencedTable: "posts", ascending: false })
    .order("id", { referencedTable: "posts", ascending: false })
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data as ProfileRecord | null;
}

export async function updateOwnedProfile(actorUserId: string, patch: Partial<ProfileRow>): Promise<ProfileRecord | null> {
  const { error } = await getServerDataClient().from("profiles").update(patch as never).eq("id", actorUserId);
  if (error) {
    throw error;
  }
  return getProfile(actorUserId);
}

export async function getUserEntitlement(actorUserId: string, feature: string): Promise<UserEntitlementRow | null> {
  const { data, error } = await getServerDataClient()
    .from("user_entitlements")
    .select("*")
    .eq("user_id", actorUserId)
    .eq("feature", feature)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data as UserEntitlementRow | null;
}

export async function upsertUserEntitlement(patch: UserEntitlementRow): Promise<void> {
  const { error } = await getServerDataClient().from("user_entitlements").upsert(patch as never, { onConflict: "user_id,feature" });
  if (error) {
    throw error;
  }
}

export async function getStripeCustomer(actorUserId: string): Promise<StripeCustomerRow | null> {
  const { data, error } = await getServerDataClient()
    .from("stripe_customers")
    .select("*")
    .eq("user_id", actorUserId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data as StripeCustomerRow | null;
}

export async function getStripeCustomerByCustomerId(stripeCustomerId: string): Promise<StripeCustomerRow | null> {
  const { data, error } = await getServerDataClient()
    .from("stripe_customers")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data as StripeCustomerRow | null;
}

export async function upsertStripeCustomer(actorUserId: string, stripeCustomerId: string): Promise<void> {
  const { error } = await getServerDataClient()
    .from("stripe_customers")
    .upsert({ user_id: actorUserId, stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() } as never, { onConflict: "user_id" });
  if (error) {
    throw error;
  }
}

export async function recordStripeWebhookEvent(eventId: string, type: string): Promise<boolean> {
  const { error } = await getServerDataClient()
    .from("stripe_webhook_events")
    .insert({ event_id: eventId, type } as never);
  if (!error) {
    return true;
  }
  if ("code" in error && error.code === "23505") {
    return false;
  }
  throw error;
}
