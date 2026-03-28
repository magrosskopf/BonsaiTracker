import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/authz";
import { fail } from "@/lib/api/response";
import { logError } from "@/lib/observability";
import { resolveManagedMedia } from "@/lib/storage";

function getStorageKey(value: string | string[] | undefined): string | null {
  if (!value) {
    return null;
  }

  const parts = Array.isArray(value) ? value : [value];
  const storageKey = parts.join("/").trim();
  return storageKey || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = await requireUser(req, res);
  if (!userId) {
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  const storageKey = getStorageKey(req.query.key);
  if (!storageKey) {
    fail(res, "BAD_REQUEST", "Ungültiger Media-Pfad.", 400);
    return;
  }

  try {
    const resolved = await resolveManagedMedia(storageKey);
    if (resolved.cacheControl) {
      res.setHeader("Cache-Control", resolved.cacheControl);
    }

    if (resolved.kind === "redirect") {
      res.redirect(302, resolved.location);
      return;
    }

    res.setHeader("Content-Type", resolved.contentType);
    res.status(200).send(resolved.buffer);
  } catch (error) {
    logError("media.resolve_failed", error, { storageKey, userId });
    fail(res, "NOT_FOUND", "Medium nicht gefunden.", 404);
  }
}
