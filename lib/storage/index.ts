import { supabaseUploadStorage } from "@/lib/storage/supabase";
import type { ResolvedMedia, SavedUpload, SaveUploadInput, UploadStorage } from "@/lib/storage/types";

const MANAGED_MEDIA_PREFIX = "/api/media/";

function getUploadStorage(): UploadStorage {
  return supabaseUploadStorage;
}

function getStorageForKey(storageKey: string): UploadStorage {
  if (storageKey.startsWith("supabase/")) {
    return supabaseUploadStorage;
  }
  throw new Error("Unbekannter Storage-Key.");
}

export async function saveUploadedFile(input: SaveUploadInput): Promise<SavedUpload> {
  return getUploadStorage().save(input);
}

export async function resolveManagedMedia(storageKey: string): Promise<ResolvedMedia> {
  return getStorageForKey(storageKey).resolve(storageKey);
}

export function mediaPathForStorageKey(storageKey: string): string {
  return `${MANAGED_MEDIA_PREFIX}${storageKey}`;
}

export function getStorageKeyFromMediaPath(mediaPath: string): string | null {
  if (!mediaPath.startsWith(MANAGED_MEDIA_PREFIX)) {
    return null;
  }
  const storageKey = mediaPath.slice(MANAGED_MEDIA_PREFIX.length).trim();
  return storageKey || null;
}

export async function removeManagedMedia(mediaPath: string): Promise<void> {
  const storageKey = getStorageKeyFromMediaPath(mediaPath);
  if (!storageKey) {
    return;
  }
  await getStorageForKey(storageKey).remove(storageKey);
}

export async function removeManagedMediaBatch(mediaPaths: string[]): Promise<void> {
  await Promise.all(mediaPaths.map((mediaPath) => removeManagedMedia(mediaPath)));
}
