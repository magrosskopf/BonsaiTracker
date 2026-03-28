import type { UploadStorageMode } from "@/lib/config/beta";

export interface SaveUploadInput {
  buffer: Buffer;
  contentType: string;
  originalName: string;
  subDirectory: string;
}

export interface SavedUpload {
  storageKey: string;
  mediaUrl: string;
}

export type ResolvedMedia =
  | {
      kind: "redirect";
      location: string;
      cacheControl?: string;
    }
  | {
      kind: "buffer";
      buffer: Buffer;
      contentType: string;
      cacheControl?: string;
    };

export interface UploadStorage {
  mode: UploadStorageMode;
  save(input: SaveUploadInput): Promise<SavedUpload>;
  resolve(storageKey: string): Promise<ResolvedMedia>;
  remove(storageKey: string): Promise<void>;
}
