export type UploadStorageMode = "local" | "supabase";

const DEFAULT_LOCAL_UPLOADS_DIR = ".runtime/uploads";

function isProductionEnv(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV?.trim().toLowerCase() === "production";
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }
  return fallback;
}

export function isHealthcheckEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return parseBooleanEnv(env.BETA_HEALTHCHECK_ENABLED, true);
}

export function getUploadStorageMode(env: NodeJS.ProcessEnv = process.env): UploadStorageMode {
  const value = env.UPLOAD_STORAGE_MODE?.trim().toLowerCase();
  if (value === "supabase") {
    return "supabase";
  }
  if (value === "local") {
    return "local";
  }
  if (isProductionEnv(env)) {
    return "supabase";
  }
  return "local";
}

export function getLocalUploadsDirectory(env: NodeJS.ProcessEnv = process.env): string {
  return env.LOCAL_UPLOADS_DIR?.trim() || DEFAULT_LOCAL_UPLOADS_DIR;
}

export interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
  signedUrlExpiresInSeconds: number;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseJwtRole(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function getSupabaseStorageConfig(env: NodeJS.ProcessEnv = process.env): SupabaseStorageConfig {
  const url = env.SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = env.SUPABASE_STORAGE_BUCKET?.trim();

  if (!url || !serviceRoleKey || !bucket) {
    throw new Error("Supabase Storage ist nicht vollständig konfiguriert.");
  }

  const serviceRole = parseJwtRole(serviceRoleKey);
  if (serviceRole && serviceRole !== "service_role") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ist kein Service-Role-Schlüssel.");
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
    bucket,
    signedUrlExpiresInSeconds: parsePositiveInteger(env.SUPABASE_SIGNED_URL_TTL_SECONDS, 60),
  };
}
