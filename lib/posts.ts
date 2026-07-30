import { formatBonsaiDate, normalizeBonsaiDisplayText } from "@/lib/bonsai-display";

interface SubEntryLike {
  id: number;
}

export function normalizeSelectedImages(availableImages: string[], selectedImages: string[]): string[] {
  return selectedImages.filter((image, index) => selectedImages.indexOf(image) === index && availableImages.includes(image)).slice(0, 5);
}

export function snapshotEntryReferenceIds(subEntries: SubEntryLike[], selectedEntryIds: number[]): number[] {
  const validIds = new Set(subEntries.map((entry) => entry.id));
  return selectedEntryIds.filter((entryId) => validIds.has(entryId));
}

export function formatPostSnapshotMeta(snapshotSpecies: string | null | undefined, createdAt: string): string {
  const species = normalizeBonsaiDisplayText(snapshotSpecies);
  const postDate = formatBonsaiDate(createdAt);

  return species ? `${species} · ${postDate}` : postDate;
}
