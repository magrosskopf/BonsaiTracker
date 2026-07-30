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

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const note = process.argv.slice(3).join(" ").trim() || null;
  if (!email || !email.includes("@")) {
    console.error("Usage: npm run approve-waitlist -- user@example.test [note]");
    process.exit(1);
  }

  const supabase = createClient(readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"), readRequiredEnv("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase.rpc("approve_waitlist", { p_email: email, p_note: note });
  if (error) {
    throw error;
  }
  console.log(`Approved ${email}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
