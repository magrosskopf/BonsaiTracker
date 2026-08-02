import type { NextApiRequest, NextApiResponse } from "next";
import legacyHandler, { config } from "@/pages/api/upload";
import { requirePublicClient } from "@/lib/api/public-client";

export { config };

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const context = await requirePublicClient(req, res, {
    integrity: "private",
    rateLimit: { POST: "mobile_upload" },
  });
  if (!context) {
    return;
  }
  await legacyHandler(req, res);
}
