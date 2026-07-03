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
    fail "DATABASE_URL must not use prisma+postgres:// for local Supabase automated validation."
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

echo "Running repository tests against the configured local Supabase target..."
npm test

echo "Running TypeScript checks against the configured local Supabase target..."
npm run typecheck

echo "Running production build against the configured local Supabase target..."
npm run build

echo "Checking Prisma migration status against the configured local Supabase target..."
# Unable to reach the configured local Supabase Postgres target during `prisma migrate status`.
if ! npm run prisma -- migrate status; then
  fail "Unable to reach the configured local Supabase Postgres target during \`prisma migrate status\`. Start or fix the local Supabase database, then rerun this validation."
fi

cat <<'EOF'
Local Supabase automated validation complete.

If this script failed before `migrate status`, treat it as a general repo regression.
If this script failed at `migrate status`, document it as a local Supabase blocker with the concrete connection error.
EOF
