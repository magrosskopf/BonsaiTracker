import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { mapSelfProfileToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { getProfile, updateOwnedProfile } from "@/lib/repositories/profiles";
import { profilePatchSchema } from "@/lib/validators/profile";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  if (req.method === "GET") {
    const profile = await getProfile(actor.id);

    if (!profile) {
      fail(res, "NOT_FOUND", "Profil nicht gefunden.", 404);
      return;
    }

    ok(res, mapSelfProfileToDto(profile, actor.email, actor.id));
    return;
  }

  if (req.method === "PATCH") {
    try {
      const parsed = profilePatchSchema.parse(req.body);
      const updated = await updateOwnedProfile(actor.id, {
        name: parsed.name,
        bio: parsed.bio,
        profile_image_url: parsed.profileImageUrl,
      });
      if (!updated) {
        fail(res, "NOT_FOUND", "Profil nicht gefunden.", 404);
        return;
      }
      ok(res, mapSelfProfileToDto(updated, actor.email, actor.id));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Profil-Daten sind ungültig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Das Profil konnte nicht gespeichert werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
