import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();
const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
  scripts?: Record<string, string>;
};
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
const coreFlowSmokeChecklistRequirements = [
  /## Kernfluss-Checklist fuer lokale Supabase-Smoke-Tests/,
  /`GET \/api\/health`/,
  /`\/dashboard`/,
  /`\/create-bonsai`/,
  /`\/bonsai\/\[id\]`/,
  /`\/bonsai\/\[id\]\/subentries`/,
  /`\/reminders`/,
  /`\/feed`/,
  /`POST \/api\/access-requests`/,
  /`\/api\/media\/`/,
  /Wenn lokales OAuth oder E-Mail-Login nicht konfiguriert ist, den Login-Schritt als `skip` mit konkretem Grund dokumentieren\./,
  /Wenn lokaler Upload-Storage oder Supabase-Storage nicht verfuegbar ist, den Media-Schritt als `skip` mit Grund dokumentieren\./,
  /Notiere jeden Schritt mit `pass`, `skip` oder `fail`\./,
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
const automatedValidationRunbookRequirements = [
  /## Automatisierte Validierung auf lokalem Supabase Postgres/,
  /`npm run validate:local-supabase`/,
  /`bash scripts\/validate-local-supabase-checks\.sh`/,
  /`npm test`/,
  /`npm run typecheck`/,
  /`npm run build`/,
  /`npm run prisma -- migrate status`/,
  /Wenn unter der lokalen Zieladresse noch keine Datenbank lauscht, startet `npm run validate:local-supabase` temporaer ein lokales Postgres auf `127\.0\.0\.1:54322`, initialisiert die Prisma-Migrationen und fuehrt danach die Repo-Checks aus\./,
  /Wenn `migrate status` wegen fehlender lokaler Supabase-Erreichbarkeit fehlschlaegt, den Lauf als lokalen Supabase-Blocker dokumentieren\./,
  /Allgemeine Repo-Fehler aus `test`, `typecheck` oder `build` nicht als Supabase-Migrationsproblem umetikettieren\./,
];
const issueSevenRunbookCompletionRequirements = [
  /## Beobachtete lokale Ausfuehrung in diesem Repo-Slice/,
  /Am 2026-07-04 wurde `npm run validate:local-supabase` in dieser Repo-Umgebung erfolgreich ausgefuehrt\./,
  /Dabei wurde mangels bestehendem Listener temporaer ein lokales Postgres auf `127\.0\.0\.1:54322` gestartet\./,
  /`npm run prisma -- validate`, `npm run prisma -- migrate deploy` und `npm run prisma -- migrate status` liefen gegen dasselbe lokale Ziel erfolgreich durch\./,
  /## Dokumentierte Skip- und Caveat-Notizen/,
  /`skip` Login und Session: in dieser Repo-Umgebung wurde kein lokales OAuth-, Magic-Link- oder SMTP-Setup mit realen Secrets hinterlegt\./,
  /`skip` Interaktive App-Smoke-Session: der erfolgreiche Wrapper-Lauf beendet das temporaere Embedded-Postgres nach den Repo-Checks wieder, daher wurde hier keine dauerhafte manuelle Browser-Session offengehalten\./,
  /`skip` Media-Pfade mit produktionsnahem Supabase-Storage: `.env.example` zeigt weiterhin Platzhalter fuer `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY`, daher wurde in diesem Slice kein echter lokaler Storage-Zugriff verifiziert\./,
  /## Spaeter separat zu bearbeiten/,
  /Echte lokale Supabase-CLI-\/Docker-Beobachtungen fuer ein dauerhaft laufendes Self-Hosted-Setup/,
  /Produktions-Cutover, produktive Secrets oder nicht-lokale Datenbankziele/,
];
const automatedValidationScriptRequirements = [
  /set -euo pipefail/,
  /DATABASE_URL must be set/,
  /prisma\+postgres:\/\//,
  /ALLOW_NON_LOCAL_DATABASE/,
  /npm test/,
  /npm run typecheck/,
  /npm run build/,
  /npm run prisma -- migrate status/,
  /Unable to reach the configured local Supabase Postgres target during `prisma migrate status`\./,
];
const localSupabaseBootstrapRequirements = [
  /EmbeddedPostgres/,
  /127\.0\.0\.1/,
  /54322/,
  /scripts\/init-local-supabase-db\.sh/,
  /scripts\/validate-local-supabase-checks\.sh/,
];

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function assertMatchesAll(content: string, requirements: RegExp[]) {
  for (const requirement of requirements) {
    assert.match(content, requirement);
  }
}

function assertRepoFileMatchesAll(relativePath: string, requirements: RegExp[]) {
  assertMatchesAll(readRepoFile(relativePath), requirements);
}

test("env example documents a direct local Supabase Postgres database target", () => {
  const envExample = readRepoFile(".env.example");

  assert.match(envExample, localDatabaseUrlPattern);
  assert.doesNotMatch(envExample, prismaAccelerateDatabaseUrlPattern);
});

test("migration runbook documents Prisma-only local usage and reversible rollback", () => {
  assertRepoFileMatchesAll(
    "docs/supabase-postgres-migration.md",
    migrationRunbookRequirements,
  );
});

test("migration runbook documents seeded baseline data for local app smoke tests", () => {
  assertRepoFileMatchesAll(
    "docs/supabase-postgres-migration.md",
    baselineRunbookRequirements,
  );
});

test("migration runbook documents the local Supabase core app flow smoke checklist", () => {
  assertRepoFileMatchesAll(
    "docs/supabase-postgres-migration.md",
    coreFlowSmokeChecklistRequirements,
  );
});

test("repo includes a guarded local Supabase initialization script based on Prisma migrations", () => {
  assertRepoFileMatchesAll(
    "scripts/init-local-supabase-db.sh",
    initScriptGuardrailRequirements,
  );
});

test("prisma seed defines deterministic local baseline data for the seeded Supabase flow", () => {
  assertRepoFileMatchesAll("prisma/seed.ts", seedFileRequirements);
});

test("migration runbook documents the automated validation path for local Supabase Postgres", () => {
  assertRepoFileMatchesAll(
    "docs/supabase-postgres-migration.md",
    automatedValidationRunbookRequirements,
  );
});

test("migration runbook captures the completed issue-7 operating notes", () => {
  assertRepoFileMatchesAll(
    "docs/supabase-postgres-migration.md",
    issueSevenRunbookCompletionRequirements,
  );
});

test("repo includes a guarded validation script for local Supabase automated checks", () => {
  assertRepoFileMatchesAll(
    "scripts/validate-local-supabase-checks.sh",
    automatedValidationScriptRequirements,
  );
});

test("package json exposes a self-contained local Supabase validation entrypoint", () => {
  assert.equal(
    packageJson.scripts?.["validate:local-supabase"],
    "tsx scripts/run-local-supabase-validation.ts",
  );
});

test("repo includes a bootstrap entrypoint for local Supabase validation", () => {
  assertRepoFileMatchesAll(
    "scripts/run-local-supabase-validation.ts",
    localSupabaseBootstrapRequirements,
  );
});
