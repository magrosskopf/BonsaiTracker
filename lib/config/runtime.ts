const PUBLISHABLE_PREFIXES = ["sb_publishable_", "eyJ"] as const;
const SECRET_PREFIXES = ["sb_secret_", "eyJ"] as const;

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assertUrl(name: string, value: string): void {
  try {
    new URL(value);
  } catch {
    throw new Error(`Invalid URL in environment variable: ${name}`);
  }
}

function hasKnownPrefix(value: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

export function getBrowserSupabaseConfig(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!publishableKey) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  assertUrl("NEXT_PUBLIC_SUPABASE_URL", url);
  if (!hasKnownPrefix(publishableKey, PUBLISHABLE_PREFIXES)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY does not look like a Supabase publishable key.");
  }
  return { url, publishableKey };
}

export function getServerSupabaseConfig(): {
  url: string;
  publishableKey: string;
  secretKey: string;
  storageBucket: string;
} {
  const browser = getBrowserSupabaseConfig();
  const secretKey = readRequiredEnv("SUPABASE_SECRET_KEY");
  const storageBucket = readRequiredEnv("SUPABASE_STORAGE_BUCKET");
  if (secretKey === browser.publishableKey || secretKey.startsWith("sb_publishable_")) {
    throw new Error("SUPABASE_SECRET_KEY must not be the publishable key.");
  }
  if (!hasKnownPrefix(secretKey, SECRET_PREFIXES)) {
    throw new Error("SUPABASE_SECRET_KEY does not look like a Supabase secret key.");
  }
  return {
    ...browser,
    secretKey,
    storageBucket,
  };
}

export function isHealthcheckEnabled(): boolean {
  return process.env.HEALTHCHECK_ENABLED !== "false";
}
