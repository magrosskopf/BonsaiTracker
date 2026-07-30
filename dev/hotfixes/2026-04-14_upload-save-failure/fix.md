# Fix: Upload Save Failure

**Implemented**: 2026-04-14
**Developer**: Codex
**Reviewer**: Pending

## Changes Made

### Files Modified

- `lib/config/beta.ts` - hardened production upload storage selection and validated the Supabase service-role key
- `tests/upload-storage.test.ts` - added regression coverage for production defaults and invalid Supabase keys

## Explanation

The hotfix removes the unsafe production fallback to local filesystem storage and rejects misconfigured Supabase keys earlier. This reduces the main risk behind the current upload outage and makes production behavior match the documented beta storage model.

## Testing Performed

- [ ] Verified issue is resolved
- [ ] Checked for obvious regressions
- [ ] Tested rollback procedure

## Deployment Notes

- Production must have valid Supabase storage credentials.
- If `UPLOAD_STORAGE_MODE` is omitted in production, the app now assumes `supabase`.
- If `SUPABASE_SERVICE_ROLE_KEY` is not a real service-role key, uploads and healthchecks will now fail fast instead of failing later during upload persistence.

## Technical Debt Created

- The user-facing upload error in `pages/api/upload.ts` is still generic; operational diagnostics rely on server logs and healthcheck output.
