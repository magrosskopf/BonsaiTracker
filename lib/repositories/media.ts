import { getServerDataClient } from "@/lib/supabase/server-data";

export async function canAccessMedia(actorUserId: string, storageKey: string): Promise<boolean> {
  const { data, error } = await getServerDataClient().rpc("can_access_media", {
    p_actor_user_id: actorUserId,
    p_media_path: `/api/media/${storageKey}`,
  });
  if (error) {
    throw error;
  }
  return Boolean(data);
}

export async function canDeleteMedia(actorUserId: string, storageKey: string): Promise<boolean> {
  const { data, error } = await getServerDataClient().rpc("can_delete_media", {
    p_actor_user_id: actorUserId,
    p_media_path: `/api/media/${storageKey}`,
  });
  if (error) {
    throw error;
  }
  return Boolean(data);
}
