import { getServerDataClient } from "@/lib/supabase/server-data";
import { NotFoundError } from "@/lib/supabase/errors";
import { asJsonObject, maybeIso, stripUndefined } from "@/lib/repositories/converters";
import type { BonsaiDetailRecord, BonsaiSummaryRecord } from "@/lib/mappers";
import type { BonsaiRow } from "@/types/database";
import type { DevelopmentStageOption, HealthStatusOption, IndoorOutdoorOption } from "@/types/domain";
import type { Json } from "@/types/supabase";

export interface BonsaiListFilters {
  search?: string;
  species?: string;
  healthStatus?: HealthStatusOption;
  developmentStage?: DevelopmentStageOption;
  indoorOutdoor?: IndoorOutdoorOption;
  status?: string;
  cursorUpdatedAt?: string;
  cursorId?: number;
  limit: number;
}

function bonsaiPayload(parsed: Record<string, unknown>, actorUserId: string): Record<string, unknown> {
  return stripUndefined({
    user_id: actorUserId,
    deleted_at: parsed.deletedAt,
    name: parsed.name,
    nickname: parsed.nickname,
    species: parsed.species,
    latin_name: parsed.latinName,
    location: parsed.location,
    indoor_outdoor: parsed.indoorOutdoor,
    age: parsed.age,
    height_cm: parsed.heightCm,
    width_cm: parsed.widthCm,
    trunk_diameter_mm: parsed.trunkDiameterMm,
    style: parsed.style,
    custom_style: parsed.style === "Sonstiger" ? parsed.customStyle : null,
    owned_since: maybeIso(parsed.ownedSince),
    acquired_from: parsed.acquiredFrom,
    purchase_price_cents: parsed.purchasePriceCents,
    health_status: parsed.healthStatus,
    development_stage: parsed.developmentStage,
    last_repot_date: maybeIso(parsed.lastRepotDate),
    next_repot_due: maybeIso(parsed.nextRepotDue),
    winter_hardiness: parsed.winterHardiness,
    sun_exposure: parsed.sunExposure,
    pot_type: parsed.potType,
    pot_color: parsed.potColor,
    watering_notes: parsed.wateringNotes,
    fertilizing_notes: parsed.fertilizingNotes,
    pruning_notes: parsed.pruningNotes,
    wiring_notes: parsed.wiringNotes,
    notes: parsed.notes,
    images: parsed.images,
  });
}

export async function listOwnedBonsais(actorUserId: string, filters: BonsaiListFilters): Promise<BonsaiSummaryRecord[]> {
  const { data, error } = await getServerDataClient().rpc("list_owned_bonsais", {
    p_actor_user_id: actorUserId,
    p_search: filters.search ?? null,
    p_species: filters.species ?? null,
    p_health_status: filters.healthStatus ?? null,
    p_development_stage: filters.developmentStage ?? null,
    p_indoor_outdoor: filters.indoorOutdoor ?? null,
    p_status: filters.status ?? "active",
    p_cursor_updated_at: filters.cursorUpdatedAt ?? null,
    p_cursor_id: filters.cursorId ?? null,
    p_limit: filters.limit,
  } as never);
  if (error) {
    throw error;
  }
  return (data ?? []) as BonsaiSummaryRecord[];
}

export async function createOwnedBonsai(actorUserId: string, parsed: Record<string, unknown>): Promise<{ id: number }> {
  const { data, error } = await getServerDataClient()
    .from("bonsais")
    .insert(bonsaiPayload(parsed, actorUserId) as never)
    .select("id")
    .single();
  if (error) {
    throw error;
  }
  return data as { id: number };
}

export async function getOwnedBonsai(actorUserId: string, bonsaiId: number, includeArchived = false): Promise<BonsaiDetailRecord | null> {
  let query = getServerDataClient()
    .from("bonsais")
    .select("*, sub_entries(*)")
    .eq("id", bonsaiId)
    .eq("user_id", actorUserId)
    .order("date", { referencedTable: "sub_entries", ascending: false })
    .order("id", { referencedTable: "sub_entries", ascending: false })
    .maybeSingle();

  if (!includeArchived) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data as BonsaiDetailRecord | null;
}

export async function patchOwnedBonsai(
  actorUserId: string,
  bonsaiId: number,
  patch: Record<string, unknown>,
  imagesToAdd: string[] = [],
  imagesToRemove: string[] = [],
): Promise<BonsaiRow> {
  const { data, error } = await getServerDataClient().rpc("patch_owned_bonsai", {
    p_actor_user_id: actorUserId,
    p_bonsai_id: bonsaiId,
    p_patch: asJsonObject(bonsaiPayload(patch, actorUserId)),
    p_images_to_add: imagesToAdd,
    p_images_to_remove: imagesToRemove,
  });
  if (error) {
    throw error;
  }
  return data as BonsaiRow;
}

export async function setOwnedBonsaiArchived(actorUserId: string, bonsaiId: number, archived: boolean): Promise<number> {
  const { data, error } = await getServerDataClient().rpc("set_bonsai_archived", {
    p_actor_user_id: actorUserId,
    p_bonsai_id: bonsaiId,
    p_archived: archived,
  });
  if (error) {
    throw error;
  }
  if (!data) {
    throw new NotFoundError();
  }
  return Number(data);
}

export async function appendOwnedBonsaiImage(actorUserId: string, bonsaiId: number, mediaPath: string): Promise<string[]> {
  const { data, error } = await getServerDataClient().rpc("append_bonsai_image", {
    p_actor_user_id: actorUserId,
    p_bonsai_id: bonsaiId,
    p_media_path: mediaPath,
  });
  if (error) {
    throw error;
  }
  return (data ?? []) as string[];
}

export function toBonsaiJsonPatch(parsed: Record<string, unknown>): Json {
  return asJsonObject(bonsaiPayload(parsed, ""));
}
