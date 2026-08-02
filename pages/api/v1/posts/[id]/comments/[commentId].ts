import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { parsePositiveId } from "@/lib/api/ids";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { requirePublicClient } from "@/lib/api/public-client";
import { mapPostCommentToDto } from "@/lib/mappers";
import { deleteOwnedPostComment, getVisiblePost, updateOwnedPostComment } from "@/lib/repositories/posts";
import { commentPatchSchema } from "@/lib/validators/comment";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const context = await requirePublicClient(req, res, { integrity: "private" });
  if (!context) {
    return;
  }

  const postId = parsePositiveId(req.query.id);
  const commentId = parsePositiveId(req.query.commentId);
  if (!postId || !commentId) {
    fail(res, "BAD_REQUEST", "Ungültige Kommentar-ID.", 400);
    return;
  }

  const post = await getVisiblePost(context.actor.id, postId);
  if (!post) {
    fail(res, "NOT_FOUND", "Kommentar nicht gefunden.", 404);
    return;
  }

  if (req.method === "PATCH") {
    try {
      const parsed = commentPatchSchema.parse(req.body);
      const updated = await updateOwnedPostComment(context.actor.id, postId, commentId, parsed.text);
      if (!updated) {
        fail(res, "NOT_FOUND", "Kommentar nicht gefunden.", 404);
        return;
      }
      ok(res, mapPostCommentToDto(updated));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Der Kommentar ist ungültig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Kommentar konnte nicht aktualisiert werden.", 500);
      return;
    }
  }

  if (req.method === "DELETE") {
    const deleted = await deleteOwnedPostComment(context.actor.id, postId, commentId);
    if (!deleted) {
      fail(res, "NOT_FOUND", "Kommentar nicht gefunden.", 404);
      return;
    }
    res.status(204).end();
    return;
  }

  res.setHeader("Allow", "PATCH, DELETE");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
