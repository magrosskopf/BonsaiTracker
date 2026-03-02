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
  requiredUtcDateField,
  requiredInteger,
  requiredTrimmedString,
} from "./shared";

const bonsaiObjectSchema = z.object({
  name: requiredTrimmedString(2, 80),
  nickname: nullableTrimmedString(80),
  species: requiredTrimmedString(2, 80),
  latinName: nullableTrimmedString(120, 2),
  location: requiredTrimmedString(2, 120),
  indoorOutdoor: z.enum(INDOOR_OUTDOOR_OPTIONS),
  age: requiredInteger(0, 200),
  heightCm: nullableInteger(0, 500),
  widthCm: nullableInteger(0, 500),
  trunkDiameterMm: nullableInteger(0, 1000),
  style: z.enum(STYLE_OPTIONS),
  customStyle: nullableTrimmedString(80),
  ownedSince: requiredUtcDateField({ notInFuture: true }),
  acquiredFrom: nullableTrimmedString(120),
  purchasePriceCents: nullableInteger(0, Number.MAX_SAFE_INTEGER),
  healthStatus: z.enum(HEALTH_STATUS_OPTIONS),
  developmentStage: z.enum(DEVELOPMENT_STAGE_OPTIONS),
  lastRepotDate: nullableUtcDateField({ notInFuture: true }),
  nextRepotDue: nullableUtcDateField(),
  winterHardiness: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(WINTER_HARDINESS_OPTIONS).nullable(),
  ),
  sunExposure: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(SUN_EXPOSURE_OPTIONS).nullable(),
  ),
  potType: nullableTrimmedString(80),
  potColor: nullableTrimmedString(40),
  wateringNotes: nullableTrimmedString(1000),
  fertilizingNotes: nullableTrimmedString(1000),
  pruningNotes: nullableTrimmedString(1000),
  wiringNotes: nullableTrimmedString(1000),
  notes: nullableTrimmedString(2000),
  images: z.array(z.string().min(1)).default([]),
});

export const bonsaiPersistedSchema = bonsaiObjectSchema.superRefine((value, ctx) => {
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

export const bonsaiPatchSchema = bonsaiObjectSchema.partial().strict();
