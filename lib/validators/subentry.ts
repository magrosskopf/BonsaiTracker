import { z } from "zod";
import { ENTRY_TYPE_OPTIONS, HEALTH_STATUS_OPTIONS } from "@/types/domain";
import { nullableTrimmedString, nullableUtcDateField, requiredUtcDateField } from "./shared";

const performedActionsSchema = z.preprocess(
  (value) => {
    if (value === undefined) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  },
  z.array(z.preprocess((item) => (typeof item === "string" ? item.trim() : item), z.string().min(1).max(80))).max(10),
);

const subEntryObjectSchema = z.object({
  date: requiredUtcDateField({ minYear: 1900, maxYear: 2200 }),
  entryType: z.enum(ENTRY_TYPE_OPTIONS),
  healthObservation: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.enum(HEALTH_STATUS_OPTIONS).nullable(),
  ),
  performedActions: performedActionsSchema,
  nextAction: nullableTrimmedString(200),
  reminderDate: nullableUtcDateField({ minYear: 1900, maxYear: 2200 }),
  notes: nullableTrimmedString(500, 0),
  images: z.array(z.string().min(1)).max(5),
});

function validateSubEntryDates(
  value: { date: Date; reminderDate: Date | null },
  ctx: z.RefinementCtx,
) {
  if (value.reminderDate && value.reminderDate < value.date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Erinnerungsdatum darf nicht vor dem Eintragsdatum liegen.", path: ["reminderDate"] });
  }
}

export const subEntryPersistedSchema = subEntryObjectSchema.superRefine(validateSubEntryDates);

export const subEntryCreateSchema = z.object({
  bonsaiId: z.preprocess((value) => Number(value), z.number().int().positive()),
  date: subEntryObjectSchema.shape.date,
  entryType: subEntryObjectSchema.shape.entryType,
  healthObservation: subEntryObjectSchema.shape.healthObservation,
  performedActions: performedActionsSchema,
  nextAction: subEntryObjectSchema.shape.nextAction,
  reminderDate: subEntryObjectSchema.shape.reminderDate,
  notes: subEntryObjectSchema.shape.notes,
  images: z.array(z.string().min(1)).max(5),
}).superRefine((value, ctx) => {
  validateSubEntryDates(value, ctx);
});

export const subEntryPatchSchema = subEntryObjectSchema.partial().superRefine((value, ctx) => {
  if (value.date && value.reminderDate && value.reminderDate < value.date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Erinnerungsdatum darf nicht vor dem Eintragsdatum liegen.", path: ["reminderDate"] });
  }
});
