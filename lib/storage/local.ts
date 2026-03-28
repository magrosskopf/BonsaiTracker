import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getLocalUploadsDirectory } from "@/lib/config/beta";
import type { ResolvedMedia, SavedUpload, SaveUploadInput, UploadStorage } from "@/lib/storage/types";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function slugifyFileName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getFileExtension(name: string): string {
  const ext = path.extname(name).toLowerCase();
  return ext || ".bin";
}

function buildRelativePath(subDirectory: string, originalName: string): string {
  const safeBase = slugifyFileName(path.basename(originalName, path.extname(originalName))) || "upload";
  const extension = getFileExtension(originalName);
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeBase}${extension}`;
  return subDirectory ? path.posix.join(subDirectory, fileName) : fileName;
}

function toStorageKey(relativePath: string): string {
  return `local/${relativePath}`;
}

function getAbsolutePath(storageKey: string): string {
  const relativePath = storageKey.replace(/^local\//, "");
  const baseDirectory = path.resolve(process.cwd(), getLocalUploadsDirectory());
  const absolutePath = path.resolve(baseDirectory, relativePath);

  if (!absolutePath.startsWith(baseDirectory)) {
    throw new Error("Ungültiger lokaler Storage-Pfad.");
  }

  return absolutePath;
}

function guessContentType(storageKey: string): string {
  const extension = path.extname(storageKey).toLowerCase();
  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

export const localUploadStorage: UploadStorage = {
  mode: "local",

  async save(input: SaveUploadInput): Promise<SavedUpload> {
    const relativePath = buildRelativePath(input.subDirectory, input.originalName);
    const storageKey = toStorageKey(relativePath);
    const absolutePath = getAbsolutePath(storageKey);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, input.buffer);

    return {
      storageKey,
      mediaUrl: `/api/media/${storageKey}`,
    };
  },

  async resolve(storageKey: string): Promise<ResolvedMedia> {
    const absolutePath = getAbsolutePath(storageKey);
    const buffer = await fs.readFile(absolutePath);

    return {
      kind: "buffer",
      buffer,
      contentType: guessContentType(storageKey),
      cacheControl: "private, max-age=60",
    };
  },

  async remove(storageKey: string): Promise<void> {
    try {
      await fs.unlink(getAbsolutePath(storageKey));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  },
};
