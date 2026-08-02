import type { NextApiRequest, NextApiResponse } from "next";
import legacyHandler from "@/pages/api/media/[...key]";
import { requirePublicClient } from "@/lib/api/public-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const context = await requirePublicClient(req, res, {
    integrity: "private",
    rateLimit: { GET: "mobile_media_read" },
  });
  if (!context) {
    return;
  }
  await legacyHandler(req, res);
}
