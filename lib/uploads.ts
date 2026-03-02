import fs from "fs";
import path from "path";
import multer from "multer";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function slugifyFileName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function ensureDirectory(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function diskStorage(subDirectory: string) {
  const absoluteDir = path.join(process.cwd(), "public", "uploads", subDirectory);
  ensureDirectory(absoluteDir);

  return multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, absoluteDir);
    },
    filename(_req, file, cb) {
      cb(null, `${Date.now()}-${slugifyFileName(file.originalname)}`);
    },
  });
}

function fileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
    cb(new Error("UNSUPPORTED_MEDIA_TYPE"));
    return;
  }
  cb(null, true);
}

export function createImageUpload(subDirectory = "") {
  return multer({
    storage: diskStorage(subDirectory),
    fileFilter,
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
    },
  });
}

export function filePathFor(subDirectory: string, file: Express.Multer.File): string {
  const prefix = subDirectory ? `/uploads/${subDirectory}` : "/uploads";
  return `${prefix}/${file.filename}`;
}
