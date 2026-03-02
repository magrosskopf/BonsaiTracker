import type { SubEntry } from "@prisma/client";

export function normalizeSelectedImages(availableImages: string[], selectedImages: string[]): string[] {
  return selectedImages.filter((image, index) => selectedImages.indexOf(image) === index && availableImages.includes(image)).slice(0, 5);
}

export function snapshotEntryReferenceIds(subEntries: SubEntry[], selectedEntryIds: number[]): number[] {
  const validIds = new Set(subEntries.map((entry) => entry.id));
  return selectedEntryIds.filter((entryId) => validIds.has(entryId));
}
