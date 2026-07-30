# Supabase CLI Database Migration

The active database baseline is implemented in the external local Supabase project at `../supabase/supabase/migrations/` by default.

Local validation:

```bash
npm run supabase:start
npm run supabase:reset
npm run test:db
npm run supabase:types:check
```

Direct PostgreSQL credentials are limited to Supabase CLI/CI migration jobs. The Next.js runtime uses only Supabase URL, publishable key, secret key and storage bucket configuration.
