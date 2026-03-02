import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnedPostOr404, requireUser } from "@/lib/authz";
import { mapPostToDto } from "@/lib/mappers";
import { fail, ok } from "@/lib/api/response";
import { getZodErrorMessage } from "@/lib/api/validation";
import { normalizeSelectedImages, snapshotEntryReferenceIds } from "@/lib/posts";
import { postPatchSchema } from "@/lib/validators/post";

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

  const postId = parseId(req.query.id);
  if (!postId) {
    fail(res, "BAD_REQUEST", "Ungueltige Post-ID.", 400);
    return;
  }

  if (req.method === "GET") {
    const post = await prisma.post.findFirst({
      where: { id: postId },
      include: {
        user: true,
        likes: { select: { userId: true } },
        comments: { include: { user: true } },
        entryReferences: true,
      },
    });

    if (!post) {
      fail(res, "NOT_FOUND", "Post nicht gefunden.", 404);
      return;
    }

    ok(res, mapPostToDto(post, userId));
    return;
  }

  if (req.method === "PATCH") {
    const existing = await prisma.post.findFirst({
      where: { id: postId, userId },
      include: {
        entryReferences: true,
      },
    });

    if (!existing) {
      fail(res, "NOT_FOUND", "Post nicht gefunden.", 404);
      return;
    }

    try {
      const patch = postPatchSchema.parse(req.body);
      const bonsaiId = patch.bonsaiId ?? existing.bonsaiId;
      const bonsai = await prisma.bonsai.findFirst({
        where: {
          id: bonsaiId,
          userId,
          deletedAt: null,
        },
      });

      if (!bonsai) {
        fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
        return;
      }

      const entryIds = patch.entryIds ?? existing.entryReferences.map((entry) => entry.subEntryId).filter((entryId): entryId is number => entryId !== null);
      const allSubEntries = await prisma.subEntry.findMany({
        where: {
          bonsaiId,
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      });
      const referencedSubEntries = entryIds.length > 0
        ? allSubEntries.filter((entry) => entryIds.includes(entry.id))
        : [];

      const availableImages = Array.from(new Set([bonsai.images, ...allSubEntries.map((entry) => entry.images)].flat()));
      const images = normalizeSelectedImages(availableImages, patch.manualImages ?? existing.images);

      const entryReferenceIds = snapshotEntryReferenceIds(referencedSubEntries, entryIds);
      await prisma.postEntryReference.deleteMany({
        where: {
          postId,
        },
      });

      const updated = await prisma.post.update({
        where: { id: postId },
        data: {
          bonsaiId,
          text: patch.text ?? existing.text,
          postType: patch.postType ?? existing.postType,
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

      ok(res, mapPostToDto(updated, userId));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        const { details, message } = getZodErrorMessage(error, "Die Post-Daten sind ungueltig.");
        fail(res, "VALIDATION_ERROR", message, 422, details);
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Post konnte nicht aktualisiert werden.", 500);
      return;
    }
  }

  if (req.method === "DELETE") {
    const existing = await getOwnedPostOr404(postId, userId);
    if (!existing) {
      fail(res, "NOT_FOUND", "Post nicht gefunden.", 404);
      return;
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(204).end();
    return;
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
