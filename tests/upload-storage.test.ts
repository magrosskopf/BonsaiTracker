import assert from "node:assert/strict";
import test from "node:test";
import { getBrowserSupabaseConfig, getServerSupabaseConfig, isHealthcheckEnabled } from "@/lib/config/runtime";
import { getStorageKeyFromMediaPath, mediaPathForStorageKey } from "@/lib/storage";

test("managed Supabase media paths round-trip through storage keys", () => {
  const storageKey = "supabase/11111111-1111-4111-8111-111111111111/subentries/example.webp";
  const mediaPath = mediaPathForStorageKey(storageKey);

  assert.equal(mediaPath, "/api/media/supabase/11111111-1111-4111-8111-111111111111/subentries/example.webp");
  assert.equal(getStorageKeyFromMediaPath(mediaPath), storageKey);
});

test("unknown media paths are ignored", () => {
  assert.equal(getStorageKeyFromMediaPath("/uploads/legacy.jpg"), null);
});

test("browser config reads only public Supabase values", () => {
  const oldEnv = process.env;
  process.env = {
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "eyJ_local_anon_test",
  } as unknown as NodeJS.ProcessEnv;
  try {
    assert.deepEqual(getBrowserSupabaseConfig(), {
      url: "http://127.0.0.1:54321",
      publishableKey: "eyJ_local_anon_test",
    });
  } finally {
    process.env = oldEnv;
  }
});

test("browser config rejects cloud publishable keys for self-hosted Supabase", () => {
  const oldEnv = process.env;
  process.env = {
    NEXT_PUBLIC_SUPABASE_URL: "https://supabasekong-example.127.0.0.1.sslip.io",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  } as unknown as NodeJS.ProcessEnv;
  try {
    assert.throws(() => getBrowserSupabaseConfig(), /Self-hosted Supabase deployments behind Kong require the public anon JWT/);
  } finally {
    process.env = oldEnv;
  }
});

test("server config rejects publishable key as secret", () => {
  const oldEnv = process.env;
  process.env = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    SUPABASE_SECRET_KEY: "sb_publishable_test",
    SUPABASE_STORAGE_BUCKET: "bonsai-beta-media",
  } as unknown as NodeJS.ProcessEnv;
  try {
    assert.throws(() => getServerSupabaseConfig(), /must not be the publishable key/);
  } finally {
    process.env = oldEnv;
  }
});

test("healthcheck defaults to enabled", () => {
  const old = process.env.HEALTHCHECK_ENABLED;
  delete process.env.HEALTHCHECK_ENABLED;
  assert.equal(isHealthcheckEnabled(), true);
  process.env.HEALTHCHECK_ENABLED = "false";
  assert.equal(isHealthcheckEnabled(), false);
  if (old === undefined) {
    delete process.env.HEALTHCHECK_ENABLED;
  } else {
    process.env.HEALTHCHECK_ENABLED = old;
  }
});
