import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { mapReminderToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { getOwnedReminder, patchOwnedReminder } from "@/lib/repositories/reminders";
import { reminderPatchSchema } from "@/lib/validators/reminder";

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  const reminderId = parseId(req.query.id);
  if (!reminderId) {
    fail(res, "BAD_REQUEST", "Ungültige Reminder-ID.", 400);
    return;
  }

  if (req.method === "PATCH") {
    const existing = await getOwnedReminder(actor.id, reminderId);
    if (!existing) {
      fail(res, "NOT_FOUND", "Reminder nicht gefunden.", 404);
      return;
    }

    try {
      const parsed = reminderPatchSchema.parse(req.body);
      const existingReminderDate = new Date(existing.reminder_date);
      const nextReminderDate = parsed.snoozeDays ? new Date(existingReminderDate.getTime() + parsed.snoozeDays * 24 * 60 * 60 * 1000) : parsed.reminderDate;
      const nextStatus = parsed.snoozeDays ? "SNOOZED" : parsed.status;
      const isCancelled = nextStatus === "CANCELLED";
      const hasTitle = Object.prototype.hasOwnProperty.call(parsed, "title");

      const updated = await patchOwnedReminder(actor.id, reminderId, {
        bonsai_id: parsed.bonsaiId ?? undefined,
        title: hasTitle ? parsed.title : undefined,
        reminder_date: nextReminderDate && !isCancelled ? nextReminderDate.toISOString() : undefined,
        status: nextStatus ?? undefined,
        snoozed_until: isCancelled ? null : parsed.snoozeDays ? nextReminderDate?.toISOString() : nextStatus === "DONE" ? null : undefined,
        completed_at: isCancelled ? null : nextStatus === "DONE" ? new Date().toISOString() : nextStatus === "SNOOZED" ? null : undefined,
      });
      if (!updated) {
        fail(res, "NOT_FOUND", "Reminder nicht gefunden.", 404);
        return;
      }

      ok(res, mapReminderToDto(updated));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Reminder-Daten sind ungültig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Reminder konnte nicht aktualisiert werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "PATCH");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
