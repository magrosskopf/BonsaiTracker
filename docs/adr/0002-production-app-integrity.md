# Production App Integrity for Public Client API

Status: accepted

Production requires a valid app-integrity signal for private and write-capable Public Client API requests from published native clients, while non-production environments may relax that requirement only through explicit configuration. Supabase Auth remains mandatory in all environments; app integrity is an additional abuse-control layer, not a replacement for user authentication.
