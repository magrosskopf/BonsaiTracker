import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/authz";
import { fail } from "@/lib/api/response";
import { logError } from "@/lib/observability";
import { removeManagedMedia, resolveManagedMedia } from "@/lib/storage";
import { canAccessMedia, canDeleteMedia } from "@/lib/repositories/media";

function getStorageKey(value: string | string[] | undefined): string | null {
  if (!value) {
    return null;
  }

  const parts = Array.isArray(value) ? value : [value];
  const storageKey = parts.join("/").trim();
  return storageKey || null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  if (req.method !== "GET" && req.method !== "DELETE") {
    res.setHeader("Allow", "GET, DELETE");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  const storageKey = getStorageKey(req.query.key);
  if (!storageKey) {
    fail(res, "BAD_REQUEST", "Ungültiger Media-Pfad.", 400);
    return;
  }

  try {
    const allowed = req.method === "GET"
      ? await canAccessMedia(actor.id, storageKey)
      : await canDeleteMedia(actor.id, storageKey);
    if (!allowed) {
      fail(res, "NOT_FOUND", "Medium nicht gefunden.", 404);
      return;
    }

    if (req.method === "DELETE") {
      await removeManagedMedia(`/api/media/${storageKey}`);
      res.status(204).end();
      return;
    }

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
    logError("media.resolve_failed", error, { storageKey, userId: actor.id });
    fail(res, "NOT_FOUND", "Medium nicht gefunden.", 404);
  }
}
