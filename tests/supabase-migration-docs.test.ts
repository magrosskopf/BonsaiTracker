import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

test("env example documents a direct local Supabase Postgres database target", () => {
  const envExample = readFileSync(path.join(repoRoot, ".env.example"), "utf8");

  assert.match(
    envExample,
    /^DATABASE_URL="postgresql:\/\/postgres:postgres@127\.0\.0\.1:54322\/postgres"$/m,
  );
  assert.doesNotMatch(envExample, /^DATABASE_URL="prisma\+postgres:\/\//m);
});

test("migration runbook documents Prisma-only local usage and reversible rollback", () => {
  const migrationDoc = readFileSync(
    path.join(repoRoot, "docs/supabase-postgres-migration.md"),
    "utf8",
  );

  assert.match(migrationDoc, /Prisma bleibt die relationale Datenzugriffsschicht\./);
  assert.match(migrationDoc, /Prisma Accelerate wird fuer dieses lokale Ziel nicht verwendet\./);
  assert.match(migrationDoc, /Vor der Umstellung den bisherigen lokalen `DATABASE_URL`-Wert ausserhalb von Git sichern\./);
  assert.match(migrationDoc, /`DATABASE_URL` wieder auf den zuvor gesicherten lokalen Wert setzen\./);
  assert.match(migrationDoc, /Keine `.env`, `.env\.local` oder echte Passwoerter committen\./);
});
