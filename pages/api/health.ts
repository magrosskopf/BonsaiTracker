import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";
import { getUploadStorageMode, isHealthcheckEnabled, getSupabaseStorageConfig } from "@/lib/config/beta";
import { logError } from "@/lib/observability";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (!isHealthcheckEnabled()) {
    fail(res, "NOT_FOUND", "Healthcheck ist deaktiviert.", 404);
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const uploadStorage = getUploadStorageMode();
    if (uploadStorage === "supabase") {
      getSupabaseStorageConfig();
    }

    ok(res, {
      status: "ok",
      database: "ok",
      uploadStorage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError("healthcheck.failed", error);
    fail(res, "INTERNAL_SERVER_ERROR", "Healthcheck fehlgeschlagen.", 500);
  }
}
