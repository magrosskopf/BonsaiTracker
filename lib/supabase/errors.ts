import type { NextApiResponse } from "next";
import { fail } from "@/lib/api/response";
import { logError } from "@/lib/observability";

export interface SupabaseLikeError {
  code?: string;
  message?: string;
  details?: string;
  status?: number;
}

export class NotFoundError extends Error {}
export class ConflictError extends Error {}
export class InvalidInputError extends Error {}

export function toApiError(error: SupabaseLikeError | Error | unknown): {
  code: "BAD_REQUEST" | "CONFLICT" | "INTERNAL_SERVER_ERROR" | "NOT_FOUND";
  message: string;
  status: 400 | 404 | 409 | 500;
} {
  if (error instanceof NotFoundError) {
    return { code: "NOT_FOUND", message: "Ressource nicht gefunden.", status: 404 };
  }
  if (error instanceof ConflictError) {
    return { code: "CONFLICT", message: "Die Ressource existiert bereits oder steht in Konflikt.", status: 409 };
  }
  if (error instanceof InvalidInputError) {
    return { code: "BAD_REQUEST", message: "Die Anfrage ist ungültig.", status: 400 };
  }

  const code = typeof error === "object" && error !== null && "code" in error ? String((error as SupabaseLikeError).code ?? "") : "";
  if (code === "PGRST116" || code === "P0002") {
    return { code: "NOT_FOUND", message: "Ressource nicht gefunden.", status: 404 };
  }
  if (code === "23505" || code === "P0001") {
    return { code: "CONFLICT", message: "Die Ressource existiert bereits oder steht in Konflikt.", status: 409 };
  }
  if (code === "23503" || code === "23514" || code === "22023") {
    return { code: "BAD_REQUEST", message: "Die Anfrage ist ungültig.", status: 400 };
  }
  return { code: "INTERNAL_SERVER_ERROR", message: "Die Datenoperation ist fehlgeschlagen.", status: 500 };
}

export function failWithSupabaseError(
  res: NextApiResponse,
  error: unknown,
  fallbackMessage: string,
  context: string,
  metadata?: Record<string, unknown>,
  includeSafeDetails = false,
): void {
  const mapped = toApiError(error);
  if (mapped.status === 500) {
    logError(context, error, metadata);
  }
  const details =
    includeSafeDetails && typeof error === "object" && error !== null
      ? {
          code: "code" in error ? String((error as SupabaseLikeError).code ?? "") || null : null,
          message: "message" in error ? String((error as SupabaseLikeError).message ?? "") || null : null,
          status: "status" in error && typeof (error as SupabaseLikeError).status === "number" ? (error as SupabaseLikeError).status : null,
        }
      : undefined;
  fail(res, mapped.code, mapped.status === 500 ? fallbackMessage : mapped.message, mapped.status, details);
}
