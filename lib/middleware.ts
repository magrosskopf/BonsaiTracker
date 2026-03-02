import type { NextApiRequest, NextApiResponse } from "next";

export function runMiddleware<TRequest extends NextApiRequest>(
  req: TRequest,
  res: NextApiResponse,
  fn: any,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result?: unknown) => {
      if (result instanceof Error) {
        reject(result);
        return;
      }
      resolve();
    });
  });
}
