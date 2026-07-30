import multer from "multer";
import { saveUploadedFile } from "@/lib/storage";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function fileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
    cb(new Error("UNSUPPORTED_MEDIA_TYPE"));
    return;
  }
  cb(null, true);
}

export function createImageUpload(_subDirectory = "") {
  return multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
    },
  });
}

export async function persistImageUpload(actorUserId: string, subDirectory: string, file: Express.Multer.File): Promise<string> {
  const stored = await saveUploadedFile({
    actorUserId,
    buffer: file.buffer,
    contentType: file.mimetype,
    originalName: file.originalname,
    subDirectory,
  });

  return stored.mediaUrl;
}
