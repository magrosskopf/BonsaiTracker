#!/usr/bin/env node

const { spawnSync } = require("child_process");
const { existsSync, mkdtempSync, rmSync } = require("fs");
const { join, resolve } = require("path");
const { tmpdir } = require("os");

function getSupabaseProjectRoot() {
  const projectRoot = resolve(process.env.BONSAI_SUPABASE_PROJECT_ROOT || join(process.cwd(), "..", "supabase"));
  const configPath = join(projectRoot, "supabase", "config.toml");
  if (!existsSync(configPath)) {
    throw new Error(`Supabase project config not found at ${configPath}. Set BONSAI_SUPABASE_PROJECT_ROOT to the external Supabase project root.`);
  }
  return projectRoot;
}

const home = mkdtempSync(join(tmpdir(), "bonsai-supabase-home-"));
const cache = mkdtempSync(join(tmpdir(), "bonsai-npm-cache-"));

try {
  const result = spawnSync("npx", ["--yes", "supabase", "--workdir", getSupabaseProjectRoot(), ...process.argv.slice(2)], {
    stdio: "inherit",
    env: {
      ...process.env,
      HOME: home,
      npm_config_cache: cache,
    },
  });

  process.exit(result.status ?? 1);
} finally {
  rmSync(home, { recursive: true, force: true });
  rmSync(cache, { recursive: true, force: true });
}
