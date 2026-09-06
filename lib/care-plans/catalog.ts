export const CARE_PLAN_SPECIES = [
  { id: "ficus", label: "Ficus", latinName: "Ficus microcarpa" },
  { id: "chinese-elm", label: "Chinesische Ulme", latinName: "Ulmus parvifolia" },
  { id: "japanese-maple", label: "Japanischer Ahorn", latinName: "Acer palmatum" },
  { id: "juniper", label: "Wacholder", latinName: "Juniperus" },
  { id: "pine", label: "Kiefer", latinName: "Pinus" },
  { id: "azalea", label: "Azalee", latinName: "Rhododendron indicum" },
  { id: "privet", label: "Liguster", latinName: "Ligustrum" },
  { id: "hornbeam", label: "Hainbuche", latinName: "Carpinus betulus" },
  { id: "beech", label: "Buche", latinName: "Fagus sylvatica" },
  { id: "serissa", label: "Serissa", latinName: "Serissa japonica" },
] as const;

export type CarePlanSpeciesId = (typeof CARE_PLAN_SPECIES)[number]["id"];

const speciesById: ReadonlyMap<string, (typeof CARE_PLAN_SPECIES)[number]> = new Map(CARE_PLAN_SPECIES.map((species) => [species.id, species]));

export function getCarePlanSpecies(speciesId: string | null | undefined) {
  return speciesId ? speciesById.get(speciesId) ?? null : null;
}

export function isCarePlanSpeciesId(value: string | null | undefined): value is CarePlanSpeciesId {
  return Boolean(value && speciesById.has(value));
}
