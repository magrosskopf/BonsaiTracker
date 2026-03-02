import type { NextApiRequest, NextApiResponse } from "next";
import type { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { decodeCursor, encodeCursor } from "@/lib/api/cursor";
import { firstQueryValue } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { mapBonsaiSummary } from "@/lib/mappers";
import { bonsaiCreateSchema } from "@/lib/validators/bonsai";
import {
  DEVELOPMENT_STAGE_OPTIONS,
  HEALTH_STATUS_OPTIONS,
  INDOOR_OUTDOOR_OPTIONS,
  type DevelopmentStageOption,
  type HealthStatusOption,
  type IndoorOutdoorOption,
} from "@/types/domain";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = await requireUser(req, res);
  if (!userId) {
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

      const cursor = cursorRaw ? decodeCursor(cursorRaw) : null;
      const statusFilter =
        status === "archived" ? { deletedAt: { not: null } } :
        status === "all" ? {} :
        { deletedAt: null };
      const where: Prisma.BonsaiWhereInput = {
        AND: [
          { userId, ...statusFilter },
          ...(species ? [{ species }] : []),
          ...(healthStatusFilter ? [{ healthStatus: healthStatusFilter }] : []),
          ...(developmentStageFilter ? [{ developmentStage: developmentStageFilter }] : []),
          ...(indoorOutdoorFilter ? [{ indoorOutdoor: indoorOutdoorFilter }] : []),
          ...(search
            ? [
                {
                  OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { nickname: { contains: search, mode: "insensitive" as const } },
                    { species: { contains: search, mode: "insensitive" as const } },
                    { latinName: { contains: search, mode: "insensitive" as const } },
                    { location: { contains: search, mode: "insensitive" as const } },
                    { notes: { contains: search, mode: "insensitive" as const } },
                    { customStyle: { contains: search, mode: "insensitive" as const } },
                  ],
                },
              ]
            : []),
          ...(cursor
            ? [
                {
                  OR: [
                    { updatedAt: { lt: new Date(cursor.updatedAt) } },
                    {
                      AND: [
                        { updatedAt: new Date(cursor.updatedAt) },
                        { id: { lt: cursor.id } },
                      ],
                    },
                  ],
                },
              ]
            : []),
        ],
      };

      const bonsais = await prisma.bonsai.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        include: {
          _count: {
            select: {
              subEntries: true,
            },
          },
        },
      });

      const hasMore = bonsais.length > limit;
      const visibleItems = hasMore ? bonsais.slice(0, limit) : bonsais;
      const nextCursor = hasMore
        ? encodeCursor({
            updatedAt: visibleItems[visibleItems.length - 1].updatedAt.toISOString(),
            id: visibleItems[visibleItems.length - 1].id,
          })
        : null;

      ok(res, { items: visibleItems.map((bonsai) => mapBonsaiSummary(bonsai as Parameters<typeof mapBonsaiSummary>[0])), nextCursor });
      return;
    } catch (error) {
      fail(res, "BAD_REQUEST", "Ungültiger Cursor oder ungültige Filterparameter.", 400);
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = bonsaiCreateSchema.parse({
        ...req.body,
        images: req.body.images ?? [],
      });

      const created = await prisma.bonsai.create({
        data: {
          ...parsed,
          userId,
          customStyle: parsed.style === "Sonstiger" ? parsed.customStyle : null,
        } as Prisma.BonsaiUncheckedCreateInput,
        select: { id: true },
      });

      ok(res, { id: created.id }, 201);
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Bonsai-Daten sind ungültig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Bonsai konnte nicht erstellt werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "GET, POST");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
