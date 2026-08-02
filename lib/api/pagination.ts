import { firstQueryValue } from "@/lib/api/request";

export interface LimitOptions {
  defaultLimit: number;
  maxLimit: number;
}

export interface CreatedAtCursor {
  createdAt: string;
  id: number;
}

export interface UpdatedAtCursor {
  updatedAt: string;
  id: number;
}

function encodeJsonCursor(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeJsonCursor<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isPositiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function parseLimit(value: string | string[] | undefined, options: LimitOptions): number | null {
  const raw = firstQueryValue(value);
  if (raw === undefined || raw === "") {
    return options.defaultLimit;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > options.maxLimit) {
    return null;
  }
  return parsed;
}

export function encodeCreatedAtCursor(cursor: CreatedAtCursor): string {
  return encodeJsonCursor(cursor);
}

export function decodeCreatedAtCursor(value: string | undefined): CreatedAtCursor | null {
  if (!value) {
    return null;
  }
  const decoded = decodeJsonCursor<Partial<CreatedAtCursor>>(value);
  if (!isIsoDate(decoded.createdAt) || !isPositiveId(decoded.id)) {
    throw new Error("Invalid createdAt cursor.");
  }
  return { createdAt: decoded.createdAt, id: decoded.id };
}

export function encodeUpdatedAtCursor(cursor: UpdatedAtCursor): string {
  return encodeJsonCursor(cursor);
}

export function decodeUpdatedAtCursor(value: string | undefined): UpdatedAtCursor | null {
  if (!value) {
    return null;
  }
  const decoded = decodeJsonCursor<Partial<UpdatedAtCursor>>(value);
  if (!isIsoDate(decoded.updatedAt) || !isPositiveId(decoded.id)) {
    throw new Error("Invalid updatedAt cursor.");
  }
  return { updatedAt: decoded.updatedAt, id: decoded.id };
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}
