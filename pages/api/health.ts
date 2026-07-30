import type { NextApiRequest, NextApiResponse } from "next";
import { fail, ok } from "@/lib/api/response";
import { getServerSupabaseConfig, isHealthcheckEnabled } from "@/lib/config/runtime";
import { logError } from "@/lib/observability";
import { getServerDataClient } from "@/lib/supabase/server-data";

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
    const config = getServerSupabaseConfig();
    const { error: settingsError } = await getServerDataClient().from("signup_settings").select("id").eq("id", true).single();
    if (settingsError) {
      throw settingsError;
    }
    const { error: bucketError } = await getServerDataClient().storage.getBucket(config.storageBucket);
    if (bucketError) {
      throw bucketError;
    }

    ok(res, {
      status: "ok",
      dataApi: "ok",
      storageBucket: config.storageBucket,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError("healthcheck.failed", error);
    fail(res, "INTERNAL_SERVER_ERROR", "Healthcheck fehlgeschlagen.", 500);
  }
}
