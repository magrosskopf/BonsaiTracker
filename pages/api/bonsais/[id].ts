import type { NextApiRequest, NextApiResponse } from "next";
import type { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedBonsaiIncludingArchived, getOwnedBonsaiOr404, requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { mapBonsaiDetail } from "@/lib/mappers";
import { bonsaiPatchSchema, bonsaiPersistedSchema } from "@/lib/validators/bonsai";

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = await requireUser(req, res);
  if (!userId) {
    return;
  }

  const bonsaiId = parseId(req.query.id);
  if (!bonsaiId) {
    fail(res, "BAD_REQUEST", "Ungültige Bonsai-ID.", 400);
    return;
  }

  if (req.method === "GET") {
    const bonsai = await prisma.bonsai.findFirst({
      where: { id: bonsaiId, userId },
      include: {
        subEntries: {
          orderBy: [{ date: "desc" }, { id: "desc" }],
        },
      },
    });

    if (!bonsai) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }

    ok(res, mapBonsaiDetail(bonsai));
    return;
  }

  if (req.method === "PATCH") {
    const restore = req.body?.restore === true;
    const existing = restore ? await getOwnedBonsaiIncludingArchived(bonsaiId, userId) : await getOwnedBonsaiOr404(bonsaiId, userId);
    if (!existing) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }

    if (restore) {
      const restored = await prisma.bonsai.update({
        where: { id: bonsaiId },
        data: { deletedAt: null },
        include: {
          subEntries: {
            orderBy: [{ date: "desc" }, { id: "desc" }],
          },
        },
      });

      await prisma.reminder.updateMany({
        where: {
          bonsaiId,
          userId,
          status: "SNOOZED",
        },
        data: {
          status: "PENDING",
          snoozedUntil: null,
        },
      });

      ok(res, mapBonsaiDetail(restored as Parameters<typeof mapBonsaiDetail>[0]));
      return;
    }

    try {
      const patch = bonsaiPatchSchema.parse(req.body);
      const candidate = bonsaiPersistedSchema.parse({
        ...existing,
        ...patch,
        style: patch.style ?? existing.style,
        customStyle: patch.style
          ? patch.style === "Sonstiger"
            ? (patch.customStyle ?? existing.customStyle)
            : null
          : patch.customStyle ?? existing.customStyle,
        images: patch.images ?? existing.images,
      });

      const updated = await prisma.bonsai.update({
        where: { id: bonsaiId },
        data: {
          ...patch,
          customStyle: candidate.style === "Sonstiger" ? candidate.customStyle : null,
          images: patch.images ?? existing.images,
        } as Prisma.BonsaiUpdateInput,
        include: {
          subEntries: {
            orderBy: [{ date: "desc" }, { id: "desc" }],
          },
        },
      });

      ok(res, mapBonsaiDetail(updated as Parameters<typeof mapBonsaiDetail>[0]));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        fail(res, "VALIDATION_ERROR", "Die Bonsai-Daten sind ungültig.", 422, error.flatten());
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Bonsai konnte nicht aktualisiert werden.", 500);
      return;
    }
  }

  if (req.method === "DELETE") {
    const existing = await getOwnedBonsaiOr404(bonsaiId, userId);
    if (!existing) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }

    await prisma.bonsai.update({
      where: { id: bonsaiId },
      data: { deletedAt: new Date() },
    });

    await prisma.reminder.updateMany({
      where: {
        bonsaiId,
        userId,
        status: "PENDING",
      },
      data: {
        status: "SNOOZED",
        snoozedUntil: new Date(),
      },
    });

    res.status(204).end();
    return;
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
