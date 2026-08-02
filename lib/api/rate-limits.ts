import type { NextApiRequest, NextApiResponse } from "next";
import { fail } from "@/lib/api/response";
import { getClientIp, checkAndConsumeRateLimit, type RateLimitScope } from "@/lib/rate-limit";

export type MobileRateLimitScope = Extract<
  RateLimitScope,
  "mobile_upload" | "mobile_post_create" | "mobile_comment_create" | "mobile_report" | "mobile_like_toggle" | "mobile_media_read"
>;

const DEFAULTS: Record<MobileRateLimitScope, { windowSeconds: number; maxHits: number; windowEnv: string; maxEnv: string }> = {
  mobile_upload: {
    windowSeconds: 60,
    maxHits: 20,
    windowEnv: "MOBILE_UPLOAD_RATE_LIMIT_WINDOW_SECONDS",
    maxEnv: "MOBILE_UPLOAD_RATE_LIMIT_MAX",
  },
  mobile_post_create: {
    windowSeconds: 300,
    maxHits: 20,
    windowEnv: "MOBILE_POST_RATE_LIMIT_WINDOW_SECONDS",
    maxEnv: "MOBILE_POST_RATE_LIMIT_MAX",
  },
  mobile_comment_create: {
    windowSeconds: 300,
    maxHits: 40,
    windowEnv: "MOBILE_COMMENT_RATE_LIMIT_WINDOW_SECONDS",
    maxEnv: "MOBILE_COMMENT_RATE_LIMIT_MAX",
  },
  mobile_report: {
    windowSeconds: 3600,
    maxHits: 20,
    windowEnv: "MOBILE_REPORT_RATE_LIMIT_WINDOW_SECONDS",
    maxEnv: "MOBILE_REPORT_RATE_LIMIT_MAX",
  },
  mobile_like_toggle: {
    windowSeconds: 60,
    maxHits: 120,
    windowEnv: "MOBILE_LIKE_RATE_LIMIT_WINDOW_SECONDS",
    maxEnv: "MOBILE_LIKE_RATE_LIMIT_MAX",
  },
  mobile_media_read: {
    windowSeconds: 60,
    maxHits: 300,
    windowEnv: "MOBILE_MEDIA_RATE_LIMIT_WINDOW_SECONDS",
    maxEnv: "MOBILE_MEDIA_RATE_LIMIT_MAX",
  },
};

function configuredInt(envName: string, fallback: number): number {
  const parsed = Number(process.env[envName]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPublicClientRateLimitSubject(options: {
  actorUserId?: string | null;
  clientIp: string;
  integritySubject?: string | null;
  target?: string | null;
}): string {
  return [
    `ip:${options.clientIp}`,
    options.actorUserId ? `actor:${options.actorUserId}` : null,
    options.integritySubject ? `device:${options.integritySubject}` : null,
    options.target ? `target:${options.target}` : null,
  ].filter(Boolean).join("|");
}

export async function consumePublicClientRateLimit(options: {
  req: NextApiRequest;
  res: NextApiResponse;
  scope: MobileRateLimitScope;
  actorUserId?: string | null;
  integritySubject?: string | null;
  target?: string | null;
}): Promise<boolean> {
  const defaults = DEFAULTS[options.scope];
  const result = await checkAndConsumeRateLimit({
    scope: options.scope,
    key: getPublicClientRateLimitSubject({
      actorUserId: options.actorUserId,
      clientIp: getClientIp(options.req),
      integritySubject: options.integritySubject,
      target: options.target,
    }),
    windowSeconds: configuredInt(defaults.windowEnv, defaults.windowSeconds),
    maxHits: configuredInt(defaults.maxEnv, defaults.maxHits),
  });

  if (!result.allowed) {
    options.res.setHeader("Retry-After", String(Math.max(1, result.retryAfterSeconds)));
    fail(options.res, "RATE_LIMITED", "Zu viele Anfragen. Bitte versuche es später erneut.", 429);
    return false;
  }

  return true;
}
