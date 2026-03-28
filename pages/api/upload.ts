import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { runMiddleware } from "@/lib/middleware";
import { logError } from "@/lib/observability";
import { createImageUpload, persistImageUpload } from "@/lib/uploads";
import { removeManagedMedia } from "@/lib/storage";

type UploadRequest = NextApiRequest & {
  file?: Express.Multer.File;
};

const upload = createImageUpload("");

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = await requireUser(req, res);
  if (!userId) {
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  try {
    await runMiddleware(req as UploadRequest, res, upload.single("file"));
  } catch (error) {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      fail(res, "PAYLOAD_TOO_LARGE", "Dateien dürfen maximal 5 MB groß sein.", 413);
      return;
    }
    if (error instanceof Error && error.message === "UNSUPPORTED_MEDIA_TYPE") {
      fail(res, "UNSUPPORTED_MEDIA_TYPE", "Es sind nur JPEG-, PNG- oder WEBP-Dateien erlaubt.", 415);
      return;
    }
    fail(res, "BAD_REQUEST", "Der Upload konnte nicht verarbeitet werden.", 400);
    return;
  }

  const bonsaiId = Number(req.body.bonsaiId);
  let targetBonsai: { id: number; images: string[] } | null = null;
  if (req.body.bonsaiId !== undefined && req.body.bonsaiId !== "") {
    if (!Number.isInteger(bonsaiId) || bonsaiId <= 0) {
      fail(res, "BAD_REQUEST", "Ungültige Bonsai-ID.", 400);
      return;
    }

    targetBonsai = await prisma.bonsai.findFirst({
      where: { id: bonsaiId, userId, deletedAt: null },
      select: { id: true, images: true },
    });

    if (!targetBonsai) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }
  }

  const file = (req as UploadRequest).file;
  if (!file) {
    fail(res, "BAD_REQUEST", "Es wurde keine Datei hochgeladen.", 400);
    return;
  }

  try {
    const filePath = await persistImageUpload("", file);

    if (targetBonsai) {
      const nextImages = targetBonsai.images.includes(filePath)
        ? targetBonsai.images
        : [...targetBonsai.images, filePath];

      try {
        await prisma.bonsai.update({
          where: { id: targetBonsai.id },
          data: { images: nextImages },
        });
      } catch (error) {
        await removeManagedMedia(filePath).catch((cleanupError) => {
          logError("upload.link_cleanup_failed", cleanupError, { userId, bonsaiId: targetBonsai?.id, filePath });
        });
        throw error;
      }
    }

    ok(res, { filePath });
  } catch (error) {
    logError("upload.persist_failed", error, { userId, bonsaiId: Number.isInteger(bonsaiId) ? bonsaiId : null });
    fail(res, "INTERNAL_SERVER_ERROR", "Der Upload konnte nicht gespeichert werden.", 500);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
