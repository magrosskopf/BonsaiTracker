import type { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";

export type RateLimitScope = "signup_ip" | "signup_email" | "waitlist_ip" | "waitlist_email";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const UNKNOWN_IP = "unknown";
const DEFAULT_RETENTION_HOURS = 24;

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

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function getClientIp(req: NextApiRequest): string {
  const forwarded = firstHeaderValue(req.headers["x-forwarded-for"]);
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = firstHeaderValue(req.headers["x-real-ip"]);
  if (realIp?.trim()) {
    return realIp.trim();
  }

  return req.socket.remoteAddress ?? UNKNOWN_IP;
}

export async function checkAndConsumeRateLimit(options: {
  scope: RateLimitScope;
  key: string;
  windowSeconds: number;
  maxHits: number;
  now?: Date;
}): Promise<RateLimitResult> {
  const now = options.now ?? new Date();
  const normalizedKey = options.key.trim().toLowerCase();
  if (options.maxHits <= 0 || options.windowSeconds <= 0) {
    return { allowed: false, remaining: 0, retryAfterSeconds: options.windowSeconds };
  }

  const cutoff = new Date(now.getTime() - options.windowSeconds * 1000);
  await prisma.authRateLimitEvent.deleteMany({
    where: {
      scope: options.scope,
      key: normalizedKey,
      createdAt: {
        lt: cutoff,
      },
    },
  });

  const [count, oldest] = await Promise.all([
    prisma.authRateLimitEvent.count({
      where: {
        scope: options.scope,
        key: normalizedKey,
        createdAt: {
          gte: cutoff,
        },
      },
    }),
    prisma.authRateLimitEvent.findFirst({
      where: {
        scope: options.scope,
        key: normalizedKey,
        createdAt: {
          gte: cutoff,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  if (count >= options.maxHits) {
    const retryAfterMs = oldest
      ? oldest.createdAt.getTime() + options.windowSeconds * 1000 - now.getTime()
      : options.windowSeconds * 1000;

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  await prisma.authRateLimitEvent.create({
    data: {
      scope: options.scope,
      key: normalizedKey,
      createdAt: now,
    },
  });

  return {
    allowed: true,
    remaining: Math.max(0, options.maxHits - (count + 1)),
    retryAfterSeconds: 0,
  };
}

export async function cleanupRateLimitEvents(retentionHours = parseIntegerEnv(process.env.RATE_LIMIT_RETENTION_HOURS, DEFAULT_RETENTION_HOURS)): Promise<number> {
  if (retentionHours <= 0) {
    return 0;
  }

  const cutoff = new Date(Date.now() - retentionHours * 3600 * 1000);
  const deleted = await prisma.authRateLimitEvent.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });

  return deleted.count;
}
