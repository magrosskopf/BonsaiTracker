import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { runMiddleware } from "@/lib/middleware";
import { createImageUpload, filePathFor } from "@/lib/uploads";

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
  if (req.body.bonsaiId !== undefined && req.body.bonsaiId !== "") {
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
  }

  const file = (req as UploadRequest).file;
  if (!file) {
    fail(res, "BAD_REQUEST", "Es wurde keine Datei hochgeladen.", 400);
    return;
  }

  ok(res, { filePath: filePathFor("", file) });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
