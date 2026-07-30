#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

function readRequiredEnv(name) {
  const value = process.env[name] && process.env[name].trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseBoolean(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

async function main() {
  const patch = {};
  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.split("=");
    if (key === "signup_enabled") patch.signup_enabled = parseBoolean(value);
    if (key === "waitlist_enabled") patch.waitlist_enabled = parseBoolean(value);
    if (key === "max_total_users") patch.max_total_users = Number.parseInt(value, 10);
  }

  const supabase = createClient(readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"), readRequiredEnv("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase.from("signup_settings").update(patch).eq("id", true);
  if (error) throw error;
  console.log("Signup settings updated.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
