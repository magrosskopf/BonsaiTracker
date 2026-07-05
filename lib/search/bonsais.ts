export function buildBonsaiSearchOr(search: string) {
  return [
    { name: { contains: search, mode: "insensitive" as const } },
    { species: { contains: search, mode: "insensitive" as const } },
    { latinName: { contains: search, mode: "insensitive" as const } },
    { location: { contains: search, mode: "insensitive" as const } },
    { notes: { contains: search, mode: "insensitive" as const } },
    { customStyle: { contains: search, mode: "insensitive" as const } },
  ];
}
