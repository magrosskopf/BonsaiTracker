import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { mapReminderToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { firstQueryValue } from "@/lib/api/request";
import { getZodErrorMessage } from "@/lib/api/validation";
import { createOwnedReminder, listOwnedReminders } from "@/lib/repositories/reminders";
import { reminderCreateSchema } from "@/lib/validators/reminder";
import { REMINDER_STATUS_OPTIONS, type ReminderStatusOption } from "@/types/domain";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  if (req.method === "GET") {
    const status = firstQueryValue(req.query.status);
    const bonsaiId = firstQueryValue(req.query.bonsaiId);
    const includeDone = firstQueryValue(req.query.includeDone) === "true";

    if (status && !REMINDER_STATUS_OPTIONS.includes(status as ReminderStatusOption)) {
      fail(res, "BAD_REQUEST", "Ungültiger Reminder-Status.", 400);
      return;
    }

    const items = await listOwnedReminders(actor.id, {
      status: status as ReminderStatusOption | undefined,
      bonsaiId: bonsaiId ? Number(bonsaiId) : undefined,
      includeDone,
    });

    ok(res, { items: items.map(mapReminderToDto) });
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = reminderCreateSchema.parse(req.body);
      const created = await createOwnedReminder(actor.id, parsed);

      ok(res, mapReminderToDto(created), 201);
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Reminder-Daten sind ungültig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Reminder konnte nicht erstellt werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "GET, POST");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
