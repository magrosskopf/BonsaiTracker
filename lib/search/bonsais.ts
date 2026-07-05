import type { Prisma } from "@prisma/client";

const SEARCH_MODE = "insensitive" as const;

function buildContainsFilter(search: string) {
  return { contains: search, mode: SEARCH_MODE };
}

export function buildBonsaiSearchOr(search: string): NonNullable<Prisma.BonsaiWhereInput["OR"]> {
  return [
    { name: buildContainsFilter(search) },
    { species: buildContainsFilter(search) },
    { latinName: buildContainsFilter(search) },
    { location: buildContainsFilter(search) },
    { notes: buildContainsFilter(search) },
    { customStyle: buildContainsFilter(search) },
  ];
}
