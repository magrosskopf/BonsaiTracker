import type { BonsaiDetail } from "@/types/dto";

export interface BonsaiTimelineImage {
  image: string;
  date: string;
  createdAt: string;
  source: string;
}

function createTimelineImage(
  image: string,
  date: string,
  createdAt: string,
  source: string,
): BonsaiTimelineImage {
  return {
    image,
    date,
    createdAt,
    source,
  };
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

function collectInitialTimelineImages(bonsai: BonsaiDetail): BonsaiTimelineImage[] {
  const timelineDate = bonsai.ownedSince ?? bonsai.createdAt;

  return bonsai.images.map((image) =>
    createTimelineImage(image, timelineDate, bonsai.createdAt, "Bonsai"),
  );
}

function collectSubEntryTimelineImages(bonsai: BonsaiDetail): BonsaiTimelineImage[] {
  return bonsai.subEntries.flatMap((entry) =>
    entry.images.map((image) =>
      createTimelineImage(image, entry.date, entry.createdAt, entry.entryType),
    ),
  );
}

export function collectBonsaiTimelineImages(bonsai: BonsaiDetail | null): BonsaiTimelineImage[] {
  if (!bonsai) {
    return [];
  }

  const timelineImages = [
    ...collectInitialTimelineImages(bonsai),
    ...collectSubEntryTimelineImages(bonsai),
  ];

  return timelineImages.sort(compareTimelineImages);
}
