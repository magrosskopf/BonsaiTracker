import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { mapPublicProfileToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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

  const profileId = parseId(req.query.id);
  if (!profileId) {
    fail(res, "BAD_REQUEST", "Ungültige Profil-ID.", 400);
    return;
  }

  const profile = await prisma.user.findUnique({
    where: { id: profileId },
    include: {
      posts: {
        include: {
          user: true,
          likes: { select: { userId: true } },
          comments: { include: { user: true } },
          entryReferences: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      },
    },
  });

  if (!profile) {
    fail(res, "NOT_FOUND", "Profil nicht gefunden.", 404);
    return;
  }

  ok(res, mapPublicProfileToDto(profile, userId));
}
