import { z } from "zod";
import { normalizeDateInput, startOfTodayUtc } from "@/lib/date";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

function applyDateConstraints(
  value: Date,
  ctx: z.RefinementCtx,
  options?: { notInFuture?: boolean; minYear?: number; maxYear?: number },
): void {
  const year = value.getUTCFullYear();
  if (options?.minYear !== undefined && year < options.minYear) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Datum muss ab ${options.minYear} liegen.` });
  }
  if (options?.maxYear !== undefined && year > options.maxYear) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Datum darf höchstens ${options.maxYear} sein.` });
  }
  if (options?.notInFuture && value > startOfTodayUtc()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Datum darf nicht in der Zukunft liegen." });
  }
}

export const nullableTrimmedString = (max: number, min = 1) =>
  z.preprocess(
    (value) => {
      if (value === null) {
        return null;
      }
      const trimmed = trimString(value);
      return trimmed === "" ? null : trimmed;
    },
    z.string().min(min).max(max).nullable(),
  );

export const requiredTrimmedString = (min: number, max: number) =>
  z.preprocess(trimString, z.string().min(min).max(max));

export const nullableInteger = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return null;
      }
      return typeof value === "string" ? Number(value) : value;
    },
    z.number().int().min(min).max(max).nullable(),
  );

export const requiredInteger = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(min).max(max),
  );

export const requiredUtcDateField = (options?: { notInFuture?: boolean; minYear?: number; maxYear?: number }) =>
  z.preprocess(
    (value) => {
      if (value instanceof Date) {
        return value;
      }
      if (value === undefined || value === null || value === "") {
        return value;
      }
      try {
        return normalizeDateInput(String(value));
      } catch {
        return value;
      }
    },
    z.date(),
  ).superRefine((value, ctx) => {
    applyDateConstraints(value, ctx, options);
  });

export const nullableUtcDateField = (options?: { notInFuture?: boolean; minYear?: number; maxYear?: number }) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      if (value instanceof Date) {
        return value;
      }
      try {
        return normalizeDateInput(String(value));
      } catch {
        return value;
      }
    },
    z.date().nullable(),
  ).superRefine((value, ctx) => {
    if (value === null) {
      return;
    }
    applyDateConstraints(value, ctx, options);
  });
