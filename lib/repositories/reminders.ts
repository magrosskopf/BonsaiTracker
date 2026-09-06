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
    source: input.source,
    careType: input.careType,
    carePlanVersion: input.carePlanVersion,
    carePlanSpeciesId: input.carePlanSpeciesId,
    carePlanRuleId: input.carePlanRuleId,
    carePlanTargetMonth: input.carePlanTargetMonth,
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
    p_payload: asJsonObject(reminderPayload({ ...payload, source: "USER" })),
  });
  if (error) {
    throw error;
  }
  return getOwnedReminder(actorUserId, (data as ReminderRow).id) as Promise<ReminderRecord>;
}

export async function listOwnedCarePlanReminders(actorUserId: string, bonsaiId: number): Promise<ReminderRow[]> {
  const { data, error } = await getServerDataClient()
    .from("reminders")
    .select("*")
    .eq("user_id", actorUserId)
    .eq("bonsai_id", bonsaiId)
    .eq("source", "CARE_PLAN");
  if (error) {
    throw error;
  }
  return (data ?? []) as ReminderRow[];
}

export async function createOwnedCarePlanReminder(actorUserId: string, input: Record<string, unknown>): Promise<void> {
  const { error } = await getServerDataClient()
    .from("reminders")
    .insert({
      user_id: actorUserId,
      bonsai_id: input.bonsaiId,
      sub_entry_id: null,
      title: input.title,
      reminder_date: maybeIso(input.reminderDate),
      status: "PENDING",
      source: "CARE_PLAN",
      care_type: input.careType,
      care_plan_version: input.carePlanVersion,
      care_plan_species_id: input.carePlanSpeciesId,
      care_plan_rule_id: input.carePlanRuleId,
      care_plan_target_month: input.carePlanTargetMonth,
    } as never);
  if (error) {
    throw error;
  }
}

export async function cancelOpenOwnedCarePlanReminders(
  actorUserId: string,
  bonsaiId: number,
  keepOrigin?: { speciesId: string; version: string },
): Promise<number> {
  let query = getServerDataClient()
    .from("reminders")
    .update({ status: "CANCELLED", snoozed_until: null, completed_at: null } as never)
    .eq("user_id", actorUserId)
    .eq("bonsai_id", bonsaiId)
    .eq("source", "CARE_PLAN")
    .in("status", ["PENDING", "SNOOZED"]);
  if (keepOrigin) {
    query = query.or(`care_plan_species_id.neq.${keepOrigin.speciesId},care_plan_version.neq.${keepOrigin.version}`);
  }
  const { data, error } = await query.select("id");
  if (error) {
    throw error;
  }
  return (data ?? []).length;
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
