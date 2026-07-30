#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "Docker is required for the local Supabase stack."

SUPABASE=(node scripts/run-supabase-cli.js)

"${SUPABASE[@]}" start --exclude vector
"${SUPABASE[@]}" db reset
"${SUPABASE[@]}" test db
npm run supabase:types:check
npm test
npm run test:integration
npm run typecheck
npm run build
