# Supabase MVP Operations

Supabase is now the primary runtime platform:

- Auth: Google and Magic Link via Supabase Auth.
- Mail: Resend as Supabase Auth Custom SMTP.
- Data: Next.js API Routes call Supabase Data API/RPC with `SUPABASE_SECRET_KEY`.
- Storage: private bucket `bonsai-beta-media`, delivered through `/api/media/*`.

Remote provider, hook, redirect and SMTP changes require separate explicit approval before execution.
