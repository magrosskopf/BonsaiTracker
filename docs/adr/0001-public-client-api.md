# Public Client API for Published Clients

Status: accepted

Flutter and other published first-party clients use a versioned Public Client API under `/api/v1/...` for application data. Existing web routes remain on their current `/api/...` surface for now; whether and when the web app migrates to `/api/v1/...` is intentionally deferred. This keeps mobile-facing DTOs, pagination, auth, app-integrity checks, and rate limits stable without exposing Supabase table, storage, or service-only RPC access directly to native clients.
