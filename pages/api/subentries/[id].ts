import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { mapSubEntryToDto } from "@/lib/mappers";
import { deleteOwnedSubEntry, getOwnedSubEntry, patchOwnedSubEntry } from "@/lib/repositories/subentries";
import { runMiddleware } from "@/lib/middleware";
import { logError } from "@/lib/observability";
import { removeManagedMediaBatch } from "@/lib/storage";
import { createImageUpload, persistImageUpload } from "@/lib/uploads";
import { toOptionalStringArray } from "@/lib/api/request";
import { subEntryPatchSchema, subEntryPersistedSchema } from "@/lib/validators/subentry";

type MulterRequest = NextApiRequest & {
  files?: Express.Multer.File[];
};

const upload = createImageUpload("subentries");

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

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

async function safeCleanup(mediaPaths: string[], context: Record<string, unknown>, event: string): Promise<void> {
  try {
    await removeManagedMediaBatch(mediaPaths);
  } catch (error) {
    logError(event, error, context);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  const subEntryId = parseId(req.query.id);
  if (!subEntryId) {
    fail(res, "BAD_REQUEST", "Ungültige Sub-Entry-ID.", 400);
    return;
  }

  if (req.method === "PATCH") {
    const newlyPersistedImages: string[] = [];

    try {
      await runMiddleware(req as MulterRequest, res, upload.array("newImages", 5));
    } catch (error) {
      handleUploadError(res, error);
      return;
    }

    const existing = await getOwnedSubEntry(actor.id, subEntryId);
    if (!existing) {
      fail(res, "NOT_FOUND", "Pflegeeintrag nicht gefunden.", 404);
      return;
    }

    try {
      const keepImages = toOptionalStringArray(req.body["keepImages[]"] ?? req.body.keepImages) ?? [];
      const newImages = await Promise.all(
        ((req as MulterRequest).files ?? []).map(async (file) => {
          const image = await persistImageUpload(actor.id, "subentries", file);
          newlyPersistedImages.push(image);
          return image;
        }),
      );
      const finalImages = [...keepImages.filter((image) => existing.images.includes(image)), ...newImages];

      const patch = subEntryPatchSchema.parse({
        ...req.body,
        performedActions: toOptionalStringArray(req.body["performedActions[]"] ?? req.body.performedActions),
        images: finalImages,
      });

      const candidate = subEntryPersistedSchema.parse({
        date: patch.date ?? existing.date,
        entryType: patch.entryType ?? existing.entry_type,
        healthObservation: patch.healthObservation ?? existing.health_observation,
        performedActions: patch.performedActions ?? existing.performed_actions,
        nextAction: patch.nextAction ?? existing.next_action,
        reminderDate: patch.reminderDate ?? existing.reminder_date,
        notes: patch.notes ?? existing.notes,
        images: finalImages,
      });

      if (finalImages.length > 5) {
        fail(res, "PAYLOAD_TOO_LARGE", "Es sind maximal 5 Bilder pro Eintrag erlaubt.", 413);
        return;
      }

      const removedImages = existing.images.filter((image) => !candidate.images.includes(image));
      const addedImages = candidate.images.filter((image) => !existing.images.includes(image));
      const updated = await patchOwnedSubEntry(actor.id, subEntryId, patch, addedImages, removedImages);
      await safeCleanup(removedImages, { userId: actor.id, subEntryId }, "subentry.removed_media_cleanup_failed");

      ok(res, mapSubEntryToDto(updated));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        await safeCleanup(newlyPersistedImages, { userId: actor.id, subEntryId }, "subentry.new_media_cleanup_failed");
        fail(res, "VALIDATION_ERROR", "Die Sub-Entry-Daten sind ungültig.", 422, error.flatten());
        return;
      }
      await safeCleanup(newlyPersistedImages, { userId: actor.id, subEntryId }, "subentry.new_media_cleanup_failed");
      logError("subentry.update_failed", error, { userId: actor.id, subEntryId });
      fail(res, "INTERNAL_SERVER_ERROR", "Der Pflegeeintrag konnte nicht aktualisiert werden.", 500);
      return;
    }
  }

  if (req.method === "DELETE") {
    const existing = await getOwnedSubEntry(actor.id, subEntryId);
    if (!existing) {
      fail(res, "NOT_FOUND", "Pflegeeintrag nicht gefunden.", 404);
      return;
    }

    const removedImages = await deleteOwnedSubEntry(actor.id, subEntryId);
    await safeCleanup(removedImages, { userId: actor.id, subEntryId }, "subentry.delete_cleanup_failed");

    res.status(204).end();
    return;
  }

  res.setHeader("Allow", "PATCH, DELETE");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
