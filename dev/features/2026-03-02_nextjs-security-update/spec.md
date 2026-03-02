# Next.js Security Update

**Status**: IMPLEMENTED  
**Created**: 2026-03-02  
**Last Modified**: 2026-03-02

## Purpose/Goal

Remove the Vercel deployment block caused by a vulnerable resolved Next.js version and make framework versions deterministic across installs.

## Functional Requirements

1. The project must no longer resolve `next` to a version blocked by Vercel for CVE-2025-66478.
2. The project must keep using the existing Pages Router setup without app architecture changes.
3. Framework versions must be pinned so future installs do not silently drift through `latest`.

## Technical Constraints

1. Only dependency metadata and lockfile changes are required.
2. Existing user changes in the worktree must remain untouched.
3. The update must stay within the current Next.js major version unless verification shows that is insufficient.

## Acceptance Criteria

1. `package.json` pins `next` to a patched version accepted by Vercel.
2. `package-lock.json` resolves `next` to the same patched version.
3. `npm run build` completes successfully after the update.

## Out-of-Scope

1. Migration from Pages Router to App Router.
2. Broader dependency modernization unrelated to the security block.
3. Changes to central workflow files.
