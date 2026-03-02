import type { NextApiResponse } from "next";

export function ok<T>(res: NextApiResponse, data: T, status = 200): void {
  res.status(status).json({ ok: true, data });
}

export function fail(
  res: NextApiResponse,
  code: string,
  message: string,
  status: number,
  details?: unknown,
): void {
  res.status(status).json({
    ok: false,
    error: details === undefined ? { code, message } : { code, message, details },
  });
}
