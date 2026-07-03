import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();
const localDatabaseUrlPattern =
  /^DATABASE_URL="postgresql:\/\/postgres:postgres@127\.0\.0\.1:54322\/postgres"$/m;
const prismaAccelerateDatabaseUrlPattern = /^DATABASE_URL="prisma\+postgres:\/\//m;
const migrationRunbookRequirements = [
  /Prisma bleibt die relationale Datenzugriffsschicht\./,
  /Prisma Accelerate wird fuer dieses lokale Ziel nicht verwendet\./,
  /Vor der Umstellung den bisherigen lokalen `DATABASE_URL`-Wert ausserhalb von Git sichern\./,
  /`DATABASE_URL` wieder auf den zuvor gesicherten lokalen Wert setzen\./,
  /Keine `.env`, `.env\.local` oder echte Passwoerter committen\./,
  /Das Repo-Skript `scripts\/init-local-supabase-db\.sh` fuehrt Prisma-Validierung, Migration und Statuspruefung aus\./,
  /Optional kann anschliessend `PRISMA_SEED=1 bash scripts\/init-local-supabase-db\.sh` verwendet werden\./,
  /Alternativ koennen die Prisma-Kommandos auch manuell ausgefuehrt werden: `npm run prisma -- validate`, `npm run prisma -- migrate deploy`, `npm run prisma -- migrate status`\./,
];
const baselineRunbookRequirements = [
  /`demo@example\.com`/,
  /Baseline-Daten/,
  /Dashboard/,
  /Reminder/,
  /Feed/,
];
const initScriptGuardrailRequirements = [
  /set -euo pipefail/,
  /DATABASE_URL must be set/,
  /prisma\+postgres:\/\//,
  /ALLOW_NON_LOCAL_DATABASE/,
  /npm run prisma -- validate/,
  /npm run prisma -- migrate deploy/,
  /npm run prisma -- migrate status/,
  /PRISMA_SEED/,
  /npm run prisma -- db seed/,
];
const seedFileRequirements = [
  /demo@example\.com/,
  /community@example\.com/,
  /signupAllowlist/,
  /waitlistRequest/,
  /bonsai\.create/,
  /subEntry\.create/,
  /reminder\.create/,
  /post\.create/,
];

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function assertMatchesAll(content: string, requirements: RegExp[]) {
  for (const requirement of requirements) {
    assert.match(content, requirement);
  }
}

test("env example documents a direct local Supabase Postgres database target", () => {
  const envExample = readRepoFile(".env.example");

  assert.match(envExample, localDatabaseUrlPattern);
  assert.doesNotMatch(envExample, prismaAccelerateDatabaseUrlPattern);
});

test("migration runbook documents Prisma-only local usage and reversible rollback", () => {
  const migrationDoc = readRepoFile("docs/supabase-postgres-migration.md");

  assertMatchesAll(migrationDoc, migrationRunbookRequirements);
});

test("migration runbook documents seeded baseline data for local app smoke tests", () => {
  const migrationDoc = readRepoFile("docs/supabase-postgres-migration.md");

  assertMatchesAll(migrationDoc, baselineRunbookRequirements);
});

test("repo includes a guarded local Supabase initialization script based on Prisma migrations", () => {
  const initScript = readRepoFile("scripts/init-local-supabase-db.sh");

  assertMatchesAll(initScript, initScriptGuardrailRequirements);
});

test("prisma seed defines deterministic local baseline data for the seeded Supabase flow", () => {
  const seedFile = readRepoFile("prisma/seed.ts");

  assertMatchesAll(seedFile, seedFileRequirements);
});
