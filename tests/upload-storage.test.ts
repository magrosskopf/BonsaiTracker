import assert from "node:assert/strict";
import test from "node:test";
import { getLocalUploadsDirectory, getSupabaseStorageConfig, getUploadStorageMode, isHealthcheckEnabled } from "@/lib/config/beta";
import { getStorageKeyFromMediaPath, mediaPathForStorageKey } from "@/lib/storage";

test("managed media paths round-trip through storage keys", () => {
  const storageKey = "local/subentries/example.webp";
  const mediaPath = mediaPathForStorageKey(storageKey);

  assert.equal(mediaPath, "/api/media/local/subentries/example.webp");
  assert.equal(getStorageKeyFromMediaPath(mediaPath), storageKey);
});

test("unknown media paths are ignored", () => {
  assert.equal(getStorageKeyFromMediaPath("/uploads/legacy.jpg"), null);
});

test("beta config defaults to local storage and enabled healthcheck", () => {
  const env = {} as NodeJS.ProcessEnv;

  assert.equal(getUploadStorageMode(env), "local");
  assert.equal(getLocalUploadsDirectory(env), ".runtime/uploads");
  assert.equal(isHealthcheckEnabled(env), true);
});

test("beta config defaults production uploads to supabase", () => {
  const env = {
    NODE_ENV: "production",
  } as unknown as NodeJS.ProcessEnv;

  assert.equal(getUploadStorageMode(env), "supabase");
});

test("beta config reads explicit env overrides", () => {
  const env = {
    UPLOAD_STORAGE_MODE: "supabase",
    LOCAL_UPLOADS_DIR: "/tmp/bonsai-uploads",
    BETA_HEALTHCHECK_ENABLED: "false",
  } as unknown as NodeJS.ProcessEnv;

  assert.equal(getUploadStorageMode(env), "supabase");
  assert.equal(getLocalUploadsDirectory(env), "/tmp/bonsai-uploads");
  assert.equal(isHealthcheckEnabled(env), false);
});

test("supabase config rejects non service-role keys", () => {
  const env = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: [
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
      "eyJyb2xlIjoiYW5vbiJ9",
      "signature",
    ].join("."),
    SUPABASE_STORAGE_BUCKET: "bonsai",
  } as unknown as NodeJS.ProcessEnv;

  assert.throws(
    () => getSupabaseStorageConfig(env),
    /SUPABASE_SERVICE_ROLE_KEY ist kein Service-Role-Schlüssel/,
  );
});
