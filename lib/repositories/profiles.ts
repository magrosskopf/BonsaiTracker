import { getServerDataClient } from "@/lib/supabase/server-data";
import type { ProfileRecord } from "@/lib/mappers";
import type { ProfileRow } from "@/types/database";

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
