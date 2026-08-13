import { z } from "zod";
import { REMINDER_STATUS_OPTIONS } from "@/types/domain";
import { nullableTrimmedString, nullableUtcDateField, requiredUtcDateField } from "./shared";

export const reminderCreateSchema = z.object({
  bonsaiId: z.preprocess((value) => Number(value), z.number().int().positive()),
  subEntryId: z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? null : Number(value)),
    z.number().int().positive().nullable(),
  ).default(null),
  title: nullableTrimmedString(160),
  reminderDate: requiredUtcDateField({ minYear: 1900, maxYear: 2200 }),
});

export const reminderPatchSchema = z.object({
  bonsaiId: z.preprocess((value) => (value === undefined || value === null || value === "" ? undefined : Number(value)), z.number().int().positive().optional()),
  title: nullableTrimmedString(160).optional(),
  reminderDate: nullableUtcDateField({ minYear: 1900, maxYear: 2200 }).optional(),
  status: z.enum(REMINDER_STATUS_OPTIONS).optional(),
  snoozeDays: z.preprocess(
    (value) => (value === undefined || value === null || value === "" ? undefined : Number(value)),
    z.number().int().positive().max(365).optional(),
  ),
}).strict();
