import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { togglePostLike } from "@/lib/repositories/posts";

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

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  const result = await togglePostLike(actor.id, postId);
  ok(res, { liked: result.liked, likeCount: result.likeCount }, result.liked ? 201 : 200);
}
