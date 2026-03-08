import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SignupEligibilityReason = "NOT_APPROVED" | "CAPACITY_REACHED" | "SIGNUP_DISABLED";

export interface SignupConfig {
  signupEnabled: boolean;
  waitlistEnabled: boolean;
  maxTotalUsers: number;
  slotReservationTtlSeconds: number;
}

const DEFAULT_MAX_TOTAL_USERS = 100;
const DEFAULT_SLOT_RESERVATION_TTL_SECONDS = 900;
const SIGNUP_SLOT_LOCK_KEY = 812_347_119;

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }
  return fallback;
}

function parseIntegerEnv(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

export function getSignupConfig(env: NodeJS.ProcessEnv = process.env): SignupConfig {
  return {
    signupEnabled: parseBooleanEnv(env.SIGNUP_ENABLED, true),
    waitlistEnabled: parseBooleanEnv(env.WAITLIST_ENABLED, true),
    maxTotalUsers: parseIntegerEnv(env.MAX_TOTAL_USERS, DEFAULT_MAX_TOTAL_USERS),
    slotReservationTtlSeconds: parseIntegerEnv(env.SIGNUP_SLOT_RESERVATION_TTL_SECONDS, DEFAULT_SLOT_RESERVATION_TTL_SECONDS),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getReservationCutoff(now: Date, ttlSeconds: number): Date {
  return new Date(now.getTime() - ttlSeconds * 1000);
}

async function ensureSignupSlots(maxTotalUsers: number): Promise<void> {
  if (maxTotalUsers <= 0) {
    return;
  }

  const currentCount = await prisma.signupSlot.count();
  if (currentCount >= maxTotalUsers) {
    return;
  }

  const rows = [];
  for (let slotNumber = currentCount + 1; slotNumber <= maxTotalUsers; slotNumber += 1) {
    rows.push({ slotNumber });
  }

  await prisma.signupSlot.createMany({
    data: rows,
    skipDuplicates: true,
  });
}

async function releaseExpiredSignupSlotsInTx(tx: Prisma.TransactionClient, now: Date, ttlSeconds: number): Promise<number> {
  const cutoff = getReservationCutoff(now, ttlSeconds);
  const released = await tx.signupSlot.updateMany({
    where: {
      email: {
        not: null,
      },
      reservedAt: {
        lt: cutoff,
      },
    },
    data: {
      email: null,
      reservedAt: null,
      releasedAt: now,
    },
  });

  return released.count;
}

export async function releaseExpiredSignupSlots(now = new Date()): Promise<number> {
  const config = getSignupConfig();
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SIGNUP_SLOT_LOCK_KEY})`;
    return releaseExpiredSignupSlotsInTx(tx, now, config.slotReservationTtlSeconds);
  });
}

export async function isExistingUser(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function isApprovedForSignup(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const approved = await prisma.signupAllowlist.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return Boolean(approved);
}

export async function isUserCapacityReached(now = new Date()): Promise<boolean> {
  const config = getSignupConfig();
  if (config.maxTotalUsers <= 0) {
    return true;
  }

  await ensureSignupSlots(config.maxTotalUsers);
  const cutoff = getReservationCutoff(now, config.slotReservationTtlSeconds);
  const [userCount, activeReservations] = await Promise.all([
    prisma.user.count(),
    prisma.signupSlot.count({
      where: {
        email: {
          not: null,
        },
        reservedAt: {
          gte: cutoff,
        },
      },
    }),
  ]);

  return userCount + activeReservations >= config.maxTotalUsers;
}

export async function isSlotReservedForEmail(email: string, now = new Date()): Promise<boolean> {
  const config = getSignupConfig();
  const normalizedEmail = normalizeEmail(email);
  const cutoff = getReservationCutoff(now, config.slotReservationTtlSeconds);

  const slot = await prisma.signupSlot.findFirst({
    where: {
      email: normalizedEmail,
      reservedAt: {
        gte: cutoff,
      },
    },
    select: { id: true },
  });

  return Boolean(slot);
}

export async function evaluateSignupEligibility(
  email: string,
): Promise<{ allowed: true } | { allowed: false; reason: SignupEligibilityReason }> {
  const config = getSignupConfig();

  if (await isExistingUser(email)) {
    return { allowed: true };
  }

  if (!config.signupEnabled) {
    return { allowed: false, reason: "SIGNUP_DISABLED" };
  }

  if (!(await isApprovedForSignup(email))) {
    return { allowed: false, reason: "NOT_APPROVED" };
  }

  if (await isUserCapacityReached()) {
    return { allowed: false, reason: "CAPACITY_REACHED" };
  }

  return { allowed: true };
}

export async function reserveSignupSlot(
  email: string,
  now = new Date(),
): Promise<{ reserved: true } | { reserved: false; reason: "CAPACITY_REACHED" }> {
  const config = getSignupConfig();
  const normalizedEmail = normalizeEmail(email);

  if (config.maxTotalUsers <= 0) {
    return { reserved: false, reason: "CAPACITY_REACHED" };
  }

  await ensureSignupSlots(config.maxTotalUsers);

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SIGNUP_SLOT_LOCK_KEY})`;
    await releaseExpiredSignupSlotsInTx(tx, now, config.slotReservationTtlSeconds);

    const cutoff = getReservationCutoff(now, config.slotReservationTtlSeconds);
    const existingReservation = await tx.signupSlot.findFirst({
      where: {
        email: normalizedEmail,
        reservedAt: {
          gte: cutoff,
        },
      },
      select: { id: true },
    });

    if (existingReservation) {
      return { reserved: true } as const;
    }

    const [userCount, activeReservations] = await Promise.all([
      tx.user.count(),
      tx.signupSlot.count({
        where: {
          email: {
            not: null,
          },
          reservedAt: {
            gte: cutoff,
          },
        },
      }),
    ]);

    if (userCount + activeReservations >= config.maxTotalUsers) {
      return { reserved: false, reason: "CAPACITY_REACHED" } as const;
    }

    const slot = await tx.signupSlot.findFirst({
      where: {
        email: null,
      },
      orderBy: {
        slotNumber: "asc",
      },
      select: { id: true },
    });

    if (!slot) {
      return { reserved: false, reason: "CAPACITY_REACHED" } as const;
    }

    await tx.signupSlot.update({
      where: {
        id: slot.id,
      },
      data: {
        email: normalizedEmail,
        reservedAt: now,
        releasedAt: null,
      },
    });

    return { reserved: true } as const;
  });
}

export async function releaseSignupSlot(email: string, now = new Date()): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  await prisma.signupSlot.updateMany({
    where: {
      email: normalizedEmail,
    },
    data: {
      email: null,
      reservedAt: null,
      releasedAt: now,
    },
  });
}
