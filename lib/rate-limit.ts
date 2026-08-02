import crypto from "crypto";
import type { NextApiRequest } from "next";
import { getServerDataClient } from "@/lib/supabase/server-data";

export type RateLimitScope =
  | "signup_ip"
  | "signup_email"
  | "waitlist_ip"
  | "waitlist_email"
  | "mobile_upload"
  | "mobile_post_create"
  | "mobile_comment_create"
  | "mobile_report"
  | "mobile_like_toggle"
  | "mobile_media_read";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const UNKNOWN_IP = "unknown";

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function hashRateLimitKey(key: string): string {
  return crypto.createHash("sha256").update(key.trim().toLowerCase()).digest("hex");
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
}): Promise<RateLimitResult> {
  if (options.maxHits <= 0 || options.windowSeconds <= 0) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, options.windowSeconds) };
  }

  const { data, error } = await getServerDataClient().rpc("consume_auth_rate_limit", {
    p_scope: options.scope,
    p_key_hash: hashRateLimitKey(options.key),
    p_window_seconds: options.windowSeconds,
    p_max_hits: options.maxHits,
  });
  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    remaining: Number(row?.remaining ?? 0),
    retryAfterSeconds: Number(row?.retry_after_seconds ?? 0),
  };
}

export async function cleanupRateLimitEvents(): Promise<number> {
  return 0;
}
