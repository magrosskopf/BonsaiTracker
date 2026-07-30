import { existsSync } from "fs";
import { join, resolve } from "path";

export function getSupabaseProjectRoot(): string {
  const projectRoot = resolve(process.env.BONSAI_SUPABASE_PROJECT_ROOT ?? join(process.cwd(), "..", "supabase"));
  const configPath = join(projectRoot, "supabase", "config.toml");

  if (!existsSync(configPath)) {
    throw new Error(`Supabase project config not found at ${configPath}. Set BONSAI_SUPABASE_PROJECT_ROOT to the external Supabase project root.`);
  }

  return projectRoot;
}

export function getSupabaseDirectory(): string {
  return join(getSupabaseProjectRoot(), "supabase");
}
