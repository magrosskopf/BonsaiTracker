import crypto from "crypto";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseStorageConfig } from "@/lib/config/beta";
import type { ResolvedMedia, SavedUpload, SaveUploadInput, UploadStorage } from "@/lib/storage/types";

function slugifyFileName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildObjectKey(subDirectory: string, originalName: string): string {
  const extension = path.extname(originalName).toLowerCase() || ".bin";
  const safeBase = slugifyFileName(path.basename(originalName, path.extname(originalName))) || "upload";
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeBase}${extension}`;
  return subDirectory ? path.posix.join(subDirectory, fileName) : fileName;
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

function getSignedUrlLocation(baseUrl: string, signedUrl: string): string {
  if (signedUrl.startsWith("http://") || signedUrl.startsWith("https://")) {
    return signedUrl;
  }

  return `${baseUrl}${signedUrl.startsWith("/") ? signedUrl : `/${signedUrl}`}`;
}

function createSupabaseStorageClient() {
  const config = getSupabaseStorageConfig();
  const client = createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return { client, config };
}

export const supabaseUploadStorage: UploadStorage = {
  mode: "supabase",

  async save(input: SaveUploadInput): Promise<SavedUpload> {
    const { client, config } = createSupabaseStorageClient();
    const objectKey = buildObjectKey(input.subDirectory, input.originalName);

    const { error } = await client.storage
      .from(config.bucket)
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
      .from(config.bucket)
      .createSignedUrl(objectKey, config.signedUrlExpiresInSeconds);

    if (error) {
      throw new Error(error.message);
    }
    if (!data?.signedUrl) {
      throw new Error("Supabase Storage hat keine Signed URL zurückgegeben.");
    }

    return {
      kind: "redirect",
      location: getSignedUrlLocation(config.url, data.signedUrl),
      cacheControl: "private, no-store",
    };
  },

  async remove(storageKey: string): Promise<void> {
    const { client, config } = createSupabaseStorageClient();
    const objectKey = getObjectKey(storageKey);

    const { error } = await client.storage
      .from(config.bucket)
      .remove([objectKey]);

    if (error) {
      throw new Error(error.message);
    }
  },
};
