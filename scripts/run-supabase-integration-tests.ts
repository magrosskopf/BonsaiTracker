import { spawnSync } from "child_process";
import { loadProjectEnv } from "./load-next-env";

loadProjectEnv();

const result = spawnSync("tsx", ["--test", "--test-concurrency=1", "tests/integration/*.test.ts"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
