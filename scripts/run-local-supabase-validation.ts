import { spawnSync } from "child_process";
import { loadProjectEnv } from "./load-next-env";

loadProjectEnv();

const steps = [
  ["npm", ["run", "supabase:start"]],
  ["npm", ["run", "supabase:reset"]],
  ["npm", ["run", "test:db"]],
  ["npm", ["run", "supabase:types:check"]],
  ["npm", ["test"]],
  ["npm", ["run", "test:integration"]],
  ["npm", ["run", "typecheck"]],
  ["npm", ["run", "build"]],
] as const;

for (const [command, args] of steps) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
