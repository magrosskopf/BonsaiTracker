import type { NextApiRequest, NextApiResponse } from "next";
import type { Bonsai, Post, Reminder, SubEntry, User } from "@prisma/client";
import { prisma } from "./prisma";
import { getServerAuthSession } from "./auth";
import { fail } from "./api/response";

export async function requireUser(req: NextApiRequest, res: NextApiResponse): Promise<number | null> {
  const session = await getServerAuthSession(req, res);
  const userId = Number(session?.user?.id);

  if (!session?.user?.id || !Number.isInteger(userId) || userId <= 0) {
    fail(res, "UNAUTHENTICATED", "Du musst angemeldet sein.", 401);
    return null;
  }

  return userId;
}

export async function getOwnedBonsaiOr404(id: number, userId: number): Promise<Bonsai | null> {
  return prisma.bonsai.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
  });
}

export async function getOwnedBonsaiIncludingArchived(id: number, userId: number): Promise<Bonsai | null> {
  return prisma.bonsai.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function getOwnedSubEntryOr404(id: number, userId: number): Promise<SubEntry | null> {
  return prisma.subEntry.findFirst({
    where: {
      id,
      bonsai: {
        userId,
        deletedAt: null,
      },
    },
  });
}

export async function getOwnedReminderOr404(id: number, userId: number): Promise<Reminder | null> {
  return prisma.reminder.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function getOwnedPostOr404(id: number, userId: number): Promise<Post | null> {
  return prisma.post.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function getVisibleProfileOr404(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}
