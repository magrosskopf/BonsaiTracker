import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { getSupabaseDirectory } from "@/scripts/supabase-project";

const repoRoot = process.cwd();
const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("env example documents canonical Supabase runtime variables only", () => {
  const envExample = readRepoFile(".env.example");

  assert.match(envExample, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(envExample, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(envExample, /SUPABASE_SECRET_KEY/);
  assert.match(envExample, /SUPABASE_STORAGE_BUCKET/);
  assert.doesNotMatch(envExample, /DATABASE_URL|NEXTAUTH|GOOGLE_CLIENT|RESEND_API_KEY|SIGNUP_SLOT|UPLOAD_STORAGE_MODE/);
});

test("package scripts expose Supabase validation lifecycle", () => {
  assert.equal(packageJson.scripts?.["supabase:start"], "node scripts/run-supabase-cli.js start --exclude vector");
  assert.equal(packageJson.scripts?.["supabase:reset"], "node scripts/run-supabase-cli.js db reset");
  assert.equal(packageJson.scripts?.["test:db"], "node scripts/run-supabase-cli.js test db");
  assert.equal(packageJson.scripts?.["supabase:types:check"], "tsx scripts/check-supabase-types.ts");
  assert.equal(packageJson.scripts?.["test:integration"], "tsx scripts/run-supabase-integration-tests.ts");
  assert.equal(packageJson.scripts?.["approve-waitlist"], undefined);
});

test("runtime dependencies no longer include Prisma or NextAuth packages", () => {
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const removed of ["@prisma/client", "prisma", "next-auth", "@next-auth/prisma-adapter", "embedded-postgres", "resend", "nodemailer"]) {
    assert.equal(allDeps[removed], undefined);
  }
});

test("Supabase project files are present", () => {
  const supabaseDir = getSupabaseDirectory();
  assert.equal(existsSync(path.join(repoRoot, "supabase")), false, "Bonsai repo must not keep a second Supabase project directory");

  for (const relativePath of [
    "config.toml",
    "migrations/20260718000100_app_baseline.sql",
    "migrations/20260718000200_auth_and_signup.sql",
    "migrations/20260718000300_service_rpcs.sql",
    "migrations/20260718000400_storage.sql",
    "seed.sql",
  ]) {
    assert.equal(existsSync(path.join(supabaseDir, relativePath)), true, relativePath);
  }
});

test("Supabase CLI scripts target the external project directory", () => {
  assert.match(readRepoFile("scripts/run-supabase-cli.js"), /--workdir/);
  assert.match(readRepoFile("scripts/generate-supabase-types.ts"), /getSupabaseProjectRoot/);
  assert.match(readRepoFile("scripts/check-supabase-types.ts"), /getSupabaseProjectRoot/);
});

test("removed signup operation scripts are absent", () => {
  for (const relativePath of ["scripts/approve-waitlist.js", "scripts/update-signup-settings.js"]) {
    assert.equal(existsSync(path.join(repoRoot, relativePath)), false, relativePath);
  }
});

test("browser Supabase config uses static public env access for Next client bundling", () => {
  const source = readRepoFile("lib/config/runtime.ts");

  assert.match(source, /process\.env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(source, /process\.env\.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(source, /readRequiredEnv\("NEXT_PUBLIC_SUPABASE_URL"\)/);
  assert.doesNotMatch(source, /readRequiredEnv\("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"\)/);
});

test("validation runners load Next env before spawning child processes", () => {
  for (const relativePath of ["scripts/run-local-supabase-validation.ts", "scripts/run-supabase-integration-tests.ts"]) {
    const source = readRepoFile(relativePath);
    const envLoadIndex = source.indexOf("loadProjectEnv()");
    const spawnIndex = source.indexOf("spawnSync(");

    assert.notEqual(envLoadIndex, -1, `${relativePath} must load Next env files`);
    assert.notEqual(spawnIndex, -1, `${relativePath} must spawn validation commands`);
    assert.ok(envLoadIndex < spawnIndex, `${relativePath} must load env before spawning commands`);
  }
});
