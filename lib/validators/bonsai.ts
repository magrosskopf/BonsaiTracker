import { z } from "zod";
import {
  DEVELOPMENT_STAGE_OPTIONS,
  HEALTH_STATUS_OPTIONS,
  INDOOR_OUTDOOR_OPTIONS,
  STYLE_OPTIONS,
  SUN_EXPOSURE_OPTIONS,
  WINTER_HARDINESS_OPTIONS,
} from "@/types/domain";
import {
  nullableInteger,
  nullableUtcDateField,
  nullableTrimmedString,
  requiredTrimmedString,
} from "./shared";

const defaultedTrimmedString = (fallback: string, min: number, max: number) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null) {
        return fallback;
      }
      if (typeof value !== "string") {
        return value;
      }
      const trimmed = value.trim();
      return trimmed === "" ? fallback : trimmed;
    },
    z.string().min(min).max(max),
  );

const defaultedEnum = <T extends readonly [string, ...string[]]>(values: T, fallback: T[number]) =>
  z.preprocess(
    (value) => (value === undefined || value === null || value === "" ? fallback : value),
    z.enum(values),
  );

const optionalStringField = nullableTrimmedString(80).default(null);

const bonsaiCreateObjectSchema = z.object({
  name: requiredTrimmedString(2, 80),
  nickname: nullableTrimmedString(80).default(null),
  species: defaultedTrimmedString("Unbekannt", 2, 80),
  latinName: nullableTrimmedString(120, 2).default(null),
  location: defaultedTrimmedString("Unbekannt", 2, 120),
  indoorOutdoor: defaultedEnum(INDOOR_OUTDOOR_OPTIONS, "OUTDOOR"),
  age: nullableInteger(0, 200).default(null),
  heightCm: nullableInteger(0, 500).default(null),
  widthCm: nullableInteger(0, 500).default(null),
  trunkDiameterMm: nullableInteger(0, 1000).default(null),
  style: defaultedEnum(STYLE_OPTIONS, "Unbekannt"),
  customStyle: nullableTrimmedString(80).default(null),
  ownedSince: nullableUtcDateField({ notInFuture: true }).default(null),
  acquiredFrom: nullableTrimmedString(120).default(null),
  purchasePriceCents: nullableInteger(0, Number.MAX_SAFE_INTEGER).default(null),
  healthStatus: defaultedEnum(HEALTH_STATUS_OPTIONS, "UNBEKANNT"),
  developmentStage: defaultedEnum(DEVELOPMENT_STAGE_OPTIONS, "UNBEKANNT"),
  lastRepotDate: nullableUtcDateField({ notInFuture: true }).default(null),
  nextRepotDue: nullableUtcDateField().default(null),
  winterHardiness: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(WINTER_HARDINESS_OPTIONS).nullable(),
  ).default(null),
  sunExposure: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(SUN_EXPOSURE_OPTIONS).nullable(),
  ).default(null),
  potType: nullableTrimmedString(80).default(null),
  potColor: nullableTrimmedString(40).default(null),
  wateringNotes: nullableTrimmedString(1000).default(null),
  fertilizingNotes: nullableTrimmedString(1000).default(null),
  pruningNotes: nullableTrimmedString(1000).default(null),
  wiringNotes: nullableTrimmedString(1000).default(null),
  notes: nullableTrimmedString(2000).default(null),
  images: z.array(z.string().min(1)).default([]),
});

const bonsaiPatchObjectSchema = z.object({
  name: requiredTrimmedString(2, 80).optional(),
  nickname: optionalStringField.optional(),
  species: defaultedTrimmedString("Unbekannt", 2, 80).optional(),
  latinName: nullableTrimmedString(120, 2).default(null).optional(),
  location: defaultedTrimmedString("Unbekannt", 2, 120).optional(),
  indoorOutdoor: defaultedEnum(INDOOR_OUTDOOR_OPTIONS, "OUTDOOR").optional(),
  age: nullableInteger(0, 200).optional(),
  heightCm: nullableInteger(0, 500).optional(),
  widthCm: nullableInteger(0, 500).optional(),
  trunkDiameterMm: nullableInteger(0, 1000).optional(),
  style: defaultedEnum(STYLE_OPTIONS, "Unbekannt").optional(),
  customStyle: nullableTrimmedString(80).default(null).optional(),
  ownedSince: nullableUtcDateField({ notInFuture: true }).optional(),
  acquiredFrom: nullableTrimmedString(120).default(null).optional(),
  purchasePriceCents: nullableInteger(0, Number.MAX_SAFE_INTEGER).optional(),
  healthStatus: defaultedEnum(HEALTH_STATUS_OPTIONS, "UNBEKANNT").optional(),
  developmentStage: defaultedEnum(DEVELOPMENT_STAGE_OPTIONS, "UNBEKANNT").optional(),
  lastRepotDate: nullableUtcDateField({ notInFuture: true }).optional(),
  nextRepotDue: nullableUtcDateField().optional(),
  winterHardiness: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(WINTER_HARDINESS_OPTIONS).nullable(),
  ).optional(),
  sunExposure: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(SUN_EXPOSURE_OPTIONS).nullable(),
  ).optional(),
  potType: nullableTrimmedString(80).default(null).optional(),
  potColor: nullableTrimmedString(40).default(null).optional(),
  wateringNotes: nullableTrimmedString(1000).default(null).optional(),
  fertilizingNotes: nullableTrimmedString(1000).default(null).optional(),
  pruningNotes: nullableTrimmedString(1000).default(null).optional(),
  wiringNotes: nullableTrimmedString(1000).default(null).optional(),
  notes: nullableTrimmedString(2000).default(null).optional(),
  images: z.array(z.string().min(1)).optional(),
}).strict();

export const bonsaiPersistedSchema = bonsaiCreateObjectSchema.superRefine((value, ctx) => {
  if (value.style === "Sonstiger" && !value.customStyle) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bitte gib einen eigenen Stil an.", path: ["customStyle"] });
  }
  if (value.style !== "Sonstiger" && value.customStyle) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "customStyle ist nur für Stil 'Sonstiger' erlaubt.", path: ["customStyle"] });
  }
  if (value.lastRepotDate && value.nextRepotDue && value.nextRepotDue < value.lastRepotDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nächstes Umtopfen darf nicht vor dem letzten Umtopfen liegen.", path: ["nextRepotDue"] });
  }
});

export const bonsaiCreateSchema = bonsaiPersistedSchema;

export const bonsaiPatchSchema = bonsaiPatchObjectSchema;
