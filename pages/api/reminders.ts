import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedBonsaiOr404, getOwnedSubEntryOr404, requireUser } from "@/lib/authz";
import { mapReminderToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { firstQueryValue } from "@/lib/api/request";
import { getZodErrorMessage } from "@/lib/api/validation";
import { reminderCreateSchema } from "@/lib/validators/reminder";
import { REMINDER_STATUS_OPTIONS, type ReminderStatusOption } from "@/types/domain";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = await requireUser(req, res);
  if (!userId) {
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

    const items = await prisma.reminder.findMany({
      where: {
        userId,
        ...(status ? { status: status as ReminderStatusOption } : includeDone ? {} : { status: { in: ["PENDING", "SNOOZED"] } }),
        ...(bonsaiId ? { bonsaiId: Number(bonsaiId) } : {}),
        ...(includeDone ? {} : { bonsai: { deletedAt: null } }),
      },
      include: {
        bonsai: true,
      },
      orderBy: [{ reminderDate: "asc" }, { id: "asc" }],
    });

    ok(res, { items: items.map(mapReminderToDto) });
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = reminderCreateSchema.parse(req.body);
      const bonsai = await getOwnedBonsaiOr404(parsed.bonsaiId, userId);
      if (!bonsai) {
        fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
        return;
      }

      if (parsed.subEntryId) {
        const subEntry = await getOwnedSubEntryOr404(parsed.subEntryId, userId);
        if (!subEntry || subEntry.bonsaiId !== parsed.bonsaiId) {
          fail(res, "NOT_FOUND", "Sub-Eintrag nicht gefunden.", 404);
          return;
        }
      }

      const created = await prisma.reminder.create({
        data: {
          userId,
          bonsaiId: parsed.bonsaiId,
          subEntryId: parsed.subEntryId,
          title: parsed.title,
          reminderDate: parsed.reminderDate,
        },
        include: {
          bonsai: true,
        },
      });

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
