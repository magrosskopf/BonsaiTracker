import type { NextApiRequest, NextApiResponse } from "next";
import { fail } from "./api/response";
import { getServerAuthClient } from "./supabase/server-auth";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getBearerToken(req: NextApiRequest): string | null {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token, extra] = header.trim().split(/\s+/);
  if (extra || scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export async function requireUser(req: NextApiRequest, res: NextApiResponse): Promise<AuthenticatedUser | null> {
  const token = getBearerToken(req);
  if (!token) {
    fail(res, "UNAUTHENTICATED", "Du musst angemeldet sein.", 401);
    return null;
  }

  const { data, error } = await getServerAuthClient().auth.getUser(token);
  if (error || !data.user?.id || !isUuid(data.user.id)) {
    fail(res, "UNAUTHENTICATED", "Du musst angemeldet sein.", 401);
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
  };
}
