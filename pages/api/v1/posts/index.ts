import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { firstQueryValue } from "@/lib/api/request";
import { decodeCreatedAtCursor, encodeCreatedAtCursor, parseLimit } from "@/lib/api/pagination";
import { requirePublicClient } from "@/lib/api/public-client";
import { mapPostToDto } from "@/lib/mappers";
import { listFeedPosts, saveOwnedPost } from "@/lib/repositories/posts";
import { postCreateSchema } from "@/lib/validators/post";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const context = await requirePublicClient(req, res, {
    integrity: "private",
    rateLimit: { POST: "mobile_post_create" },
  });
  if (!context) {
    return;
  }

  if (req.method === "GET") {
    try {
      const limit = parseLimit(req.query.limit, { defaultLimit: 20, maxLimit: 50 });
      if (!limit) {
        fail(res, "BAD_REQUEST", "limit muss zwischen 1 und 50 liegen.", 400);
        return;
      }

      let cursor: ReturnType<typeof decodeCreatedAtCursor> | null = null;
      try {
        cursor = decodeCreatedAtCursor(firstQueryValue(req.query.cursor));
      } catch {
        fail(res, "BAD_REQUEST", "Ungültiger Cursor.", 400);
        return;
      }

      const posts = await listFeedPosts(context.actor.id, {
        limit: limit + 1,
        cursorCreatedAt: cursor?.createdAt,
        cursorId: cursor?.id,
      });
      const hasMore = posts.length > limit;
      const visibleItems = hasMore ? posts.slice(0, limit) : posts;
      const lastItem = visibleItems[visibleItems.length - 1];

      ok(res, {
        items: visibleItems.map((post) => mapPostToDto(post, context.actor.id)),
        nextCursor: hasMore && lastItem ? encodeCreatedAtCursor({ createdAt: lastItem.created_at, id: lastItem.id }) : null,
      });
      return;
    } catch {
      fail(res, "INTERNAL_SERVER_ERROR", "Der Feed konnte nicht geladen werden.", 500);
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = postCreateSchema.parse(req.body);
      const created = await saveOwnedPost(context.actor.id, null, parsed.bonsaiId, parsed.text, parsed.postType, parsed.entryIds, parsed.manualImages);

      ok(res, mapPostToDto(created, context.actor.id), 201);
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
