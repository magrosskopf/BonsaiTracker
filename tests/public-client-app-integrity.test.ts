import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { verifyAppIntegrity } from "@/lib/api/app-integrity";

function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

const mutableEnv = process.env as Record<string, string | undefined>;

test("app integrity fails when enforcement is on and headers are missing", async () => {
  const previous = process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE;
  process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE = "enforce";

  await assert.rejects(
    () => verifyAppIntegrity({ token: null, platform: null }),
    /APP_INTEGRITY_REQUIRED/,
  );

  process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE = previous;
});

test("dev bypass only works outside production with explicit env", async () => {
  const previousMode = process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE;
  const previousBypass = process.env.PUBLIC_CLIENT_APP_INTEGRITY_ALLOW_DEV_BYPASS;
  const previousHash = process.env.PUBLIC_CLIENT_APP_INTEGRITY_DEV_TOKEN_HASH;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE = "enforce";
  process.env.PUBLIC_CLIENT_APP_INTEGRITY_ALLOW_DEV_BYPASS = "true";
  process.env.PUBLIC_CLIENT_APP_INTEGRITY_DEV_TOKEN_HASH = hash("local-token");
  mutableEnv.NODE_ENV = "test";

  const result = await verifyAppIntegrity({ token: "local-token", platform: "ios" });

  assert.equal(result.verified, true);
  assert.equal(result.devBypass, true);
  assert.equal(result.platform, "ios");

  process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE = previousMode;
  process.env.PUBLIC_CLIENT_APP_INTEGRITY_ALLOW_DEV_BYPASS = previousBypass;
  process.env.PUBLIC_CLIENT_APP_INTEGRITY_DEV_TOKEN_HASH = previousHash;
  mutableEnv.NODE_ENV = previousNodeEnv;
});

test("provider paths fail closed until platform adapters verify tokens", async () => {
  const previousMode = process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE;
  const previousAppleTeam = process.env.APPLE_APP_ATTEST_TEAM_ID;
  const previousAppleBundle = process.env.APPLE_APP_ATTEST_BUNDLE_ID;
  process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE = "enforce";
  process.env.APPLE_APP_ATTEST_TEAM_ID = "TEAMID";
  process.env.APPLE_APP_ATTEST_BUNDLE_ID = "com.example.bonsai";

  await assert.rejects(
    () => verifyAppIntegrity({ token: "provider-token", platform: "ios" }),
    /APP_INTEGRITY_PROVIDER_UNIMPLEMENTED/,
  );

  process.env.PUBLIC_CLIENT_APP_INTEGRITY_MODE = previousMode;
  process.env.APPLE_APP_ATTEST_TEAM_ID = previousAppleTeam;
  process.env.APPLE_APP_ATTEST_BUNDLE_ID = previousAppleBundle;
});
