import { getServerDataClient } from "@/lib/supabase/server-data";
import { NotFoundError } from "@/lib/supabase/errors";
import { asJsonObject, maybeIso, stripUndefined } from "@/lib/repositories/converters";
import type { BonsaiDetailRecord, BonsaiSummaryRecord } from "@/lib/mappers";
import type { BonsaiRow, SubEntryRow } from "@/types/database";
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

function sanitizePostgrestSearchTerm(value: string): string {
  return value.replace(/[,*()]/g, " ").trim();
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
  const supabase = getServerDataClient();
  let query = supabase
    .from("bonsais")
    .select("*")
    .eq("user_id", actorUserId)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(filters.limit);

  if (filters.status === "archived") {
    query = query.not("deleted_at", "is", null);
  } else if (filters.status !== "all") {
    query = query.is("deleted_at", null);
  }
  if (filters.species) {
    query = query.eq("species", filters.species);
  }
  if (filters.healthStatus) {
    query = query.eq("health_status", filters.healthStatus);
  }
  if (filters.developmentStage) {
    query = query.eq("development_stage", filters.developmentStage);
  }
  if (filters.indoorOutdoor) {
    query = query.eq("indoor_outdoor", filters.indoorOutdoor);
  }
  if (filters.search) {
    const term = sanitizePostgrestSearchTerm(filters.search);
    if (term) {
      query = query.or(`name.ilike.*${term}*,species.ilike.*${term}*,latin_name.ilike.*${term}*,location.ilike.*${term}*`);
    }
  }
  if (filters.cursorUpdatedAt) {
    query = query.or(
      `updated_at.lt.${filters.cursorUpdatedAt},and(updated_at.eq.${filters.cursorUpdatedAt},id.lt.${filters.cursorId ?? 2147483647})`,
    );
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const bonsais = (data ?? []) as BonsaiRow[];
  const ids = bonsais.map((bonsai) => bonsai.id);
  if (ids.length === 0) {
    return [];
  }

  const { data: subEntries, error: subEntryError } = await supabase.from("sub_entries").select("bonsai_id").in("bonsai_id", ids);
  if (subEntryError) {
    throw subEntryError;
  }

  const subEntryCounts = new Map<number, number>();
  for (const entry of (subEntries ?? []) as Pick<SubEntryRow, "bonsai_id">[]) {
    subEntryCounts.set(entry.bonsai_id, (subEntryCounts.get(entry.bonsai_id) ?? 0) + 1);
  }

  return bonsais.map((bonsai) => ({
    ...bonsai,
    sub_entry_count: subEntryCounts.get(bonsai.id) ?? 0,
  }));
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
