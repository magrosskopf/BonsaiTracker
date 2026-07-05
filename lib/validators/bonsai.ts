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

const defaultNullString = (max: number, min = 1) => nullableTrimmedString(max, min).default(null);

const optionalNullString = (max: number, min = 1) => nullableTrimmedString(max, min).optional();

const defaultNullInteger = (min: number, max: number) => nullableInteger(min, max).default(null);

const optionalNullInteger = (min: number, max: number) => nullableInteger(min, max).optional();

const nullableEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(values).nullable(),
  );

const defaultNullEnum = <T extends readonly [string, ...string[]]>(values: T) => nullableEnum(values).default(null);

const optionalNullEnum = <T extends readonly [string, ...string[]]>(values: T) => nullableEnum(values).optional();

const bonsaiCreateObjectSchema = z.object({
  name: requiredTrimmedString(2, 80),
  species: defaultedTrimmedString("Unbekannt", 2, 80),
  latinName: defaultNullString(120, 2),
  location: defaultedTrimmedString("Unbekannt", 2, 120),
  indoorOutdoor: defaultedEnum(INDOOR_OUTDOOR_OPTIONS, "OUTDOOR"),
  age: defaultNullInteger(0, 200),
  heightCm: defaultNullInteger(0, 500),
  widthCm: defaultNullInteger(0, 500),
  trunkDiameterMm: defaultNullInteger(0, 1000),
  style: defaultedEnum(STYLE_OPTIONS, "Unbekannt"),
  customStyle: defaultNullString(80),
  ownedSince: nullableUtcDateField({ notInFuture: true }).default(null),
  acquiredFrom: defaultNullString(120),
  purchasePriceCents: defaultNullInteger(0, Number.MAX_SAFE_INTEGER),
  healthStatus: defaultedEnum(HEALTH_STATUS_OPTIONS, "UNBEKANNT"),
  developmentStage: defaultedEnum(DEVELOPMENT_STAGE_OPTIONS, "UNBEKANNT"),
  lastRepotDate: nullableUtcDateField({ notInFuture: true }).default(null),
  nextRepotDue: nullableUtcDateField().default(null),
  winterHardiness: defaultNullEnum(WINTER_HARDINESS_OPTIONS),
  sunExposure: defaultNullEnum(SUN_EXPOSURE_OPTIONS),
  potType: defaultNullString(80),
  potColor: defaultNullString(40),
  wateringNotes: defaultNullString(1000),
  fertilizingNotes: defaultNullString(1000),
  pruningNotes: defaultNullString(1000),
  wiringNotes: defaultNullString(1000),
  notes: defaultNullString(2000),
  images: z.array(z.string().min(1)).default([]),
});

const bonsaiPatchObjectSchema = z.object({
  name: requiredTrimmedString(2, 80).optional(),
  species: defaultedTrimmedString("Unbekannt", 2, 80).optional(),
  latinName: optionalNullString(120, 2),
  location: defaultedTrimmedString("Unbekannt", 2, 120).optional(),
  indoorOutdoor: defaultedEnum(INDOOR_OUTDOOR_OPTIONS, "OUTDOOR").optional(),
  age: optionalNullInteger(0, 200),
  heightCm: optionalNullInteger(0, 500),
  widthCm: optionalNullInteger(0, 500),
  trunkDiameterMm: optionalNullInteger(0, 1000),
  style: defaultedEnum(STYLE_OPTIONS, "Unbekannt").optional(),
  customStyle: optionalNullString(80),
  ownedSince: nullableUtcDateField({ notInFuture: true }).optional(),
  acquiredFrom: optionalNullString(120),
  purchasePriceCents: optionalNullInteger(0, Number.MAX_SAFE_INTEGER),
  healthStatus: defaultedEnum(HEALTH_STATUS_OPTIONS, "UNBEKANNT").optional(),
  developmentStage: defaultedEnum(DEVELOPMENT_STAGE_OPTIONS, "UNBEKANNT").optional(),
  lastRepotDate: nullableUtcDateField({ notInFuture: true }).optional(),
  nextRepotDue: nullableUtcDateField().optional(),
  winterHardiness: optionalNullEnum(WINTER_HARDINESS_OPTIONS),
  sunExposure: optionalNullEnum(SUN_EXPOSURE_OPTIONS),
  potType: optionalNullString(80),
  potColor: optionalNullString(40),
  wateringNotes: optionalNullString(1000),
  fertilizingNotes: optionalNullString(1000),
  pruningNotes: optionalNullString(1000),
  wiringNotes: optionalNullString(1000),
  notes: optionalNullString(2000),
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
