import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();
const localDatabaseUrlPattern =
  /^DATABASE_URL="postgresql:\/\/postgres:postgres@127\.0\.0\.1:54322\/postgres"$/m;
const prismaAccelerateDatabaseUrlPattern = /^DATABASE_URL="prisma\+postgres:\/\//m;
const migrationDocRequirements = [
  /Prisma bleibt die relationale Datenzugriffsschicht\./,
  /Prisma Accelerate wird fuer dieses lokale Ziel nicht verwendet\./,
  /Vor der Umstellung den bisherigen lokalen `DATABASE_URL`-Wert ausserhalb von Git sichern\./,
  /`DATABASE_URL` wieder auf den zuvor gesicherten lokalen Wert setzen\./,
  /Keine `.env`, `.env\.local` oder echte Passwoerter committen\./,
  /Das Repo-Skript `scripts\/init-local-supabase-db\.sh` fuehrt Prisma-Validierung, Migration und Statuspruefung aus\./,
  /Optional kann anschliessend `PRISMA_SEED=1 bash scripts\/init-local-supabase-db\.sh` verwendet werden\./,
  /Alternativ koennen die Prisma-Kommandos auch manuell ausgefuehrt werden: `npm run prisma -- validate`, `npm run prisma -- migrate deploy`, `npm run prisma -- migrate status`\./,
];
const initScriptRequirements = [
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

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("env example documents a direct local Supabase Postgres database target", () => {
  const envExample = readRepoFile(".env.example");

  assert.match(envExample, localDatabaseUrlPattern);
  assert.doesNotMatch(envExample, prismaAccelerateDatabaseUrlPattern);
});

test("migration runbook documents Prisma-only local usage and reversible rollback", () => {
  const migrationDoc = readRepoFile("docs/supabase-postgres-migration.md");

  for (const requirement of migrationDocRequirements) {
    assert.match(migrationDoc, requirement);
  }
});

test("repo includes a guarded local Supabase initialization script based on Prisma migrations", () => {
  const initScript = readRepoFile("scripts/init-local-supabase-db.sh");

  for (const requirement of initScriptRequirements) {
    assert.match(initScript, requirement);
  }
});
