import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedReminderOr404, requireUser } from "@/lib/authz";
import { mapReminderToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { reminderPatchSchema } from "@/lib/validators/reminder";

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = await requireUser(req, res);
  if (!userId) {
    return;
  }

  const reminderId = parseId(req.query.id);
  if (!reminderId) {
    fail(res, "BAD_REQUEST", "Ungueltige Reminder-ID.", 400);
    return;
  }

  if (req.method === "PATCH") {
    const existing = await getOwnedReminderOr404(reminderId, userId);
    if (!existing) {
      fail(res, "NOT_FOUND", "Reminder nicht gefunden.", 404);
      return;
    }

    try {
      const parsed = reminderPatchSchema.parse(req.body);
      const nextReminderDate = parsed.snoozeDays ? new Date(existing.reminderDate.getTime() + parsed.snoozeDays * 24 * 60 * 60 * 1000) : parsed.reminderDate;
      const nextStatus = parsed.snoozeDays ? "SNOOZED" : parsed.status;

      const updated = await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          title: parsed.title ?? undefined,
          reminderDate: nextReminderDate ?? undefined,
          status: nextStatus ?? undefined,
          snoozedUntil: parsed.snoozeDays ? nextReminderDate ?? undefined : nextStatus === "DONE" ? null : undefined,
          completedAt: nextStatus === "DONE" ? new Date() : nextStatus === "SNOOZED" ? null : undefined,
        },
        include: {
          bonsai: true,
        },
      });

      ok(res, mapReminderToDto(updated));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Reminder-Daten sind ungueltig.");
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
