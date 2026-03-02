import type { NextApiRequest, NextApiResponse } from "next";
import type { Prisma } from "@prisma/client";
import multer from "multer";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { firstQueryValue, toOptionalStringArray } from "@/lib/api/request";
import { mapSubEntryToDto } from "@/lib/mappers";
import { runMiddleware } from "@/lib/middleware";
import { createImageUpload, filePathFor } from "@/lib/uploads";
import { subEntryCreateSchema } from "@/lib/validators/subentry";

type MulterRequest = NextApiRequest & {
  files?: Express.Multer.File[];
};

const upload = createImageUpload("subentries");

function handleUploadError(res: NextApiResponse, error: unknown): void {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    fail(res, "PAYLOAD_TOO_LARGE", "Dateien dürfen maximal 5 MB groß sein.", 413);
    return;
  }
  if (error instanceof Error && error.message === "UNSUPPORTED_MEDIA_TYPE") {
    fail(res, "UNSUPPORTED_MEDIA_TYPE", "Es sind nur JPEG-, PNG- oder WEBP-Dateien erlaubt.", 415);
    return;
  }
  fail(res, "BAD_REQUEST", "Die Upload-Daten konnten nicht verarbeitet werden.", 400);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = await requireUser(req, res);
  if (!userId) {
    return;
  }

  if (req.method === "GET") {
    const bonsaiId = Number(firstQueryValue(req.query.bonsaiId));
    if (!Number.isInteger(bonsaiId) || bonsaiId <= 0) {
      fail(res, "BAD_REQUEST", "Ungültige Bonsai-ID.", 400);
      return;
    }

    const bonsai = await prisma.bonsai.findFirst({
      where: { id: bonsaiId, userId, deletedAt: null },
    });

    if (!bonsai) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }

    const items = await prisma.subEntry.findMany({
      where: { bonsaiId },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    });

    ok(res, { items: items.map(mapSubEntryToDto) });
    return;
  }

  if (req.method === "POST") {
    try {
      await runMiddleware(req as MulterRequest, res, upload.array("images", 5));
    } catch (error) {
      handleUploadError(res, error);
      return;
    }

    try {
      const files = ((req as MulterRequest).files ?? []).map((file) => filePathFor("subentries", file));
      const parsed = subEntryCreateSchema.parse({
        ...req.body,
        performedActions: toOptionalStringArray(req.body["performedActions[]"] ?? req.body.performedActions),
        images: files,
      });

      const bonsai = await prisma.bonsai.findFirst({
        where: { id: parsed.bonsaiId, userId, deletedAt: null },
      });

      if (!bonsai) {
        fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
        return;
      }

      const created = await prisma.subEntry.create({
        data: parsed as Prisma.SubEntryUncheckedCreateInput,
      });

      ok(res, mapSubEntryToDto(created), 201);
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        fail(res, "VALIDATION_ERROR", "Die Sub-Entry-Daten sind ungültig.", 422, error.flatten());
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Sub-Eintrag konnte nicht erstellt werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "GET, POST");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
