#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "Docker is required for the local Supabase stack."

SUPABASE=(node scripts/run-supabase-cli.js)

echo "Starting local Supabase stack..."
"${SUPABASE[@]}" start --exclude vector

echo "Resetting local Supabase database from versioned migrations and seed..."
"${SUPABASE[@]}" db reset

echo "Running pgTAP database tests..."
"${SUPABASE[@]}" test db

echo "Local Supabase database initialized."
