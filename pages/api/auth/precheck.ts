import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { fail, ok } from "@/lib/api/response";
import { checkAndConsumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { evaluateSignupEligibility, getSignupConfig, normalizeEmail } from "@/lib/signup-gating";

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
    const parsed = bodySchema.parse(req.body);
    const email = normalizeEmail(parsed.email);
    const ip = getClientIp(req);
    const config = await getSignupConfig();

    const windowSeconds = parseIntegerEnv(process.env.SIGNUP_RATE_LIMIT_WINDOW_SECONDS, 900);
    const maxPerIp = parseIntegerEnv(process.env.SIGNUP_RATE_LIMIT_MAX_PER_IP, 10);
    const maxPerEmail = parseIntegerEnv(process.env.SIGNUP_RATE_LIMIT_MAX_PER_EMAIL, 5);

    const [ipLimit, emailLimit] = await Promise.all([
      checkAndConsumeRateLimit({
        scope: "signup_ip",
        key: ip,
        windowSeconds,
        maxHits: maxPerIp,
      }),
      checkAndConsumeRateLimit({
        scope: "signup_email",
        key: email,
        windowSeconds,
        maxHits: maxPerEmail,
      }),
    ]);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      ok(res, {
        allowed: false,
        message: "Zurzeit können wir keine weiteren Anfragen annehmen. Bitte versuche es später erneut.",
      });
      return;
    }

    const eligibility = await evaluateSignupEligibility(email);
    if (!eligibility.allowed) {
      const message = eligibility.reason === "CAPACITY_REACHED"
        ? "Die geschlossene Beta ist aktuell voll. Nutze bitte die Warteliste."
        : "Registrierungen sind aktuell nur mit Freigabe möglich. Nutze bitte die Warteliste.";

      ok(res, {
        allowed: false,
        message,
      });
      return;
    }

    ok(res, {
      allowed: true,
      waitlistEnabled: config.waitlistEnabled,
      message: "Wenn die E-Mail bekannt oder freigegeben ist, wird ein Login-Link versendet.",
    });
  } catch (error) {
    console.error("POST /api/auth/precheck failed", error);
    fail(res, "INTERNAL_SERVER_ERROR", "Die Anfrage konnte nicht verarbeitet werden.", 500);
  }
}
