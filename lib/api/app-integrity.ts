import crypto from "crypto";
import type { NextApiRequest } from "next";

export type AppIntegrityPlatform = "ios" | "android";
export type AppIntegrityMode = "off" | "enforce";

export interface AppIntegrityHeaders {
  token: string | null;
  platform: AppIntegrityPlatform | null;
}

export interface AppIntegrityResult {
  platform: AppIntegrityPlatform | null;
  subject: string | null;
  verified: boolean;
  devBypass: boolean;
}

export interface AppIntegrityOptions {
  required?: boolean;
}

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getMode(): AppIntegrityMode {
  const configured = process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE;
  if (configured === "off" || configured === "enforce") {
    return configured;
  }
  return process.env.NODE_ENV === "production" ? "enforce" : "off";
}

function isDevBypassAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.PUBLIC_CLIENT_APP_INTEGRITY_ALLOW_DEV_BYPASS === "true";
}

export function parseAppIntegrityHeaders(req: NextApiRequest): AppIntegrityHeaders {
  const token = firstHeaderValue(req.headers["x-bonsai-app-integrity"])?.trim() || null;
  const rawPlatform = firstHeaderValue(req.headers["x-bonsai-platform"])?.trim().toLowerCase();
  const platform = rawPlatform === "ios" || rawPlatform === "android" ? rawPlatform : null;
  return { token, platform };
}

export function isAppIntegrityRequired(options: AppIntegrityOptions = {}): boolean {
  return Boolean(options.required) || getMode() === "enforce";
}

export async function verifyAppIntegrity(headers: AppIntegrityHeaders, options: AppIntegrityOptions = {}): Promise<AppIntegrityResult> {
  const required = isAppIntegrityRequired(options);
  if (!required) {
    return { platform: headers.platform, subject: null, verified: false, devBypass: false };
  }

  if (!headers.token || !headers.platform) {
    throw new Error("APP_INTEGRITY_REQUIRED");
  }

  const devTokenHash = process.env.PUBLIC_CLIENT_APP_INTEGRITY_DEV_TOKEN_HASH;
  if (devTokenHash && isDevBypassAllowed() && sha256(headers.token) === devTokenHash) {
    return {
      platform: headers.platform,
      subject: `dev:${sha256(headers.token).slice(0, 16)}`,
      verified: true,
      devBypass: true,
    };
  }

  if (headers.platform === "ios") {
    if (!process.env.APPLE_APP_ATTEST_TEAM_ID || !process.env.APPLE_APP_ATTEST_BUNDLE_ID) {
      throw new Error("APP_INTEGRITY_PROVIDER_UNCONFIGURED");
    }
  }

  if (headers.platform === "android") {
    if (!process.env.GOOGLE_PLAY_INTEGRITY_PACKAGE_NAME || !process.env.GOOGLE_PLAY_INTEGRITY_PROJECT_NUMBER) {
      throw new Error("APP_INTEGRITY_PROVIDER_UNCONFIGURED");
    }
  }

  throw new Error("APP_INTEGRITY_PROVIDER_UNIMPLEMENTED");
}
