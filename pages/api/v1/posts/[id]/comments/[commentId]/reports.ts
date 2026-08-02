import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { parsePositiveId } from "@/lib/api/ids";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { requirePublicClient } from "@/lib/api/public-client";
import { createOrReturnOpenReport } from "@/lib/repositories/reports";
import { reportCreateSchema } from "@/lib/validators/report";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const postId = parsePositiveId(req.query.id);
  const commentId = parsePositiveId(req.query.commentId);
  const context = await requirePublicClient(req, res, {
    integrity: "private",
    rateLimit: { POST: "mobile_report" },
    rateLimitTarget: postId && commentId ? `comment:${postId}:${commentId}` : null,
  });
  if (!context) {
    return;
  }

  if (!postId || !commentId) {
    fail(res, "BAD_REQUEST", "Ungültige Kommentar-ID.", 400);
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  try {
    const parsed = reportCreateSchema.parse(req.body);
    const report = await createOrReturnOpenReport(context.actor.id, { type: "comment", postId, commentId }, parsed);
    if (!report) {
      fail(res, "NOT_FOUND", "Kommentar nicht gefunden.", 404);
      return;
    }
    ok(res, { reported: true, status: "OPEN" }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      const { details, message } = getZodErrorMessage(error, "Die Meldung ist ungültig.");
      fail(res, "VALIDATION_ERROR", message, 422, details);
      return;
    }
    fail(res, "INTERNAL_SERVER_ERROR", "Die Meldung konnte nicht gespeichert werden.", 500);
  }
}
