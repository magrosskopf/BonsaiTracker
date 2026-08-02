import type { NextApiRequest, NextApiResponse } from "next";
import legacyHandler from "@/pages/api/reminders";
import { requirePublicClient } from "@/lib/api/public-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const context = await requirePublicClient(req, res, { integrity: "private" });
  if (!context) {
    return;
  }
  await legacyHandler(req, res);
}
