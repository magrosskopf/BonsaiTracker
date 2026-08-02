import type { NextApiRequest, NextApiResponse } from "next";
import { fail } from "@/lib/api/response";
import { getClientIp } from "@/lib/rate-limit";
import { requireUser, type AuthenticatedUser } from "@/lib/authz";
import { parseAppIntegrityHeaders, verifyAppIntegrity, type AppIntegrityResult } from "@/lib/api/app-integrity";
import { consumePublicClientRateLimit, type MobileRateLimitScope } from "@/lib/api/rate-limits";
import { logError } from "@/lib/observability";

export interface PublicClientContext {
  actor: AuthenticatedUser;
  integrity: AppIntegrityResult;
  clientIp: string;
  rateLimitSubject: string;
}

export interface PublicClientOptions {
  integrity?: "private" | "write" | "always";
  rateLimit?: MobileRateLimitScope | Partial<Record<string, MobileRateLimitScope>>;
  rateLimitTarget?: string | null;
}

function isWriteMethod(method?: string): boolean {
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

function rateLimitForMethod(
  method: string | undefined,
  rateLimit: PublicClientOptions["rateLimit"],
): MobileRateLimitScope | null {
  if (!rateLimit) {
    return null;
  }
  if (typeof rateLimit === "string") {
    return rateLimit;
  }
  return rateLimit[method ?? ""] ?? null;
}

export async function requirePublicClient(
  req: NextApiRequest,
  res: NextApiResponse,
  options: PublicClientOptions = {},
): Promise<PublicClientContext | null> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return null;
  }

  try {
    const integrity = await verifyAppIntegrity(parseAppIntegrityHeaders(req), {
      required: options.integrity === "always" || options.integrity === "private" || (options.integrity === "write" && isWriteMethod(req.method)),
    });

    const rateLimitScope = rateLimitForMethod(req.method, options.rateLimit);
    if (rateLimitScope) {
      const allowed = await consumePublicClientRateLimit({
        req,
        res,
        scope: rateLimitScope,
        actorUserId: actor.id,
        integritySubject: integrity.subject,
        target: options.rateLimitTarget,
      });
      if (!allowed) {
        return null;
      }
    }

    const clientIp = getClientIp(req);
    return {
      actor,
      integrity,
      clientIp,
      rateLimitSubject: [clientIp, actor.id, integrity.subject].filter(Boolean).join("|"),
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "APP_INTEGRITY_FAILED";
    if (code === "APP_INTEGRITY_REQUIRED" || code === "APP_INTEGRITY_PROVIDER_UNCONFIGURED" || code === "APP_INTEGRITY_PROVIDER_UNIMPLEMENTED") {
      fail(res, code, "Die App-Integrität konnte nicht bestätigt werden.", code === "APP_INTEGRITY_REQUIRED" ? 401 : 403);
      return null;
    }
    logError("public_client.boundary_failed", error, { userId: actor.id });
    fail(res, "APP_INTEGRITY_FAILED", "Die App-Integrität konnte nicht bestätigt werden.", 403);
    return null;
  }
}
