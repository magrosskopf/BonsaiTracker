import { firstQueryValue } from "@/lib/api/request";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export function parsePositiveId(value: string | string[] | undefined): number | null {
  const raw = firstQueryValue(value);
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseOptionalPositiveId(value: string | string[] | undefined): number | undefined | null {
  const raw = firstQueryValue(value);
  if (raw === undefined || raw === "") {
    return undefined;
  }
  return parsePositiveId(raw);
}

export function parseRequiredUuid(value: string | string[] | undefined): string | null {
  const raw = firstQueryValue(value);
  return raw && UUID_PATTERN.test(raw) ? raw : null;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
