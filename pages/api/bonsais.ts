import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { decodeCursor, encodeCursor } from "@/lib/api/cursor";
import { firstQueryValue } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { mapBonsaiSummary } from "@/lib/mappers";
import { logError, logInfo, logWarn } from "@/lib/observability";
import { createOwnedBonsai, listOwnedBonsais } from "@/lib/repositories/bonsais";
import { failWithSupabaseError } from "@/lib/supabase/errors";
import { bonsaiCreateSchema } from "@/lib/validators/bonsai";
import {
  DEVELOPMENT_STAGE_OPTIONS,
  HEALTH_STATUS_OPTIONS,
  INDOOR_OUTDOOR_OPTIONS,
  type DevelopmentStageOption,
  type HealthStatusOption,
  type IndoorOutdoorOption,
} from "@/types/domain";

function summarizeBonsaiCreatePayload(parsed: Record<string, unknown>): Record<string, unknown> {
  return {
    name: parsed.name,
    species: parsed.species,
    location: parsed.location,
    indoorOutdoor: parsed.indoorOutdoor,
    style: parsed.style,
    hasCustomStyle: typeof parsed.customStyle === "string" && parsed.customStyle.length > 0,
    ownedSince: parsed.ownedSince,
    healthStatus: parsed.healthStatus,
    developmentStage: parsed.developmentStage,
    lastRepotDate: parsed.lastRepotDate,
    nextRepotDue: parsed.nextRepotDue,
    imageCount: Array.isArray(parsed.images) ? parsed.images.length : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  if (req.method === "GET") {
    try {
      const search = firstQueryValue(req.query.search)?.trim();
      const species = firstQueryValue(req.query.species)?.trim();
      const healthStatus = firstQueryValue(req.query.healthStatus);
      const developmentStage = firstQueryValue(req.query.developmentStage);
      const indoorOutdoor = firstQueryValue(req.query.indoorOutdoor);
      const status = firstQueryValue(req.query.status);
      const sort = firstQueryValue(req.query.sort);
      const limitRaw = firstQueryValue(req.query.limit);
      const cursorRaw = firstQueryValue(req.query.cursor);
      const limit = limitRaw ? Number(limitRaw) : 20;

      if (healthStatus && !HEALTH_STATUS_OPTIONS.includes(healthStatus as (typeof HEALTH_STATUS_OPTIONS)[number])) {
        fail(res, "BAD_REQUEST", "Ungültiger healthStatus-Filter.", 400);
        return;
      }
      if (developmentStage && !DEVELOPMENT_STAGE_OPTIONS.includes(developmentStage as (typeof DEVELOPMENT_STAGE_OPTIONS)[number])) {
        fail(res, "BAD_REQUEST", "Ungültiger developmentStage-Filter.", 400);
        return;
      }
      if (indoorOutdoor && !INDOOR_OUTDOOR_OPTIONS.includes(indoorOutdoor as (typeof INDOOR_OUTDOOR_OPTIONS)[number])) {
        fail(res, "BAD_REQUEST", "Ungültiger indoorOutdoor-Filter.", 400);
        return;
      }
      const healthStatusFilter = healthStatus as HealthStatusOption | undefined;
      const developmentStageFilter = developmentStage as DevelopmentStageOption | undefined;
      const indoorOutdoorFilter = indoorOutdoor as IndoorOutdoorOption | undefined;

      if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        fail(res, "BAD_REQUEST", "limit muss zwischen 1 und 50 liegen.", 400);
        return;
      }

      if (status && !["active", "archived", "all"].includes(status)) {
        fail(res, "BAD_REQUEST", "status muss active, archived oder all sein.", 400);
        return;
      }

      if (sort && sort !== "updatedAt_desc") {
        fail(res, "BAD_REQUEST", "sort unterstützt in v1 nur updatedAt_desc.", 400);
        return;
      }

      let cursor: ReturnType<typeof decodeCursor> | null = null;
      try {
        cursor = cursorRaw ? decodeCursor(cursorRaw) : null;
      } catch {
        fail(res, "BAD_REQUEST", "Ungültiger Cursor.", 400);
        return;
      }

      const bonsais = await listOwnedBonsais(actor.id, {
        search,
        species,
        healthStatus: healthStatusFilter,
        developmentStage: developmentStageFilter,
        indoorOutdoor: indoorOutdoorFilter,
        status: status ?? "active",
        cursorUpdatedAt: cursor?.updatedAt,
        cursorId: cursor?.id,
        limit: limit + 1,
      });

      const hasMore = bonsais.length > limit;
      const visibleItems = hasMore ? bonsais.slice(0, limit) : bonsais;
      const nextCursor = hasMore
        ? encodeCursor({
            updatedAt: visibleItems[visibleItems.length - 1].updated_at,
            id: visibleItems[visibleItems.length - 1].id,
          })
        : null;

      ok(res, { items: visibleItems.map(mapBonsaiSummary), nextCursor });
      return;
    } catch (error) {
      failWithSupabaseError(res, error, "Das Dashboard konnte nicht geladen werden.", "bonsai.list_failed", {
        userId: actor.id,
      });
      return;
    }
  }

  if (req.method === "POST") {
    try {
      logInfo("bonsai.create_started", {
        userId: actor.id,
        contentType: req.headers["content-type"],
        bodyKeys: req.body && typeof req.body === "object" ? Object.keys(req.body) : [],
      });

      const parsed = bonsaiCreateSchema.parse({
        ...req.body,
        images: req.body.images ?? [],
      });
      logInfo("bonsai.create_payload_parsed", {
        userId: actor.id,
        payload: summarizeBonsaiCreatePayload(parsed),
      });

      const created = await createOwnedBonsai(actor.id, parsed);
      logInfo("bonsai.create_succeeded", {
        userId: actor.id,
        bonsaiId: created.id,
      });

      ok(res, { id: created.id }, 201);
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Bonsai-Daten sind ungültig.");
        logWarn("bonsai.create_validation_failed", {
          userId: actor.id,
          details,
        });
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      logError("bonsai.create_failed", error, { userId: actor.id });
      fail(res, "INTERNAL_SERVER_ERROR", "Der Bonsai konnte nicht erstellt werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "GET, POST");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
