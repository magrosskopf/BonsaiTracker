import { z } from "zod";
import { COMMUNITY_REPORT_REASON_OPTIONS } from "@/types/domain";
import { nullableTrimmedString } from "@/lib/validators/shared";

export const reportCreateSchema = z.object({
  reason: z.enum(COMMUNITY_REPORT_REASON_OPTIONS),
  note: nullableTrimmedString(500, 0).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.reason === "OTHER" && !value.note?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["note"],
      message: "Bei OTHER ist eine Notiz erforderlich.",
    });
  }
});
