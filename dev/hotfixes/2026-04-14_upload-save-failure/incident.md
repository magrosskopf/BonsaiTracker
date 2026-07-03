# Incident: Upload Save Failure

**Status**: ACTIVE
**Severity**: High
**Detected**: 2026-04-14
**Reporter**: User report in Codex session

## Symptoms

After taking or selecting an image in the app, the upload request fails with the message `Der Upload konnte nicht gespeichert werden.`

## Impact

- **Users Affected**: Potentially all authenticated users who try to upload bonsai images
- **Services Affected**: Image upload for bonsai creation and bonsai edit
- **Business Impact**: Core beta workflow is blocked because users cannot attach photos

## Timeline

- **2026-04-14**: First user report received
- **2026-04-14**: Issue confirmed in code path `pages/api/upload.ts`
- **2026-04-14**: Investigation started

## Error Details

`pages/api/upload.ts` returns the failing user-facing message only from the persistence block around `persistImageUpload(...)` and the immediate bonsai image-link update.

## Initial Observations

- Upload storage selection currently falls back to `local` when `UPLOAD_STORAGE_MODE` is missing.
- Beta documentation and README explicitly define Supabase Storage as the production upload backend.
- A production fallback to local filesystem is risky for serverless deployments and can cause write failures during upload persistence.
- Supabase configuration currently accepts any JWT-like key without checking whether it is actually a `service_role` key.

## Root Cause Analysis

**Root Cause**: Upload storage configuration is not hardened for production. If `UPLOAD_STORAGE_MODE` is missing or invalid in production, the app silently falls back to local filesystem storage instead of the required Supabase backend. Separately, an incorrect Supabase key can pass initial config parsing and only fail during the actual upload attempt.

**Affected Components**:
- `lib/config/beta.ts`
- `lib/storage/index.ts`
- `lib/storage/supabase.ts`
- `pages/api/upload.ts`

**Why it happened**: The storage mode helper defaults to `local` outside explicit configuration, which is convenient for local development but unsafe in production. Supabase config parsing also does not validate the role encoded in `SUPABASE_SERVICE_ROLE_KEY`.

## Fix Strategy

**Approach**: Apply a minimal configuration hardening patch:

1. Default production upload storage to `supabase` when the mode is not explicitly set.
2. Validate the Supabase JWT role during config parsing and reject non-`service_role` keys early.
3. Add regression tests for both cases.

**Alternative Approaches Considered**:
1. Change the upload API to fall back to local storage on Supabase failure. Rejected because this violates the beta storage model and hides operational misconfiguration.
2. Rebuild the storage integration against the S3-compatible endpoint. Rejected because it is too large for a hotfix and not required to address the current failure mode.

**Estimated Time**: < 30 minutes

**Risks**:
- Production environments with incomplete Supabase configuration will fail earlier and more consistently.
- Existing environments that intentionally use `local` in production would need an explicit `UPLOAD_STORAGE_MODE=local`, but that conflicts with the documented beta setup.

**Rollback Plan**:

Revert the config hardening in `lib/config/beta.ts` and the related tests if the change causes an unexpected regression.

## Communication

- [ ] Stakeholders notified
- [ ] Status page updated (if applicable)
- [ ] Team alerted
