import { loadEnvConfig } from "@next/env";

export function loadProjectEnv(projectDir = process.cwd()): void {
  loadEnvConfig(projectDir);
}
