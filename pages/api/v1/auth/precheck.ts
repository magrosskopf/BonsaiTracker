import type { NextApiRequest, NextApiResponse } from "next";
import legacyHandler from "@/pages/api/auth/precheck";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  await legacyHandler(req, res);
}
