import type { IndoorOutdoorOption } from "@/types/domain";
import type { CarePlanSpeciesId } from "./catalog";

export const CARE_PLAN_VERSION = "2026-09-06.v1";

export const CARE_PLAN_CARE_TYPES = ["FERTILIZING", "PRUNING", "WIRING", "REPOTTING", "INSPECTION"] as const;
export type CarePlanCareType = (typeof CARE_PLAN_CARE_TYPES)[number];

export interface CarePlanRule {
  id: string;
  speciesIds: readonly CarePlanSpeciesId[];
  months: readonly number[];
  careType: CarePlanCareType;
  title: string;
  note: string;
  placement?: Exclude<IndoorOutdoorOption, "BEIDES">;
}

const deciduous: CarePlanSpeciesId[] = ["chinese-elm", "japanese-maple", "hornbeam", "beech"];
const conifers: CarePlanSpeciesId[] = ["juniper", "pine"];
const flowering: CarePlanSpeciesId[] = ["azalea", "serissa"];
const tropical: CarePlanSpeciesId[] = ["ficus", "serissa"];
const allSpecies: CarePlanSpeciesId[] = ["ficus", "chinese-elm", "japanese-maple", "juniper", "pine", "azalea", "privet", "hornbeam", "beech", "serissa"];

export const CARE_PLAN_RULES: readonly CarePlanRule[] = [
  {
    id: "spring-repot-check",
    speciesIds: allSpecies,
    months: [3, 4],
    careType: "REPOTTING",
    title: "Umtopfen prüfen",
    note: "Wurzelballen und Substrat kontrollieren; nur bei passendem Zustand umtopfen.",
  },
  {
    id: "spring-fertilize-start",
    speciesIds: allSpecies,
    months: [4, 5],
    careType: "FERTILIZING",
    title: "Düngesaison starten",
    note: "Nach stabilem Austrieb mit moderater Düngung beginnen.",
  },
  {
    id: "deciduous-structure-prune",
    speciesIds: deciduous,
    months: [2, 3],
    careType: "PRUNING",
    title: "Strukturschnitt prüfen",
    note: "Vor starkem Austrieb Verzweigung, Silhouette und Schnittstellen beurteilen.",
    placement: "OUTDOOR",
  },
  {
    id: "tropical-prune",
    speciesIds: tropical,
    months: [5, 8],
    careType: "PRUNING",
    title: "Formschnitt prüfen",
    note: "Lange Triebe einkürzen, wenn der Baum kräftig wächst.",
    placement: "INDOOR",
  },
  {
    id: "conifer-wire-check",
    speciesIds: conifers,
    months: [6, 9],
    careType: "WIRING",
    title: "Draht kontrollieren",
    note: "Drahtspuren früh erkennen und eingewachsene Drähte entfernen.",
  },
  {
    id: "azalea-after-flower",
    speciesIds: ["azalea"],
    months: [6],
    careType: "PRUNING",
    title: "Nach der Blüte schneiden",
    note: "Verblühtes entfernen und Form nur nach tatsächlicher Blüte korrigieren.",
  },
  {
    id: "summer-health-inspection",
    speciesIds: allSpecies,
    months: [7, 8],
    careType: "INSPECTION",
    title: "Sommerkontrolle",
    note: "Laub, Substrat, Schädlinge und Hitzestress systematisch prüfen.",
  },
  {
    id: "autumn-fertilize-finish",
    speciesIds: allSpecies,
    months: [9],
    careType: "FERTILIZING",
    title: "Herbstdüngung prüfen",
    note: "Düngung an Wachstum und Vorbereitung auf die Ruhephase anpassen.",
  },
  {
    id: "winter-wire-prune",
    speciesIds: [...deciduous, ...conifers],
    months: [11, 12],
    careType: "WIRING",
    title: "Wintergestaltung planen",
    note: "Laubfreie oder ruhigere Phasen für Drahtung und Strukturbeurteilung nutzen.",
    placement: "OUTDOOR",
  },
] as const;
