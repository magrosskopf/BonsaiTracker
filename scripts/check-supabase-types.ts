import { spawnSync } from "child_process";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { getSupabaseProjectRoot } from "./supabase-project";

const home = mkdtempSync(join(tmpdir(), "bonsai-supabase-home-"));
const cache = mkdtempSync(join(tmpdir(), "bonsai-npm-cache-"));

const result = spawnSync("npx", ["--yes", "supabase", "--workdir", getSupabaseProjectRoot(), "gen", "types", "typescript", "--local", "--schema", "public"], {
  encoding: "utf8",
  env: { ...process.env, HOME: home, npm_config_cache: cache },
});

rmSync(home, { recursive: true, force: true });
rmSync(cache, { recursive: true, force: true });

if (result.status !== 0 || result.error || !result.stdout.trim()) {
  process.stderr.write(result.stderr || result.error?.message || "supabase CLI failed to generate types.");
  process.exit(result.status ?? 1);
}

const current = readFileSync("types/supabase.ts", "utf8").trim();
if (current !== result.stdout.trim()) {
  console.error("types/supabase.ts is out of date. Run npm run supabase:types.");
  process.exit(1);
}
