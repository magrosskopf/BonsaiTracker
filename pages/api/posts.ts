import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { mapPostToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { logError } from "@/lib/observability";
import { listFeedPosts, saveOwnedPost } from "@/lib/repositories/posts";
import { postCreateSchema } from "@/lib/validators/post";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  if (req.method === "GET") {
    try {
      const posts = await listFeedPosts(actor.id);

      ok(res, { items: posts.map((post) => mapPostToDto(post, actor.id)) });
      return;
    } catch (error) {
      logError("posts.list_failed", error, { userId: actor.id });
      fail(res, "INTERNAL_SERVER_ERROR", "Der Feed konnte nicht geladen werden.", 500);
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = postCreateSchema.parse(req.body);
      const created = await saveOwnedPost(actor.id, null, parsed.bonsaiId, parsed.text, parsed.postType, parsed.entryIds, parsed.manualImages);

      ok(res, mapPostToDto(created, actor.id), 201);
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Post-Daten sind ungültig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Post konnte nicht erstellt werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "GET, POST");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
