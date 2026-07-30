import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { mapPostCommentToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { createPostComment, getVisiblePost, listPostComments } from "@/lib/repositories/posts";
import { commentCreateSchema } from "@/lib/validators/comment";

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

  const postId = parseId(req.query.id);
  if (!postId) {
    fail(res, "BAD_REQUEST", "Ungültige Post-ID.", 400);
    return;
  }

  const post = await getVisiblePost(actor.id, postId);
  if (!post) {
    fail(res, "NOT_FOUND", "Post nicht gefunden.", 404);
    return;
  }

  if (req.method === "GET") {
    const items = await listPostComments(actor.id, postId);
    ok(res, { items: items.map(mapPostCommentToDto) });
    return;
  }

  if (req.method === "POST") {
    try {
      const parsed = commentCreateSchema.parse(req.body);
      const created = await createPostComment(actor.id, postId, parsed.text);
      ok(res, mapPostCommentToDto(created), 201);
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Der Kommentar ist ungültig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Kommentar konnte nicht erstellt werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "GET, POST");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
