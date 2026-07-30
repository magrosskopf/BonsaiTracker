# Implementation Notes

Current runtime target: Supabase Auth, Supabase Data API/RPC and private Supabase Storage through Next.js API Routes.

Historical Prisma/NextAuth notes are retained in Git history only. The active schema source is the external Supabase project at `../supabase/supabase/migrations/` by default, and the app runtime must not receive `DATABASE_URL`.
