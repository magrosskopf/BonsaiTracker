import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { firstQueryValue, toOptionalStringArray } from "@/lib/api/request";
import { mapSubEntryToDto } from "@/lib/mappers";
import { createOwnedSubEntry, listOwnedSubEntries } from "@/lib/repositories/subentries";
import { runMiddleware } from "@/lib/middleware";
import { logError } from "@/lib/observability";
import { removeManagedMediaBatch } from "@/lib/storage";
import { createImageUpload, persistImageUpload } from "@/lib/uploads";
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

async function safeCleanup(mediaPaths: string[], context: Record<string, unknown>): Promise<void> {
  try {
    await removeManagedMediaBatch(mediaPaths);
  } catch (error) {
    logError("subentry.create_cleanup_failed", error, context);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  if (req.method === "GET") {
    const bonsaiId = Number(firstQueryValue(req.query.bonsaiId));
    if (!Number.isInteger(bonsaiId) || bonsaiId <= 0) {
      fail(res, "BAD_REQUEST", "Ungültige Bonsai-ID.", 400);
      return;
    }

    const items = await listOwnedSubEntries(actor.id, bonsaiId);
    if (!items) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }

    ok(res, { items: items.map(mapSubEntryToDto) });
    return;
  }

  if (req.method === "POST") {
    const persistedImages: string[] = [];

    try {
      await runMiddleware(req as MulterRequest, res, upload.array("images", 5));
    } catch (error) {
      handleUploadError(res, error);
      return;
    }

    try {
      const files = await Promise.all(
        ((req as MulterRequest).files ?? []).map(async (file) => {
          const image = await persistImageUpload(actor.id, "subentries", file);
          persistedImages.push(image);
          return image;
        }),
      );
      const parsed = subEntryCreateSchema.parse({
        ...req.body,
        performedActions: toOptionalStringArray(req.body["performedActions[]"] ?? req.body.performedActions),
        images: files,
      });

      const created = await createOwnedSubEntry(actor.id, parsed, files);

      ok(res, mapSubEntryToDto(created), 201);
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        await safeCleanup(persistedImages, { userId: actor.id });
        fail(res, "VALIDATION_ERROR", "Die Sub-Entry-Daten sind ungültig.", 422, error.flatten());
        return;
      }
      await safeCleanup(persistedImages, { userId: actor.id });
      logError("subentry.create_failed", error, { userId: actor.id });
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
