import type { Json } from "@/types/supabase";

export function maybeIso(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === "") {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

export function stripUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export function asJsonObject(input: Record<string, unknown>): Json {
  return stripUndefined(input) as Json;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
