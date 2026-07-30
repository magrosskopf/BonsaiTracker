import { getServerDataClient } from "@/lib/supabase/server-data";
import { asJsonObject, maybeIso, stripUndefined } from "@/lib/repositories/converters";
import type { ReminderRecord } from "@/lib/mappers";
import type { ReminderRow } from "@/types/database";
import type { ReminderStatusOption } from "@/types/domain";

function reminderPayload(input: Record<string, unknown>): Record<string, unknown> {
  return stripUndefined({
    bonsaiId: input.bonsaiId,
    subEntryId: input.subEntryId,
    title: input.title,
    reminderDate: maybeIso(input.reminderDate),
    status: input.status,
    completedAt: maybeIso(input.completedAt),
    snoozedUntil: maybeIso(input.snoozedUntil),
  });
}

export async function listOwnedReminders(
  actorUserId: string,
  filters: { status?: ReminderStatusOption; bonsaiId?: number; includeDone?: boolean },
): Promise<ReminderRecord[]> {
  let query = getServerDataClient()
    .from("reminders")
    .select("*, bonsais(name, deleted_at)")
    .eq("user_id", actorUserId)
    .order("reminder_date", { ascending: true })
    .order("id", { ascending: true });
  if (filters.status) {
    query = query.eq("status", filters.status);
  } else if (!filters.includeDone) {
    query = query.in("status", ["PENDING", "SNOOZED"]);
  }
  if (filters.bonsaiId) {
    query = query.eq("bonsai_id", filters.bonsaiId);
  }
  if (!filters.includeDone) {
    query = query.is("bonsais.deleted_at", null);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return (data ?? []) as ReminderRecord[];
}

export async function createOwnedReminder(actorUserId: string, payload: Record<string, unknown>): Promise<ReminderRecord> {
  const { data, error } = await getServerDataClient().rpc("create_owned_reminder", {
    p_actor_user_id: actorUserId,
    p_payload: asJsonObject(reminderPayload(payload)),
  });
  if (error) {
    throw error;
  }
  return getOwnedReminder(actorUserId, (data as ReminderRow).id) as Promise<ReminderRecord>;
}

export async function getOwnedReminder(actorUserId: string, reminderId: number): Promise<ReminderRecord | null> {
  const { data, error } = await getServerDataClient()
    .from("reminders")
    .select("*, bonsais(name, deleted_at)")
    .eq("id", reminderId)
    .eq("user_id", actorUserId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data as ReminderRecord | null;
}

export async function patchOwnedReminder(actorUserId: string, reminderId: number, patch: Partial<ReminderRow>): Promise<ReminderRecord | null> {
  const { data, error } = await getServerDataClient()
    .from("reminders")
    .update(patch as never)
    .eq("id", reminderId)
    .eq("user_id", actorUserId)
    .select("*, bonsais(name, deleted_at)")
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data as ReminderRecord | null;
}
