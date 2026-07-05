import type { BonsaiDetail } from "@/types/dto";

export interface BonsaiTimelineImage {
  image: string;
  date: string;
  createdAt: string;
  source: string;
}

function toTimestamp(value: string): number {
  return new Date(value).getTime();
}

function compareTimelineImages(left: BonsaiTimelineImage, right: BonsaiTimelineImage): number {
  if (left.date !== right.date) {
    return toTimestamp(left.date) - toTimestamp(right.date);
  }

  return toTimestamp(left.createdAt) - toTimestamp(right.createdAt);
}

export function collectBonsaiTimelineImages(bonsai: BonsaiDetail | null): BonsaiTimelineImage[] {
  if (!bonsai) {
    return [];
  }

  return [
    ...bonsai.images.map((image) => ({
      image,
      date: bonsai.ownedSince ?? bonsai.createdAt,
      createdAt: bonsai.createdAt,
      source: "Bonsai",
    })),
    ...bonsai.subEntries.flatMap((entry) =>
      entry.images.map((image) => ({
        image,
        date: entry.date,
        createdAt: entry.createdAt,
        source: entry.entryType,
      })),
    ),
  ].sort(compareTimelineImages);
}
