import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { mapPostToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { deleteOwnedPost, getVisiblePost, saveOwnedPost } from "@/lib/repositories/posts";
import { postPatchSchema } from "@/lib/validators/post";

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

  if (req.method === "GET") {
    const post = await getVisiblePost(actor.id, postId);

    if (!post) {
      fail(res, "NOT_FOUND", "Post nicht gefunden.", 404);
      return;
    }

    ok(res, mapPostToDto(post, actor.id));
    return;
  }

  if (req.method === "PATCH") {
    const existing = await getVisiblePost(actor.id, postId);

    if (!existing || existing.user_id !== actor.id) {
      fail(res, "NOT_FOUND", "Post nicht gefunden.", 404);
      return;
    }

    try {
      const patch = postPatchSchema.parse(req.body);
      const entryIds = patch.entryIds ?? existing.post_entry_references.map((entry) => entry.sub_entry_id).filter((entryId): entryId is number => entryId !== null);
      const updated = await saveOwnedPost(
        actor.id,
        postId,
        patch.bonsaiId ?? existing.bonsai_id,
        patch.text ?? existing.text,
        patch.postType ?? existing.post_type,
        entryIds,
        patch.manualImages ?? existing.images,
      );

      ok(res, mapPostToDto(updated, actor.id));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Post-Daten sind ungültig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Post konnte nicht aktualisiert werden.", 500);
      return;
    }
  }

  if (req.method === "DELETE") {
    const deleted = await deleteOwnedPost(actor.id, postId);
    if (!deleted) {
      fail(res, "NOT_FOUND", "Post nicht gefunden.", 404);
      return;
    }

    res.status(204).end();
    return;
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
