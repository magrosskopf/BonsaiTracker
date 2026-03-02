export interface BonsaiCursor {
  updatedAt: string;
  id: number;
}

export function encodeCursor(cursor: BonsaiCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeCursor(value: string): BonsaiCursor {
  const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as BonsaiCursor;
  if (typeof parsed.id !== "number" || typeof parsed.updatedAt !== "string") {
    throw new Error("Ungültiger Cursor.");
  }

  return parsed;
}
