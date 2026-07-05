import type { BonsaiDetail } from "@/types/dto";
import type { BonsaiFormValues } from "@/types/forms";

const DATE_INPUT_VALUE_LENGTH = 10;
const EURO_CENTS_FACTOR = 100;
const EURO_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export const emptyBonsaiFormValues: BonsaiFormValues = {
  name: "",
  species: "",
  latinName: "",
  location: "",
  indoorOutdoor: "OUTDOOR",
  age: "",
  heightCm: "",
  widthCm: "",
  trunkDiameterMm: "",
  style: "Unbekannt",
  customStyle: "",
  ownedSince: "",
  acquiredFrom: "",
  purchasePriceCents: "",
  healthStatus: "UNBEKANNT",
  developmentStage: "UNBEKANNT",
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

function toDateInputValue(value: string | null | undefined): string {
  return value?.slice(0, DATE_INPUT_VALUE_LENGTH) ?? "";
}

export function bonsaiDetailToFormValues(detail: BonsaiDetail): BonsaiFormValues {
  return {
    name: detail.name,
    species: detail.species,
    latinName: detail.latinName ?? "",
    location: detail.location,
    indoorOutdoor: detail.indoorOutdoor,
    age: asString(detail.age),
    heightCm: asString(detail.heightCm),
    widthCm: asString(detail.widthCm),
    trunkDiameterMm: asString(detail.trunkDiameterMm),
    style: detail.style,
    customStyle: detail.customStyle ?? "",
    ownedSince: toDateInputValue(detail.ownedSince),
    acquiredFrom: detail.acquiredFrom ?? "",
    purchasePriceCents: centsToEuroString(detail.purchasePriceCents),
    healthStatus: detail.healthStatus,
    developmentStage: detail.developmentStage,
    lastRepotDate: toDateInputValue(detail.lastRepotDate),
    nextRepotDue: toDateInputValue(detail.nextRepotDue),
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

function normalizeEuroAmount(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  return trimmed.replace(",", ".");
}

function euroToCents(value: string): number | null {
  const normalized = normalizeEuroAmount(value);
  if (normalized === null) {
    return null;
  }

  if (!EURO_AMOUNT_PATTERN.test(normalized)) {
    return Number.NaN;
  }

  return Math.round(Number(normalized) * EURO_CENTS_FACTOR);
}

function centsToEuroString(value: number | null): string {
  return value === null ? "" : (value / EURO_CENTS_FACTOR).toFixed(2).replace(".", ",");
}

function nullableDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function bonsaiFormValuesToPayload(values: BonsaiFormValues) {
  return {
    name: values.name,
    species: values.species,
    latinName: nullableString(values.latinName),
    location: values.location,
    indoorOutdoor: values.indoorOutdoor,
    age: nullableNumber(values.age),
    heightCm: nullableNumber(values.heightCm),
    widthCm: nullableNumber(values.widthCm),
    trunkDiameterMm: nullableNumber(values.trunkDiameterMm),
    style: values.style,
    customStyle: values.style === "Sonstiger" ? nullableString(values.customStyle) : null,
    ownedSince: nullableDate(values.ownedSince),
    acquiredFrom: nullableString(values.acquiredFrom),
    purchasePriceCents: euroToCents(values.purchasePriceCents),
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
