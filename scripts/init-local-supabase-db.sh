#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL must be set to a direct local Supabase Postgres URL." >&2
  exit 1
fi

if [[ "${DATABASE_URL}" == prisma+postgres://* ]]; then
  echo "DATABASE_URL must not use prisma+postgres:// for local Supabase initialization." >&2
  exit 1
fi

if [[ "${DATABASE_URL}" != postgres://* && "${DATABASE_URL}" != postgresql://* ]]; then
  echo "DATABASE_URL must use a direct postgres:// or postgresql:// URL." >&2
  exit 1
fi

if [[ "${ALLOW_NON_LOCAL_DATABASE:-0}" != "1" ]]; then
  if [[ "${DATABASE_URL}" != *"@127.0.0.1:"* && "${DATABASE_URL}" != *"@localhost:"* ]]; then
    echo "Refusing to run against a non-local database target. Set ALLOW_NON_LOCAL_DATABASE=1 to override deliberately." >&2
    exit 1
  fi
fi

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
