import type { BonsaiDetail } from "@/types/dto";

export interface BonsaiTimelineImage {
  image: string;
  date: string;
  createdAt: string;
  source: string;
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
  ].sort((left, right) => {
    if (left.date !== right.date) {
      return new Date(left.date).getTime() - new Date(right.date).getTime();
    }

    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });
}
