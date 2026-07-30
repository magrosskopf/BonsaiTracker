import type { NextApiRequest, NextApiResponse } from "next";
import { requireUser } from "@/lib/authz";
import { mapPublicProfileToDto } from "@/lib/mappers";
import { parseUuid } from "@/lib/api/request";
import { fail, ok } from "@/lib/api/response";
import { getProfile } from "@/lib/repositories/profiles";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  const profileId = parseUuid(req.query.id);
  if (!profileId) {
    fail(res, "BAD_REQUEST", "Ungültige Profil-ID.", 400);
    return;
  }

  const profile = await getProfile(profileId);

  if (!profile) {
    fail(res, "NOT_FOUND", "Profil nicht gefunden.", 404);
    return;
  }

  ok(res, mapPublicProfileToDto(profile, actor.id));
}
