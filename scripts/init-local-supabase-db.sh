#!/usr/bin/env bash

set -euo pipefail

fail() {
  echo "$1" >&2
  exit 1
}

require_database_url() {
  if [[ -z "${DATABASE_URL:-}" ]]; then
    fail "DATABASE_URL must be set to a direct local Supabase Postgres URL."
  fi
}

reject_prisma_accelerate_url() {
  if [[ "${DATABASE_URL}" == prisma+postgres://* ]]; then
    fail "DATABASE_URL must not use prisma+postgres:// for local Supabase initialization."
  fi
}

require_direct_postgres_url() {
  if [[ "${DATABASE_URL}" != postgres://* && "${DATABASE_URL}" != postgresql://* ]]; then
    fail "DATABASE_URL must use a direct postgres:// or postgresql:// URL."
  fi
}

is_local_database_target() {
  [[ "${DATABASE_URL}" == *"@127.0.0.1:"* || "${DATABASE_URL}" == *"@localhost:"* ]]
}

require_local_database_target() {
  if [[ "${ALLOW_NON_LOCAL_DATABASE:-0}" != "1" ]] && ! is_local_database_target; then
    fail "Refusing to run against a non-local database target. Set ALLOW_NON_LOCAL_DATABASE=1 to override deliberately."
  fi
}

require_database_url
reject_prisma_accelerate_url
require_direct_postgres_url
require_local_database_target

echo "Validating Prisma schema against the configured local Postgres target..."
npm run prisma -- validate

echo "Applying committed Prisma migrations to the configured local Supabase database..."
npm run prisma -- migrate deploy

if [[ "${PRISMA_SEED:-0}" == "1" ]]; then
  echo "Seeding local baseline data..."
  npm run prisma -- db seed
fi

echo "Checking Prisma migration status..."
npm run prisma -- migrate status

cat <<'EOF'
Local Supabase initialization complete.

Recommended next steps:
1. Run `npm test`
2. Run `npm run typecheck`
3. Start the app with `npm run dev`
4. Perform the local smoke test from docs/supabase-postgres-migration.md
EOF
