import type { NextApiRequest, NextApiResponse } from "next";
import legacyHandler from "@/pages/api/posts/[id]/comments";
import { requirePublicClient } from "@/lib/api/public-client";
import { parsePositiveId } from "@/lib/api/ids";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const postId = parsePositiveId(req.query.id);
  const context = await requirePublicClient(req, res, {
    integrity: "private",
    rateLimit: { POST: "mobile_comment_create" },
    rateLimitTarget: postId ? `post:${postId}` : null,
  });
  if (!context) {
    return;
  }
  await legacyHandler(req, res);
}
