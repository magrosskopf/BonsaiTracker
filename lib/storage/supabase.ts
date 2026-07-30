import crypto from "crypto";
import path from "path";
import { getServerSupabaseConfig } from "@/lib/config/runtime";
import { getServerDataClient } from "@/lib/supabase/server-data";
import type { ResolvedMedia, SavedUpload, SaveUploadInput, UploadStorage } from "@/lib/storage/types";

function slugifyFileName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildObjectKey(actorUserId: string, subDirectory: string, originalName: string): string {
  const extension = path.extname(originalName).toLowerCase() || ".bin";
  const safeBase = slugifyFileName(path.basename(originalName, path.extname(originalName))) || "upload";
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeBase}${extension}`;
  return path.posix.join(actorUserId, subDirectory || "uploads", fileName);
}

function toStorageKey(objectKey: string): string {
  return `supabase/${objectKey}`;
}

function getObjectKey(storageKey: string): string {
  if (!storageKey.startsWith("supabase/")) {
    throw new Error("Ungültiger Supabase-Storage-Key.");
  }
  return storageKey.replace(/^supabase\//, "");
}

function createSupabaseStorageClient() {
  return { client: getServerDataClient(), config: getServerSupabaseConfig() };
}

export const supabaseUploadStorage: UploadStorage = {
  mode: "supabase",

  async save(input: SaveUploadInput): Promise<SavedUpload> {
    const { client, config } = createSupabaseStorageClient();
    const objectKey = buildObjectKey(input.actorUserId, input.subDirectory, input.originalName);

    const { error } = await client.storage
      .from(config.storageBucket)
      .upload(objectKey, input.buffer, {
        contentType: input.contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return {
      storageKey: toStorageKey(objectKey),
      mediaUrl: `/api/media/${toStorageKey(objectKey)}`,
    };
  },

  async resolve(storageKey: string): Promise<ResolvedMedia> {
    const { client, config } = createSupabaseStorageClient();
    const objectKey = getObjectKey(storageKey);

    const { data, error } = await client.storage
      .from(config.storageBucket)
      .download(objectKey);

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error("Supabase Storage hat keine Datei zurückgegeben.");
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    return {
      kind: "buffer",
      buffer,
      contentType: data.type || "application/octet-stream",
      cacheControl: "private, no-store",
    };
  },

  async remove(storageKey: string): Promise<void> {
    const { client, config } = createSupabaseStorageClient();
    const objectKey = getObjectKey(storageKey);

    const { error } = await client.storage
      .from(config.storageBucket)
      .remove([objectKey]);

    if (error) {
      throw new Error(error.message);
    }
  },
};
