import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/prisma";
import { checkAndConsumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSignupConfig, normalizeEmail } from "@/lib/signup-gating";

const bodySchema = z.object({
  email: z.string().email().max(320),
});

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

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  try {
    const config = getSignupConfig();
    if (!config.waitlistEnabled) {
      ok(res, {
        submitted: false,
        message: "Die Warteliste ist aktuell geschlossen.",
      });
      return;
    }

    const parsed = bodySchema.parse(req.body);
    const email = normalizeEmail(parsed.email);
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"]?.slice(0, 512) ?? null;

    const windowSeconds = parseIntegerEnv(process.env.SIGNUP_RATE_LIMIT_WINDOW_SECONDS, 900);
    const maxPerIp = parseIntegerEnv(process.env.SIGNUP_RATE_LIMIT_MAX_PER_IP, 10);
    const maxPerEmail = parseIntegerEnv(process.env.SIGNUP_RATE_LIMIT_MAX_PER_EMAIL, 5);

    const [ipLimit, emailLimit] = await Promise.all([
      checkAndConsumeRateLimit({
        scope: "waitlist_ip",
        key: ip,
        windowSeconds,
        maxHits: maxPerIp,
      }),
      checkAndConsumeRateLimit({
        scope: "waitlist_email",
        key: email,
        windowSeconds,
        maxHits: maxPerEmail,
      }),
    ]);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      fail(res, "RATE_LIMITED", "Zu viele Anfragen. Bitte versuche es später erneut.", 429);
      return;
    }

    await prisma.waitlistRequest.upsert({
      where: {
        email,
      },
      update: {
        sourceIp: ip,
        userAgent,
      },
      create: {
        email,
        sourceIp: ip,
        userAgent,
      },
    });

    ok(res, {
      submitted: true,
      message: "Danke. Wir melden uns, sobald ein Platz frei wird.",
    });
  } catch (error) {
    console.error("POST /api/access-requests failed", error);
    fail(res, "INTERNAL_SERVER_ERROR", "Die Anfrage konnte nicht gespeichert werden.", 500);
  }
}
