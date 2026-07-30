import { getServerDataClient } from "@/lib/supabase/server-data";
import { asJsonObject, maybeIso, stripUndefined } from "@/lib/repositories/converters";
import type { SubEntryRow } from "@/types/database";

function subEntryPayload(input: Record<string, unknown>): Record<string, unknown> {
  return stripUndefined({
    bonsaiId: input.bonsaiId,
    bonsai_id: input.bonsaiId,
    date: maybeIso(input.date),
    entryType: input.entryType,
    entry_type: input.entryType,
    healthObservation: input.healthObservation,
    health_observation: input.healthObservation,
    performedActions: input.performedActions,
    performed_actions: input.performedActions,
    nextAction: input.nextAction,
    next_action: input.nextAction,
    reminderDate: maybeIso(input.reminderDate),
    reminder_date: maybeIso(input.reminderDate),
    notes: input.notes,
  });
}

export async function listOwnedSubEntries(actorUserId: string, bonsaiId: number): Promise<SubEntryRow[] | null> {
  const { data: bonsai, error: bonsaiError } = await getServerDataClient()
    .from("bonsais")
    .select("id")
    .eq("id", bonsaiId)
    .eq("user_id", actorUserId)
    .is("deleted_at", null)
    .maybeSingle();
  if (bonsaiError) {
    throw bonsaiError;
  }
  if (!bonsai) {
    return null;
  }
  const { data, error } = await getServerDataClient()
    .from("sub_entries")
    .select("*")
    .eq("bonsai_id", bonsaiId)
    .order("date", { ascending: false })
    .order("id", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []) as SubEntryRow[];
}

export async function createOwnedSubEntry(actorUserId: string, payload: Record<string, unknown>, images: string[]): Promise<SubEntryRow> {
  const { data, error } = await getServerDataClient().rpc("create_owned_sub_entry", {
    p_actor_user_id: actorUserId,
    p_payload: asJsonObject(subEntryPayload(payload)),
    p_images: images,
  });
  if (error) {
    throw error;
  }
  return data as SubEntryRow;
}

export async function getOwnedSubEntry(actorUserId: string, subEntryId: number): Promise<SubEntryRow | null> {
  const { data, error } = await getServerDataClient()
    .from("sub_entries")
    .select("*, bonsais!inner(user_id, deleted_at)")
    .eq("id", subEntryId)
    .eq("bonsais.user_id", actorUserId)
    .is("bonsais.deleted_at", null)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data as SubEntryRow | null;
}

export async function patchOwnedSubEntry(
  actorUserId: string,
  subEntryId: number,
  patch: Record<string, unknown>,
  imagesToAdd: string[],
  imagesToRemove: string[],
): Promise<SubEntryRow> {
  const { data, error } = await getServerDataClient().rpc("patch_owned_sub_entry", {
    p_actor_user_id: actorUserId,
    p_sub_entry_id: subEntryId,
    p_patch: asJsonObject(subEntryPayload(patch)),
    p_images_to_add: imagesToAdd,
    p_images_to_remove: imagesToRemove,
  });
  if (error) {
    throw error;
  }
  return data as SubEntryRow;
}

export async function deleteOwnedSubEntry(actorUserId: string, subEntryId: number): Promise<string[]> {
  const { data, error } = await getServerDataClient().rpc("delete_owned_sub_entry", {
    p_actor_user_id: actorUserId,
    p_sub_entry_id: subEntryId,
  });
  if (error) {
    throw error;
  }
  return (data ?? []) as string[];
}
