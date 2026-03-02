import type { BonsaiDetail } from "@/types/dto";
import type { BonsaiFormValues } from "@/types/forms";

export const emptyBonsaiFormValues: BonsaiFormValues = {
  name: "",
  nickname: "",
  species: "",
  latinName: "",
  location: "",
  indoorOutdoor: "OUTDOOR",
  age: "",
  heightCm: "",
  widthCm: "",
  trunkDiameterMm: "",
  style: "Chokkan",
  customStyle: "",
  ownedSince: "",
  acquiredFrom: "",
  purchasePriceCents: "",
  healthStatus: "UNBEKANNT",
  developmentStage: "ROHLING",
  lastRepotDate: "",
  nextRepotDue: "",
  winterHardiness: "",
  sunExposure: "",
  potType: "",
  potColor: "",
  wateringNotes: "",
  fertilizingNotes: "",
  pruningNotes: "",
  wiringNotes: "",
  notes: "",
};

function asString(value: number | string | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function bonsaiDetailToFormValues(detail: BonsaiDetail): BonsaiFormValues {
  return {
    name: detail.name,
    nickname: detail.nickname ?? "",
    species: detail.species,
    latinName: detail.latinName ?? "",
    location: detail.location,
    indoorOutdoor: detail.indoorOutdoor,
    age: String(detail.age),
    heightCm: asString(detail.heightCm),
    widthCm: asString(detail.widthCm),
    trunkDiameterMm: asString(detail.trunkDiameterMm),
    style: detail.style,
    customStyle: detail.customStyle ?? "",
    ownedSince: detail.ownedSince.slice(0, 10),
    acquiredFrom: detail.acquiredFrom ?? "",
    purchasePriceCents: asString(detail.purchasePriceCents),
    healthStatus: detail.healthStatus,
    developmentStage: detail.developmentStage,
    lastRepotDate: detail.lastRepotDate?.slice(0, 10) ?? "",
    nextRepotDue: detail.nextRepotDue?.slice(0, 10) ?? "",
    winterHardiness: detail.winterHardiness ?? "",
    sunExposure: detail.sunExposure ?? "",
    potType: detail.potType ?? "",
    potColor: detail.potColor ?? "",
    wateringNotes: detail.wateringNotes ?? "",
    fertilizingNotes: detail.fertilizingNotes ?? "",
    pruningNotes: detail.pruningNotes ?? "",
    wiringNotes: detail.wiringNotes ?? "",
    notes: detail.notes ?? "",
  };
}

function nullableString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function nullableNumber(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

function nullableDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function bonsaiFormValuesToPayload(values: BonsaiFormValues) {
  return {
    name: values.name,
    nickname: nullableString(values.nickname),
    species: values.species,
    latinName: nullableString(values.latinName),
    location: values.location,
    indoorOutdoor: values.indoorOutdoor,
    age: Number(values.age),
    heightCm: nullableNumber(values.heightCm),
    widthCm: nullableNumber(values.widthCm),
    trunkDiameterMm: nullableNumber(values.trunkDiameterMm),
    style: values.style,
    customStyle: values.style === "Sonstiger" ? nullableString(values.customStyle) : null,
    ownedSince: values.ownedSince,
    acquiredFrom: nullableString(values.acquiredFrom),
    purchasePriceCents: nullableNumber(values.purchasePriceCents),
    healthStatus: values.healthStatus,
    developmentStage: values.developmentStage,
    lastRepotDate: nullableDate(values.lastRepotDate),
    nextRepotDue: nullableDate(values.nextRepotDue),
    winterHardiness: nullableString(values.winterHardiness),
    sunExposure: nullableString(values.sunExposure),
    potType: nullableString(values.potType),
    potColor: nullableString(values.potColor),
    wateringNotes: nullableString(values.wateringNotes),
    fertilizingNotes: nullableString(values.fertilizingNotes),
    pruningNotes: nullableString(values.pruningNotes),
    wiringNotes: nullableString(values.wiringNotes),
    notes: nullableString(values.notes),
  };
}
