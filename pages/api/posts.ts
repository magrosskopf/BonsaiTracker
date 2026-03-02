import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedBonsaiOr404, requireUser } from "@/lib/authz";
import { mapPostToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { normalizeSelectedImages, snapshotEntryReferenceIds } from "@/lib/posts";
import { postCreateSchema } from "@/lib/validators/post";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const userId = await requireUser(req, res);
  if (!userId) {
    return;
  }

  if (req.method === "GET") {
    try {
      const posts = await prisma.post.findMany({
        include: {
          user: true,
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            include: {
              user: true,
            },
          },
          entryReferences: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

      ok(res, { items: posts.map((post) => mapPostToDto(post, userId)) });
      return;
    } catch (error) {
      console.error("GET /api/posts failed", error);
      fail(res, "INTERNAL_SERVER_ERROR", "Der Feed konnte nicht geladen werden.", 500);
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = postCreateSchema.parse(req.body);
      const bonsai = await getOwnedBonsaiOr404(parsed.bonsaiId, userId);
      if (!bonsai) {
        fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
        return;
      }

      const allSubEntries = await prisma.subEntry.findMany({
        where: {
          bonsaiId: parsed.bonsaiId,
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      });

      const referencedSubEntries = parsed.entryIds.length > 0
        ? allSubEntries.filter((entry) => parsed.entryIds.includes(entry.id))
        : [];

      const availableImages = Array.from(new Set([bonsai.images, ...allSubEntries.map((entry) => entry.images)].flat()));
      const images = normalizeSelectedImages(availableImages, parsed.manualImages);

      const entryReferenceIds = snapshotEntryReferenceIds(referencedSubEntries, parsed.entryIds);
      const created = await prisma.post.create({
        data: {
          userId,
          bonsaiId: parsed.bonsaiId,
          text: parsed.text,
          postType: parsed.postType,
          snapshotName: bonsai.name,
          snapshotSpecies: bonsai.species,
          images,
          entryReferences: {
            create: entryReferenceIds.map((subEntryId) => ({ subEntryId })),
          },
        },
        include: {
          user: true,
          likes: { select: { userId: true } },
          comments: { include: { user: true } },
          entryReferences: true,
        },
      });

      ok(res, mapPostToDto(created, userId), 201);
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Post-Daten sind ungueltig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Post konnte nicht erstellt werden.", 500);
      return;
    }
  }

  res.setHeader("Allow", "GET, POST");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
